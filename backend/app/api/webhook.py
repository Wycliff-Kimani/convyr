from fastapi import APIRouter, Request, Query, HTTPException
from fastapi.responses import PlainTextResponse
import logging
import asyncio
from supabase import create_client

from app.config import settings
from app.services.whatsapp import send_whatsapp_message, send_typing_indicator
from app.services.redis_client import has_been_greeted, set_greeting_sent
from app.services.automation import get_matching_automation

logger = logging.getLogger(__name__)
router = APIRouter()

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


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

            # Upsert contact
            contact_result = supabase.table("contacts").upsert(
                {"phone_number": sender},
                on_conflict="phone_number"
            ).execute()
            contact_id = contact_result.data[0]["id"]

            # Save inbound message
            supabase.table("messages").insert({
                "whatsapp_message_id": msg_id,
                "contact_id": contact_id,
                "direction": "inbound",
                "message_type": "text",
                "content": text,
                "status": "received"
            }).execute()

            # Check cooldown
            already_greeted = await has_been_greeted(sender)

            if not already_greeted:
                await send_typing_indicator(msg_id)
                await asyncio.sleep(2)

                # Check automations first, fall back to default greeting
                reply = await get_matching_automation(text)
                if not reply:
                    reply = "👋 Hi! Thanks for reaching out. We'll get back to you shortly."

                await send_whatsapp_message(to=sender, text=reply)
                await set_greeting_sent(sender, expiry_seconds=20)

                # Save outbound reply
                supabase.table("messages").insert({
                    "contact_id": contact_id,
                    "direction": "outbound",
                    "message_type": "text",
                    "content": reply,
                    "status": "sent"
                }).execute()
            else:
                logger.info(f"Customer {sender} already greeted. Message saved silently.")

    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")

    return {"status": "ok"}