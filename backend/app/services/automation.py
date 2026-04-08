from supabase import create_client
from app.config import settings

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

# Keywords that should take priority over greetings
PRIORITY_KEYWORDS = [
    "order", "buy", "price", "delivery", "payment", "mpesa", 
    "help", "complaint", "hours", "thank", "bye"
]

GREETING_KEYWORDS = [
    "hi", "hello", "hey", "morning", "afternoon", 
    "evening", "habari", "mambo", "niaje"
]


async def get_matching_automation(message_text: str) -> str | None:
    # Get all active automations
    result = supabase.table("automations").select("*").eq("is_active", True).execute()
    automations = result.data

    if not automations:
        return None

    text_lower = message_text.lower()

    # Build lookup dictionary for fast access
    keyword_map = {}
    any_message_response = None

    for rule in automations:
        if rule["trigger_type"] == "contains_keyword" and rule["keyword"]:
            keyword_map[rule["keyword"]] = rule["response"]
        elif rule["trigger_type"] == "any_message":
            any_message_response = rule["response"]

    # Check priority keywords first
    for keyword in PRIORITY_KEYWORDS:
        if keyword in text_lower and keyword in keyword_map:
            return keyword_map[keyword]

    # Then check greeting keywords
    for keyword in GREETING_KEYWORDS:
        if keyword in text_lower and keyword in keyword_map:
            return keyword_map[keyword]

    # Fall back to any_message rule if exists
    if any_message_response:
        return any_message_response

    # No match
    return None