import httpx
import logging
from app.config import settings

logger = logging.getLogger(__name__)

REDIS_URL = settings.UPSTASH_REDIS_REST_URL
REDIS_TOKEN = settings.UPSTASH_REDIS_REST_TOKEN


async def set_greeting_sent(phone_number: str, expiry_seconds: int = 86400):
    """
    Mark that we've sent a greeting to this phone number.
    Expires after 24 hours (86400 seconds) by default.
    """
    key = f"greeted:{phone_number}"
    headers = {"Authorization": f"Bearer {REDIS_TOKEN}"}
    
    async with httpx.AsyncClient() as client:
        try:
            # SET key with EX (expiry in seconds)
            response = await client.post(
                f"{REDIS_URL}/set/{key}",
                headers=headers,
                json={"value": "1", "ex": expiry_seconds}
            )
            response.raise_for_status()
            logger.info(f"Marked {phone_number} as greeted (expires in {expiry_seconds}s)")
        except Exception as e:
            logger.error(f"Error setting greeting flag in Redis: {str(e)}")


async def has_been_greeted(phone_number: str) -> bool:
    """
    Check if we've already sent a greeting to this phone number in the last 24 hours.
    Returns True if greeted, False otherwise.
    """
    key = f"greeted:{phone_number}"
    headers = {"Authorization": f"Bearer {REDIS_TOKEN}"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{REDIS_URL}/get/{key}", headers=headers)
            response.raise_for_status()
            result = response.json()
            
            # Upstash returns {"result": "1"} if key exists, {"result": null} if not
            exists = result.get("result") is not None
            logger.info(f"Checked greeting status for {phone_number}: {'already greeted' if exists else 'not greeted'}")
            return exists
        except Exception as e:
            logger.error(f"Error checking greeting flag in Redis: {str(e)}")
            return False  # Default to False (send greeting) if Redis fails