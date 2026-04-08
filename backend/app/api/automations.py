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


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    return payload


class AutomationCreate(BaseModel):
    name: str
    trigger_type: str
    keyword: Optional[str] = None
    response: str
    is_active: bool = True


class AutomationUpdate(BaseModel):
    name: Optional[str] = None
    trigger_type: Optional[str] = None
    keyword: Optional[str] = None
    response: Optional[str] = None
    is_active: Optional[bool] = None


@router.get("/automations")
async def get_automations(user=Depends(get_current_user)):
    business_id = user.get("business_id")
    result = supabase.table("automations").select("*").eq("business_id", business_id).order("created_at", desc=True).execute()
    return {"automations": result.data, "total": len(result.data)}


@router.post("/automations", status_code=201)
async def create_automation(data: AutomationCreate, user=Depends(get_current_user)):
    business_id = user.get("business_id")

    if data.trigger_type == "contains_keyword" and not data.keyword:
        raise HTTPException(status_code=400, detail="Keyword is required for contains_keyword trigger.")

    result = supabase.table("automations").insert({
        "business_id": business_id,
        "name": data.name,
        "trigger_type": data.trigger_type,
        "keyword": data.keyword.lower() if data.keyword else None,
        "response": data.response,
        "is_active": data.is_active,
    }).execute()

    return result.data[0]


@router.patch("/automations/{automation_id}")
async def update_automation(automation_id: str, data: AutomationUpdate, user=Depends(get_current_user)):
    business_id = user.get("business_id")

    existing = supabase.table("automations").select("id").eq("id", automation_id).eq("business_id", business_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Automation not found.")

    updates = {k: v for k, v in data.dict().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update.")

    result = supabase.table("automations").update(updates).eq("id", automation_id).execute()
    return result.data[0]


@router.delete("/automations/{automation_id}", status_code=204)
async def delete_automation(automation_id: str, user=Depends(get_current_user)):
    business_id = user.get("business_id")

    existing = supabase.table("automations").select("id").eq("id", automation_id).eq("business_id", business_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Automation not found.")

    supabase.table("automations").delete().eq("id", automation_id).execute()
    return