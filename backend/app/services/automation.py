from supabase import create_client
from app.config import settings

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


async def get_matching_automation(message_text: str) -> str | None:
    # Get all active automations
    result = supabase.table("automations").select("*").eq("is_active", True).execute()
    automations = result.data

    if not automations:
        return None

    text_lower = message_text.lower()

    # Check keyword matches first (more specific)
    for rule in automations:
        if rule["trigger_type"] == "contains_keyword" and rule["keyword"]:
            if rule["keyword"] in text_lower:
                return rule["response"]

    # Fall back to any_message rule
    for rule in automations:
        if rule["trigger_type"] == "any_message":
            return rule["response"]

    return None