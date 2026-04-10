import httpx
import base64
import logging
from app.config import settings

logger = logging.getLogger(__name__)

def get_auth_header():
    credentials = f"{settings.PAYHERO_USERNAME}:{settings.PAYHERO_PASSWORD}"
    encoded = base64.b64encode(credentials.encode()).decode()
    return f"Basic {encoded}"


async def initiate_stk_push(phone_number: str, amount: int, external_reference: str) -> dict:
    headers = {
        "Authorization": get_auth_header(),
        "Content-Type": "application/json"
    }

    # Ensure phone number is in correct format — 254XXXXXXXXX
    if phone_number.startswith("0"):
        phone_number = "254" + phone_number[1:]
    elif phone_number.startswith("+"):
        phone_number = phone_number[1:]

    payload = {
        "amount": amount,
        "phone_number": phone_number,
        "channel_id": int(settings.PAYHERO_CHANNEL_ID),
        "provider": "m-pesa",
        "external_reference": external_reference,
        "callback_url": settings.PAYHERO_CALLBACK_URL,
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.PAYHERO_API_URL}/payments",
            headers=headers,
            json=payload,
            timeout=30.0
        )
        if not response.is_success:
            logger.error(f"PayHero error response: {response.status_code} - {response.text}")
            response.raise_for_status()
        return response.json()


async def check_payment_status(external_reference: str) -> dict:
    headers = {
        "Authorization": get_auth_header(),
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{settings.PAYHERO_API_URL}/transaction-status",
            headers=headers,
            params={"external_reference": external_reference},
            timeout=30.0
        )
        if not response.is_success:
            logger.error(f"PayHero error response: {response.status_code} - {response.text}")
            response.raise_for_status()
        return response.json()