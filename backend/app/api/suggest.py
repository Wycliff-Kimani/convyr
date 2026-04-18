from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List
import anthropic
from app.config import settings
from app.services.auth import decode_access_token
import logging

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()


class MessageItem(BaseModel):
    direction: str  # "inbound" or "outbound"
    content: str


class SuggestReplyRequest(BaseModel):
    messages: List[MessageItem]  # last N messages for context


@router.post("/suggest-reply")
async def suggest_reply(
    data: SuggestReplyRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    if not settings.ANTHROPIC_API_KEY:
        raise HTTPException(status_code=503, detail="AI suggestions not configured.")

    if not data.messages:
        raise HTTPException(status_code=400, detail="No messages provided.")

    # Build conversation history for Claude
    conversation_lines = []
    for msg in data.messages[-10:]:  # last 10 messages max
        role = "Customer" if msg.direction == "inbound" else "You (Business)"
        conversation_lines.append(f"{role}: {msg.content}")

    conversation_text = "\n".join(conversation_lines)

    prompt = f"""You are a helpful WhatsApp business assistant for a Kenyan SME. 
Based on this conversation, suggest a short, professional, friendly reply to the customer's last message.

Conversation:
{conversation_text}

Write ONLY the reply message itself. No explanations, no quotes, no labels. 
Keep it concise (1-3 sentences), warm, and professional.
If relevant, use simple Kenyan business English. Do not use emojis unless the conversation style calls for it."""

    try:
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}],
        )
        suggestion = response.content[0].text.strip()
        return {"suggestion": suggestion}

    except Exception as e:
        logger.error(f"AI suggestion failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate suggestion.")