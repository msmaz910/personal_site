"""FastAPI application entry point."""

from pathlib import Path

from fastapi import FastAPI

from app.spa import SPAStaticFiles

FRONTEND_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"

app = FastAPI()


@app.get("/api/health")
def health() -> dict[str, str]:
    """Report that the service is running."""
    return {"status": "ok"}


app.mount("/", SPAStaticFiles(directory=FRONTEND_DIST, html=True, check_dir=False))
