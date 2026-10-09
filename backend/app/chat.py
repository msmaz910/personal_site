"""OpenRouter chat client and the request and response models for /api/chat."""

from functools import lru_cache
from typing import Literal

from fastapi import HTTPException
from openai import OpenAI
from pydantic import BaseModel, Field

from app.cleaning import MAX_REPLY_CHARS, clean_reply
from app.config import Settings, get_settings
from app.prompts import build_system_prompt, load_profile

UNAVAILABLE_MESSAGE = (
    "The chat is unavailable right now. Please try again later, "
    "or reach Michelle by email or on LinkedIn."
)
FALLBACK_REPLY = (
    "I'm not sure how to answer that. Please try rephrasing, "
    "or reach Michelle by email or on LinkedIn."
)
CLOSING_MESSAGE = (
    "Thank you for the great conversation! I've reached the limit for this chat, "
    "but Michelle would be glad to answer anything else. You can contact her at "
    "michelle.mazzotta@gmail.com or on LinkedIn."
)


class Message(BaseModel):
    """One chat turn. Visitors cannot send system messages."""

    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    """The conversation so far, oldest message first."""

    messages: list[Message] = Field(min_length=1)


class ChatResponse(BaseModel):
    """The reply, and whether the chat has reached its user message limit."""

    reply: str
    limit_reached: bool = False


@lru_cache
def get_client() -> OpenAI:
    """Return the shared OpenRouter client."""
    settings = get_settings()
    return OpenAI(
        api_key=settings.openrouter_api_key,
        base_url=settings.openrouter_base_url,
        timeout=30,
        max_retries=1,
    )


def check_message_lengths(settings: Settings, messages: list[Message]) -> None:
    """Raise a 422 if a user message or a bot reply is longer than its limit.

    Bot replies are cut to MAX_REPLY_CHARS by `clean_reply`, so a longer one
    was not sent by this API.
    """
    limit = settings.max_message_chars
    limits = {"user": limit, "assistant": MAX_REPLY_CHARS}
    if any(len(m.content) > limits[m.role] for m in messages):
        raise HTTPException(
            status_code=422,
            detail=f"Your message is too long. Please keep it under {limit} "
            "characters.",
        )


def check_message_count(settings: Settings, messages: list[Message]) -> None:
    """Raise a 422 if the history is longer than a real chat can be.

    The most is every allowed user message, the replies between them, and one
    final user message that gets the closing message.
    """
    if len(messages) > 2 * settings.max_user_messages + 1:
        raise HTTPException(
            status_code=422,
            detail="This conversation is too long. Please start a new chat.",
        )


def check_not_blank(messages: list[Message]) -> None:
    """Raise a 422 if any message is empty or only whitespace."""
    if any(not m.content.strip() for m in messages):
        raise HTTPException(
            status_code=422, detail="Your message is empty. Please type a question."
        )


def check_ends_with_user(messages: list[Message]) -> None:
    """Raise a 422 if the newest message is not from the visitor."""
    if messages[-1].role != "user":
        raise HTTPException(
            status_code=422, detail="The last message must be from you."
        )


def validate_messages(settings: Settings, messages: list[Message]) -> None:
    """Run every request check, cheapest first, before any model call."""
    check_message_count(settings, messages)
    check_not_blank(messages)
    check_ends_with_user(messages)
    check_message_lengths(settings, messages)


def is_over_user_limit(settings: Settings, messages: list[Message]) -> bool:
    """Return True when the history holds more user messages than allowed."""
    return sum(m.role == "user" for m in messages) > settings.max_user_messages


def get_reply(
    client: OpenAI, settings: Settings, messages: list[Message]
) -> ChatResponse:
    """Send the system prompt and conversation to the model; return the cleaned reply.

    Rejects invalid requests (too many, blank, too long, or not ending on a user
    message) with a 422, and returns CLOSING_MESSAGE with `limit_reached` set,
    without calling the model, once the user message limit is passed.
    Only the newest `max_history_messages` messages are sent. Falls back to
    FALLBACK_REPLY when nothing is left after cleaning.
    """
    validate_messages(settings, messages)
    if is_over_user_limit(settings, messages):
        return ChatResponse(reply=CLOSING_MESSAGE, limit_reached=True)
    system = {"role": "system", "content": build_system_prompt(load_profile())}
    recent = messages[-settings.max_history_messages :]
    history = [message.model_dump() for message in recent]
    completion = client.chat.completions.create(
        model=settings.openrouter_model,
        messages=[system, *history],
        max_tokens=settings.max_reply_tokens,
    )
    reply = clean_reply(completion.choices[0].message.content) or FALLBACK_REPLY
    return ChatResponse(reply=reply)
