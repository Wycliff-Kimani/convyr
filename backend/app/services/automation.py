import hashlib
from datetime import datetime, timezone, timedelta
from supabase import create_client
from app.config import settings

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

COOLDOWN_HOURS = 4


def get_reply_hash(reply_text: str) -> str:
    return hashlib.md5(reply_text.strip().lower().encode()).hexdigest()


async def was_reply_sent_recently(contact_id: str, reply_hash: str) -> bool:
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=COOLDOWN_HOURS)).isoformat()
    result = supabase.table("contact_reply_history").select("id").eq(
        "contact_id", contact_id
    ).eq(
        "reply_hash", reply_hash
    ).gte("sent_at", cutoff).execute()
    return len(result.data) > 0


async def record_reply_sent(contact_id: str, business_id: str, reply_hash: str):
    supabase.table("contact_reply_history").insert({
        "contact_id": contact_id,
        "business_id": business_id,
        "reply_hash": reply_hash,
    }).execute()


async def get_matching_automation(message_text: str, contact_id: str, business_id: str) -> str | None:
    # Get active automations for THIS business only
    result = supabase.table("automations").select("*").eq("is_active", True).eq("business_id", business_id).execute()
    automations = result.data

    if not automations:
        return None

    text_lower = message_text.lower()

    keyword_map = {}
    any_message_response = None

    for rule in automations:
        if rule["trigger_type"] == "contains_keyword" and rule["keyword"]:
            keyword_map[rule["keyword"].lower()] = rule["response"]
        elif rule["trigger_type"] == "any_message":
            any_message_response = rule["response"]

    matched_reply = None

    # Match directly against database keywords — no hardcoded lists
    for keyword, response in keyword_map.items():
        if keyword in text_lower:
            matched_reply = response
            break

    if not matched_reply and any_message_response:
        matched_reply = any_message_response

    if not matched_reply:
        return None

    reply_hash = get_reply_hash(matched_reply)
    already_sent = await was_reply_sent_recently(contact_id, reply_hash)

    if already_sent:
        return None

    await record_reply_sent(contact_id, business_id, reply_hash)

    return matched_reply