"""Live check that starter-question answers are plain text and not job pitches.

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


@pytest.mark.live
@pytest.mark.parametrize("question", STARTER_QUESTIONS)
def test_starter_answer_is_plain_and_not_a_job_invite(question):
    reply = get_reply(
        get_client(), get_settings(), [Message(role="user", content=question)]
    ).reply

    assert "**" not in reply, reply
    assert not HEADING.search(reply), reply
    assert not JOB_INVITE.search(reply), reply
