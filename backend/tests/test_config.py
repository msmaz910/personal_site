"""Tests for settings loaded from environment variables."""

import pytest
from pydantic import ValidationError

from app.config import Settings


def test_settings_load_from_env(monkeypatch):
    monkeypatch.setenv("OPENROUTER_API_KEY", "test-key")
    monkeypatch.setenv("OPENROUTER_MODEL", "test/model")
    monkeypatch.setenv("PORT", "9000")
    monkeypatch.setenv("MAX_MESSAGE_CHARS", "500")
    monkeypatch.setenv("MAX_REPLY_TOKENS", "300")
    monkeypatch.setenv("MAX_USER_MESSAGES", "5")
    monkeypatch.setenv("MAX_HISTORY_MESSAGES", "8")

    settings = Settings(_env_file=None)

    assert settings.openrouter_api_key == "test-key"
    assert settings.openrouter_model == "test/model"
    assert settings.port == 9000
    assert settings.max_message_chars == 500
    assert settings.max_reply_tokens == 300
    assert settings.max_user_messages == 5
    assert settings.max_history_messages == 8


def test_missing_api_key_fails_clearly(monkeypatch):
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)

    with pytest.raises(ValidationError, match="openrouter_api_key"):
        Settings(_env_file=None)
