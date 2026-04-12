from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from supabase import create_client
from app.config import settings
from app.services.auth import decode_access_token
import httpx
import logging

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    return payload


@router.get("/business")
async def get_business(user=Depends(get_current_user)):
    business_id = user.get("business_id")
    result = supabase.table("businesses").select(
        "id, name, email, phone_number, whatsapp_phone_number_id, whatsapp_business_account_id, subscription_plan, subscription_status, created_at"
    ).eq("id", business_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Business not found.")

    return result.data[0]


class ConnectWhatsAppInput(BaseModel):
    code: str


@router.post("/business/connect-whatsapp")
async def connect_whatsapp(data: ConnectWhatsAppInput, user=Depends(get_current_user)):
    """
    Receives the auth code from Meta Embedded Signup,
    exchanges it for a long-lived access token,
    fetches the business's WhatsApp phone number ID,
    and saves everything to the business record.
    """
    business_id = user.get("business_id")

    # Step 1 — Exchange code for access token
    try:
        async with httpx.AsyncClient() as client:
            token_response = await client.get(
                "https://graph.facebook.com/v19.0/oauth/access_token",
                params={
                    "client_id": settings.META_APP_ID,
                    "client_secret": settings.META_APP_SECRET,
                    "code": data.code,
                }
            )
            token_response.raise_for_status()
            token_data = token_response.json()
    except Exception as e:
        logger.error(f"Failed to exchange code for token: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to exchange authorization code. Please try again.")

    access_token = token_data.get("access_token")
    if not access_token:
        logger.error(f"No access token in Meta response: {token_data}")
        raise HTTPException(status_code=400, detail="Meta did not return an access token.")

    # Step 2 — Fetch the WhatsApp Business Account and phone number ID
    try:
        async with httpx.AsyncClient() as client:
            waba_response = await client.get(
                "https://graph.facebook.com/v19.0/me/businesses",
                params={"access_token": access_token}
            )
            waba_response.raise_for_status()
            waba_data = waba_response.json()

            waba_id = None
            if waba_data.get("data"):
                waba_id = waba_data["data"][0].get("id")

            phone_number_id = None
            if waba_id:
                phones_response = await client.get(
                    f"https://graph.facebook.com/v19.0/{waba_id}/phone_numbers",
                    params={"access_token": access_token}
                )
                phones_response.raise_for_status()
                phones_data = phones_response.json()
                if phones_data.get("data"):
                    phone_number_id = phones_data["data"][0].get("id")

    except Exception as e:
        logger.error(f"Failed to fetch WhatsApp account details: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to fetch WhatsApp account details.")

    # Step 3 — Save to database
    try:
        supabase.table("businesses").update({
            "whatsapp_access_token": access_token,
            "whatsapp_business_account_id": waba_id,
            "whatsapp_phone_number_id": phone_number_id,
        }).eq("id", business_id).execute()
    except Exception as e:
        logger.error(f"Failed to save WhatsApp connection: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save WhatsApp connection.")

    logger.info(f"WhatsApp connected for business {business_id} — WABA: {waba_id}, Phone ID: {phone_number_id}")

    result = supabase.table("businesses").select(
        "id, name, email, phone_number, whatsapp_phone_number_id, whatsapp_business_account_id, subscription_plan, subscription_status, created_at"
    ).eq("id", business_id).execute()

    return result.data[0]


@router.post("/business/disconnect-whatsapp")
async def disconnect_whatsapp(user=Depends(get_current_user)):
    """
    Clears the WhatsApp connection for the business —
    nulls out the access token, phone number ID, and WABA ID.
    """
    business_id = user.get("business_id")

    try:
        supabase.table("businesses").update({
            "whatsapp_access_token": None,
            "whatsapp_business_account_id": None,
            "whatsapp_phone_number_id": None,
        }).eq("id", business_id).execute()
    except Exception as e:
        logger.error(f"Failed to disconnect WhatsApp for business {business_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to disconnect WhatsApp.")

    logger.info(f"WhatsApp disconnected for business {business_id}")

    result = supabase.table("businesses").select(
        "id, name, email, phone_number, whatsapp_phone_number_id, whatsapp_business_account_id, subscription_plan, subscription_status, created_at"
    ).eq("id", business_id).execute()

    return result.data[0]


@router.delete("/account")
async def delete_account(user=Depends(get_current_user)):
    """
    Permanently deletes the user's account and all associated business data.
    Deletion order: messages → contacts → automations → payments → businesses → users
    """
    business_id = user.get("business_id")
    user_id = user.get("user_id")

    try:
        # Delete in dependency order
        supabase.table("messages").delete().eq("business_id", business_id).execute()
        supabase.table("contacts").delete().eq("business_id", business_id).execute()
        supabase.table("automations").delete().eq("business_id", business_id).execute()
        supabase.table("payments").delete().eq("business_id", business_id).execute()
        supabase.table("businesses").delete().eq("id", business_id).execute()
        supabase.table("users").delete().eq("id", user_id).execute()

        logger.info(f"Account deleted — user {user_id}, business {business_id}")
    except Exception as e:
        logger.error(f"Failed to delete account for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete account. Please contact support.")

    return {"message": "Account deleted successfully."}