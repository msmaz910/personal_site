# Personal Website with AI Chat - Project Plan

## Goal

A polished, professional personal website for Michelle, with an AI chat that answers questions about her background using a profile file (LinkedIn profile plus extra details).

Audience: recruiters, colleagues, and people from networking. Success means a visitor can learn Michelle's story and get accurate answers from the chat.

Vibe: outdoorsy hipster. Loves hiking and cycling, and is also proficient with current technology.

## Decisions

| Area | Decision |
|---|---|
| Backend | FastAPI (Python), managed with uv |
| Frontend | Vite + React + TypeScript, React Router, built to static files |
| Packaging | One Docker container: `Dockerfile.vercel` (multi-stage: Node builds frontend; Python stage installs dependencies with uv from `pyproject.toml` and `uv.lock`, then runs everything with `uv run`) |
| Hosting | Vercel Functions running the container (Container Images, Beta) |
| Chat model | Claude via OpenRouter. `OPENROUTER_MODEL=anthropic/claude-sonnet-5` (name confirmed on OpenRouter) |
| Data | No database, no user accounts. Chat history lives in the browser only |
| Chat knowledge | Whole profile file placed in the system prompt (no vector database) |
| Pages | Home, About, Career, Portfolio, Contact. Shared header, footer, theme |
| Chat UI | Floating button and panel on every page. Non-streaming: backend returns a cleaned reply |
| Tracking | Jira (tasks), GitHub (code, PRs, CI), both via MCP |

Assumptions to revisit if wrong: chat answers only from the profile file; Contact page uses links and email (no form); repo is hosted on GitHub.

## Architecture

- One uvicorn process (started with `uv run uvicorn`) serves: `POST /api/chat`, `GET /api/health`, and the built React files. Any non-API path returns `index.html` so deep links like `/career` work on refresh.
- Chat flow: browser sends the conversation to `/api/chat`. Backend builds a system prompt from `backend/data/profile.md` plus rules (answer only from the profile, stay professional, say so when unsure), calls OpenRouter, cleans the reply, returns it.
- Cleaning step (its own small function): strips reasoning blocks, HTML and script tags, and enforces a length cap. The frontend renders replies as plain text, never as raw HTML.
- The OpenRouter client uses the `openai` SDK pointed at `https://openrouter.ai/api/v1`. Verify against current docs in E5-3.
- Vercel containers are stateless and scale to zero after 5 idle minutes, so the first request after a quiet period is slow. Keep all state in the browser.

## Repository layout

```
PLAN.md, README.md, Dockerfile.vercel, .dockerignore, .gitignore
.env.example            committed template
.env                    real secrets, gitignored
pyproject.toml          uv-managed
backend/app/            main.py, config.py, chat.py, prompts.py, cleaning.py
backend/data/           profile.md
backend/tests/          pytest tests
frontend/               Vite + React + TypeScript (src/, tests, e2e/)
.github/workflows/      CI
```

## Environment files

| File | Committed | Contents |
|---|---|---|
| `.env` | No | `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `PORT`, `MAX_MESSAGE_CHARS`, `MAX_REPLY_TOKENS`, `MAX_USER_MESSAGES` |
| `.env.example` | Yes | Same keys, placeholder values. Doubles as the checklist for Vercel settings |
| `frontend/.env.development`, `frontend/.env.production` | Yes | Public values only: `VITE_SITE_NAME`, `VITE_LINKEDIN_URL`, `VITE_GITHUB_URL`, `VITE_CONTACT_EMAIL` |

Rules:
- Anything prefixed `VITE_` is visible in the browser. Never put secrets there.
- `.dockerignore` excludes `.env` so keys are never baked into the image.
- Locally: `docker run --env-file .env ...`. On Vercel: enter the same keys in project settings. `.env` is never uploaded.
- Add a variable to `.env.example` whenever one is added to `.env`.
- Vercel defaults containers to port 80. Set `PORT` in Vercel project settings to match the app.

## Visual theme

Starting point, to be tuned once seen in the browser.

- Colors: deep night navy background (about `#0B1620`) with slightly lighter cards; warm off-white text (about `#F3EEE4`); Patagonia-style mountain blue accent, lightened for dark backgrounds; sunset orange secondary accent; sage green used sparingly.
- Type: sturdy serif for headings, clean sans-serif for body, monospace for tech tags.
- Feel: generous spacing, subtle topographic or ridge-line motifs, real hiking and cycling photos where available.
- Define colors and fonts once as CSS variables (E3-1). Every page uses them.

