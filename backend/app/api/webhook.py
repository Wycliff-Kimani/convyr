from fastapi import APIRouter, Request, Query, HTTPException
from fastapi.responses import PlainTextResponse
import logging
import asyncio
from datetime import datetime, timezone, timedelta
from supabase import create_client

from app.config import settings
from app.services.whatsapp import send_whatsapp_message, send_typing_indicator
from app.services.automation import get_matching_automation

logger = logging.getLogger(__name__)
router = APIRouter()

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

COOLDOWN_HOURS = 4


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
            business_result = supabase.table("businesses").select("id").eq("whatsapp_phone_number_id", phone_number_id).execute()
            business_id = business_result.data[0]["id"] if business_result.data else None

            # Upsert contact with business_id
            contact_result = supabase.table("contacts").upsert(
                {"phone_number": sender, "business_id": business_id},
                on_conflict="phone_number"
            ).execute()
            contact = contact_result.data[0]
            contact_id = contact["id"]

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

            # Check cooldown — has the bot replied to this contact in the last 4 hours?
            last_replied = contact.get("last_auto_replied_at")
            cooldown_passed = True

            if last_replied:
                last_replied_dt = datetime.fromisoformat(last_replied.replace("Z", "+00:00"))
                time_since = datetime.now(timezone.utc) - last_replied_dt
                if time_since < timedelta(hours=COOLDOWN_HOURS):
                    cooldown_passed = False
                    logger.info(f"Cooldown active for {sender} — skipping auto-reply ({time_since} since last reply)")

            if cooldown_passed:
                # Show typing indicator
                await send_typing_indicator(msg_id)
                await asyncio.sleep(1)

                # Check automations
                reply = await get_matching_automation(text)
                if not reply:
                    reply = "Thanks for reaching out! Our team will get back to you shortly. 🙏"

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

                # Update last_auto_replied_at on the contact
                supabase.table("contacts").update({
                    "last_auto_replied_at": datetime.now(timezone.utc).isoformat()
                }).eq("id", contact_id).execute()

    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")

    return {"status": "ok"}