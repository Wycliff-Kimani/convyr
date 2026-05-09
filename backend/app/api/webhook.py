from fastapi import APIRouter, Request, Query, HTTPException
from fastapi.responses import PlainTextResponse, JSONResponse
import logging
import asyncio
import hashlib
import hmac
import time
from collections import defaultdict
from supabase import create_client

from app.config import settings
from app.services.whatsapp import send_whatsapp_message, send_typing_indicator
from app.services.automation import get_matching_automation, was_reply_sent_recently, record_reply_sent, FALLBACK_REPLY_HASH

logger = logging.getLogger(__name__)
router = APIRouter()

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

FALLBACK_REPLY = "Thanks for reaching out! Our team will get back to you shortly. 🙏"

RATE_LIMIT_WINDOW = 60
RATE_LIMIT_MAX = 20
_rate_limit_store: dict = defaultdict(list)


def is_rate_limited(identifier: str) -> bool:
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW
    _rate_limit_store[identifier] = [
        t for t in _rate_limit_store[identifier] if t > window_start
    ]
    if len(_rate_limit_store[identifier]) >= RATE_LIMIT_MAX:
        return True
    _rate_limit_store[identifier].append(now)
    return False


def verify_meta_signature(payload_bytes: bytes, signature_header: str | None) -> bool:
    if not settings.META_APP_SECRET:
        logger.warning("META_APP_SECRET not set — skipping signature verification")
        return True

    if not signature_header or not signature_header.startswith("sha256="):
        logger.warning("Missing or malformed X-Hub-Signature-256 header")
        return False

    expected = hmac.new(
        settings.META_APP_SECRET.encode("utf-8"),
        payload_bytes,
        hashlib.sha256
    ).hexdigest()

    received = signature_header.removeprefix("sha256=")

    return hmac.compare_digest(expected, received)


@router.get("/webhook", response_class=PlainTextResponse)
async def verify_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
):
    if hub_mode == "subscribe" and hub_verify_token == settings.WHATSAPP_VERIFY_TOKEN:
        logger.info("WhatsApp webhook verified successfully.")
        return hub_challenge
    raise HTTPException(status_code=403, detail="Verification failed.")


