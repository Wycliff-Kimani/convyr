from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from supabase import create_client
from app.config import settings
from app.services.auth import hash_password, verify_password, create_access_token, decode_access_token
import logging

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


class RegisterRequest(BaseModel):
    business_name: str
    email: EmailStr
    password: str
    full_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/auth/register", status_code=201)
async def register(data: RegisterRequest):
    email = data.email.lower().strip()

    # Check if email already exists in users
    existing_user = supabase.table("users").select("id").eq("email", email).execute()
    if existing_user.data:
        raise HTTPException(status_code=400, detail="Email already registered.")

    # Check if email already exists in businesses
    existing_business = supabase.table("businesses").select("id").eq("email", email).execute()
    if existing_business.data:
        raise HTTPException(status_code=400, detail="Email already registered.")

    # Create business
    business = supabase.table("businesses").insert({
        "name": data.business_name,
        "email": email,
    }).execute()
    business_id = business.data[0]["id"]

    # Create user
    user = supabase.table("users").insert({
        "business_id": business_id,
        "email": email,
        "hashed_password": hash_password(data.password),
        "full_name": data.full_name,
        "role": "owner",
    }).execute()

    token = create_access_token({"sub": user.data[0]["id"], "business_id": business_id})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.data[0]["id"],
            "email": email,
            "full_name": data.full_name,
            "business_id": business_id,
        }
    }


@router.post("/auth/login")
async def login(data: LoginRequest):
    email = data.email.lower().strip()

    result = supabase.table("users").select("*").eq("email", email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    user = result.data[0]

    if not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not user["is_active"]:
        raise HTTPException(status_code=403, detail="Account is disabled.")

    token = create_access_token({"sub": user["id"], "business_id": user["business_id"]})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "business_id": user["business_id"],
        }
    }


@router.get("/auth/me")
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    user_id = payload.get("sub")
    result = supabase.table("users").select("id, email, full_name, business_id, role").eq("id", user_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="User not found.")

    return result.data[0]