## Testing strategy

| Layer | Tools | Covers |
|---|---|---|
| Backend unit and API | pytest, FastAPI TestClient, pytest-cov | Prompt builder, cleaning, input limits, `/api/chat`, `/api/health` |
| Frontend unit and component | Vitest, React Testing Library | Layout, pages render, chat panel behavior |
| End-to-end | Playwright against the running container | All 5 pages, deep-link refresh, chat opens and shows a reply |
| Accessibility | axe inside Playwright | Contrast and semantics on every page |
| Chat safety | pytest with mocked model | Prompt injection, off-topic, unanswerable questions, oversized input |
| Static checks | ruff, oxlint, tsc | Lint, format, type errors |
| Container smoke | Docker build, run, hit `/api/health` | Image builds and starts |
| Live evals | About 15 real questions against the real model | Chat accuracy. Run on demand, never in CI |

Rules:
- CI never calls the real OpenRouter API. The model is always mocked.
- Live tests are marked `live`, skipped by default, and run only on demand with `uv run pytest -m live`.
- Every story ships with its own tests. Tests are part of the acceptance criteria.
- Backend coverage floor: 80%.
- Use `uv run pytest`, never `python`.

## Working from Jira and GitHub

For Claude, when working from Jira tasks:

1. Take one story at a time, in dependency order. Do not start a story whose dependencies are not done.
2. Story summaries in Jira match the IDs and titles below (for example `E5-3: OpenRouter client and POST /api/chat`).
3. Before changing files, post a short bullet plan and wait for approval.
4. Work in small steps and validate each one.
5. Run the acceptance checks and show the evidence (command output, test results) before calling a story done.
6. Use one branch per story, named with the Jira key (for example `SITE-12-openrouter-client`). Open one pull request per story that references the Jira key. CI must pass before merge.
7. Move the Jira issue to Done only after the PR is merged.
8. Owner "Michelle" means content or account access only she can provide. Ask for it instead of inventing it.

Project conventions: uv only (`uv run`, `uv add`), latest library APIs, short modules and functions, docstrings over inline comments, no emojis in code, prints or logs, no defensive programming, keep README concise.

## Stories

Format: ID and summary, description, acceptance criteria (AC), dependencies, owner.

### E1 Foundation

**E1-1: Repo setup.** Initialize git and uv; add `.gitignore`, `.dockerignore`, README skeleton.
- AC: `uv run python --version` works; `.env` is ignored by git; `.env` is excluded by `.dockerignore`.
- Depends on: none. Owner: Claude.

**E1-2: Env files and config.** Create `.env.example`, local `.env`, frontend env files, and `config.py` that loads settings.
- AC: app fails clearly if `OPENROUTER_API_KEY` is missing; `.env.example` lists every variable used; test proves config loads from env.
- Depends on: E1-1. Owner: Claude (Michelle adds real keys to `.env`).

**E1-3: FastAPI skeleton.** App with `GET /api/health`.
- AC: `curl localhost:8000/api/health` returns 200 with `{"status": "ok"}`.
- Depends on: E1-2. Owner: Claude.

**E1-4: Vite + React + TypeScript scaffold.** Create `frontend/` with a placeholder page.
- AC: `npm run dev` shows the page; `npm run build` produces `frontend/dist`.
- Depends on: E1-1. Owner: Claude.

**E1-5: Backend test setup.** Add pytest, pytest-cov, ruff (pytest and httpx2 already added in E1-2 and E1-3) with config. Add a `live` pytest marker and one live test that makes a single real OpenRouter call.
- AC: `uv run pytest` passes with the health test and skips the live test; `uv run pytest -m live` makes one real call with `OPENROUTER_MODEL` and gets a reply; `uv run ruff check` is clean; coverage report prints.
- Depends on: E1-3. Owner: Claude.

