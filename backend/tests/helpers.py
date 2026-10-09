"""Small helpers shared by the chat tests."""

from fastapi.testclient import TestClient

from app.main import app
from app.prompts import build_system_prompt, load_profile

SYSTEM = {"role": "system", "content": build_system_prompt(load_profile())}

HISTORY = [
    {"role": "user", "content": "What does Michelle do?"},
    {"role": "assistant", "content": "She leads analytics."},
    {"role": "user", "content": "Which tools does she use?"},
]


def post_chat(messages):
    return TestClient(app).post("/api/chat", json={"messages": messages})


def conversation(user_count):
    """Build alternating user and assistant turns that end on a user message."""
    turns = []
    for i in range(user_count):
        turns.append({"role": "user", "content": f"question {i}"})
        turns.append({"role": "assistant", "content": f"answer {i}"})
    return turns[:-1]
