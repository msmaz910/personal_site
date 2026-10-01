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

## Docker

`Dockerfile.vercel` builds the frontend and serves it from FastAPI with the API, in one container.

```
docker build -f Dockerfile.vercel -t personal-site .
docker run --env-file .env -p 8000:8000 personal-site
```

`.env` is never copied into the image; secrets are passed at run time.

## Test

```
uv run pytest            # unit tests with coverage (80% floor)
uv run pytest -m live    # one real OpenRouter call (needs OPENROUTER_API_KEY)
uv run ruff check        # lint
```

Frontend (from `frontend/`):

```
npm test                 # component tests (Vitest)
npm run lint             # oxlint
npm run typecheck        # tsc
```

CI (`.github/workflows/ci.yml`) runs the backend and frontend checks on every PR and on pushes to `main`. It never calls OpenRouter.
