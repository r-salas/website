#
#
#   Text chat over Rubén's CV, backed by OpenRouter
#
#

import inspect
import logging
from collections.abc import AsyncIterator
from pathlib import Path
from typing import Literal

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI, OpenAIError
from pydantic import BaseModel

import settings

DATA_DIR = Path(__file__).parent / "data"
CV_MARKDOWN_PATH = DATA_DIR / "Ruben_Salas_ML_Engineer_CV.md"

# Keep the request small and bounded
MAX_HISTORY_MESSAGES = 30


openai_client = AsyncOpenAI(
    api_key=settings.OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1",
    default_headers={
        "HTTP-Referer": settings.SITE_URL,
        "X-Title": settings.SITE_TITLE,
    },
)

SYSTEM_PROMPT = inspect.cleandoc("""
    You are the AI assistant embedded in Rubén Salas's personal website. Visitors chat with you 
    to learn about his professional background, skills and projects.
    
    Answer using only the CV below. If something isn't covered by it, say you don't have that 
    information and suggest reaching out to Rubén directly instead of guessing.
    
    Speak as a knowledgeable assistant representing Rubén (third person), be concise, warm and 
    professional, and reply in the same language the visitor is writing in.
    
    --- CV START ---
    {CV_MARKDOWN_PATH}
    --- CV END ---
""").format(
    CV_MARKDOWN_PATH=CV_MARKDOWN_PATH.read_text(encoding="utf-8")
)


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


logger = logging.getLogger(__name__)

router = APIRouter()


async def _stream_reply(messages: list[ChatMessage]) -> AsyncIterator[str]:
    history = messages[-MAX_HISTORY_MESSAGES:]

    try:
        stream = await openai_client.chat.completions.create(
            model=settings.OPENROUTER_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                *[{"role": message.role, "content": message.content} for message in history],
            ],
            stream=True,
        )

        async for chunk in stream:
            delta = chunk.choices[0].delta.content if chunk.choices else None
            if delta:
                yield delta
    except OpenAIError:
        # The response has already started streaming with a 200 status by the time the model
        # call can fail, so surface the error as assistant text instead of an HTTP error.
        logger.exception("OpenRouter chat completion failed")
        yield "Sorry, I'm having trouble reaching the assistant right now. Please try again in a moment."


@router.post("/chat")
def chat(request: ChatRequest):
    return StreamingResponse(_stream_reply(request.messages), media_type="text/plain")
