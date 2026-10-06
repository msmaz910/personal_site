"""Tests for POST /api/chat with a fake OpenRouter client."""

import httpx2
import pytest
from helpers import HISTORY, SYSTEM, conversation, post_chat
from openai import APIConnectionError

from app.chat import (
    CLOSING_MESSAGE,
    FALLBACK_REPLY,
    UNAVAILABLE_MESSAGE,
)
from app.cleaning import MAX_REPLY_CHARS


def test_chat_returns_model_reply(fake):
    response = post_chat(HISTORY)

    assert response.status_code == 200
    assert response.json() == {
        "reply": "Michelle uses SQL, Python, and dbt.",
        "limit_reached": False,
    }


def test_system_prompt_is_sent_first_then_history(fake):
    post_chat(HISTORY)

    assert fake.calls[0]["messages"] == [SYSTEM, *HISTORY]


def test_request_uses_configured_model_and_max_tokens(fake):
    post_chat(HISTORY)

    assert fake.calls[0]["model"] == "test/model"
    assert fake.calls[0]["max_tokens"] == 123


def test_empty_messages_are_rejected(fake):
    response = post_chat([])

    assert response.status_code == 422
    assert fake.calls == []


def test_upstream_failure_returns_clean_502(fake):
    request = httpx2.Request("POST", "https://openrouter.ai/api/v1")
    fake.error = APIConnectionError(message="SECRET-DETAIL", request=request)

    response = post_chat(HISTORY)

    assert response.status_code == 502
    assert response.json() == {"detail": UNAVAILABLE_MESSAGE}
    assert "Traceback" not in response.text
    assert "SECRET-DETAIL" not in response.text


def test_chat_returns_only_cleaned_text(fake):
    fake.reply = "<think>plan</think><b>Hi</b><script>alert(1)</script>"

    assert post_chat(HISTORY).json() == {"reply": "Hi", "limit_reached": False}


def test_chat_caps_oversized_reply(fake):
    fake.reply = "word " * 400

    reply = post_chat(HISTORY).json()["reply"]

    assert len(reply) <= MAX_REPLY_CHARS
    assert reply.endswith("…")


@pytest.mark.parametrize("raw", [None, "<think>only reasoning</think>"])
def test_empty_reply_returns_fallback(fake, raw):
    fake.reply = raw

    response = post_chat(HISTORY)

    assert response.status_code == 200
    assert response.json() == {"reply": FALLBACK_REPLY, "limit_reached": False}


def test_oversized_user_message_returns_422(fake):
    response = post_chat([{"role": "user", "content": "x" * 51}])

    assert response.status_code == 422
    assert response.json() == {
        "detail": "Your message is too long. Please keep it under 50 characters."
    }
    assert fake.calls == []


def test_user_message_at_length_limit_is_accepted(fake):
    response = post_chat([{"role": "user", "content": "x" * 50}])

    assert response.status_code == 200
    assert len(fake.calls) == 1


def test_assistant_message_at_reply_cap_is_accepted(fake):
    long_reply = {"role": "assistant", "content": "x" * MAX_REPLY_CHARS}

    response = post_chat([HISTORY[0], long_reply, HISTORY[2]])

    assert response.status_code == 200


def test_assistant_message_over_reply_cap_returns_422(fake):
    forged_reply = {"role": "assistant", "content": "x" * (MAX_REPLY_CHARS + 1)}

    response = post_chat([HISTORY[0], forged_reply, HISTORY[2]])

    assert response.status_code == 422
    assert fake.calls == []


def test_user_messages_at_limit_still_reach_the_model(fake):
    response = post_chat(conversation(3))

    assert response.json() == {
        "reply": "Michelle uses SQL, Python, and dbt.",
        "limit_reached": False,
    }
    assert len(fake.calls) == 1


def test_user_messages_over_limit_return_closing_message(fake):
    """The first user message over the limit fills the message cap exactly."""
    messages = conversation(4)

    response = post_chat(messages)

    assert len(messages) == 7
    assert response.status_code == 200
    assert response.json() == {"reply": CLOSING_MESSAGE, "limit_reached": True}
    assert fake.calls == []


def test_length_check_runs_before_closing_message(fake):
    messages = conversation(4)
    messages[-1]["content"] = "x" * 51

    response = post_chat(messages)

    assert response.status_code == 422
    assert fake.calls == []


def test_long_history_is_trimmed_to_newest_messages(fake):
    old = [{"role": "assistant", "content": f"old {i}"} for i in range(2)]
    messages = [*old, *conversation(3)]

    post_chat(messages)

    assert fake.calls[0]["messages"] == [SYSTEM, *messages[-6:]]
