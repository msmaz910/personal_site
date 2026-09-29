"""FastAPI application entry point."""

from fastapi import FastAPI

app = FastAPI()


@app.get("/api/health")
def health() -> dict[str, str]:
    """Report that the service is running."""
    return {"status": "ok"}