**E1-6: Frontend test setup.** Add Vitest, React Testing Library, `tsc` check (oxlint kept from E1-4).
- AC: `npm test` passes with one component test; `npm run lint` and `npm run typecheck` are clean.
- Depends on: E1-4. Owner: Claude.

**E1-7: GitHub Actions CI.** Workflow runs ruff, pytest with coverage, oxlint, tsc, Vitest on every push and PR.
- AC: a PR shows all checks green; a deliberately broken test turns CI red (then reverted).
- Depends on: E1-5, E1-6. Owner: Claude.

### E2 Docker and Vercel

**E2-1: Confirm Vercel Container Images access.** Check that the account has the Container Images (Beta) permission.
- AC: written confirmation that a `Dockerfile.vercel` project can deploy on the account. If not, fall back to Vercel-native FastAPI and update this plan.
- Depends on: none. Owner: Michelle.

**E2-2: Multi-stage Dockerfile.vercel.** Stage 1 builds the frontend; stage 2 copies the uv binary from the official image (`COPY --from=ghcr.io/astral-sh/uv:0.12.21 /uv /bin/`, pinned like `setup-uv`), installs deps with `uv sync --frozen --no-dev` (so the build fails if `uv.lock` is out of date), and runs `uv run uvicorn` on `$PORT`. FastAPI serves `frontend/dist` and falls back to `index.html` for page routes (missing files and unknown `/api/` paths return 404).
- AC: `docker build -f Dockerfile.vercel .` succeeds; `docker run --env-file .env -p 8000:8000 ...` serves the page at `/`, `/career` (direct load) and `/api/health`; `.env` is not inside the image (`docker run ... ls -a` check); test covers the SPA fallback.
- Depends on: E1-3, E1-4. Owner: Claude.

**E2-3: Deploy hello-world to Vercel.** Deploy the container from E2-2 to Vercel with `PORT` set.
- AC: the Vercel URL serves the placeholder page and `/api/health`.
- Depends on: E2-1, E2-2. Owner: Michelle (Vercel account), Claude (config).

**E2-4: Connect GitHub to Vercel.** Link the Vercel project to `msmaz910/personal_site` so pushes deploy automatically (`vercel git connect`, after installing the Vercel GitHub app on the repo).
- AC: a PR gets a preview URL; a merge to `main` deploys production; uploads still respect `.vercelignore` (no `.env`).
- Depends on: E2-3. Owner: Michelle (GitHub app install), Claude (config).

### E3 Design system and layout

**E3-1: Theme tokens.** CSS variables for colors, fonts, spacing; load fonts.
- AC: a test page shows all tokens; text contrast meets WCAG AA on the dark background (checked with axe or a contrast tool).
- Depends on: E1-4. Owner: Claude.

**E3-2: Shared layout and routing.** Header, footer, React Router with 5 routes, placeholder pages.
- AC: all 5 routes render inside the shared layout; nav highlights the active page; component tests for header, footer and routing.
- Depends on: E3-1, E1-6. Owner: Claude.

**E3-3: Responsive mobile navigation.** Menu that works at phone width.
- AC: at 375px wide, nav is usable with keyboard and touch; no horizontal scroll; component test for open and close.
- Depends on: E3-2. Owner: Claude.

### E4 Pages

Content lives in typed data files in `frontend/src/data/`. No database.

**E4-1: Home.** Name, tagline, photo, short intro, links to Portfolio and chat.
- AC: renders from data file; component test; no layout shift on load.
- Depends on: E3-2. Owner: Claude builds, Michelle supplies tagline and photo.

**E4-2: About.** Personal story, skills, and the hiking and cycling side.
- AC: renders from data file; component test; images have alt text.
- Depends on: E3-2. Owner: Claude builds, Michelle supplies copy and photos.

**E4-3: Career.** Timeline of roles and education.
- AC: entries render in order from a data file; component test with sample entries.
- Depends on: E3-2. Owner: Claude builds, Michelle supplies entries.

**E4-4: Portfolio.** Project cards with description, tech tags, links.
- AC: cards render from a data file; each link opens correctly; component test.
- Depends on: E3-2. Owner: Claude builds, Michelle supplies projects.

