# Personal Website

A personal website with an AI chat assistant. See `PLAN.md` for the full plan.

## Setup

```
uv sync
cp .env.example .env   # then add your keys
```

## Run

```
uv run uvicorn app.main:app --app-dir backend --port 8000
curl localhost:8000/api/health
```

Frontend (from `frontend/`):

```
npm install
npm run dev     # dev server
npm run build   # outputs frontend/dist
```

## Test

```
uv run pytest
```
