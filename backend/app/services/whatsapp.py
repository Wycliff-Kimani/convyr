import httpx
import logging
from app.config import settings

logger = logging.getLogger(__name__)


async def send_whatsapp_message(to: str, text: str, phone_number_id: str = None, access_token: str = None):
    # Use provided credentials or fallback to settings for backward compatibility
    pn_id = phone_number_id or settings.WHATSAPP_PHONE_NUMBER_ID
    token = access_token or settings.WHATSAPP_ACCESS_TOKEN

    url = f"https://graph.facebook.com/v22.0/{pn_id}/messages"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {
            "body": text
        }
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=payload, timeout=10.0)
            response.raise_for_status()
            logger.info(f"Message sent successfully to {to}")
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error sending message to {to}: {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error sending message to {to}: {str(e)}")
            raise


async def send_typing_indicator(message_id: str, phone_number_id: str = None, access_token: str = None):
    """
    Shows typing indicator (3 dots) for up to 25 seconds or until a message is sent.
    This also marks the message as read (blue ticks).
    """
    pn_id = phone_number_id or settings.WHATSAPP_PHONE_NUMBER_ID
    token = access_token or settings.WHATSAPP_ACCESS_TOKEN

    url = f"https://graph.facebook.com/v22.0/{pn_id}/messages"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "status": "read",
        "message_id": message_id
    }

    async with httpx.AsyncClient() as client:
        try:
            await client.post(url, headers=headers, json=payload, timeout=10.0)
            logger.info(f"Typing indicator sent for message {message_id}")
        except Exception as e:
            logger.error(f"Error sending typing indicator: {str(e)}")