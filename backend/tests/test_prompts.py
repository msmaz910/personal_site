"""Tests for loading the profile used in the chat system prompt."""

import re

import pytest

from app.prompts import PROFILE_PATH, load_profile


def test_load_profile_returns_file_contents(tmp_path):
    profile = tmp_path / "profile.md"
    profile.write_text("# Test Profile\n\nAnalytics engineer.\n")

    assert load_profile(profile) == "# Test Profile\n\nAnalytics engineer.\n"


def test_load_profile_missing_file_names_the_path(tmp_path):
    missing = tmp_path / "profile.md"

    with pytest.raises(FileNotFoundError, match=re.escape(str(missing))):
        load_profile(missing)


def test_default_profile_path_exists():
    assert PROFILE_PATH.is_file()
