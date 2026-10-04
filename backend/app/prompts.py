"""Profile loading for the chat system prompt."""

from pathlib import Path

PROFILE_PATH = Path(__file__).parent.parent / "data" / "profile.md"


def load_profile(path: Path = PROFILE_PATH) -> str:
    """Return the profile text. Missing files raise FileNotFoundError with the path."""
    return path.read_text(encoding="utf-8")
