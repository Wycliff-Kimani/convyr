from fastapi import APIRouter, Request, Query, HTTPException
from fastapi.responses import PlainTextResponse
import logging
import asyncio

from app.config import settings
from app.services.whatsapp import send_whatsapp_message, send_typing_indicator
from app.services.redis_client import has_been_greeted, set_greeting_sent

logger = logging.getLogger(__name__)

router = APIRouter()


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

            # Check if we've already greeted this customer in the last 24 hours
            already_greeted = await has_been_greeted(sender)

            if not already_greeted:
                # First message in 24 hours — send greeting with typing indicator
                await send_typing_indicator(msg_id)
                await asyncio.sleep(2)  # Show typing dots for 2 seconds
                await send_whatsapp_message(
                    to=sender,
                    text="👋 Hi! Thanks for reaching out. We'll get back to you shortly."
                )
                # Mark this customer as greeted (expires in 24 hours)
                await set_greeting_sent(sender, expiry_seconds=86400)
            else:
                # Already greeted — silently save message (no reply)
                logger.info(f"Customer {sender} already greeted. Message saved silently.")

    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")

    return {"status": "ok"}