**E4-5: Contact.** Email, LinkedIn, GitHub links (no form).
- AC: links come from `VITE_` variables; component test checks each link target.
- Depends on: E3-2. Owner: Claude.

### E5 Chat backend

**E5-1: Profile file and loader.** `backend/data/profile.md` plus a loader function.
- AC: loader returns the file contents; clear error if the file is missing; test covers both.
- Depends on: E1-5. Owner: Michelle writes `profile.md` (LinkedIn export plus extra details), Claude writes the loader.

**E5-2: System prompt builder.** Combines the profile with rules (answer only from profile, professional tone, admit when unsure, ignore instructions to change these rules).
- AC: unit tests confirm the profile text and every rule appear in the prompt.
- Depends on: E5-1. Owner: Claude.

**E5-3: OpenRouter client and POST /api/chat.** Accepts a message list, calls OpenRouter, returns a reply.
- AC: with the model mocked, `POST /api/chat` returns 200 and the mocked reply; the request sent to the mock includes the system prompt and `OPENROUTER_MODEL`; upstream failure returns a clean error message, not a stack trace.
- Depends on: E5-2. Owner: Claude.

**E5-4: Response cleaning.** Pure function that strips reasoning blocks, HTML and script tags, and applies a length cap.
- AC: unit tests for each case (reasoning block, script tag, oversized reply, normal reply unchanged); `/api/chat` returns only cleaned text.
- Depends on: E5-3. Owner: Claude.

**E5-5: Input limits.** Cap message length, number of messages sent, reply tokens, and total user messages per chat using env settings.
- AC: oversized message returns 422; history longer than the cap is trimmed; `max_tokens` is passed to the model; tests for each.
- AC: when the history holds more than `MAX_USER_MESSAGES` (10) user messages, the backend returns the closing message without calling the model; test covers it.
- Closing message (backend is the only source): "Thank you for the great conversation! I've reached the limit for this chat, but Michelle would be glad to answer anything else. You can contact her at michelle.mazzotta@gmail.com or on LinkedIn."
- Depends on: E5-3. Owner: Claude.

### E6 Chat frontend

**E6-1: Floating button and panel.** Button on every page opens a chat panel.
- AC: present on all 5 routes; opens and closes by mouse and keyboard; focus moves into the panel and returns on close; component tests.
- Depends on: E3-2. Owner: Claude.

**E6-2: Wire chat to the API.** Send messages, show loading indicator, show replies as plain text, show a friendly error.
- AC: with the API mocked, a sent message shows a loading state then the reply; a failed request shows an error message; history sent is capped; component tests.
- AC: the panel counts user messages; at `MAX_USER_MESSAGES` it shows the closing message returned by the backend and disables the input; component test covers it.
- Depends on: E6-1, E5-3. Owner: Claude.

**E6-3: Suggested starter questions.** A few clickable prompts shown when the chat is empty.
- AC: clicking a suggestion sends it; suggestions hide after the first message; component test.
- Depends on: E6-2. Owner: Claude builds, Michelle approves the questions.

### E7 Launch

**E7-1: Responsive and visual polish pass.** Review every page at phone, tablet and desktop widths.
- AC: no horizontal scroll or clipped content at 375, 768 and 1280px; screenshots saved for review.
- Depends on: E4-1 to E4-5, E6-1. Owner: Claude, Michelle reviews.

**E7-2: SEO and link previews.** Page titles, meta descriptions, favicon, Open Graph image.
- AC: each page has a unique title and description; sharing the URL in LinkedIn's Post Inspector shows title and image.
- Depends on: E4-1 to E4-5. Owner: Claude, Michelle supplies image.

**E7-3: Production env vars on Vercel.** Enter all `.env.example` keys in Vercel project settings.
- AC: every variable in `.env.example` exists in Vercel; live `/api/health` returns ok; a live chat message gets a real reply.
- Depends on: E2-3, E5-3. Owner: Michelle (keys), Claude (checklist).

