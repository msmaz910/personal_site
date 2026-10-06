# Personal Website

The personal site of Michelle Lewis: five pages (Home, About, Career, Portfolio, Contact) and an AI chat "digital twin" that answers questions from `backend/data/profile.md` using OpenRouter. Live at https://www.michellelewis.dev. See `PLAN.md` for the full plan.

## Prerequisites

- [uv](https://docs.astral.sh/uv/) (installs Python 3.14 from `.python-version`)
- Node 26
- An [OpenRouter](https://openrouter.ai) API key
- Docker (optional)

## Quick start

From a fresh clone, run from the repo root:

```
uv sync
cp .env.example .env   # then set OPENROUTER_API_KEY
(cd frontend && npm ci && npm run build)
uv run uvicorn app.main:app --app-dir backend --port 8000
```

Open http://localhost:8000.

- Build the frontend first; the backend serves `frontend/dist`, and without it `/` returns a 500.
- Run uvicorn from the repo root so it finds `.env`.
- Check the API with `curl localhost:8000/api/health`.

## Dev mode

Use two terminals so frontend edits reload instantly. Vite proxies `/api` to port 8000.

```
uv run uvicorn app.main:app --app-dir backend --port 8000   # terminal 1, repo root
cd frontend && npm run dev                                  # terminal 2, repo root
```

Open http://localhost:5173.

## Environment variables

Set in `.env` (see `.env.example`).

| Name | Default | Purpose |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | none (required) | Your OpenRouter key |
| `OPENROUTER_MODEL` | `anthropic/claude-sonnet-5` | Model used for chat |
| `PORT` | `8000` | Port the container listens on |
| `MAX_MESSAGE_CHARS` | `1000` | Longest message a visitor can send |
| `MAX_REPLY_TOKENS` | `500` | Longest reply the model may write |
| `MAX_USER_MESSAGES` | `10` | Visitor messages allowed per chat |
| `MAX_HISTORY_MESSAGES` | `20` | Newest messages sent to the model |

Public `VITE_*` values (name, links, site URL) live in `frontend/.env.development` and `frontend/.env.production`. They are visible in the browser, so never put secrets there. If the domain changes, update `VITE_SITE_URL` in both files.

## Docker

`Dockerfile.vercel` builds the frontend and serves it from FastAPI with the API, in one container.

```
docker build -f Dockerfile.vercel -t personal-site .
docker run --env-file .env -p 8000:8000 personal-site
```

`.env` is never copied into the image; secrets are passed at run time.

## Deploy (Vercel)

The Vercel project `personal-site` uses the Container framework preset and builds `Dockerfile.vercel`. Every key in `.env.example` (including `PORT=8000`) must be set in project settings for Production and Preview; changes apply on the next deploy.

The project is connected to GitHub. Every PR gets a preview URL, and every merge to `main` deploys production. Manual deploys still work:

```
vercel deploy          # preview
vercel deploy --prod   # production
```

`.vercelignore` decides what is uploaded. Vercel ignores `.dockerignore`, so keep the two in sync.

Each deploy adds an image to the container registry, which caps at 50. The `Prune registry` workflow trims it after every merge to `main` and needs the `VERCEL_TOKEN` GitHub secret. Run it by hand from the Actions tab to preview (dry run is on by default).

## Editing content

- Page text: `frontend/src/data/*.ts`
- What the chat knows: `backend/data/profile.md`
- How the chat behaves: `backend/app/prompts.py`

The starter questions live in `frontend/src/data/chat.ts` and are copied into `backend/tests/test_live_chat.py`; update both together.

## Cost protection

- A Vercel firewall rule limits `/api/chat` to 10 requests per minute per IP.
- The OpenRouter key has a $20 monthly spend cap.

## Test

```
uv run pytest                    # unit tests with coverage (80% floor)
uv run pytest -m live --no-cov   # real OpenRouter calls (billed; needs OPENROUTER_API_KEY)
uv run ruff check                # lint
```

Frontend (from `frontend/`):

```
npm test                 # component tests (Vitest)
npm run lint             # oxlint
npm run typecheck        # tsc
```

CI (`.github/workflows/ci.yml`) runs the backend and frontend checks on every PR and on pushes to `main`. It never calls OpenRouter.
