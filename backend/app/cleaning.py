"""Clean model replies before they reach the visitor."""

import re

MAX_REPLY_CHARS = 1200
ELLIPSIS = "…"

FLAGS = re.DOTALL | re.IGNORECASE
CLOSED_THINK = re.compile(r"<think>.*?</think\s*>", FLAGS)
UNCLOSED_THINK = re.compile(r"<think>.*", FLAGS)
BEFORE_STRAY_THINK_END = re.compile(r".*</think\s*>", FLAGS)
CLOSED_SCRIPT_OR_STYLE = re.compile(r"<(script|style)\b.*?</\1\s*>", FLAGS)
UNCLOSED_SCRIPT_OR_STYLE = re.compile(r"<(?:script|style)\b.*", FLAGS)
TAG = re.compile(r"</?[a-z][^>]*>", re.IGNORECASE)
EXTRA_BLANK_LINES = re.compile(r"\n{3,}")


def clean_reply(content: str | None) -> str:
    """Return the reply as plain, tidy text within the length cap; "" if empty."""
    text = remove_reasoning(content or "")
    text = remove_scripts_and_styles(text)
    text = TAG.sub("", text)
    text = EXTRA_BLANK_LINES.sub("\n\n", text.strip())
    return cap_length(text)


def remove_reasoning(text: str) -> str:
    """Drop <think> blocks, an unclosed <think> tail, and text before a stray end."""
    text = CLOSED_THINK.sub("", text)
    text = UNCLOSED_THINK.sub("", text)
    return BEFORE_STRAY_THINK_END.sub("", text)


def remove_scripts_and_styles(text: str) -> str:
    """Drop <script> and <style> blocks with their contents, closed or not."""
    text = CLOSED_SCRIPT_OR_STYLE.sub("", text)
    return UNCLOSED_SCRIPT_OR_STYLE.sub("", text)


def cap_length(text: str) -> str:
    """Cut text over the cap at the last full word and end it with an ellipsis."""
    if len(text) <= MAX_REPLY_CHARS:
        return text
    keep = MAX_REPLY_CHARS - len(ELLIPSIS)
    cut = text[:keep]
    if not (cut[-1].isspace() or text[keep].isspace()):
        cut = cut.rsplit(None, 1)[0]
    return cut.rstrip() + ELLIPSIS
