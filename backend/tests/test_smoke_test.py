"""Tests for the smoke test's asset and health checks."""

import pytest

from smoke_test import asset_paths, health_ok

BUILT = (
    '<script type="module" crossorigin src="/assets/index-AbC1.js"></script>'
    '<link rel="stylesheet" crossorigin href="/assets/index-XyZ2.css">'
)

ASSET_CASES = {
    "script and stylesheet": (
        BUILT,
        ["/assets/index-AbC1.js", "/assets/index-XyZ2.css"],
    ),
    "page links ignored": ('<a href="/about">About</a>', []),
    "external urls ignored": ('<script src="https://cdn.example.com/assets/a.js">', []),
    "no html": ("", []),
}

HEALTH_CASES = {
    "ok": ('{"status":"ok"}', True),
    "ok with spaces": ('{ "status": "ok" }', True),
    "wrong status": ('{"status":"degraded"}', False),
    "extra field": ('{"status":"ok","x":1}', False),
}


@pytest.mark.parametrize(
    ("html", "expected"), ASSET_CASES.values(), ids=ASSET_CASES.keys()
)
def test_asset_paths(html, expected):
    assert asset_paths(html) == expected


@pytest.mark.parametrize(
    ("body", "expected"), HEALTH_CASES.values(), ids=HEALTH_CASES.keys()
)
def test_health_ok(body, expected):
    assert health_ok(body) is expected
