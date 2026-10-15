"""Smoke test a deployed site: every page, its assets, and the health endpoint."""

import argparse
import json
import re
import time
import urllib.error
import urllib.request

DEFAULT_URL = "https://www.michellelewis.dev"
PAGES = ["/", "/about", "/career", "/portfolio", "/contact"]
ATTEMPTS = 15
DELAY_SECONDS = 2
ASSET = re.compile(r'(?:src|href)="(/assets/[^"]+)"')


def asset_paths(html: str) -> list[str]:
    """Every /assets/... path used by a src or href attribute."""
    return ASSET.findall(html)


def health_ok(body: str) -> bool:
    """True if the health body is exactly {"status": "ok"}."""
    return json.loads(body) == {"status": "ok"}


def fetch(url: str) -> str:
    """Body of a 200 response; a 4xx or 5xx fails with the URL in the message."""
    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            return response.read().decode()
    except urllib.error.HTTPError as error:
        raise AssertionError(f"{url}: HTTP {error.code}") from error


def check_page(base: str, path: str) -> None:
    """The page serves the app shell and all its assets load."""
    html = fetch(base + path)
    assert '<div id="root">' in html, f"{path}: no root div"
    assets = asset_paths(html)
    assert assets, f"{path}: no assets found"
    for asset in assets:
        fetch(base + asset)


def run_checks(base: str) -> None:
    """Check every page, then the health endpoint."""
    for path in PAGES:
        check_page(base, path)
    assert health_ok(fetch(base + "/api/health")), "/api/health: wrong body"


def main() -> None:
    """Run the checks, retrying while a fresh deploy or container starts up."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("base_url", nargs="?", default=DEFAULT_URL)
    base = parser.parse_args().base_url.rstrip("/")
    for attempt in range(1, ATTEMPTS + 1):
        try:
            run_checks(base)
            break
        except (OSError, AssertionError) as error:
            print(f"Attempt {attempt}/{ATTEMPTS} failed: {error}")
            time.sleep(DELAY_SECONDS)
    else:
        raise SystemExit("Smoke test failed.")
    print(f"Smoke test passed: {len(PAGES)} pages, their assets, and /api/health.")


if __name__ == "__main__":
    main()
