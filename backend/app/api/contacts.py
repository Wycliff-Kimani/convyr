from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from supabase import create_client
from app.config import settings
from app.services.auth import decode_access_token
import logging

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

VALID_LABELS = ["new", "repeat", "pending_payment", "order_in_progress", "done"]


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    return payload


class UpdateContactInput(BaseModel):
    label: Optional[str] = None
    notes: Optional[str] = None
    name: Optional[str] = None


@router.get("/contacts")
async def get_contacts(user=Depends(get_current_user)):
    business_id = user.get("business_id")
    result = supabase.table("contacts").select("*").eq("business_id", business_id).order("created_at", desc=True).execute()
    return {"contacts": result.data, "total": len(result.data)}


@router.get("/contacts/{contact_id}")
async def get_contact(contact_id: str, user=Depends(get_current_user)):
    business_id = user.get("business_id")
    result = supabase.table("contacts").select("*").eq("id", contact_id).eq("business_id", business_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Contact not found.")
    return result.data[0]


@router.patch("/contacts/{contact_id}")
async def update_contact(contact_id: str, data: UpdateContactInput, user=Depends(get_current_user)):
    business_id = user.get("business_id")

    # Verify contact belongs to this business
    existing = supabase.table("contacts").select("id").eq("id", contact_id).eq("business_id", business_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Contact not found.")

    # Validate label if provided
    if data.label and data.label not in VALID_LABELS:
        raise HTTPException(status_code=400, detail=f"Invalid label. Must be one of: {', '.join(VALID_LABELS)}")

    # Build update payload with only provided fields
    update_data = {}
    if data.label is not None:
        update_data["label"] = data.label
    if data.notes is not None:
        update_data["notes"] = data.notes
    if data.name is not None:
        update_data["name"] = data.name

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update.")

    result = supabase.table("contacts").update(update_data).eq("id", contact_id).eq("business_id", business_id).execute()

    logger.info(f"Contact {contact_id} updated: {update_data}")
    return result.data[0]


@router.get("/contacts/{contact_id}/messages")
async def get_contact_messages(contact_id: str, user=Depends(get_current_user)):
    business_id = user.get("business_id")
    result = supabase.table("messages").select("*").eq("contact_id", contact_id).eq("business_id", business_id).order("created_at", desc=False).execute()
    return {"messages": result.data, "total": len(result.data)}