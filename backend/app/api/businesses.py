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


@router.get("/business")
async def get_business(user=Depends(get_current_user)):
    business_id = user.get("business_id")
    result = supabase.table("businesses").select(
        "id, name, email, phone_number, subscription_plan, subscription_status, created_at"
    ).eq("id", business_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Business not found.")

    return result.data[0]