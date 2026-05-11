from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client
from app.config import settings
from app.services.auth import decode_access_token
from datetime import datetime, timezone, timedelta
from collections import defaultdict
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


def parse_ts(ts: str) -> datetime:
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except Exception:
        return datetime.min.replace(tzinfo=timezone.utc)


@router.get("/dashboard/stats")
async def get_dashboard_stats(user=Depends(get_current_user)):
    business_id = user.get("business_id")

    # WhatsApp connection status
    biz = supabase.table("businesses").select(
        "whatsapp_phone_number_id"
    ).eq("id", business_id).execute()
    is_whatsapp_connected = bool(
        biz.data and biz.data[0].get("whatsapp_phone_number_id")
    )

    # Total contacts
    contacts_count = supabase.table("contacts").select(
        "id", count="exact"
    ).eq("business_id", business_id).execute()
    total_contacts = contacts_count.count or 0

    # Total outbound (for ROI)
    outbound_count_result = supabase.table("messages").select(
        "id", count="exact"
    ).eq("business_id", business_id).eq("direction", "outbound").execute()
    outbound_count = outbound_count_result.count or 0

    # Fetch recent 500 messages for stat computation
    msgs_result = supabase.table("messages").select(
        "id, contact_id, direction, content, created_at, replied_by_admin"
    ).eq("business_id", business_id).order(
        "created_at", desc=True
    ).limit(500).execute()
    messages = list(reversed(msgs_result.data or []))  # oldest first

    # Group by contact
    contact_msgs: dict = defaultdict(list)
    for msg in messages:
        contact_msgs[msg["contact_id"]].append(msg)

    # Outbound times per contact for auto-reply detection
    outbound_times: dict = defaultdict(list)
    for msg in messages:
        if msg["direction"] == "outbound":
            outbound_times[msg["contact_id"]].append(msg["created_at"])

    one_hour_ago = (
        datetime.now(timezone.utc) - timedelta(hours=1)
    ).isoformat()

    new_leads = 0
    needs_reply = 0
    missed_opportunities = 0
    orders_tracked = 0

    for cid, msgs in contact_msgs.items():
        last_msg = msgs[-1]

        if len(msgs) <= 3:
            new_leads += 1

        if last_msg["direction"] == "inbound" and not last_msg.get("replied_by_admin"):
            needs_reply += 1
            if last_msg["created_at"] < one_hour_ago:
                has_reply_after = any(
                    m["direction"] == "outbound"
                    and m["created_at"] > last_msg["created_at"]
                    for m in msgs
                )
                if not has_reply_after:
                    missed_opportunities += 1

        for m in msgs:
            if m["direction"] == "inbound":
                c = m.get("content", "").lower()
                if "order" in c or "buy" in c:
                    orders_tracked += 1
                    break

    # ROI
    estimated_hours = round((outbound_count * 2.5 / 60) * 10) / 10
    estimated_kes = round(estimated_hours * 500)

    # Recent activity — last 5 inbound with contact info
    recent_result = supabase.table("messages").select(
        "id, contact_id, direction, content, created_at, replied_by_admin, contacts(name, phone_number)"
    ).eq("business_id", business_id).eq(
        "direction", "inbound"
    ).order("created_at", desc=True).limit(5).execute()
    recent_activity = recent_result.data or []

    # Mark was_auto_replied per item
    for item in recent_activity:
        inbound_ts = parse_ts(item["created_at"])
        cid = item["contact_id"]
        item["was_auto_replied"] = any(
            inbound_ts < parse_ts(ot) <= inbound_ts + timedelta(seconds=60)
            for ot in outbound_times.get(cid, [])
        )

    return {
        "is_whatsapp_connected": is_whatsapp_connected,
        "total_contacts": total_contacts,
        "outbound_count": outbound_count,
        "new_leads": new_leads,
        "needs_reply": needs_reply,
        "missed_opportunities": missed_opportunities,
        "orders_tracked": orders_tracked,
        "estimated_hours_saved": estimated_hours,
        "estimated_kes_saved": estimated_kes,
        "sales_closed": 0,
        "recent_activity": recent_activity,
    }