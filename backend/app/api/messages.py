from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from supabase import create_client
from app.config import settings
from app.services.auth import decode_access_token
from app.services.whatsapp import send_whatsapp_message
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


class SendMessageRequest(BaseModel):
    to: str
    text: str


@router.get("/messages")
async def get_messages(user=Depends(get_current_user)):
    business_id = user.get("business_id")
    result = supabase.table("messages").select("*, contacts(phone_number, name)").eq("business_id", business_id).order("created_at", desc=True).limit(100).execute()
    return {"messages": result.data, "total": len(result.data)}


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