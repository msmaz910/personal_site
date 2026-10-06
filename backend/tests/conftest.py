"""Shared fixtures: a fake OpenRouter client wired into the app."""

from types import SimpleNamespace

import pytest

from app.chat import get_client
from app.config import Settings, get_settings
from app.main import app


class FakeClient:
    """Stands in for the OpenAI client and records each create() call."""

    def __init__(self):
        self.reply = "Michelle uses SQL, Python, and dbt."
        self.error = None
        self.calls = []
        self.chat = SimpleNamespace(completions=self)

    def create(self, **kwargs):
        """Record the request, then raise the set error or return the reply."""
        self.calls.append(kwargs)
        if self.error:
            raise self.error
        message = SimpleNamespace(content=self.reply)
        return SimpleNamespace(choices=[SimpleNamespace(message=message)])


@pytest.fixture
def fake():
    client = FakeClient()
    settings = Settings(
        _env_file=None,
        openrouter_api_key="test-key",
        openrouter_model="test/model",
        max_reply_tokens=123,
        max_message_chars=50,
        max_user_messages=3,
        max_history_messages=6,
    )
    app.dependency_overrides[get_client] = lambda: client
    app.dependency_overrides[get_settings] = lambda: settings
    yield client
    app.dependency_overrides.clear()