@router.post("/webhook", status_code=200)
async def receive_webhook(request: Request):
    # ── Signature verification ──────────────────────────────────────────────
    raw_body = await request.body()
    signature = request.headers.get("X-Hub-Signature-256")

    if not verify_meta_signature(raw_body, signature):
        logger.warning("Webhook signature verification failed — request rejected")
        raise HTTPException(status_code=403, detail="Invalid signature")

    # ── Rate limiting ───────────────────────────────────────────────────────
    client_ip = request.client.host if request.client else "unknown"
    if is_rate_limited(client_ip):
        logger.warning(f"Rate limit exceeded for IP: {client_ip}")
        return {"status": "ok"}

    import json
    payload = json.loads(raw_body)
    logger.info(f"Webhook received: {payload}")

    try:
        entry = payload.get("entry", [])[0]
        changes = entry.get("changes", [])[0]
        value = changes.get("value", {})
        messages = value.get("messages", [])

        if not messages:
            return {"status": "ok"}

        message = messages[0]
        sender = message.get("from")
        msg_id = message.get("id")
        msg_type = message.get("type")

        if sender and is_rate_limited(f"sender:{sender}"):
            logger.warning(f"Rate limit exceeded for sender: {sender}")
            return {"status": "ok"}

        if msg_type == "text":
            text = message["text"]["body"]
            logger.info(f"Message from {sender}: {text}")

            phone_number_id = value.get("metadata", {}).get("phone_number_id")

            # Fetch business including fallback cooldown setting
            business_result = supabase.table("businesses").select(
                "id, whatsapp_access_token, whatsapp_phone_number_id, fallback_cooldown_minutes"
            ).eq("whatsapp_phone_number_id", phone_number_id).execute()

            if not business_result.data:
                logger.warning(f"No business found for phone_number_id: {phone_number_id}")
                return {"status": "ok"}

            business_data = business_result.data[0]
            business_id = business_data["id"]
            access_token = business_data.get("whatsapp_access_token")
            actual_phone_id = business_data.get("whatsapp_phone_number_id")
            fallback_cooldown_minutes = business_data.get("fallback_cooldown_minutes", 30)

            contact_result = supabase.table("contacts").upsert(
                {"phone_number": sender, "business_id": business_id},
                on_conflict="phone_number,business_id"
            ).execute()
            contact_id = contact_result.data[0]["id"]

            supabase.table("messages").insert({
                "whatsapp_message_id": msg_id,
                "contact_id": contact_id,
                "business_id": business_id,
                "direction": "inbound",
                "message_type": "text",
                "content": text,
                "status": "received"
            }).execute()

            reply = await get_matching_automation(text, contact_id, business_id)

            # Fallback: DB-backed cooldown via contact_reply_history
            if not reply:
                fallback_suppressed = await was_reply_sent_recently(
                    contact_id, FALLBACK_REPLY_HASH, fallback_cooldown_minutes
                )
                if not fallback_suppressed:
                    reply = FALLBACK_REPLY
                    await record_reply_sent(contact_id, business_id, FALLBACK_REPLY_HASH)
                else:
                    logger.info(
                        f"Fallback suppressed for {sender} — sent within last {fallback_cooldown_minutes} minutes"
                    )

            if reply:
                await send_typing_indicator(msg_id, phone_number_id=actual_phone_id, access_token=access_token)
                await asyncio.sleep(1)

                await send_whatsapp_message(to=sender, text=reply, phone_number_id=actual_phone_id, access_token=access_token)

                supabase.table("messages").insert({
                    "contact_id": contact_id,
                    "business_id": business_id,
                    "direction": "outbound",
                    "message_type": "text",
                    "content": reply,
                    "status": "sent"
                }).execute()
            else:
                logger.info(f"No reply sent to {sender}")

    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")

    return {"status": "ok"}


@router.post("/webhook/data-deletion")
async def data_deletion_callback(request: Request):
    try:
        payload = await request.json()
        signed_request = payload.get("signed_request")

        if not signed_request:
            raise HTTPException(status_code=400, detail="Missing signed_request")

        import base64
        import json

        parts = signed_request.split(".")
        if len(parts) != 2:
            raise HTTPException(status_code=400, detail="Invalid signed_request format")

        encoded_sig, payload_b64 = parts

        padding = 4 - len(payload_b64) % 4
        if padding != 4:
            payload_b64 += "=" * padding

        decoded_payload = base64.urlsafe_b64decode(payload_b64)
        data = json.loads(decoded_payload)

        expected_sig = hmac.new(
            settings.META_APP_SECRET.encode("utf-8"),
            payload_b64.encode("utf-8"),
            hashlib.sha256
        ).digest()
        expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).decode("utf-8").rstrip("=")

        if not hmac.compare_digest(encoded_sig, expected_sig_b64):
            logger.warning("Data deletion request failed signature verification")
            raise HTTPException(status_code=403, detail="Invalid signature")

        user_id = data.get("user_id")
        logger.info(f"Data deletion request received for Facebook user_id: {user_id}")

        business_result = supabase.table("businesses").select("id").eq(
            "facebook_user_id", user_id
        ).execute()

        if business_result.data:
            business_id = business_result.data[0]["id"]
            supabase.table("messages").delete().eq("business_id", business_id).execute()
            supabase.table("contacts").delete().eq("business_id", business_id).execute()
            supabase.table("automations").delete().eq("business_id", business_id).execute()
            supabase.table("businesses").delete().eq("id", business_id).execute()
            logger.info(f"Deleted all data for business_id: {business_id}")

        confirmation_code = hashlib.sha256(f"{user_id}-deleted".encode()).hexdigest()[:16]

        return JSONResponse({
            "url": f"https://convyr.vercel.app/privacy",
            "confirmation_code": confirmation_code
        })

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing data deletion request: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process deletion request")