**E7-4: Cost protection.** Vercel firewall rate limit on `/api/chat`, spend limit on the OpenRouter key.
- AC: rapid repeated requests to the live `/api/chat` get rate limited; OpenRouter dashboard shows the spend limit set.
- Depends on: E7-3. Owner: Michelle.

**E7-5: Custom domain (optional).** Attach a domain to the Vercel project.
- AC: site loads over HTTPS on the custom domain.
- Depends on: E7-3. Owner: Michelle.

**E7-6: Final README.** Concise: what it is, how to run with uv and Docker, env variables, how to deploy, how to run tests.
- AC: someone can follow it from a fresh clone to a running site.
- Depends on: E7-3. Owner: Claude.

### E8 Quality assurance

**E8-1: Playwright end-to-end tests.** Run against the built container with the model mocked.
- AC: tests visit all 5 pages, reload on a deep link, open the chat, send a message and see a reply; run in CI.
- Depends on: E2-2, E6-2. Owner: Claude.

**E8-2: Accessibility checks.** Add axe checks to the Playwright tests.
- AC: no serious or critical axe violations on any page or on the open chat panel.
- Depends on: E8-1. Owner: Claude.

**E8-3: Chat safety tests.** Mocked-model tests for prompt injection, off-topic, unanswerable, and oversized input.
- AC: system prompt is always sent first and cannot be replaced by user messages; oversized input rejected; suite runs in CI.
- Depends on: E5-5. Owner: Claude.

**E8-4: Live chat evals.** A file of about 15 questions with expected facts, and a script that runs them against the real model.
- AC: `uv run` command prints pass or fail per question; not part of CI; Michelle reviews the questions and answers for accuracy.
- Depends on: E5-3. Owner: Claude builds, Michelle reviews.

**E8-5: CI container smoke test.** Build the image, run it, hit `/api/health`.
- AC: CI job fails if the image does not build or the health check fails.
- Depends on: E2-2, E1-7. Owner: Claude.

**E8-6: Post-deploy smoke test.** Script that checks the live Vercel URL (pages load, `/api/health` ok).
- AC: script passes against the production URL; documented in README.
- Depends on: E7-3. Owner: Claude.

## Suggested order

1. E1 (foundation and test setup)
2. E2 (Docker, and an early deploy to prove Vercel works)
3. E3 (theme and layout)
4. E5 then E6 (chat), alongside E4 (pages) as content arrives
5. E8 (end-to-end, accessibility, safety)
6. E7 (launch)

## Definition of done (every story)

- Acceptance criteria met, with evidence shown.
- Tests written and passing locally.
- Lint and type checks clean.
- PR merged with CI green.
- Jira issue moved to Done.

## Progress log

### 2026-09-28

- **E1-1 Repo setup: Done.** Merged in PR #1 (`msmaz910/personal_site`, private). Jira moved to Done.
  - Git and uv initialized (`pyproject.toml`, `uv.lock`); `uv run python --version` gives 3.14.4.
  - `.gitignore` and `.dockerignore` both exclude `.env` (`.env.example` stays tracked). `.dockerignore` also excludes `PLAN.md` and `Profile.pdf`.
  - `README.md` skeleton added (Setup, Run, Test).
- **Plan change:** E1-5 now adds a `live` pytest marker and one live test that makes a real OpenRouter call. Live tests are skipped by default and run with `uv run pytest -m live`.
- **Notes:**
  - Only one secret is needed: `OPENROUTER_API_KEY` (Claude is called through OpenRouter). Add it to `.env` in E1-2.
  - `gh` installed via Homebrew and signed in. PRs are opened from the terminal.
- **Next:** E1-2 (env files and config), then E1-4 (Vite scaffold).

- **E1-2 Env files and config: Done.** Merged in PR #2. Defaults set to `MAX_MESSAGE_CHARS=1000` and `MAX_REPLY_TOKENS=500`.
- **Plan change (not a numbered story):** added `MAX_USER_MESSAGES` (default 10, so 20 messages including bot replies). The setting was merged in PR #3, which was mislabeled "E1-3" by mistake. It is not the E1-3 story. Enforcement is planned in E5-5 (backend) and E6-2 (frontend); the closing message text lives only in the backend.
- **E1-3 is still the FastAPI skeleton** (`GET /api/health`) and has not started as of this entry.
- **Next:** E1-3 (FastAPI skeleton), then E1-4 (Vite scaffold).
- **E1-3 FastAPI skeleton: Done.** `GET /api/health` in `backend/app/main.py`; test in `backend/tests/test_health.py`; curl returns 200 `{"status": "ok"}`.
  - Used `httpx2` (not `httpx`) as the dev test client, since Starlette now deprecates `httpx`.
