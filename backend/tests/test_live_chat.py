"""Live check that starter-question answers are plain, short, and not job pitches.

Makes real OpenRouter calls. Run with `uv run pytest -m live --no-cov`.
"""

import re

import pytest

from app.chat import Message, get_client, get_reply
from app.config import get_settings

# Copied from frontend/src/data/chat.ts (starterQuestions).
STARTER_QUESTIONS = [
    "What's her current role?",
    "What's her career goal?",
    "How did she get into analytics?",
    "What skills does she have?",
]

HEADING = re.compile(r"^#+\s", re.MULTILINE)
# Not "opportunit" alone: the profile says "cost saving opportunities".
JOB_INVITE = re.compile(r"(discuss|job|new|career|future) opportunit", re.IGNORECASE)
# Prompt asks for under 50 words. 80 allows for run-to-run variation and dash markers
# (counted as words), and still catches the old 132-word answers.
MAX_FIRST_ANSWER_WORDS = 80


@pytest.mark.live
@pytest.mark.parametrize("question", STARTER_QUESTIONS)
def test_starter_answer_is_plain_short_and_not_a_job_invite(question):
    reply = get_reply(
        get_client(), get_settings(), [Message(role="user", content=question)]
    ).reply

    assert "**" not in reply, reply
    assert not HEADING.search(reply), reply
    assert not JOB_INVITE.search(reply), reply
    words = len(reply.split())
    assert words <= MAX_FIRST_ANSWER_WORDS, f"{words} words: {reply}"
