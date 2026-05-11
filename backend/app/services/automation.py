import hashlib
from datetime import datetime, timezone, timedelta
from supabase import create_client
from app.config import settings

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

FALLBACK_REPLY_HASH = hashlib.md5("__fallback__".encode()).hexdigest()


def get_reply_hash(reply_text: str) -> str:
    return hashlib.md5(reply_text.strip().lower().encode()).hexdigest()


async def was_reply_sent_recently(contact_id: str, reply_hash: str, cooldown_minutes: int) -> bool:
    cutoff = (datetime.now(timezone.utc) - timedelta(minutes=cooldown_minutes)).isoformat()
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
    result = supabase.table("automations").select("*").eq("is_active", True).eq("business_id", business_id).execute()
    automations = result.data

    if not automations:
        return None

    text_lower = message_text.lower()

    keyword_automations = []
    any_message_automation = None

    for rule in automations:
        if rule["trigger_type"] == "contains_keyword" and rule["keyword"]:
            keyword_automations.append(rule)
        elif rule["trigger_type"] == "any_message":
            any_message_automation = rule

    matched_rule = None

    for rule in keyword_automations:
        keywords = [k.strip().lower() for k in rule["keyword"].split(",") if k.strip()]
        if any(keyword in text_lower for keyword in keywords):
            matched_rule = rule
            break

    if not matched_rule and any_message_automation:
        matched_rule = any_message_automation

    if not matched_rule:
        return None

    matched_reply = matched_rule["response"]
    cooldown_minutes = matched_rule.get("cooldown_minutes", 240)

    reply_hash = get_reply_hash(matched_reply)
    already_sent = await was_reply_sent_recently(contact_id, reply_hash, cooldown_minutes)

    if already_sent:
        return None

    await record_reply_sent(contact_id, business_id, reply_hash)

    return matched_reply