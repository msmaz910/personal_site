"""Tests for choosing which registry images to delete."""

import pytest

from prune_registry import images_to_delete


def image(n: int) -> dict:
    """Image number n; a higher n is newer. Its tag is n padded to 12 digits."""
    return {
        "id": f"image_{n}",
        "createdAt": f"2026-10-01T00:{n // 60:02d}:{n % 60:02d}.000Z",
        "tags": [f"{n:012d}"],
    }


def registry(count: int) -> list[dict]:
    """count images, oldest first, so the function must sort them itself."""
    return [image(n) for n in range(count)]


def sha_of(n: int) -> str:
    """Full 40-character commit SHA whose 12-character prefix tags image n."""
    return f"{n:012d}" + "f" * 28


NO_MATCH = "a" * 40

CASES = {
    "empty": (0, NO_MATCH, []),
    "at the keep size": (20, NO_MATCH, []),
    "at the limit": (40, NO_MATCH, []),
    "at the limit with live image oldest": (40, sha_of(0), []),
    "one over the limit": (41, NO_MATCH, range(21)),
    "full registry": (50, NO_MATCH, range(30)),
    "live image older than the newest 20": (41, sha_of(0), range(1, 21)),
    "live image among the newest 20": (41, sha_of(40), range(21)),
}


@pytest.mark.parametrize(
    ("count", "live_sha", "deleted"), CASES.values(), ids=CASES.keys()
)
def test_images_to_delete(count, live_sha, deleted):
    doomed = images_to_delete(registry(count), live_sha)

    assert {i["id"] for i in doomed} == {f"image_{n}" for n in deleted}
