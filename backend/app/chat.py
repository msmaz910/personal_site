"""OpenRouter chat client and the request and response models for /api/chat."""

from functools import lru_cache
from typing import Literal

from openai import OpenAI
from pydantic import BaseModel, Field

from app.cleaning import clean_reply
from app.config import Settings, get_settings
from app.prompts import build_system_prompt, load_profile

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
UNAVAILABLE_MESSAGE = (
    "The chat is unavailable right now. Please try again later, "
    "or reach Michelle by email or on LinkedIn."
)
FALLBACK_REPLY = (
    "I'm not sure how to answer that. Please try rephrasing, "
    "or reach Michelle by email or on LinkedIn."
)


class Message(BaseModel):
    """One chat turn. Visitors cannot send system messages."""

    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    """The conversation so far, oldest message first."""

    messages: list[Message] = Field(min_length=1)


class ChatResponse(BaseModel):
    """The model's reply."""

    reply: str


@lru_cache
def get_client() -> OpenAI:
    """Return the shared OpenRouter client."""
    return OpenAI(
        api_key=get_settings().openrouter_api_key,
        base_url=OPENROUTER_BASE_URL,
        timeout=30,
        max_retries=1,
    )


def get_reply(client: OpenAI, settings: Settings, messages: list[Message]) -> str:
    """Send the system prompt and conversation to the model; return the cleaned reply.

    Falls back to FALLBACK_REPLY when nothing is left after cleaning.
    """
    system = {"role": "system", "content": build_system_prompt(load_profile())}
    history = [message.model_dump() for message in messages]
    completion = client.chat.completions.create(
        model=settings.openrouter_model,
        messages=[system, *history],
        max_tokens=settings.max_reply_tokens,
    )
    return clean_reply(completion.choices[0].message.content) or FALLBACK_REPLY
