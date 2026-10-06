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

## Deploy (Vercel)

The Vercel project `personal-site` uses the Container framework preset and builds `Dockerfile.vercel`. `PORT=8000` is set in project settings.

The project is connected to GitHub. Every PR gets a preview URL, and every merge to `main` deploys production. Manual deploys still work:

```
vercel deploy          # preview
vercel deploy --prod   # production
```

`.vercelignore` decides what is uploaded. Vercel ignores `.dockerignore`, so keep the two in sync.

Each deploy adds an image to the container registry, which caps at 50. The `Prune registry` workflow trims it after every merge to `main` and needs the `VERCEL_TOKEN` GitHub secret. Run it by hand from the Actions tab to preview (dry run is on by default).

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
