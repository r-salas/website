#
#
#   Voice
#
#
#   Realtime voice over Rubén's CV, backed by the Gemini Live API.
#
#   The browser talks to Gemini directly over WebSockets; this endpoint only mints a short-lived,
#   single-use ephemeral token with the whole session setup (model, prompt, voice…) locked in, so
#   neither the API key nor the system prompt can be tampered with client-side.
#

import logging
from datetime import UTC, datetime, timedelta

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from chat import CV_MARKDOWN_PATH, MAX_HISTORY_MESSAGES, ChatMessage
from config import settings

AUTH_TOKENS_URL = "https://generativelanguage.googleapis.com/v1beta/auth_tokens"

# The token must be used to open a session within this window...
NEW_SESSION_WINDOW = timedelta(minutes=1)
# ...and the session is cut off after this, which also caps the cost of a single visitor.
SESSION_DURATION = timedelta(minutes=10)

SYSTEM_PROMPT = f"""\
You are the voice assistant embedded in Rubén Salas's personal website. Visitors talk to you \
out loud to learn about his professional background, skills and projects.

Answer using only the CV below. If something isn't covered by it, say you don't have that \
information and suggest reaching out to Rubén directly instead of guessing.

Speak as a knowledgeable assistant representing Rubén (third person), be warm and professional. \
This is a spoken conversation: keep replies short (a few sentences), never use markdown, lists \
or URLs, and reply in the same language the visitor is speaking.

--- CV START ---
{CV_MARKDOWN_PATH.read_text(encoding="utf-8")}
--- CV END ---
"""


LANGUAGES = {"en": "English", "es": "Spanish"}


class VoiceTokenRequest(BaseModel):
    # Prior text chat, so switching from typing to talking keeps the context.
    messages: list[ChatMessage] = []
    # The website's UI language, used until the visitor speaks another one.
    language: str = "en"


class VoiceTokenResponse(BaseModel):
    token: str
    model: str


logger = logging.getLogger(__name__)

router = APIRouter()


def _system_instruction(messages: list[ChatMessage], language: str) -> str:
    language_name = LANGUAGES.get(language, LANGUAGES["en"])
    prompt = (
        f"{SYSTEM_PROMPT}\n"
        f"The visitor is browsing the website in {language_name}: greet them and speak {language_name} "
        "until they start speaking another language.\n"
    )

    history = messages[-MAX_HISTORY_MESSAGES:]
    if not history:
        return prompt

    transcript = "\n".join(f"{message.role}: {message.content}" for message in history)
    return (
        f"{prompt}\n"
        "The visitor has already been chatting with you by text; continue that conversation:\n"
        f"--- CONVERSATION START ---\n{transcript}\n--- CONVERSATION END ---\n"
    )


@router.post("/voice/token")
async def create_voice_token(request: VoiceTokenRequest) -> VoiceTokenResponse:
    now = datetime.now(UTC)
    model = f"models/{settings.gemini_live_model}"

    # With no fieldMask, this setup fully replaces whatever the client sends on connect.
    body = {
        "uses": 1,
        "expireTime": (now + SESSION_DURATION).isoformat(),
        "newSessionExpireTime": (now + NEW_SESSION_WINDOW).isoformat(),
        "bidiGenerateContentSetup": {
            "model": model,
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {
                    "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": settings.gemini_live_voice}},
                },
            },
            "systemInstruction": {"parts": [{"text": _system_instruction(request.messages, request.language)}]},
            "inputAudioTranscription": {},
            "outputAudioTranscription": {},
        },
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                AUTH_TOKENS_URL,
                headers={"x-goog-api-key": settings.gemini_api_key},
                json=body,
            )
            response.raise_for_status()
    except httpx.HTTPStatusError as error:
        logger.error("Gemini ephemeral token creation failed: %s", error.response.text)
        raise HTTPException(status_code=502, detail="Voice assistant unavailable")
    except httpx.HTTPError:
        logger.exception("Gemini ephemeral token creation failed")
        raise HTTPException(status_code=502, detail="Voice assistant unavailable")

    return VoiceTokenResponse(token=response.json()["name"], model=model)
