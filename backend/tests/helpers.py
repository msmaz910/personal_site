"""Small helpers shared by the chat tests."""

import re

from fastapi.testclient import TestClient

from app.chat import Message, get_client, get_reply
from app.config import get_settings
from app.main import app
from app.prompts import build_system_prompt, load_profile

SYSTEM = {"role": "system", "content": build_system_prompt(load_profile())}

HISTORY = [
    {"role": "user", "content": "What does Michelle do?"},
    {"role": "assistant", "content": "She leads analytics."},
    {"role": "user", "content": "Which tools does she use?"},
]

HEADING = re.compile(r"^#+\s", re.MULTILINE)
# Not "opportunit" alone: the profile says "cost saving opportunities".
JOB_INVITE = re.compile(r"(discuss|job|new|career|future) opportunit", re.IGNORECASE)
# Prompt asks for under 50 words. 80 allows for run-to-run variation and dash markers
# (counted as words), and still catches the old 132-word answers.
MAX_FIRST_ANSWER_WORDS = 80


def post_chat(messages):
    return TestClient(app).post("/api/chat", json={"messages": messages})


def conversation(user_count):
    """Build alternating user and assistant turns that end on a user message."""
    turns = []
    for i in range(user_count):
        turns.append({"role": "user", "content": f"question {i}"})
        turns.append({"role": "assistant", "content": f"answer {i}"})
    return turns[:-1]


def format_problems(reply, max_words=MAX_FIRST_ANSWER_WORDS):
    """Return what is wrong with a live reply's format; empty means plain and short."""
    problems = []
    if "**" in reply:
        problems.append("contains ** markdown")
    if HEADING.search(reply):
        problems.append("contains a # heading")
    if JOB_INVITE.search(reply):
        problems.append("invites a job opportunity")
    words = len(reply.split())
    if words > max_words:
        problems.append(f"{words} words, limit is {max_words}")
    return problems


def ask(question):
    """Return the real model's reply to one question. Billed: live tests only."""
    messages = [Message(role="user", content=question)]
    return get_reply(get_client(), get_settings(), messages).reply
