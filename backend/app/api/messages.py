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
    contact_id: str
    message: str


@router.get("/messages")
async def get_messages(user=Depends(get_current_user)):
    result = supabase.table("messages").select("*, contacts(phone_number, name)").order("created_at", desc=True).limit(100).execute()
    return {"messages": result.data, "total": len(result.data)}


@router.post("/messages/send")
async def send_message(data: SendMessageRequest, user=Depends(get_current_user)):
    # Get contact phone number
    contact = supabase.table("contacts").select("phone_number").eq("id", data.contact_id).execute()
    if not contact.data:
        raise HTTPException(status_code=404, detail="Contact not found.")

    phone_number = contact.data[0]["phone_number"]

    # Send via WhatsApp
    await send_whatsapp_message(to=phone_number, text=data.message)

    # Save outbound message to database
    supabase.table("messages").insert({
        "contact_id": data.contact_id,
        "direction": "outbound",
        "message_type": "text",
        "content": data.message,
        "status": "sent"
    }).execute()

    return {"status": "sent", "to": phone_number, "message": data.message}