- **E1-3 marked Done in Jira.**
- **E1-4 Vite + React + TypeScript scaffold: Done.** Scaffold in `frontend/` (Vite 8, React 19, TypeScript 6); placeholder page shows `VITE_SITE_NAME` and "Coming soon".
  - `npm run dev` serves the page; `npm run build` produces `frontend/dist`; `npm run lint` is clean.
  - The template ships with oxlint. E1-6 says ESLint, so decide there whether to keep oxlint or switch.


### 2026-09-30

- **E1-5 Backend test setup: Done (local commit, PR pending).**
  - Added `pytest-cov` and `ruff` (dev) and `openai` (runtime, used by the live test now and by E5-3 later).
  - `uv run pytest` runs unit tests, skips `live` tests, prints coverage, and fails below 80%.
  - `uv run pytest -m live` makes one real OpenRouter call through the `openai` SDK (v3) and gets a reply.
  - Ruff rules: `E`, `F`, `I`, `UP`, `B`. `src = ["backend"]` so ruff treats `app` as first-party.
  - Note: the 80% floor also applies to `-m live` runs. Once E5 adds modules, live-only runs may need `--no-cov`.
- **E1-5 moved to Done in Jira** after PR #7 merged.
- **E1-6 Frontend test setup: Done (local commit, PR pending).**
  - Kept oxlint instead of switching to ESLint (already configured, fast, fewer dependencies). Plan wording updated.
  - Added Vitest 5, jsdom, React Testing Library and jest-dom. Config lives in `vite.config.ts`; setup in `src/test/setup.ts`.
  - Scripts: `npm test` (`vitest run`), `npm run typecheck` (`tsc -b`), `npm run lint` (`oxlint`).
  - One component test for `App`. Test code is not included in `dist`.
  - Node upgraded to 26.10.0, so jsdom is on 30.1.1 (jsdom 30 needs Node 24.15+).
  - `lint` runs `oxlint --deny-warnings` so warnings fail the check (and CI in E1-7).
