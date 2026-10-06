"""Live test that makes one real OpenRouter call.

Run with `uv run pytest -m live --no-cov`.
"""

import pytest
from openai import OpenAI

from app.config import get_settings


@pytest.mark.live
def test_openrouter_returns_reply():
    settings = get_settings()
    client = OpenAI(
        api_key=settings.openrouter_api_key, base_url=settings.openrouter_base_url
    )

    completion = client.chat.completions.create(
        model=settings.openrouter_model,
        messages=[{"role": "user", "content": "Reply with the single word: ready"}],
        max_tokens=20,
    )

    assert completion.choices[0].message.content.strip()
