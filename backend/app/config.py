"""Application settings loaded from environment variables and `.env`."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings. `openrouter_api_key` is required."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    openrouter_api_key: str
    openrouter_model: str = "anthropic/claude-sonnet-5"
    port: int = 8000
    max_message_chars: int = 1000
    max_reply_tokens: int = 500
    max_user_messages: int = 10


@lru_cache
def get_settings() -> Settings:
    """Return the shared settings instance."""
    return Settings()