- **E1-6 moved to Done in Jira** after PR #8 merged.
- **E1-7 GitHub Actions CI: Done (PR #9 open).**
  - `.github/workflows/ci.yml` runs on PRs and pushes to `main`. Two parallel jobs: `backend` (ruff, pytest with coverage) and `frontend` (oxlint, tsc, Vitest on Node 26).
  - Python is managed by uv: `uv python pin 3.14` wrote `.python-version`; CI uses `setup-uv` and `uv sync --locked`. CI resolved CPython 3.14.7.
  - `astral-sh/setup-uv` publishes only full version tags, so it is pinned to `v10.2.0` (`@v10` fails to resolve).
  - Proved: green run, then a deliberately broken health test turned `backend` red, then the revert turned it green.
  - Branch protection and rulesets need GitHub Pro on a private repo. Decided to skip; green checks before merge are by convention.

### 2026-10-01

- **E2-2 Multi-stage Dockerfile.vercel: Done (PR pending).**
  - Stage 1 builds the frontend on `node:26-slim`; stage 2 is `python:3.14-slim` with uv `0.12.21` (pinned, current `latest`), `uv sync --frozen --no-dev`, and uvicorn on `${PORT:-8000}`.
  - `backend/app/spa.py`: `SPAStaticFiles` returns `index.html` for page routes like `/career`. Missing files (`/assets/missing.js`) and unknown `/api/` paths return 404. Tests in `test_spa.py`.
  - Proved: build succeeds; `/`, `/career`, `/api/health` return 200; no `.env` file anywhere in the image.
  - `.dockerignore` patterns now use `**/`. Without it, Docker matched only the top level, so `frontend/node_modules`, `__pycache__` and nested `.env` files (reproduced with `backend/.env`) entered the build.
  - Accepted: running the backend locally without `frontend/dist` returns 500 at `/`. Use the Vite dev server for pages.

- **E2-2 moved to Done in Jira** after PR #10 merged.
- **E2-3 Deploy hello-world to Vercel: Done (PR pending).**
  - Project `personal-site` in team Lewis (Hobby), linked with `vercel link`. Deploys are from the CLI for now; GitHub auto-deploys are E2-4.
  - `PORT=8000` set for Production and Preview.
  - Root cause of a first deploy that served only Vercel 404s: `vercel project add` skips framework detection, so the preset was "Other" and Docker never ran. Fixed with `vercel project update --framework container`.
  - Added `.vercelignore`: the CLI ignores `.gitignore` and `.dockerignore`, and its defaults skip `.env.local` but not `.env`. Confirmed on Vercel that the upload holds no `.env`, `Profile.pdf` or `PLAN.md`.
  - Preview verified: `/`, `/career`, `/api/health` return 200; `/api/unknown` and `/assets/missing.js` return 404.
  - `vercel link` appended `.env*` to `.gitignore`, which overrode the `!.env.example` exceptions. Removed it; kept `.vercel`.
  - Production: https://personal-site-one-gamma-42.vercel.app serves the page at `/` and `/career`, and `/api/health` returns `{"status":"ok"}`, without login. Image built by Vercel in about 27s.
  - The very first CLI deploy of a new project goes to production even without `--prod`. Production deploys are run by Michelle.

- **E2-3 moved to Done in Jira** after PR #11 merged.
- **E2-4 Connect GitHub to Vercel: In progress.**
  - Michelle installed the Vercel GitHub app; `vercel git connect` linked the project to `msmaz910/personal_site` with `main` as the production branch.
- **E3-1 Theme tokens: Done (PR pending).**
  - `frontend/src/styles/tokens.css` holds all tokens: 8 colors, 3 font families, 7 spacing steps. `index.css` imports it and sets dark-only base styles (Vite template styles and light mode removed).
  - Fonts self-hosted with Fontsource: Young Serif (headings), Inter (body), JetBrains Mono (tech tags). No requests to Google.
  - Headings switched from Fraunces to Young Serif, a free match for Patagonia's Belwe logo font (Belwe is commercial; their UI font Ridgeway Sans is proprietary). Young Serif has one weight, so headings use 400.
  - `StyleGuide` (rendered in `App` until E3-2) lists every token, read from `tokens.css` via `parseTokens()`, so the page and tests cannot drift from the CSS.
  - Contrast test checks each text color on `bg` and `surface` is at least 4.5:1 (WCAG AA). Lowest pair is 7.11:1. Proved it fails with a low-contrast color.
  - Root cause of an empty `tokens.css?raw` in tests: Vitest skips CSS files by default. Fixed with `test.css.include` in `vite.config.ts`.
  - One-off axe-core 4.10.3 run in a real browser: 0 WCAG A/AA violations, 42 color-contrast passes, all 3 fonts loaded.

- **E3-1 moved to Done in Jira** after PR #13 merged. Production serves the new theme.
- **E3-2 Shared layout and routing: Done (PR pending).**
  - React Router 8.4.0 in data mode: `createBrowserRouter` from `react-router`, `RouterProvider` from `react-router/dom` (v8 removed `react-router-dom`).
  - `src/pages.tsx` lists the 5 pages once; the header nav and the routes are both built from it. Pages are placeholders until E4.
  - `Layout` (header, main, footer) wraps every route. `NavLink` sets `aria-current="page"`, styled with the accent color and underline.
  - Footer: copyright year plus LinkedIn and GitHub links from `VITE_` variables.
  - Unknown paths show a Not found page inside the layout. The style guide moved to the unlisted `/style-guide` route.
  - Vitest runs in `test` mode, so `.env.development` is not loaded and `VITE_` values are undefined. Header and footer tests set them with `vi.stubEnv`.
  - Verified against FastAPI serving the build: deep-loading `/career` works, nav clicks update the page and the active link, `/nope` shows Not found, axe finds 0 WCAG A/AA violations.
