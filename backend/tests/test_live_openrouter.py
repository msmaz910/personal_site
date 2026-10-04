"""Live test that makes one real OpenRouter call. Run with `uv run pytest -m live`."""

import pytest
from openai import OpenAI

from app.chat import OPENROUTER_BASE_URL
from app.config import get_settings


@pytest.mark.live
def test_openrouter_returns_reply():
    settings = get_settings()
    client = OpenAI(api_key=settings.openrouter_api_key, base_url=OPENROUTER_BASE_URL)

    completion = client.chat.completions.create(
        model=settings.openrouter_model,
        messages=[{"role": "user", "content": "Reply with the single word: ready"}],
        max_tokens=20,
    )

    assert completion.choices[0].message.content.strip()
