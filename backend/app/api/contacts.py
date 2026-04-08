from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client
from app.config import settings
from app.services.auth import decode_access_token
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


@router.get("/contacts")
async def get_contacts(user=Depends(get_current_user)):
    result = supabase.table("contacts").select("*").order("created_at", desc=True).execute()
    return {"contacts": result.data, "total": len(result.data)}


@router.get("/contacts/{contact_id}")
async def get_contact(contact_id: str, user=Depends(get_current_user)):
    result = supabase.table("contacts").select("*").eq("id", contact_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Contact not found.")
    return result.data[0]


@router.get("/contacts/{contact_id}/messages")
async def get_contact_messages(contact_id: str, user=Depends(get_current_user)):
    result = supabase.table("messages").select("*").eq("contact_id", contact_id).order("created_at", desc=False).execute()
    return {"messages": result.data, "total": len(result.data)}