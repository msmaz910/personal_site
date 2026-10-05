"""FastAPI application entry point."""

from pathlib import Path
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException
from openai import APIError, OpenAI

from app.chat import (
    UNAVAILABLE_MESSAGE,
    ChatRequest,
    ChatResponse,
    get_client,
    get_reply,
)
from app.config import Settings, get_settings
from app.spa import SPAStaticFiles

FRONTEND_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"

app = FastAPI()


@app.get("/api/health")
def health() -> dict[str, str]:
    """Report that the service is running."""
    return {"status": "ok"}


@app.post("/api/chat")
def chat(
    request: ChatRequest,
    client: Annotated[OpenAI, Depends(get_client)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> ChatResponse:
    """Return the model's reply, or a clean 502 if OpenRouter fails."""
    try:
        return get_reply(client, settings, request.messages)
    except APIError as error:
        raise HTTPException(status_code=502, detail=UNAVAILABLE_MESSAGE) from error


app.mount("/", SPAStaticFiles(directory=FRONTEND_DIST, html=True, check_dir=False))
