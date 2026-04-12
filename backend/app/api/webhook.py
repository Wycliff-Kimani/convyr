from fastapi import APIRouter, Request, Query, HTTPException
from fastapi.responses import PlainTextResponse
import logging
import asyncio
from supabase import create_client

from app.config import settings
from app.services.whatsapp import send_whatsapp_message, send_typing_indicator
from app.services.automation import get_matching_automation

logger = logging.getLogger(__name__)
router = APIRouter()

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

FALLBACK_REPLY = "Thanks for reaching out! Our team will get back to you shortly. 🙏"


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
    payload = await request.json()
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

        if msg_type == "text":
            text = message["text"]["body"]
            logger.info(f"Message from {sender}: {text}")

            # Look up business by phone_number_id from webhook payload
            phone_number_id = value.get("metadata", {}).get("phone_number_id")
            business_result = supabase.table("businesses").select("id").eq(
                "whatsapp_phone_number_id", phone_number_id
            ).execute()
            business_id = business_result.data[0]["id"] if business_result.data else None

            # Upsert contact with business_id
            contact_result = supabase.table("contacts").upsert(
                {"phone_number": sender, "business_id": business_id},
                on_conflict="phone_number"
            ).execute()
            contact_id = contact_result.data[0]["id"]

            # Save inbound message
            supabase.table("messages").insert({
                "whatsapp_message_id": msg_id,
                "contact_id": contact_id,
                "business_id": business_id,
                "direction": "inbound",
                "message_type": "text",
                "content": text,
                "status": "received"
            }).execute()

            # Get matching automation reply (cooldown handled inside)
            reply = await get_matching_automation(text, contact_id, business_id)

            # If no automation matched, check if fallback was already sent recently
            if not reply:
                from app.services.automation import get_reply_hash, was_reply_sent_recently, record_reply_sent
                fallback_hash = get_reply_hash(FALLBACK_REPLY)
                fallback_sent = await was_reply_sent_recently(contact_id, fallback_hash)
                if not fallback_sent:
                    reply = FALLBACK_REPLY
                    await record_reply_sent(contact_id, business_id, fallback_hash)

            if reply:
                # Show typing indicator
                await send_typing_indicator(msg_id)
                await asyncio.sleep(1)

                # Send reply
                await send_whatsapp_message(to=sender, text=reply)

                # Save outbound reply
                supabase.table("messages").insert({
                    "contact_id": contact_id,
                    "business_id": business_id,
                    "direction": "outbound",
                    "message_type": "text",
                    "content": reply,
                    "status": "sent"
                }).execute()
            else:
                logger.info(f"No reply sent to {sender} — all matching replies already sent within cooldown window")

    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")

    return {"status": "ok"}