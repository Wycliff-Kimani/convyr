from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from supabase import create_client
from app.config import settings
from app.services.auth import decode_access_token
from app.services.payhero import initiate_stk_push, check_payment_status
import logging
import uuid

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

PLAN_PRICES = {
    "basic": 2000,
    "pro": 5000,
}


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    return payload


class InitiatePaymentRequest(BaseModel):
    phone_number: str
    plan: str


@router.post("/payments/initiate")
async def initiate_payment(data: InitiatePaymentRequest, user=Depends(get_current_user)):
    business_id = user.get("business_id")

    # Validate plan
    if data.plan not in PLAN_PRICES:
        raise HTTPException(status_code=400, detail="Invalid plan. Choose 'basic' or 'pro'.")

    amount = PLAN_PRICES[data.plan]
    external_reference = str(uuid.uuid4())

    # Save pending payment to database
    supabase.table("payments").insert({
        "business_id": business_id,
        "amount": amount,
        "phone_number": data.phone_number,
        "external_reference": external_reference,
        "status": "pending",
        "plan": data.plan,
    }).execute()

    # Initiate STK push
    try:
        result = await initiate_stk_push(
            phone_number=data.phone_number,
            amount=amount,
            external_reference=external_reference,
        )
        logger.info(f"STK push initiated: {result}")
    except Exception as e:
        logger.error(f"STK push failed: {str(e)}")
        # Update payment status to failed
        supabase.table("payments").update({"status": "failed"}).eq("external_reference", external_reference).execute()
        raise HTTPException(status_code=500, detail="Failed to initiate payment. Please try again.")

    return {
        "status": "pending",
        "message": "M-Pesa prompt sent to your phone. Enter your PIN to complete payment.",
        "external_reference": external_reference,
        "amount": amount,
        "plan": data.plan,
    }


@router.post("/payments/callback")
async def payment_callback(request: Request):
    payload = await request.json()
    logger.info(f"Payment callback received: {payload}")

    try:
        # PayHero callback structure
        external_reference = payload.get("external_reference")
        status = payload.get("status")

        if not external_reference:
            return {"status": "ok"}

        if status == "Success":
            # Update payment status
            supabase.table("payments").update({
                "status": "completed",
                "payhero_reference": payload.get("provider_reference"),
            }).eq("external_reference", external_reference).execute()

            # Get payment to find business_id and plan
            payment = supabase.table("payments").select("*").eq("external_reference", external_reference).execute()
            if payment.data:
                business_id = payment.data[0]["business_id"]
                plan = payment.data[0]["plan"]

                # Activate subscription
                supabase.table("businesses").update({
                    "subscription_status": "active",
                    "subscription_plan": plan,
                }).eq("id", business_id).execute()

                logger.info(f"Subscription activated for business {business_id} on {plan} plan")

        elif status == "Failed":
            supabase.table("payments").update({
                "status": "failed",
            }).eq("external_reference", external_reference).execute()

    except Exception as e:
        logger.error(f"Error processing payment callback: {str(e)}")

    return {"status": "ok"}


@router.get("/payments/status/{external_reference}")
async def get_payment_status(external_reference: str, user=Depends(get_current_user)):
    result = supabase.table("payments").select("*").eq("external_reference", external_reference).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Payment not found.")

    return result.data[0]


@router.get("/payments/history")
async def get_payment_history(user=Depends(get_current_user)):
    business_id = user.get("business_id")
    result = supabase.table("payments").select("*").eq("business_id", business_id).order("created_at", desc=True).execute()
    return {"payments": result.data, "total": len(result.data)}