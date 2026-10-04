"""Tests for cleaning model replies before they reach the visitor."""

import pytest

from app.cleaning import MAX_REPLY_CHARS, clean_reply

CASES = {
    "normal reply unchanged": ("Hello", "Hello"),
    "markdown unchanged": (
        "**Michelle** leads analytics.\n- SQL\n- Python",
        "**Michelle** leads analytics.\n- SQL\n- Python",
    ),
    "reasoning block": ("<think>plan</think>Answer", "Answer"),
    "reasoning block mixed case": ("<THINK>a\nb</THINK>\nAnswer", "Answer"),
    "unclosed reasoning block": ("Answer<think>cut off", "Answer"),
    "stray reasoning end": ("private reasoning</think>Answer", "Answer"),
    "script tag": ("a<script>alert(1)</script>b", "ab"),
    "unclosed script tag": ("a<script src=x>alert(1)", "a"),
    "style tag": ("<style>p{}</style>Hi", "Hi"),
    "unclosed style tag": ("Hi<style>p{color:red}", "Hi"),
    "html tags": ("<b>Bold</b> text", "Bold text"),
    "comparison symbols kept": ("x <= y and a < b > c", "x <= y and a < b > c"),
    "entities kept": ("R&amp;D", "R&amp;D"),
    "extra blank lines": ("Line1\n\n\n\nLine2", "Line1\n\nLine2"),
    "padding": ("  padded  ", "padded"),
    "none": (None, ""),
    "empty": ("", ""),
    "only reasoning": ("<think>only</think>", ""),
}


@pytest.mark.parametrize(("raw", "expected"), CASES.values(), ids=CASES.keys())
def test_clean_reply(raw, expected):
    assert clean_reply(raw) == expected


def test_oversized_reply_is_cut_at_a_word_and_marked():
    words = [f"w{i}" for i in range(600)]

    reply = clean_reply(" ".join(words))

    assert len(reply) <= MAX_REPLY_CHARS
    assert reply.endswith("…")
    assert reply[:-1].split()[-1] in words


def test_reply_at_the_cap_is_unchanged():
    text = "a" * MAX_REPLY_CHARS

    assert clean_reply(text) == text


def test_single_long_word_is_hard_cut():
    reply = clean_reply("a" * (MAX_REPLY_CHARS + 300))

    assert reply == "a" * (MAX_REPLY_CHARS - 1) + "…"


def test_word_ending_just_before_the_cut_is_kept():
    keep = MAX_REPLY_CHARS - 1
    text = "x" * (keep - 5) + " bar " + "y" * 50

    assert clean_reply(text).endswith(" bar…")
