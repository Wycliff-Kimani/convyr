from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from supabase import create_client
from app.config import settings
from app.services.auth import decode_access_token
from app.services.whatsapp import send_whatsapp_message
import logging
import httpx

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


class SendMessageRequest(BaseModel):
    to: str
    text: str


@router.get("/messages")
async def get_messages(user=Depends(get_current_user)):
    business_id = user.get("business_id")
    result = supabase.table("messages").select("*, contacts(phone_number, name)").eq("business_id", business_id).eq("deleted_for_me", False).order("created_at", desc=True).limit(200).execute()
    data = result.data
    data.reverse()
    return {"messages": data, "total": len(data)}


@router.post("/messages/send")
async def send_message(data: SendMessageRequest, user=Depends(get_current_user)):
    business_id = user.get("business_id")

    # Send via WhatsApp
    await send_whatsapp_message(to=data.to, text=data.text)

    # Look up contact by phone number and business_id
    contact = supabase.table("contacts").select("id").eq("phone_number", data.to).eq("business_id", business_id).execute()
    contact_id = contact.data[0]["id"] if contact.data else None

    # Save outbound message to database
    supabase.table("messages").insert({
        "contact_id": contact_id,
        "business_id": business_id,
        "direction": "outbound",
        "message_type": "text",
        "content": data.text,
        "status": "sent"
    }).execute()

    return {"status": "sent", "to": data.to, "message": data.text}


@router.delete("/messages/{message_id}")
async def delete_message(message_id: str, delete_for_everyone: bool = False, user=Depends(get_current_user)):
    business_id = user.get("business_id")

    # Verify message belongs to this business
    result = supabase.table("messages").select("*").eq("id", message_id).eq("business_id", business_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Message not found.")

    message = result.data[0]

    if delete_for_everyone:
        # Only outbound messages within 24 hours can be deleted for everyone
        whatsapp_message_id = message.get("whatsapp_message_id")
        if not whatsapp_message_id:
            raise HTTPException(status_code=400, detail="Cannot delete this message for everyone — no WhatsApp message ID.")

        # Get the business WhatsApp credentials
        business = supabase.table("businesses").select("whatsapp_phone_number_id, whatsapp_access_token").eq("id", business_id).execute()
        if not business.data:
            raise HTTPException(status_code=404, detail="Business not found.")

        phone_number_id = business.data[0]["whatsapp_phone_number_id"]
        access_token = business.data[0]["whatsapp_access_token"]

        # Call WhatsApp API to delete the message
        try:
            async with httpx.AsyncClient() as client:
                response = await client.delete(
                    f"https://graph.facebook.com/v21.0/{phone_number_id}/messages/{whatsapp_message_id}",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                if response.status_code not in [200, 204]:
                    logger.warning(f"WhatsApp delete failed: {response.text}")
        except Exception as e:
            logger.error(f"Failed to delete message on WhatsApp: {str(e)}")

        # Mark as deleted for everyone in DB
        supabase.table("messages").update({
            "deleted_for_everyone": True,
            "deleted_for_me": True,
            "content": "This message was deleted."
        }).eq("id", message_id).execute()

    else:
        # Delete for me only — just hide from dashboard
        supabase.table("messages").update({
            "deleted_for_me": True
        }).eq("id", message_id).execute()

    return {"status": "deleted", "message_id": message_id, "delete_for_everyone": delete_for_everyone}