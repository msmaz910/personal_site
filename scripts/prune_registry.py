"""Prune old images from the Vercel container registry."""

import argparse
import json
import subprocess

REPOSITORY = "dockerfile"
MAX_IMAGES = 40
KEEP_NEWEST = 20


def images_to_delete(images: list[dict], live_sha: str) -> list[dict]:
    """Return images to delete: none at or under MAX_IMAGES, else all but the
    newest KEEP_NEWEST and the live image."""
    if len(images) <= MAX_IMAGES:
        return []
    newest_first = sorted(images, key=lambda i: i["createdAt"], reverse=True)
    return [i for i in newest_first[KEEP_NEWEST:] if not is_live(i, live_sha)]


def is_live(image: dict, live_sha: str) -> bool:
    """True if the image is tagged with a prefix of the live commit SHA."""
    return any(live_sha.startswith(tag) for tag in image["tags"])


def vercel(*args: str) -> str:
    """Run the Vercel CLI and return its output; a failure stops the script."""
    return subprocess.run(
        ["vercel", *args], check=True, capture_output=True, text=True
    ).stdout


def list_images() -> list[dict]:
    """All images in the registry repository."""
    output = vercel("vcr", "image", "ls", REPOSITORY, "--limit", "100", "-F", "json")
    return json.loads(output)["images"]


def live_commit_sha() -> str:
    """Commit SHA of the newest READY production deployment."""
    deployments = json.loads(vercel("ls", "--prod", "--format", "json"))["deployments"]
    ready = [d for d in deployments if d["state"] == "READY"]
    if not ready:
        raise SystemExit("No READY production deployment found; refusing to prune.")
    return ready[0]["meta"]["githubCommitSha"]


def main() -> None:
    """Delete old images, or only print the plan with --dry-run."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="delete nothing")
    dry_run = parser.parse_args().dry_run
    images = list_images()
    doomed = images_to_delete(images, live_commit_sha())
    print(f"{len(images)} images (limit {MAX_IMAGES}), deleting {len(doomed)}")
    for image in doomed:
        print(f"{'would delete' if dry_run else 'deleting'} {', '.join(image['tags'])}")
        if not dry_run:
            vercel("vcr", "image", "rm", REPOSITORY, image["id"], "--yes")


if __name__ == "__main__":
    main()
