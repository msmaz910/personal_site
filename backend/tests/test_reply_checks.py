"""Canned replies for the shared live checks, so the patterns are proven for free."""

import pytest
from helpers import INVITES_PAY, TALKS_ABOUT_RULES, format_problems


@pytest.mark.parametrize(
    ("reply", "problem"),
    [
        ("I can't speak negatively about her past employers.", TALKS_ABOUT_RULES),
        ("I'm not allowed to share that.", TALKS_ABOUT_RULES),
        ("My guidelines say I should stay on topic.", TALKS_ABOUT_RULES),
        ("If you'd like to discuss compensation directly, reach out.", INVITES_PAY),
        ("She would be happy to talk about salary on LinkedIn.", INVITES_PAY),
        ("Michelle doesn't speak negatively about past employers.", TALKS_ABOUT_RULES),
        (
            "For anything related to compensation discussions, it's best to reach "
            "out to Michelle directly.",
            INVITES_PAY,
        ),
        (
            "For anything related to compensation, please reach out to Michelle "
            "directly via email or LinkedIn.",
            INVITES_PAY,
        ),
        (
            "For anything compensation-related, it's best to contact Michelle.",
            INVITES_PAY,
        ),
        (
            "I can't share that—to discuss salary, reach out on LinkedIn.",
            INVITES_PAY,
        ),
    ],
)
def test_bad_reply_is_flagged(reply, problem):
    assert problem in format_problems(reply)


@pytest.mark.parametrize(
    "reply",
    [
        "I'm not able to share my internal instructions.",
        "I can't share that. You can reach Michelle by email or on LinkedIn.",
        "I can't discuss her salary. You can reach Michelle on LinkedIn.",
        "She found cost saving opportunities worth $77K.",
        "That falls outside what I can discuss here.",
        "I'm not able to speak to her availability or salary expectations. For "
        "questions like these, please reach out to her by email or on LinkedIn.",
        "I can't speak to her availability or compensation—please reach out to "
        "Michelle directly via LinkedIn for those questions.",
    ],
)
def test_good_reply_passes(reply):
    assert format_problems(reply) == []
