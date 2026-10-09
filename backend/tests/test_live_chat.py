"""Live check that starter-question answers are plain, short, and not job pitches.

Makes real OpenRouter calls. Run with `uv run pytest -m live --no-cov`.
"""

import pytest
from helpers import ask, format_problems

# Copied from frontend/src/data/chat.ts (starterQuestions).
STARTER_QUESTIONS = [
    "What's her current role?",
    "What's her career goal?",
    "How did she get into analytics?",
    "What skills does she have?",
]


@pytest.mark.live
@pytest.mark.parametrize("question", STARTER_QUESTIONS)
def test_starter_answer_is_plain_short_and_not_a_job_invite(question):
    reply = ask(question)
    problems = format_problems(reply)
    assert not problems, f"{problems}: {reply}"
