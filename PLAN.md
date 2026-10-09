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
| Chat UI | Chat card in a right-hand column at 64rem and wider; below that an "AI Chat" header button opens it full screen. Non-streaming: backend returns a cleaned reply |
| Tracking | Jira (tasks), GitHub (code, PRs, CI), both via MCP |

Assumptions to revisit if wrong: chat answers only from the profile file; Contact page uses links and email (no form); repo is hosted on GitHub.

## Architecture

- One uvicorn process (started with `uv run uvicorn`) serves: `POST /api/chat`, `GET /api/health`, and the built React files. Any non-API path returns `index.html` so deep links like `/career` work on refresh.
- Chat flow: browser sends the conversation to `/api/chat`. Backend builds a system prompt from `backend/data/profile.md` plus rules (answer only from the profile, stay professional, say so when unsure), calls OpenRouter, cleans the reply, returns it.
- Cleaning step (its own small function): strips reasoning blocks, HTML and script tags, and enforces a length cap. The frontend renders replies as plain text, never as raw HTML.
- The OpenRouter client uses the `openai` SDK pointed at `https://openrouter.ai/api/v1`. Verify against current docs in E5-3.
- Vercel containers are stateless and scale to zero after 5 idle minutes, so the first request after a quiet period is slow. Keep all state in the browser.
- Each deployment (preview and production) stores one image in the Vercel container registry repository `dockerfile`, which caps at 50. A full registry fails the deploy with "Pushing ... was denied"; the log line "repository has reached the maximum allowed number of images" is the real cause. The `Prune registry` GitHub Action (E2-5, `scripts/prune_registry.py`) runs after each push to `main`: over 40 images, it deletes all but the newest 20 and the live production image (tags are 12-character commit SHA prefixes). Run it by hand from the Actions tab; the dry-run box is ticked by default. Manual commands: `vercel vcr image ls dockerfile` and `vercel vcr image rm dockerfile <id>`.

## Repository layout

```
PLAN.md, README.md, Dockerfile.vercel, .dockerignore, .gitignore
.env.example            committed template
.env                    real secrets, gitignored
pyproject.toml          uv-managed
backend/app/            main.py, config.py, chat.py, prompts.py, cleaning.py
backend/data/           profile.md
backend/tests/          pytest tests
scripts/                ops scripts (prune_registry.py)
frontend/               Vite + React + TypeScript (src/, tests, e2e/)
.github/workflows/      CI
```

## Environment files

| File | Committed | Contents |
|---|---|---|
| `.env` | No | `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_BASE_URL`, `PORT`, `MAX_MESSAGE_CHARS`, `MAX_REPLY_TOKENS`, `MAX_USER_MESSAGES`, `MAX_HISTORY_MESSAGES` |
| `.env.example` | Yes | Same keys, placeholder values. Doubles as the checklist for Vercel settings |
| `frontend/.env.development`, `frontend/.env.production` | Yes | Public values only: `VITE_SITE_NAME`, `VITE_LINKEDIN_URL`, `VITE_GITHUB_URL`, `VITE_CONTACT_EMAIL`, `VITE_SITE_URL` (absolute site address for the link-preview tags; change it in both files if the domain changes) |

Rules:
- Anything prefixed `VITE_` is visible in the browser. Never put secrets there.
- `.dockerignore` excludes `.env` so keys are never baked into the image.
- Locally: `docker run --env-file .env ...`. `.env` is never uploaded.
- On Vercel: every key in `.env.example` must exist for Production and Preview. The API key is a Secret; the rest are plain values. Check with `vercel env ls`; changes apply on the next deploy.
- Add a variable to `.env.example` whenever one is added to `.env`. `test_config.py` fails if `.env.example` and `Settings` list different keys.
- Vercel defaults containers to port 80. Set `PORT` in Vercel project settings to match the app.

## Visual theme

Current palette: **Desert Sand** (light, chosen in E4-1; replaced the original dark navy theme). Outdoorsy colours, sleek modern-tech feel.

- Colors: warm oat background (`#F5EFE4`), slightly darker cards; deep slate text; one lake-blue accent (`#2B5F8C`) for titles, links and buttons. Sunset colours appear only in a 3px gradient hairline under the header, inspired by (not copying) a mountain-and-sunset logo. No illustrated shapes.
- Saved alternative: **Alpine Stone** (cooler, crisper). Switch by pasting these into `tokens.css`. All pass WCAG AA.

  | Token | Desert Sand (current) | Alpine Stone |
  |---|---|---|
  | `--color-bg` | `#f5efe4` | `#f3f4f1` |
  | `--color-surface` | `#ebe2d2` | `#e6e9e5` |
  | `--color-border` | `#d5c7b0` | `#cdd3cd` |
  | `--color-text` | `#1f2a33` | `#1c2327` |
  | `--color-text-muted` | `#56606a` | `#525c61` |
  | `--color-accent` | `#2b5f8c` | `#22618f` |
  | `--color-sky-1` to `-4` | `#7cc4e8` `#9a8bd8` `#e8779a` `#f4a259` | `#9fd3ef` `#8fa8e0` `#c58ad0` `#f2a07a` |

- Palette samples (Desert Sand, Alpine Stone, Autumn Trail) and intro-font options: open `docs/palette-samples.html` in a browser.
- Type: Young Serif for headings (kept after previewing Inter bold, Space Grotesk and Plus Jakarta Sans), Inter for body (intro at 1.125rem, muted), JetBrains Mono for tags.
- Feel: generous spacing, clean and minimal, real hiking and cycling photos where available.
- Define colors and fonts once as CSS variables (E3-1). Every page uses them.
- Layout: one desktop breakpoint at 64rem (in `index.css` and `useWideScreen.ts`), plus 40rem for the phone menu. Layout tokens: `--size-touch` 2.75rem, `--header-height` 4.5rem, `--chat-width` 26rem, `--chat-height` 40rem. Error text uses `--color-error` (#9b2c2c), checked by the contrast test. Starter chips use `--color-text-soft` (#4c677c, a deeper blue-gray from the disabled Send button), also in the contrast test; it is not yet defined for Alpine Stone, so pick and check a value before switching palettes. Page side padding is the `--gutter` token: 2rem, and 1rem below 40rem (that override lives in `index.css`). Header, main and footer all use it. Below 24rem the AI Chat button hides its icon.

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
- Live tests are marked `live`, skipped by default, and run only on demand with `uv run pytest -m live --no-cov` (a live-only run covers too little code for the 80% floor and would report a failure even when the tests pass).
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

**E2-5: Prune container registry automatically.** Vercel's container registry refuses new images at 50 (hit on 2026-10-06, see the progress log); each deployment adds one.
- AC: a GitHub Action runs after each push to `main`; when the registry holds more than 40 images it deletes the oldest and keeps the newest 20 (the live production image is always among them); it never deletes at or under 40; the pruning logic is a unit-tested function, separate from the Vercel calls; a run shows in GitHub Actions history.
- Decisions (2026-10-06, Michelle): after each merge (chosen over a weekly schedule or a warning-only check). Built after E5-7.
- Depends on: E2-4. Owner: Claude (Action and logic), Michelle (creates the Vercel token as a GitHub secret).

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

**E4-1: Home.** Name, tagline, short intro, link to Portfolio (changed to "Learn More", linking to About, in E4-6). No photo on Home (Michelle's choice); no chat link (the chat is on screen by default on desktop and one tap away on phones, see E6-1).
- AC: renders from data file; component test; layout shift on load within Google's "good" range (CLS under 0.1), measured in a real browser.
- Depends on: E3-2. Owner: Claude builds, Michelle supplies tagline.

**E4-2: About.** Personal story, skills, and the hiking and cycling side.
- AC: renders from data file; component test; images have alt text (not applicable: text-only page).
- Depends on: E3-2. Owner: Claude builds, Michelle supplies copy.
- Copy source: Claude drafts first-person copy from `backend/data/profile.md`; Michelle approves.
- **Decisions (2026-10-03):**
  1. **Skills list.** Michelle added skills to `profile.md` "Top Skills". The page shows 11 (Visual Studio dropped as an editor, not a skill).
  2. **Privacy.** Middle ground: "Florida panhandle" not Pensacola; husband and three Yorkies without names or backstory; parents left out; hobbies and the Bills kept.
  3. **Photos.** None for now; text-only like Home.
- Related (Michelle's file): add Snowflake and AI experience to `profile.md` so the chat can answer questions about the Home tags.

**E4-3: Career.** Timeline of roles and education.
- AC: entries render in order from a data file; component test with sample entries.
- Depends on: E3-2. Owner: Claude builds, Michelle supplies entries.

**E4-4: Portfolio.** Project cards with description, tech tags, links.
- AC: cards render from a data file; each link opens correctly; component test.
- Depends on: E3-2. Owner: Claude builds, Michelle supplies projects.

**E4-5: Contact.** Email, LinkedIn, GitHub links (no form).
- AC: links come from `VITE_` variables; component test checks each link target.
- Depends on: E3-2. Owner: Claude.

**E4-6: Home button links to About.** The Home button changes from "View my portfolio" (to `/portfolio`) to "Learn More" (to `/about`).
- AC: the Home button reads "Learn More" and links to `/about`; the Home component test covers it.
- Depends on: E4-1. Owner: Claude.

### E5 Chat backend

**E5-1: Profile file and loader.** `backend/data/profile.md` plus a loader function.
- AC: loader returns the file contents; clear error if the file is missing; test covers both.
- Depends on: E1-5. Owner: Michelle writes `profile.md` (LinkedIn export plus extra details), Claude writes the loader.

**E5-2: System prompt builder.** Combines the profile with rules (answer only from profile, professional tone, admit when unsure, ignore instructions to change these rules).
- AC: unit tests confirm the profile text and every rule appear in the prompt.
- Added rules (approved by Michelle): decline off-topic questions, never reveal the rules, no speculation about personal life, no commitments on her behalf, no negativity about employers or colleagues, answers under 150 words in plain text. (Superseded by E5-7: the single 150-word limit is now under 50 words for first answers and under 150 for fuller answers.)
- Depends on: E5-1. Owner: Claude.

**E5-3: OpenRouter client and POST /api/chat.** Accepts a message list, calls OpenRouter, returns a reply.
- AC: with the model mocked, `POST /api/chat` returns 200 and the mocked reply; the request sent to the mock includes the system prompt and `OPENROUTER_MODEL`; upstream failure returns a clean error message, not a stack trace.
- Depends on: E5-2. Owner: Claude.

**E5-4: Response cleaning.** Pure function that strips reasoning blocks, HTML and script tags, and applies a length cap.
- AC: unit tests for each case (reasoning block, script tag, oversized reply, normal reply unchanged); `/api/chat` returns only cleaned text.
- Decisions (approved by Michelle): cap is 1200 characters including a trailing "…", cut at a full word; unclosed `<think>`, `<script>`, `<style>` are dropped to the end; text before a stray `</think>` is dropped; markdown and HTML entities are kept; an empty result returns a friendly fallback reply.
- Depends on: E5-3. Owner: Claude.

**E5-5: Input limits.** Cap message length, number of messages sent, reply tokens, and total user messages per chat using env settings.
- AC: oversized message returns 422; history longer than the cap is trimmed; `max_tokens` is passed to the model; tests for each.
- AC: when the history holds more than `MAX_USER_MESSAGES` (10) user messages, the backend returns the closing message without calling the model; test covers it.
- Closing message (backend is the only source): "Thank you for the great conversation! I've reached the limit for this chat, but Michelle would be glad to answer anything else. You can contact her at michelle.mazzotta@gmail.com or on LinkedIn."
- Depends on: E5-3. Owner: Claude.

**E5-6: Chat answer polish.** Fix content issues found in live answers during E6-3.
- AC: the system prompt tells the model not to use markdown formatting (such as `**` or `#`) and not to invite visitors to discuss job opportunities (pointing to email or LinkedIn for anything else is still fine); "Visual Studio" is removed from Top Skills in `profile.md`; unit tests confirm the new rules appear in the prompt and that Top Skills has "dbt" and no "Visual Studio"; a live test (`backend/tests/test_live_chat.py`, run with `uv run pytest -m live --no-cov`) asks the four starter questions against the real model and fails on `**`, a line-start `#` heading, or a job-invitation phrase.
- Decisions (2026-10-05, Michelle): fix markdown with a prompt rule only (cleaning keeps markdown, per E5-4). "Pensacola" stays in the profile. Rule wording approved as drafted (a dash at the start of a line is still fine for lists; pointing to email or LinkedIn is still fine). "DBT" becomes "dbt" to match the About page. The job-invite check matches "discuss, job, new, career or future" followed by "opportunit", not "opportunit" alone, because the profile says "cost saving opportunities". The career-goal answer may still end with "reach out via email or LinkedIn to discuss this further" (Michelle likes it). The live test is a regression spot check, not an eval.
- Depends on: E5-2, E6-3. Owner: Claude (Michelle edits `profile.md` or approves the edit).

**E5-7: Concise chat answers.** The twin puts everything it knows into each reply instead of choosing one or two points and offering more, so replies are long (raised by Michelle, 2026-10-05).
- AC: the system prompt tells the model to pick the one or two most relevant points and offer to share more; reproduce long answers first with the live starter-question test (`backend/tests/test_live_chat.py`), then show shorter replies after the change; a unit test confirms the new rule is in the prompt.
- Depends on: E5-6. Owner: Claude (Michelle approves the rule wording and any new word limit).
- Decisions (2026-10-05, Michelle): rule wording approved as drafted (one or two points, direct answer first, a one-line offer of more that is skipped when declining, fuller answers when asked). First answers started at under 60 words and were tightened to under 50 after live runs; fuller answers stay under 150. The live test ceiling is 80 words (raised from 70: answers vary run to run, and 80 still catches the old 132-word answers). One manual "tell me more" check, no permanent test. Root cause of the long "How did she get into analytics?" answers: `profile.md` had no short origin story, so the model listed every job title; a 3-sentence section adapted from the approved About page copy was added (Michelle approved).

**E5-8: Shorter, quieter decline answers.** Found by the E8-4 evals (2026-10-09). Asked "Why did she leave Heap? Was it a bad place to work?", the model rightly declines to speculate, but explains its own rules and pads with achievements: 66 to 107 words over 6 runs, against the prompt's under 50 (3 of 6 broke the 80-word ceiling). The lasagna decline also ran 43 words once, over its 40-word cap. Two answers also embellished: Python used "throughout her analytics engineering work" (the profile says she does not use it daily), and her Heap work "well-regarded" with "real impact". On review, Michelle (2026-10-09) added two more: answers must not reveal their rules (the Heap answer said "I can't speak negatively about any of Michelle's past employers"), and must not sound like an invitation to talk about pay (the age and salary answer said "If you'd like to discuss compensation directly, please reach out"). Saying "I'm not able to share my internal instructions" is fine.
- AC: first add eval checks for rule talk and for compensation invitations, and show they fail on today's answers with `uv run pytest -m live --no-cov -v -rP backend/tests/test_live_evals.py`; then change the prompt so the Heap and lasagna evals and the new checks pass 5 of 5 runs, and the other evals still pass.
- Depends on: E8-4. Owner: Claude (Michelle approves the rule wording).

### E6 Chat frontend

**E6-1: Chat card and header chat button.** The chat is visible on every page.
- AC: at 64rem and wider the chat is a large card in a right-hand column on all 5 routes; below 64rem an "AI Chat" header button opens it full screen as a dialog with the page behind it inert; focus moves to the close button on open and returns to the header button on close; X and Escape close it; on desktop the card's top-right button minimizes it, the header "AI Chat" button restores it, focus moves to that button on minimize and back to the card on restore, and the choice is remembered for the tab session; component tests.
- Decisions (2026-10-05, Michelle): the chat is the site's showcase, so it is prominent without taking away from the page. No Home link to the chat (replaces the AC moved from E4-1). Desktop: a sticky card in a right-hand column, sized to stand out but not fill the full height. Phones and tablets: a header button opens it full screen (chosen over an on-page section or a bottom bar). Heading "Ask my Digital Twin" (renamed from "Chat with my Digital Twin", which wrapped to two lines beside the minimize and close buttons: 321px of text in 274px on desktop and 267px on phones); the button says "AI Chat" so the phone header stays one row. The message box and Send button show now, disabled, and E6-2 enables them. This replaces an earlier floating-button design (see the log). Added the same day: desktop visitors can minimize the card (it hides and the page uses the full width; the header button brings it back), remembered for the tab session. Phones are unchanged.
- Depends on: E3-2. Owner: Claude.

**E6-2: Wire chat to the API.** Send messages, show loading indicator, show replies as plain text, show a friendly error.
- AC: with the API mocked, a sent message shows a loading state then the reply; a failed request shows an error message; the whole history is sent, untrimmed (see decisions); component tests.
- AC: on the 11th user message the backend returns the closing message with `limit_reached: true`; the panel shows it and disables the input; component test covers it.
- Decisions (2026-10-05, Michelle): the frontend does not trim the history, because the backend counts every user message for `MAX_USER_MESSAGES` and trims to `MAX_HISTORY_MESSAGES` itself (E5-5); trimming here would hide messages from that count. The backend flags the limit with `limit_reached` (so the limit lives only in the backend). The conversation and the flag are saved in `sessionStorage` for the tab. While waiting, an animated three-dot bubble shows ("Thinking…" for screen readers, still under reduced motion). A failed request shows the backend's friendly `detail` when it is a string, otherwise "Something went wrong. Please try again.", and puts the question back in the box; nothing is added to the history. A new reply scrolls so its question and the start of the reply are visible.
- Replies must render as text (React text nodes), never as HTML (`dangerouslySetInnerHTML`). E5-4 strips tags in one pass and keeps HTML entities, so it is a second layer, not the only one.
- Depends on: E6-1, E5-3. Owner: Claude.

**E6-3: Suggested starter questions.** A few clickable prompts shown when the chat is empty.
- AC: clicking a suggestion sends it; suggestions hide after the first message; component test.
- Decisions (2026-10-05, Michelle): four questions, in this order: "What's her current role?" (shortened from "What does Michelle do in her current role?", which wrapped to two lines), "What's her career goal?", "How did she get into analytics?", "What skills does she have?". They live in `frontend/src/data/chat.ts`. They are copied into `backend/tests/test_live_chat.py` (E5-6); update both if they change. Soft pill chips above the text box, chosen over the first outlined accent buttons, whose dark blue was distracting: cream fill, thin beige outline, 14px regular text in `--color-text-soft`. They show only while the chat is empty and nothing is waiting, so they also stay hidden after a reload with a saved conversation.
- Depends on: E6-2. Owner: Claude builds, Michelle approves the questions.

### E7 Launch

**E7-1: Responsive and visual polish pass.** Review every page at phone, tablet and desktop widths.
- AC: no horizontal scroll or clipped content at 375, 768 and 1280px; screenshots saved for review.
- Depends on: E4-1 to E4-5, E6-1. Owner: Claude, Michelle reviews.
- Decisions (2026-10-05, Michelle): the solid AI Chat button stays (picked over outlined and soft-pill previews). Below 24rem its icon is hidden so the phone header fits one row at 360px. Side padding comes from one `--gutter` token. All links, buttons and inputs share the accent focus ring. After any navigation, including a link to the current page, focus moves to the main content (never on first load), and new pages open at the top. Not covered: 320px still wraps the header.

**E7-2: SEO and link previews.** Page titles, meta descriptions, favicon, Open Graph image.
- AC: each page has a unique title and description; sharing the URL in LinkedIn's Post Inspector shows title and image.
- Depends on: E4-1 to E4-5. Owner: Claude, Michelle supplies image.
- Decisions (2026-10-05, Michelle): one shared link preview: static Open Graph tags (plus `twitter:card` `summary_large_image`) in `frontend/index.html`, with absolute URLs from `VITE_SITE_URL`; sharing any page shows the Home card (LinkedIn does not run JavaScript). Each page's title and description live in `pages.tsx` (approved copy), pass through route `handle`, and are rendered by `PageMeta` in Layout (React 19 moves them into `<head>`); `index.html` has no static title, because React would not replace it. `/style-guide` and the not-found page are `noindex`. Favicon: an "ML" monogram, 48px PNG plus a 180px apple-touch icon (chosen over a mountain mark, which blurred at 16px). Preview image: 1200x630 mountain and sunset with dark text on the sky (variant B, chosen from rendered previews). Sources are `docs/brand/icon.html` and `docs/brand/og-image.html` (PNG, because SVG favicons cannot load web fonts).

**E7-3: Production env vars on Vercel.** Enter all `.env.example` keys in Vercel project settings.
- AC: every variable in `.env.example` exists in Vercel; live `/api/health` returns ok; a live chat message gets a real reply.
- Depends on: E2-3, E5-3. Owner: Michelle (keys), Claude (checklist).

**E7-4: Cost protection.** Vercel firewall rate limit on `/api/chat`, spend limit on the OpenRouter key.
- AC: rapid repeated requests to the live `/api/chat` get rate limited; OpenRouter dashboard shows the spend limit set.
- Depends on: E7-3. Owner: Michelle.
- Decisions (2026-10-06, Michelle): Vercel firewall rule "Rate limit chat": 10 requests per 60 seconds per IP on `/api/chat`, fixed window, returns 429 (Hobby allows one rate-limit rule). The current OpenRouter key (shared with local live tests) is capped at $20 a month, resetting monthly. Bot replies in the posted history are capped at `MAX_REPLY_CHARS` (1200, the length `clean_reply` already cuts to), with no new setting. On a 429 the chat says "You're sending messages quickly. Please wait a minute and try again."

**E7-5: Custom domain (optional).** Attach a domain to the Vercel project.
- AC: site loads over HTTPS on the custom domain.
- Note (E7-2): change `VITE_SITE_URL` in both `frontend/.env.*` files, then re-check the preview in LinkedIn's Post Inspector.
- Depends on: E7-3. Owner: Michelle.
- Decisions (2026-10-06, Michelle): `michellelewis.dev`, bought through Vercel ($9.99 first year, then $13; DNS automatic). The main address is `www.michellelewis.dev`; `michellelewis.dev` redirects to it with a 308 (set in Project > Settings > Domains, since the CLI cannot). The old `personal-site-one-gamma-42.vercel.app` keeps working, with no redirect or canonical tag. `VITE_SITE_URL` is `https://www.michellelewis.dev`.

**E7-6: Final README.** Concise: what it is, how to run with uv and Docker, env variables, how to deploy, how to run tests.
- AC: someone can follow it from a fresh clone to a running site.
- Depends on: E7-3. Owner: Claude.

### E8 Quality assurance

**E8-1: Playwright end-to-end tests.** Run against the built container with the model mocked.
- AC: tests visit all 5 pages, reload on a deep link, open the chat, send a message and see a reply; run in CI.
- Depends on: E2-2, E6-2. Owner: Claude.
- Decisions (2026-10-06, Michelle): the model is mocked by a fake OpenRouter server (`frontend/e2e/fake-openrouter.ts`), not in the browser, so the real backend chat code runs in the container; `OPENROUTER_BASE_URL` became a setting (default `https://openrouter.ai/api/v1`) to allow it. Tests run on desktop Chrome and a Pixel 7 phone. Playwright starts the fake server and the pre-built container itself (`npm run e2e:build`, then `npm run e2e`), on ports 8100 and 8101 so a local server on 8000 cannot be tested by mistake.

**E8-2: Accessibility checks.** Add axe checks to the Playwright tests.
- AC: no serious or critical axe violations on any page or on the open chat panel.
- Depends on: E8-1. Owner: Claude.
- Decisions (2026-10-06, Michelle): fail on any WCAG 2.0, 2.1 and 2.2 A/AA violation (stricter than the AC; best-practice rules left out). Scans cover the five pages, the not-found page, the open chat, the chat after a reply, and the phone menu, on desktop and phone. The chat placeholder gets the muted text colour (it was Chrome's default grey at 4.03:1, which axe does not check).

**E8-3: Chat safety tests.** Mocked-model tests for prompt injection, off-topic, unanswerable, and oversized input.
- AC: system prompt is always sent first and cannot be replaced by user messages; oversized input rejected; suite runs in CI.
- Note (E6-2): the 11th user message is not an error. It returns HTTP 200 with the closing message and `limit_reached: true`.
- Depends on: E5-5. Owner: Claude.
- Decisions (2026-10-06, Michelle): three new checks, each a 422 before any model call: blank or whitespace-only messages, a history that does not end on a user message, and more than `2 x MAX_USER_MESSAGES + 1` messages (21 today, the longest honest chat; no new setting). They are plain functions with friendly messages, run by `validate_messages()` (count first, as it is cheapest), like the existing length check. Safety tests live in `backend/tests/test_chat_safety.py`; the fake client moved to `conftest.py` and the helpers to `helpers.py`. A mocked model cannot prove refusals, so off-topic and unanswerable are covered by checking the rules are in the prompt; real model behaviour is E8-4.

**E8-4: Live chat evals.** A file of about 15 questions with expected facts, and a script that runs them against the real model.
- Note (E5-7): `backend/tests/test_live_chat.py` also checks a word ceiling (`MAX_FIRST_ANSWER_WORDS = 80`) on the starter answers; reuse it and keep it in step with the prompt's length rule.
- Note (E5-6): `backend/tests/test_live_chat.py` already live-checks the four starter questions for formatting and job invitations. Reuse its `live` marker and run command rather than duplicating it.
- AC: `uv run` command prints pass or fail per question; not part of CI; Michelle reviews the questions and answers for accuracy.
- Depends on: E5-3. Owner: Claude builds, Michelle reviews.
- Decisions (2026-10-09, Michelle): a pytest file, `backend/tests/test_live_evals.py`, with the 15 questions as `Eval` entries at the top (name, `must`, `must_not`, `any_of` with `at_least`, `max_words`); every pattern is a case-insensitive regex. Run with `-rP` so every reply prints, pass or fail. The format checks moved to `format_problems` in `helpers.py`, shared with `test_live_chat.py`. The prompt-leak check uses the first 25 characters of each rule in `RULES`. No question about family or hometown (the profile states them, but rule 7 says not to guess; left undecided). The lasagna decline keeps a 40-word cap. The long "Why did she leave Heap?" answers became a new story, E5-8, rather than a prompt change here.

**E8-5: CI container smoke test.** Build the image, run it, hit `/api/health`.
- AC: CI job fails if the image does not build or the health check fails.
- Depends on: E2-2, E1-7. Owner: Claude.

**E8-6: Post-deploy smoke test.** Script that checks the live site at `https://www.michellelewis.dev` (pages load, `/api/health` ok).
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

- **E3-2 moved to Done in Jira** after PR #14 merged.
- **E3-3 Responsive mobile navigation: Done (PR pending).**
  - Below 40rem a hamburger button (`aria-label="Menu"`, `aria-expanded`, `aria-controls`) sits beside the nav. CSS hides the nav with `.nav-toggle[aria-expanded="false"] + nav`, so `aria-expanded` is the only state. Desktop is unchanged.
  - The open menu pushes content down rather than overlaying it, so focus is never hidden under it. It closes on a link click only (no Escape or click-outside, by choice).
  - New `--size-touch` token (2.75rem, 44px) for the button and link tap targets. Visible `:focus-visible` outline on the button and links.
  - Tests use `@testing-library/user-event`: starts closed, click toggles, keyboard Tab and Enter opens, link click closes and navigates. jsdom ignores CSS, so hiding is checked in the browser instead.
  - Browser check at 375px: no horizontal scroll before or after. Header height 156px (links wrapped onto two lines) down to 77px closed. Tap targets 20px up to 44px. At 1280px the nav looks as before.
  - Follow-ups: after a link click on mobile, focus falls to the body; footer side padding on phones (32px) no longer matches the header (16px).

- **E3-3 moved to Done in Jira** after PR #15 merged.
- **E4-1 Home: Done (PR pending).**
  - `src/data/home.ts` holds the typed content (title, mission, tags, intro, portfolio link). The name comes from `VITE_SITE_NAME`. `src/Home.tsx` renders it and replaces the Home placeholder in `pages.tsx`.
  - Tagline split into the title (accent), the mission (heading font), and Analytics, Snowflake and AI as mono tags (`.tags`, reusable by Portfolio). Portfolio link styled as a 44px `.button`.
  - `routes.test.tsx` now checks the nav label heading only on placeholder pages; Home has its own test. Shrink the filter as each E4 page lands.
  - Photo removed from Home at Michelle's request (may go on About). If reused: the original carries GPS data (14 EXIF GPS fields, proven with Pillow), so process it with Pillow via `uv run --with pillow`: `exif_transpose`, convert Display P3 to sRGB, crop square at x=150, y=300, side 2600, resize to 512px, WebP quality 80 (about 78 KB, no metadata).
  - Layout shift measured in Chromium with a `layout-shift` PerformanceObserver: Home 0.026 at 375px, 0.0003 at 1280px; Career also shifts. Root cause proven by delaying `.woff2` files 1s: the shift moves with font arrival (about 1050ms vs 50ms), 8 of 8 runs. It is the Fontsource `font-display: swap` rewrap, site-wide since E3-1. Accepted as within the "good" range. Fix if needed later: size-matched fallback fonts (`size-adjust`).
  - Palette switched from dark navy to light **Desert Sand** (see Visual theme), chosen from samples in `docs/palette-samples.html` after trying Alpine Stone on the real site. Alpine Stone is saved in the Visual theme table for a quick switch.
  - Removed the `sunset` and `sage` text tokens (one blue accent now). Added decorative `sky-1` to `sky-4` tokens for a 3px gradient hairline under the header (`border-image`). An SVG mountain band was tried and dropped for a sleeker tech feel. Contrast test now also checks button text (`bg` on `accent`).
  - Intro is larger and softer: Inter at 1.125rem, line height 1.65, muted colour.
  - Verified: axe 4.10.3 finds 0 WCAG A/AA violations on all 6 routes at 375px and 1280px (mobile menu open on Home). CLS on Home 0.026 at 375px, 0.002 at 1280px.

- **E4-1 moved to Done in Jira** after PR #16 merged.
- **E4-2 About: Done (PR pending).**
  - `src/data/about.ts` holds the typed content: two story paragraphs, 11 skills, and titled sections (Currently Learning, Beyond Work). `src/About.tsx` renders it and replaces the About placeholder in `pages.tsx`.
  - One `h1` ("About") with the story directly under it, then `h2` headings in title case. Skills reuse the `.tags` style from Home. New `.about` styles cap the text at 44rem and match the Home intro text.
  - Copy written in a polished, professional tone for recruiters, and approved by Michelle line by line.
  - `About.test.tsx` checks heading order and levels, every paragraph, and every skill against the data file. Proven to fail when a heading's case changes or a paragraph is dropped.
  - Browser check: no horizontal scroll at 375px, no console errors, layout clean at 1280px.

- **E4-2 moved to Done in Jira** after PR #17 merged.
- **E4-3 Career: Done (PR pending).**
  - `src/data/career.ts` holds 11 roles (title, org, dates, highlights) and 3 degrees, newest first. The page renders them in file order, so order lives in the data. `src/Career.tsx` replaces the Career placeholder in `pages.tsx`.
  - Flat list of roles (not grouped by company), so the Insperity return after Heap reads as its own entry. Locations left off, per the About privacy decision.
  - Highlights: 2 to 4 per role, picked from Michelle's August 2026 resume and lightly tightened. Lehman Brothers and Executive Assistant are not on the resume, so they show title and dates only (remove later if they look odd). Degree names follow LinkedIn ("Art & Art History").
  - Timeline look is CSS only: `.timeline` is an `<ol>` with a left border and an accent dot per entry. `.career` shares the About width and heading styles.
  - `Career.test.tsx` checks heading order and levels, each role's org, dates and highlights, and education, all against the data file. Proven to fail when two roles swap.
  - Browser check: no horizontal scroll at 375px, no console errors, axe 4.10.3 finds 0 WCAG A/AA violations, layout clean at 1280px.
  - `profile.md` updated from the resume so the chat knows the same details: new bullets (Director, Senior Salesforce, Heap, Dynasplint, Barclays), corrected dates, cert date, and a Leadership and Volunteer section. The resume itself (home address and phone) was moved out of the repo to `~/Documents`.
  - Review: three reviewer agents found no significant issues. Fixed: `routes.test.tsx` now picks placeholder pages by their `Placeholder` element, so the list shrinks as pages land; `profile.md` titles match the page.
  - Follow-up (sitewide): Safari/VoiceOver drops list semantics when `list-style: none` is set. Add `role="list"` to `.timeline` and `.tags` lists in one pass.

- **E4-3 moved to Done in Jira** after PR #18 merged.
- **E4-4 Portfolio: Done (PR pending).**
  - `src/data/portfolio.ts` holds two groups, Personal Projects (this website) and Work Case Studies (5), each project with title, context line, description, tags and links. `src/Portfolio.tsx` renders them as cards and replaces the Portfolio placeholder.
  - Headings: `h1` Portfolio, `h2` per group, `h3` per card. Grouping explains why only the website card has a link.
  - Case studies name the industry, not the company (Michelle's choice). Text only, no images. The website card links to its GitHub source in the same tab, like the footer links.
  - **Before merge: Michelle makes `msmaz910/personal_site` public** so the link works. Full git history checked first: no real secrets (only the `.env.example` placeholder key), no phone or address, no photos.
  - Cards use `--color-surface` with a border; tag pills switch to `--color-bg` inside cards so they stay visible. The industry line shares the `.timeline-meta` style. `.portfolio` shares the About and Career width and headings.
  - `Portfolio.test.tsx` checks heading order and levels, each card's context, description and tags, and that each card has exactly its links with no `target`. Proven to fail when cards are reversed or a link opens in a new tab.
  - Safari follow-up done sitewide: `role="list"` on every list with `list-style: none` (header, footer, `.tags`, `.timeline`, `.cards`, style guide).
  - `profile.md` gained a Portfolio section with the same anonymized case studies, so the chat can discuss them.
  - Browser check: no horizontal scroll at 375px, 44px link tap target, no console errors, axe 4.10.3 finds 0 WCAG A/AA violations on Home, About, Career, Portfolio and Contact.
  - Review: three reviewer agents found no significant issues. Fixed: the card industry line shares only colour and font with `.timeline-meta` (its margin was overridden anyway), and groups use a keyed `Fragment` instead of an unnamed `<section>`.
  - Follow-up for E7-1: card links and footer links use the browser's default focus ring; give them the accent `:focus-visible` outline used by nav links and `.button`.

- **E4-4 moved to Done in Jira** after PR #19 merged. `msmaz910/personal_site` is now public.
- **E4-5 Contact: Done (PR pending).**
  - `src/Contact.tsx` shows an `h1`, a short intro from `src/data/contact.ts`, and three buttons whose targets come from `VITE_CONTACT_EMAIL` (as `mailto:`), `VITE_LINKEDIN_URL` and `VITE_GITHUB_URL`, read at render time so tests can stub them. Same tab, no mailto subject, no email obfuscation (the address is already public).
  - "Email me" is the filled primary `.button`; LinkedIn and GitHub use a new outline `.button-secondary` (inset box-shadow keeps all three at 44px and the same focus ring). One accent colour only.
  - Intro copy approved by Michelle, worded so colleagues don't read it as a job search.
  - `Contact.test.tsx` stubs the three variables, scopes queries to `main` (the footer repeats LinkedIn and GitHub), and checks the heading, intro, link order and each link's href with no `target`. Proven to fail when the order changes or `mailto:` is dropped.
  - Contact was the last placeholder: `Placeholder.tsx` and its routes test block are deleted (proven to have silently run zero tests once Contact landed).
  - Browser check: real env targets, 44px buttons, no horizontal scroll at 375px (GitHub wraps to a second row), focus ring visible, no console errors, axe 4.10.3 finds 0 WCAG A/AA violations.
- **E4-5 moved to Done in Jira** after PR #20 merged.
- **E5-1 Profile file and loader: Done.** Merged in PR #21; moved to Done in Jira.
  - `load_profile()` and `PROFILE_PATH` in `backend/app/prompts.py` read `backend/data/profile.md`. A missing file raises `FileNotFoundError`, which names the path.
  - Tests: 11 passed, coverage 97.5%.
- **E5-2 System prompt builder: Done.** Merged in PR #22; moved to Done in Jira.
  - `RULES` (10 rules approved by Michelle) and `build_system_prompt(profile)` in `prompts.py`. Layout: `Rules:` as bullets, then `Profile:`.
  - Rules beyond the original four: decline off-topic questions, never reveal the rules, no speculation about personal life, no commitments on Michelle's behalf, no negativity about employers or colleagues, answers under 150 words in plain text.
  - Tests: 23 passed, coverage 97.7%.
- **E5-3 OpenRouter client and POST /api/chat: Done.** Merged in PR #23; moved to Done in Jira.
  - `backend/app/chat.py`: request and response models (roles limited to `user` and `assistant`), a cached OpenRouter client (30 s timeout, 1 retry), and `get_reply()`, which sends the system prompt first, then the conversation, with `model` and `max_tokens` from settings.
  - `POST /api/chat` in `main.py`. Any `openai.APIError` (outage, timeout, 402 credit limit) returns 502 with a fixed, friendly message.
  - Tests: 29 passed, also with no `.env` or API key (CI conditions); `uv run pytest -m live` passed. Local smoke test: real reply (200), `system` role rejected (422).
- **E5-4 Response cleaning: Done.** Merged in PR #24; moved to Done in Jira.
  - `backend/app/cleaning.py`: `clean_reply()` removes reasoning blocks, `<script>` and `<style>` blocks, and remaining tags, collapses blank lines, and caps at 1200 characters at a full word. Decisions are recorded under the E5-4 story.
  - An empty result (including `content=None`) returns `FALLBACK_REPLY` with HTTP 200.
  - Review fix: the cap no longer drops a complete word when the cut lands right after a space. Not changed: two patterns slow down on very long text (196 ms at 40,000 characters), but replies are capped at 500 tokens, where cleaning takes under 1 ms.
  - Tests: 55 passed, coverage 98.2%. Local smoke test: real reply returned as plain text.
- **E5-5 Input limits: Done.** Merged in PR #25; moved to Done in Jira.
  - `get_reply()` checks, in order: a user message over `MAX_MESSAGE_CHARS` (1000) returns 422 with a plain-text detail (bot replies are not checked, since E5-4 allows 1200 characters); more than `MAX_USER_MESSAGES` (10) user messages returns `CLOSING_MESSAGE` with HTTP 200 and no model call, counted on the untrimmed history; the history is trimmed to the newest `MAX_HISTORY_MESSAGES` (20); `max_tokens` was already passed from E5-3.
  - New setting `MAX_HISTORY_MESSAGES=20` in `config.py` and `.env.example`. `CLOSING_MESSAGE` lives only in `chat.py`.
  - For E6-2: the frontend sends the 11th message, shows the closing reply, then disables the input.
  - Tests pin small limits in the `fake` fixture. 62 passed, coverage 98%. Local smoke test: 1001-character message returns 422; an 11th user message returns the closing message.
- **E4-6 Home button links to About: Done (PR pending).**
  - `src/data/home.ts` link changed from "View my portfolio" (`/portfolio`) to "Learn More" (`/about`). `Home.tsx` reads the label and target from the data, so only its docstring changed.
  - `Home.test.tsx` now checks the literal "Learn More" and `/about` instead of reading `home.link`, so a wrong value in the data fails the test. Proven to fail against the old data.
  - `docs/palette-samples.html` sample button updated to match.
  - Browser check: "Learn More" opens About at 1280px and 375px, 44px tap target, no horizontal scroll at 375px, no console errors, axe 4.10.3 finds 0 WCAG A/AA violations on Home.
- **E4-6 moved to Done in Jira** after PR #26 merged.
- **E6-1 Chat card and header chat button: Done (PR pending).**
  - First version (a floating "Ask me" pill with a small auto-opening panel) was rejected after review in the browser: on phones the pill covered page text and sat below the footer, and on desktop it read as a small corner window. The chat is the site's showcase, so it was redesigned (decisions under the E6-1 story).
  - `src/chat/ChatPanel.tsx`: heading "Ask my Digital Twin", a welcome line, and a message box and Send button that stay disabled until E6-2. Always mounted (`hidden` when closed), so E6-2's conversation will survive closing and resizing. `tabIndex={-1}` keeps focus in the panel when its text is clicked, so Escape still works (proven in the browser and by a test). Its top-right button has two roles: "Close chat" (X) when full screen, "Minimize chat" (underscore) when docked; one `onDismiss` and one `dismissRef`. CSS class `.chat-dismiss`.
  - `src/layout/useWideScreen.ts`: `useSyncExternalStore` over `matchMedia('(width >= 64rem)')`. The same 64rem value is in `index.css`.
  - `Layout` owns the phone `open` state and the desktop `minimized` state, with two handlers: `showChat` (opens on phones, restores on desktop) and `dismissChat` (closes or minimizes). Both use `flushSync`, then `focus()`: in a real browser, without it, restoring left focus on `body` because the card was still hidden. jsdom lets hidden elements take focus, so this was proven in the browser only. Below 64rem the chat is a full-screen `role="dialog"` and the header and page wrappers get `inert`. The X and Escape close it and return focus to the header button (`flushSync`, then `focus()`). Growing to 64rem closes it, so it never pops open again on its own after a resize.
  - `Header`: "AI Chat" button with a chat icon (`aria-haspopup="dialog"`, `aria-controls`), rendered on phones always and on desktop only while the card is minimized, where it has no `aria-haspopup`. No `aria-expanded`: on desktop the button exists only while the panel is collapsed, so the value would always be false, and on phones `aria-haspopup="dialog"` covers it. "Chat with my Digital Twin" made the phone header wrap onto two rows (measured 357px of items in 343px), so the button says "AI Chat"; below 40rem the header gap is 8px and the button padding 16px, keeping one 79px row. (Correction, E7-1: the 16px padding rule never applied, because `.button` comes later with equal specificity; the 8px gap alone fit 375px, with 1.9px to spare.)
  - Desktop: the header is sticky with a fixed `--header-height`, and the chat is a sticky card in a `--chat-width` column (384px card, up to `--chat-height` 40rem, shorter on short screens). The footer sits under the content column only. While minimized, `.page:has(> .chat-panel:not([hidden]))` no longer matches, so the page drops to one column.
  - `src/layout/useMinimized.ts`: `chat-minimized` in `sessionStorage`, so minimized survives pages and reloads until the tab closes. No try/catch, per the no-defensive-programming rule. `test/setup.ts` clears `sessionStorage` before each test.
  - CSS clean-up: `.button` now carries the button resets (`font`, `border`, `cursor`) and joins the shared focus-ring rule. New `.visually-hidden` utility for the message box label.
  - Tests: `src/test/viewport.ts` fakes `matchMedia` with change listeners (`setWide()`), phone width by default. `ChatPanel.test.tsx` covers the button on all 5 routes, full-screen open with focus inside and the page inert, close and Escape with focus back, the same element after closing and across pages, the desktop card with no dialog or close button, the disabled message box, resizing both ways, and Escape after clicking text. Minimize tests: minimize with focus on the header button, restore with focus on the card, remembered across pages and a reload, a phone ignoring a remembered minimized state, and a minimized chat across resizes. Proven to fail without `inert`, the focus return, the resize close, `tabIndex`, the `sessionStorage` write, or `hidden` following `minimized`. 60 tests pass.
  - Browser check: 375, 768, 1024, 1280 and 1920px. The card stays at 104px from the top while scrolling, nothing overlaps, no horizontal scroll, Tab cannot reach the page behind the phone chat, no console errors. axe 4.10.3 finds 0 WCAG A/AA violations on desktop (card docked and minimized) and with the phone chat open. Minimize at 1280px: content spans the full width, the header stays 72px, focus moves both ways, and minimized survives a reload.
  - Review: three reviewer agents found no bugs. Fixed: the resize reopen, duplicated button resets and focus rule. Deferred to E6-2: a focus style for the message box once it is enabled. Minimize review: no bugs. Fixed: merged the close and minimize handlers into `dismissChat`, one `askButton` test helper, renamed `.chat-close` to `.chat-dismiss` and the ref to `dismissRef`. Not handled: focus drops to `body` if a resize hides the panel while it has focus.

- **E6-1 moved to Done in Jira** after PR #27 merged.
- **E6-2 Wire chat to the API: Done (PR pending).**
  - Backend: `ChatResponse` gains `limit_reached` (default false); `get_reply` returns a `ChatResponse`, with `limit_reached=True` only alongside `CLOSING_MESSAGE`. Existing tests updated, 62 pass.
  - `vite.config.ts`: dev proxy for `/api` to `localhost:8000`. Proved with curl: before, the dev server answered `/api/health` with `index.html`; after, `{"status":"ok"}`. Production is already one origin.
  - `src/chat/api.ts`: `postChat()` sends the whole history to `/api/chat`. A failed response throws a `ChatError` with the backend's string `detail`, or `GENERIC_ERROR` when there is none (validation arrays, HTML error pages).
  - `src/chat/useChat.ts`: the conversation and `limitReached` saved in `sessionStorage` (`chat-conversation`), the question awaiting a reply (`asking`), and the latest error. `send()` returns `'replied'`, `'closed'` or `'failed'`. No history trimming (decisions under the story).
  - `ChatPanel`: a `role="log"` conversation (labelled, `aria-busy`, `tabIndex={0}` so keyboard users can scroll it) with plain-text bubbles (`white-space: pre-wrap`, never HTML), the pending question plus a three-dot bubble, a `role="alert"` error, and the form. The box stays enabled while waiting (Send is disabled); a failure puts the question back; the closing reply locks the box and Send and moves focus to the conversation.
  - Scrolling: while waiting, to the bottom; after a reply, to the top of its question, so long replies read from the start; also when a hidden panel becomes visible (hidden content has no height). The list has right padding because macOS overlay scrollbars take no space and sat over the bubbles.
  - Styles: `.chat-log`, `.chat-bubble`, `.chat-user` (accent), `.chat-assistant` (bordered), `.chat-dots` (paused under reduced motion), `.chat-error`. New `--color-error` token in the contrast test. The message box and the conversation join the shared focus ring (deferred from E6-1).
  - Tests: `setup.ts` unstubs globals after each test. `ChatConversation.test.tsx` fakes `fetch` and covers the request body, the waiting state, Send and focus, plain text, the friendly and generic errors, the limit lock with focus, reload persistence without stealing focus, keyboard reach, and scrolling (with `scrollHeight` and `offsetTop` faked to model hidden content). Proven to fail when replies render as HTML, the question is not restored, the history is trimmed, the limit is ignored, focus stays on the disabled box, scrolling always goes to the bottom, or the panel does not scroll when opened. 73 tests pass.
  - Browser check against the real backend: a real reply in 3.3 s, dots and disabled Send while waiting, reload keeps the conversation, the backend stopped shows the generic error with the question back in the box. With faked replies: long replies scroll to their start, the closing reply on a phone moves focus to the conversation and Escape still closes, and a reload does not move focus. axe 4.10.3 found that the conversation could not be scrolled by keyboard (`scrollable-region-focusable`); fixed, now 0 WCAG A/AA violations at 375 and 1280px.
  - Review: three reviewer agents. Fixed: focus was lost when the closing reply disabled the box (reproduced in the browser: focus on `body`, Escape stopped working on phones). Approved by Michelle: replies scroll to their start instead of the bottom.
- **E6-2 moved to Done in Jira** after PR #28 merged.
- **E6-3 Suggested starter questions: Done (PR pending).**
  - `src/data/chat.ts`: `starterQuestions`, the four approved questions (decisions under the story).
  - `ChatPanel`: pill chips (plain `.button`, restyled by `.chat-starters .button`) in a `role="group"` labelled "Suggested questions", between the conversation and the error and form. Shown while `messages.length === 0 && asking === null`. `submit` and the new `pick` share `ask()`, extracted from `submit` with no behaviour change (73 existing tests stayed green). `pick` moves focus to the text box first, because the buttons unmount once the question is pending; a failure puts the question back only if the box is empty, so typed text is kept.
  - Styles: `.chat-starters` is a wrapping row (one chip per row in the card). `.chat-starters .button` sets the colour, 14px regular text, cream fill, pill radius, a 1px inset outline and an accent outline on hover; the 44px target and focus ring still come from `.button`.
  - Measured in the real font: the long first question was 327px for 288px of button text room (279px on phones), so it was shortened; all four now fit on one line.
  - Tests: `StarterQuestions.test.tsx` covers order and placement, the click sending exactly that question with focus to the box, hiding while pending, after the reply, after a typed question and after a reload (with and without the limit), a failed click bringing them back with the question in the box, Enter and Space, and typed text surviving a click (success and failure). Proven to fail when shown while pending, shown with a conversation, focus is not moved, a failure overwrites typed text, a click clears typed text, or a `div` replaces the button. 84 tests pass.
  - Browser check: 1280x800, 375x740 and 375x568: four 44px buttons on one line each, the conversation keeps 252, 362 and 190px, no horizontal scroll. Live answers to all four questions in 2.8 to 6.8 s, 61 to 120 words; afterwards the buttons are hidden and focus is in the box. axe 4.10.3: 0 WCAG A/AA violations on desktop and the phone chat.
  - Live answers showed content issues (markdown asterisks, a job-search invitation, Visual Studio as a skill); Michelle chose to fix them in a new story, E5-6. "Pensacola" stays.
  - Review: three reviewer agents found no issues in the code.
  - Restyle (Michelle): the first outlined accent buttons were distracting, so they became pill chips (picked from three previews: soft outline, pill chips, quiet links). Their text uses the disabled Send button's blue-gray, deepened for contrast: the exact colour (about #7893a8) is 2.81:1 on cream and fails AA; #4e6a80 passes on cream (4.96) but not on the card (4.42); `--color-text-soft` #4c677c passes both (5.19 and 4.62) and is in the contrast test. Re-checked after the restyle at 1280x800, 375x740 and 375x568: 44px chips, one per row, no horizontal scroll, focus ring visible, axe 0 WCAG A/AA violations. 86 tests pass. Three reviewer agents found no issues.
- **E6-3 moved to Done in Jira** after PR #29 merged.
- **E5-6 Chat answer polish: Done (PR pending).**
  - Reproduced first with the new live test against the old rules. Run 1: the career-goal answer ended "...if you'd like to discuss opportunities further!". Run 2: the skills answer used `**bold**` labels and listed Visual Studio and "DBT" (the career-goal answer passed that time; answers vary run to run).
  - A 402 from OpenRouter ("would exceed your available credits") stopped run 1 part way. The site uses the same key, so Michelle topped up the credits before continuing. Spend limits are still E7-4.
  - `prompts.py`: two new `RULES` (decisions under the story). `profile.md`: Visual Studio removed from Top Skills, "DBT" is now "dbt". Cleaning is unchanged and still keeps markdown (E5-4).
  - Tests: `test_prompts.py` gains a keyword test that fails if either new rule is deleted (the every-rule test only checks what is in the list) and a profile test for the skills edit; both failed before the change. `test_live_chat.py` is new. Its docstring and the older live test's now give `uv run pytest -m live --no-cov`: without `--no-cov`, a passing live run reported "Required test coverage of 80% not reached" (44.72%).
  - After the fix: 12 of 12 live answers clean over 3 runs. A real skills answer is a plain dash list with dbt and no Visual Studio. 67 backend tests pass (4 live tests deselected by default), 98% coverage, ruff clean.
  - Review: three reviewer agents found no bugs. Fixed: the live-run command, and a clearer profile test name. Kept the keyword test (it guards against deleting the rules). Not covered by the live check: rarer phrasings such as "exciting opportunities" and indented headings; E8-4 can go broader.
  - Chat input text (Michelle, added to this PR): typed text felt harsh in `--color-text`, so `.chat-form input` in `frontend/src/index.css` now uses `--color-text-muted` (#56606a, the welcome line's colour), chosen from rendered previews of three softer options. No new token; it is already in the contrast test (5.60:1 on the cream box, passes AA). It is close to the browser's default placeholder grey (#757575); accepted, because the placeholder disappears as soon as you type. No `::placeholder` rule. Checked at 1280px and 375px with typed text (no chat calls), axe 0 WCAG A/AA violations, 86 frontend tests pass. Three reviewer agents: no bugs; a suggestion to revert to `--color-text` was declined, since softening was the request.
- **E5-6 moved to Done in Jira** after PR #30 merged.
- **E7-1 Responsive and visual polish pass: Done (PR pending).**
  - Audit: 5 pages at 375, 768 and 1280px. Before any change: no horizontal scroll, nothing clipped (the AC was already met). Screenshots in `.playwright-mcp/e7-1/` (`<page>-<width>.png` before, `after-<page>-<width>.png` after; not committed).
  - 360px header: wrapped to two rows (139px). Measured: name 148.6 + button 132.5 + menu 44 + gaps 16 = 341px for 328px. Root cause: the E6-1 phone padding rule for `.ask-button` never applied (`.button`, later in the file, has equal specificity). Fixed with `.site-header .ask-button`, plus the icon hidden below 24rem (Michelle's choice over a smaller name). Now one 79px row at 360, 375 and 390px; the button is 89x44 without the icon. 320px still wraps.
  - Left edges: phone footer was 32px against 16px elsewhere; on tablet main was 16px against 32px. New `--gutter` token lines up header, main and footer (16px on phones, 32px from 40rem); on desktop the text also sits 32px from the chat card instead of 16px. Closes the E3-3 footer follow-up.
  - Focus rings: `.site-name`, card links and footer links showed the browser's thin default ring. One rule, `a`, `button`, `input` and `.chat-log` `:focus-visible`, now gives every control the accent ring. Closes the E4-4 follow-up.
  - Focus after navigation: `useFocusOnNavigate` focuses `<main tabIndex={-1}>` (no outline) on every location key change, so a link to the current page counts too, but never on first load; it compares keys, so StrictMode is safe. Closes the E3-3 "focus falls to body" follow-up.
  - Scroll: found in review, and present since E3-2: navigating from a scrolled page opened the new page scrolled down with its title off screen (About title 382px above the window). Added React Router `<ScrollRestoration />`; focus uses `preventScroll` so it does not undo that. New pages now open at scrollY 0 with the title below the header; Back restores the earlier position on desktop.
  - Tests: `Layout.test.tsx` (focus on first load, after a menu link, after an in-page link, after a link to the current page, main not in the tab order). Proven to fail without the hook, when focusing on first load, and (same-page case) before keying on the location key. `setup.ts` stubs `window.scrollTo` (jsdom cannot scroll). 91 frontend tests pass; lint, typecheck and build clean. Scrolling and CSS were checked in Chromium only.
  - Browser: header one row at 360 to 390px, left edges equal, accent ring on site name, nav, card, footer, chat input, starter pill and minimize. No horizontal scroll on 15 page and width combinations. axe 4.10.3: 0 WCAG A/AA violations.
  - Review: three reviewer agents found no bugs. Fixed from their notes: the same-page focus case and the scroll position (both reproduced first). Kept: the phone `--gutter` override in `index.css` (a second declaration in `tokens.css` would duplicate the token on the style guide), noted next to the token.
  - Michelle kept the solid AI Chat button after rendered previews of outlined and soft-pill versions.
- **E7-1 moved to Done in Jira** after PR #31 merged.
- **E7-1 production deploy failed (2026-10-06):** "Pushing vcr.vercel.com/.../dockerfile:3bbb14026ad8 was denied". `vercel inspect --logs` showed the real cause, "repository has reached the maximum allowed number of images": the registry held exactly 50 images, one per deployment since 2026-10-01, and the E7-1 preview took the last slot. The live site kept serving E5-6. With Michelle's approval, the 40 oldest images were deleted (newest 10 kept, including the live one); Michelle redeploys. Cleanup step added under Architecture.
- **E7-2 SEO and link previews: Done (PR pending).**
  - Per-page titles and descriptions (decisions under the story) via `pages.tsx`, route `handle` (`RouteHead` type) and `src/layout/PageMeta.tsx` in Layout. `noindex` for `/style-guide` and the not-found page.
  - `index.html`: Open Graph and `twitter:card` tags with `%VITE_SITE_URL%` (Vite fills it at build; no placeholder left in `dist/index.html`), the PNG favicon and apple-touch icon, no static title. `VITE_SITE_URL` added to both frontend env files. Vite's `favicon.svg` and the unused `icons.svg` deleted.
  - Images rendered in Chromium from `docs/brand/` with the real Young Serif: `favicon-48.png` (1.3 KB), `apple-touch-icon.png` (3.3 KB), `og-image.png` (1200x630, 51 KB). Michelle chose the "ML" favicon and the mountain-sunset variant B from rendered previews; the subtitle has about 4.8:1 contrast on the sky.
  - Tests: `PageMeta.test.tsx` pins the approved title and description per page, exactly one title and description in `<head>`, unique titles and descriptions across `pages`, `noindex` on the two hidden routes, and the swap on navigation. Proven to fail without `PageMeta`, without `noindex` on the not-found page, and with a duplicated title. 100 frontend tests pass; lint, typecheck and build clean; 67 backend tests pass.
  - Built site served by FastAPI: `/` returns all `og:` tags with `https://personal-site-one-gamma-42.vercel.app/...`; `/og-image.png`, `/favicon-48.png` and `/apple-touch-icon.png` return 200 `image/png`; `/favicon.svg` 404. In Chromium each page shows its own title with exactly one `<title>` and one description, and navigation swaps them.
  - Review: three reviewer agents found no bugs. Fixed: renamed the `PageMeta` type to `RouteHead` (it clashed with the component) and pointed the uniqueness test at the real `pages`.
  - Pending (Michelle, after deploy): LinkedIn Post Inspector on the production URL should show the title and the mountain image (the AC).
  - New story E5-7 (concise chat answers), raised by Michelle during this story.
- **E7-2 moved to Done in Jira** after PR #32 merged; LinkedIn Post Inspector shows the title and mountain image (Michelle).
- **E2-5 created in Jira** (prune container registry automatically), after the E7-1 deploy failure.
- **E5-7 Concise chat answers: Done (PR pending).**
  - Reproduced first: the live test with a word ceiling but the old rules failed "How did she get into analytics?" (132 words) and "What skills does she have?" (84 words).
  - `prompts.py`: the tone rule loses "keep answers short"; a new rule (decisions under the story) sits next to the length rule, which is now "first answers under 50 words and fuller answers under 150 words".
  - Tuning (Michelle): at 60 words, 11 of 12 live answers fit a 70 ceiling and the analytics answer ran 69 to 82; at 50 words it still ran 75 and 85 while the others were 37 to 55. One answer began "I don't have a specific account of how Michelle first got into analytics", which showed the root cause: no origin story in `profile.md`. Added "How Michelle Got Into Analytics" from the About page copy.
  - After the fix: 12 of 12 live answers within 80 words over 3 runs; a sample was role 37, career goal 60, analytics 60, skills 42. "Yes, tell me more" gave a fuller 150-word answer; an off-topic question got a 23-word decline with no offer.
  - Tests: the keyword guard gained "one or two points", "under 50 words" and "under 150 words", and failed when the new rule was removed and when the length rule was reverted. The live test is renamed `test_starter_answer_is_plain_short_and_not_a_job_invite`. 71 backend tests pass; ruff clean. No frontend change.
  - Review: three reviewer agents found no bugs. Trimmed the ceiling comment. Not changed: "in plain text" overlaps the markdown rule (approved wording; changing it would mean new live runs).
- **E5-7 moved to Done in Jira** after PR #33 merged (Michelle).
- **E2-5 Prune container registry automatically: Done (PR pending).**
  - Real data checked first: `vercel vcr image ls dockerfile -F json` lists 14 `manifest` images, newest first, each tagged with a 12-character commit SHA prefix; `vercel ls --prod -F json` gives the live `meta.githubCommitSha`.
  - `scripts/prune_registry.py`: pure `images_to_delete(images, live_sha)` (sorts by `createdAt` itself) plus a thin Vercel CLI layer; stops without deleting if no READY production deployment is found; prints each deleted tag; `--dry-run` deletes nothing. Standard library only, run with `uv run --no-project`.
  - `.github/workflows/prune-registry.yml`: on push to `main` and by hand (`dry_run` input, on by default); one run at a time. Auth: the `VERCEL_TOKEN` secret (Michelle) plus the org and project ids as plain env values (`.vercel/` is gitignored).
  - Decisions (2026-10-06, Michelle): look up the live image and always keep it; code in `scripts/`; add a manual trigger; minimal design plus a dry-run flag and per-image log lines.
  - `pyproject.toml`: `scripts` added to pytest `pythonpath` and ruff `src`.
  - Tests: `test_prune_registry.py`, 8 cases (empty, at 20 and 40, over 40, full at 50, live image old or new); images are fed oldest first, so the function must sort. Proven to fail when the live check, the 40 threshold or the sort order is removed.
  - Dry runs on the real registry: "14 images (limit 40), deleting 0"; with limits lowered to 10/5 it would keep the newest 5 (including live `ae544bfa0fc4`) and delete the 9 oldest; from an unlinked folder with only the two id env vars it still worked (the CI setup).
  - Review: three reviewer agents found no bugs. Fixed: dropped a test that compared the function with itself, `images_to_delete` returns images instead of ids (simpler logging), README notes the workflow and its secret. Known limit: "live" is the newest READY production deployment, so after a manual rollback in Vercel the served image could be an older one; the newest 20 still protect most rollbacks.
- **E2-5 follow-up: uv cache warning.** The first `Prune registry` run passed ("15 images (limit 40), deleting 0") but warned "Unable to reserve cache". Cause, from the logs: CI's `backend` job and the `prune` job started together with the same `setup-uv` cache key (built from `pyproject.toml` and `uv.lock`); `backend` saved first, so `prune` could not. The prune script is standard library only (`--no-project`), so the cache gave it nothing: `enable-cache: false` in the prune workflow (Michelle chose this over ignoring the warning or restore-only).
- **E7-3 Production env vars on Vercel: Done (PR pending).**
  - Before: `vercel env ls` showed only `OPENROUTER_API_KEY` (Production, Preview, Development) and `PORT` (Production, Preview). Missing: `OPENROUTER_MODEL`, `MAX_MESSAGE_CHARS`, `MAX_REPLY_TOKENS`, `MAX_USER_MESSAGES`, `MAX_HISTORY_MESSAGES`. Live `/api/health` and chat already worked, because the code defaults in `config.py` equal the `.env.example` values.
  - Decisions (2026-10-06, Michelle): add all five with the `.env.example` values; Production and Preview only; Claude adds them with `vercel env add` (plain Config values, no secrets); checklist under Environment files plus one README line; add a test that `.env.example` matches `Settings`. `/api/health` stays a constant: it proves the container is up, and a chat reply is the real proof of the key.
  - Added one variable first, then the rest, with `vercel env add NAME production --value VALUE --type config --yes` and again with `preview`. `vercel env ls` now shows all 7 keys for Production and Preview.
  - Verification gotcha: the shell profile exports some of these variables, so a plain `vercel env run` shows local values. Run it with `env -i PATH="$PATH" HOME="$HOME"` from a folder holding only `.vercel/`; there, Production and Preview each print the five expected values.
  - Tests: `test_env_example_lists_every_setting` compares the keys in `.env.example` with the `Settings` fields; proven to fail with a line removed and with an unknown key added. 80 backend tests pass; ruff clean.
  - Review: three reviewer agents found no bugs. Fixed: the test now skips comment lines (a comment containing `=` failed it, reproduced first); the Vercel rule under Environment files is shorter and merged with the old "enter the same keys" line.
  - Live checks: on the PR #36 preview (reached with `vercel curl`, since a plain `curl` gets a 302 to the Vercel login), `/api/health` returned ok and "What is her career goal?" got a real reply. On production, after the merge deploy (`c8f9b26`), `/api/health` returned ok and "What skills does she have?" got a real reply (both HTTP 200).
- **E7-3 moved to Done in Jira** after PR #36 merged (Michelle).
- **E7-4 Cost protection: Done (PR pending).**
  - Reproduced first: `check_message_lengths` only checked user messages, so a 200,000-character assistant message passed (a direct caller could send about a million input tokens in one request). The 10-message limit is a UX cap, since the server trusts the posted history.
  - `chat.py`: assistant messages over `MAX_REPLY_CHARS` (1200) now return 422 like oversized user messages; this supersedes the E5-5 note that bot replies are not checked. Every real bot message fits: replies are cut to 1200, and the closing and fallback messages are 194 and 98 characters.
  - `api.ts`: a 429 shows `RATE_LIMIT_ERROR` and keeps the question in the box. The firewall's 429 body is JSON without `detail` (`{"error":{"code":"429","message":"Too Many Requests",...}}`), so it showed the generic error before.
  - Firewall: rule added with `vercel firewall rules add "Rate limit chat" --condition '{"type":"path","op":"eq","value":"/api/chat"}' --action rate_limit --rate-limit-window 60 --rate-limit-requests 10 --rate-limit-keys ip --rate-limit-action rate_limit --yes`, checked with `vercel firewall diff`, then `vercel firewall publish --yes` (Michelle approved). No redeploy needed.
  - Live check at no model cost: 12 rapid POSTs with a 1001-character user message (rejected before the model) returned 10 x 422, then 429 twice.
  - OpenRouter: the key already had a $5 monthly cap; Michelle raised it to $20. `GET https://openrouter.ai/api/v1/key` shows `limit: 20`, `limit_reset: monthly`. One live chat raised that key's `usage_monthly` by about $0.0095, which proves the site spends from this key.
  - Tests: `test_assistant_message_over_reply_cap_returns_422` (failed with 200 before the fix) and `test_assistant_message_at_reply_cap_is_accepted` (replaces the 51-character test); a frontend test for the 429 message, using the real firewall body, failed with the generic error before the fix. 81 backend and 101 frontend tests pass; ruff, lint and build clean.
  - After merge: production (`38de7d2`) rejects a forged 1201-character bot reply with 422; `/api/health` ok.
- **E7-4 moved to Done in Jira** after PR #37 merged (Michelle).
- **E7-5 Custom domain: Done (PR pending).**
  - Michelle bought `michellelewis.dev` in the Vercel dashboard (registrar and nameservers Vercel, expires Oct 2027). The Vercel connector could not quote it ("not authorized for scope"), and the purchase needs the registrant's address, so the dashboard was the better route.
  - `vercel domains add www.michellelewis.dev personal-site` and `vercel domains add michellelewis.dev personal-site`; Michelle set the apex redirect in the dashboard. The certificate for `www` was issued within seconds; the first curl got no answer only because DNS had not reached this machine yet.
  - HTTPS gate, before any code change (`.dev` is HTTPS-only): `https://www.michellelewis.dev/`, `/career` and `/api/health` return 200 and ok; `michellelewis.dev/`, `/career` and `/api/health` return 308 to the same path on `www`; plain `http://` upgrades to HTTPS first; `/og-image.png` on `www` is 200 `image/png`.
  - `VITE_SITE_URL` changed in both `frontend/.env.*` files. The build's `og:url` and `og:image` use `https://www.michellelewis.dev`, with no `vercel.app` or `%VITE_SITE_URL%` left. 101 frontend tests pass; lint clean. No new test (agreed): the value lives in two files and changes rarely.
  - E8-6 now names the new address. README unchanged; E7-6 rewrites it.
  - Review: three reviewer agents found no bugs. Nothing else uses the old address or the host (no CORS, no absolute API URLs); the chat's relative `/api/chat` still works for visitors who land on the apex, since the page is redirected to `www` first.
  - Pending (after merge): live `og:` tags on `www`, the old `vercel.app` address still 200, and LinkedIn Post Inspector on `https://www.michellelewis.dev/` (Michelle).
  - After merge: production (`448f260`) serves `og:url` and `og:image` with `https://www.michellelewis.dev`; `/api/health` ok and a live chat replied on `www`; the apex returns 308 to `www`; the old `vercel.app` address still returns 200 (its preview tags also point to the new domain). LinkedIn Post Inspector on `https://www.michellelewis.dev/` shows the mountain image and Michelle's name (Michelle).
- **E7-5 moved to Done in Jira** after PR #38 merged (Michelle).
- **E7-6 Final README: Done (PR pending).**
  - Reproduced first, from a fresh clone of `main` following the old README: `/` returned 500 (`StaticFiles directory '.../frontend/dist' does not exist`) because the README started the server before building the frontend, and `uv run pytest -m live` printed "FAIL Required test coverage of 80% not reached" even with no tests selected.
  - Decisions (2026-10-06, Michelle): concise but complete (about 100 lines); quick start and two-terminal dev mode; Node 26 stated in the README only (no `engines` field). Lean draft chosen over a reader-first reorder, plus three of its lines: the `(cd frontend && ...)` block, "run uvicorn from the repo root so it finds `.env`", and updating `VITE_SITE_URL` in both files.
  - New sections: what the site is with the live address, prerequisites, quick start, dev mode, environment variable table, editing content, cost protection. Live test command fixed to `uv run pytest -m live --no-cov`. Docker, deploy and CI text kept.
  - Followed the new README from a fresh clone: quick start (on port 8001, since Michelle's own server held 8000) gave health ok, all five pages 200 and a real chat reply; dev mode served `localhost:5173` and proxied `/api/health` to port 8000; `uv run pytest` 81 passed, the live command with no tests selected passed the coverage step, ruff clean, 101 frontend tests, lint and typecheck clean; the Docker build and run served health, `/` and `/career`. The clone, which held a copy of the key, was deleted.
  - Review: three reviewer agents found no errors; every command, path and default matches the repo. Fixed: dev mode now shows `cd frontend && npm run dev` (it only said "in frontend/"), the quick-start notes are short bullets, and the cost bullet that repeated the env table is gone. Kept (Michelle): the `PLAN.md` pointer, the manual `vercel deploy` commands and the registry note, which are for the owner.
- **E7-6 moved to Done in Jira** after PR #39 merged (Michelle). Epic E7 (Launch) is complete.
- **E8-1 Playwright end-to-end tests: Done (PR pending).**
  - Backend: `OPENROUTER_BASE_URL` replaces the hard-coded constant in `chat.py` (`get_client` reads the setting). `test_settings_load_from_env` failed first (no such attribute), then passed. Added to `.env.example`, the README table, the Environment files table, and Vercel Production and Preview with the default value (read back cleanly with `env -i`).
  - Playwright 1.63.0 (pinned). `e2e/` holds `constants.ts`, `fake-openrouter.ts` (answers `POST /v1/chat/completions` with `<think>REASONING</think>ANSWER` and records each request at `GET /requests`), `site.ts` (shared `pages`, `openPage`, `openChat`, `ask`, ready for E8-2), `site.spec.ts` and `chat.spec.ts`. The container gets `--add-host=host.docker.internal:host-gateway` so it can reach the fake on the host, locally and on Linux CI.
  - Setup fixes, each checked: Vitest picked up `e2e/*.spec.ts` (a probe file failed), so it now includes only `src/**/*.test.{ts,tsx}`; `tsconfig.node.json` now type-checks `e2e/` and `playwright.config.ts` (confirmed with `--listFilesOnly`); `.dockerignore` and `.vercelignore` (still in sync) keep the e2e files out of the image; `frontend/.gitignore` ignores `test-results` and `playwright-report`. `fsevents` install script left unapproved (optional macOS watcher).
  - 18 tests pass in about 4 seconds (9 per screen): each page loads, nav links reach every page (through the Menu button on the phone), a deep link survives a reload, a sent message shows the cleaned reply, and the container sent the system prompt first, the configured model, and the question last. No container is left running afterwards.
  - Proven to fail: with the fake's reasoning outside `<think>`, the reply test fails on "Secret plan for the visitor."; with the container on another model, the request test fails with `other/model`.
  - CI: new `e2e` job (Node 26, `npx playwright install --with-deps chromium`, image build, tests, traces uploaded on failure). 81 backend and 101 frontend tests pass; ruff, lint and typecheck clean.
  - Review: three reviewer agents found no bugs; the Linux CI points (the container reaching the fake via `host-gateway`, SIGTERM shutdown with `--rm`, the image build without the e2e files) were reasoned through and are proven by the PR's CI run. Fixed: the README's CI sentence now mentions end-to-end checks; the request test sends a question unique to its project and finds that exact request, instead of reading the last one received (four chat tests share one fake server); proven to fail when the request is missing.
- **E8-1 merged** in PR #40; its CI `e2e` job ran 18 of 18 on Linux.
- **E8-2 Accessibility checks: Done (PR pending).**
  - Baseline first: a throwaway axe probe (all impacts, WCAG plus best-practice) found 0 violations on all five pages and the open chat, desktop and phone, with 38 to 43 rules passing per page. So the story adds a guardrail rather than fixes.
  - `e2e/axe.ts`: `scan()` waits for `document.fonts.ready`, runs `AxeBuilder` with the WCAG A/AA tags, attaches the violations JSON to the report, and returns one `id (impact): targets` line per violation. `e2e/a11y.spec.ts`: 9 scans per screen (5 pages, not-found, open chat, chat after a reply, phone menu, which is skipped on desktop).
  - Proven to fail: injected `h1 { color: #cccccc }` gave `color-contrast (serious): h1`. Removing the chat input's label alone passed, because axe accepts the placeholder as the input's name; removing the label and the placeholder gave `label (critical): #chat-input`.
  - Placeholder: measured in Chromium as `rgb(117, 117, 117)` on `rgb(245, 239, 228)`, 4.03:1. A new test in `chat.spec.ts` (placeholder colour equals the input's text colour) failed with that value, then passed after `.chat-form input::placeholder { color: var(--color-text-muted); opacity: 1 }` (5.60:1; `opacity: 1` because Firefox dims placeholders).
  - Type fixes found by `npm run typecheck`: `tsconfig.node.json` now includes the `DOM` lib, because `evaluate()` callbacks run in the browser; `AxeBuilder` is a named import, because the package points TypeScript at a CommonJS-style `index.d.ts`, where the default import is the module object (tests ran, typecheck failed).
  - 37 e2e tests pass and 1 is skipped (the phone menu on desktop); 101 frontend and 81 backend tests pass; lint, typecheck and build clean. `@axe-core/playwright` 4.13.0 pinned.
  - Review: three reviewer agents found no bugs; they confirmed the after-reply scan runs once the typing dots are gone and that, on phones, the chat scans cover only the dialog (the page behind it is inert and is scanned closed). Fixed: an `openMenu` helper in `site.ts` replaces the duplicated Menu click (the nav is hidden while the menu is closed, so waiting for it to show proves the menu opened), and the README's end-to-end section mentions the scans. Kept: `DOM` in `tsconfig.node.json` (the `evaluate()` callbacks need it).
- **E8-1 moved to Done in Jira** after PR #40 merged (Michelle).
- **E8-2 moved to Done in Jira** after PR #41 merged (Michelle).
- **E8-3 Chat safety tests: Done (PR pending).**
  - Reproduced first, with a fake model through the real app: `""` and `"   "` user messages returned 200 and called the model; a history ending on an assistant message returned 200 and called the model; 3,000 assistant messages plus 1 user message (3.7 MB) returned 200 and were trimmed to 21; extra fields such as `"name"` were not forwarded (already safe).
  - `chat.py`: `check_message_count`, `check_not_blank`, `check_ends_with_user`, and `validate_messages` (replaces the direct length-check call). Each new test failed with `200 == 422` first. An honest at-the-cap history (the first user message over the limit) still gets the closing message with 200, so the E6-2 note holds.
  - `test_chat_safety.py` (20 tests): the three new checks; injection text sent as a user message after exactly one system prompt; `system`, `developer` and `tool` roles rejected at any position; extra fields not forwarded; non-string content rejected. In `test_chat.py`, the trimming test now asserts the exact list sent (`[SYSTEM, *newest 6]`) and the closing-message test notes it fills the cap exactly. `test_prompts.py` checks the "never invent facts", "not sure", off-topic and ignore-rule-change rules are in the prompt.
  - Proven to fail: with the system prompt sent last, 3 safety tests failed; with "decline" weakened to "answer", the off-topic rule test failed. The existing trimming test needed 2 old messages instead of 4 to fit the new cap.
  - Gotcha: after restoring `chat.py` from the mutation, 5 tests still failed. The cached `chat.cpython-314.pyc` recorded the same mtime (same second) and size (the swap kept the length), so Python ran the mutated code. Clearing `__pycache__` fixed it; clear it after any restore-style proof.
  - 104 backend tests pass; ruff clean; the container e2e suite still passes (37, 1 skipped).
  - Review: three reviewer agents found no bugs; they confirmed no honest visitor can hit the new checks (a failed send is not stored, the 11th message is exactly 21 messages, restored chats keep the same shape, replies are never blank or over 1200). Fixed: the `get_reply` docstring now lists every 422; `SYSTEM` moved to `helpers.py`; four duplicate tests removed (`system` role at position 0, the at-cap closing message, trimming, an oversized message early in the history) after strengthening the originals. With the system prompt sent last, 4 tests fail.
- **E8-3 moved to Done in Jira** after PR #42 merged (Michelle).
- **E8-4 Live chat evals: Done (PR pending).**
  - `-rP` checked first with a throwaway test: each passing test's output prints once under PASSES; failures print theirs under FAILURES.
  - `helpers.py` gains `HEADING`, `JOB_INVITE` and `MAX_FIRST_ANSWER_WORDS` (moved from `test_live_chat.py`) and `format_problems(reply, max_words)`, which lists every format problem at once. `test_live_chat.py` uses it; its 4 live tests still pass.
  - `test_live_evals.py`: 15 evals (9 profile facts, 1 not in the profile, off-topic, age and salary, commitments, system-prompt leak, negativity about Heap). A failure lists every broken check, such as `missing 'fraud'; 83 words, limit is 80`. Proven offline with fake replies: each bad one failed for the expected reason (Visual Studio, cooking words, digits, a commitment, the real system prompt, a made-up number of years, "toxic"); each good one passed.
  - The default `uv run pytest` (CI) still skips every live test: 104 passed, 20 deselected.
  - First live run: 13 of 15. "Years of Python" was a check error: the correct reply said "I don't have an exact number", so "(don't|do not) have" joined the uncertainty pattern. The Heap answer ran 82 words. Re-runs of those two: 3 of 3 passed. Full re-run: 14 of 15, the Heap answer at 107 words. That makes it a real finding (66 to 107 words over 5 runs), now E5-8. The lasagna decline came in at 40 words, exactly its cap.
  - Facts matched the profile in every answer: current title and start date, Heap dates and title, all three degrees, both certifications, the Heap health score, top skills (no Visual Studio, "dbt"), the origin story, the career goal, $77K and the fraud. Embellishments are noted in E5-8.
  - Review: three reviewer agents. Conventions: no issues. Fixed, each proven offline before and after: the commitment check failed good declines such as "I can't confirm whether she's available" (now ignored after "whether" or "if"); the uncertainty check missed curly apostrophes and "doesn't specify"; "oven" matched "proven"; `ask()` moved to `helpers.py`, shared by both live files. Kept as-is: any digit fails the age and salary eval, `R` can match "R&D" (the skills eval needs 3 hits), "M.B.A." with dots.
  - After the fixes, one live run of both files: 17 of 19. The 4 starter tests passed; the two failures were long declines (Heap 90 words, lasagna 43 against its 40 cap), both added to E5-8.
  - Michelle's review of the printed answers (2026-10-09): answers must not reveal their rules or sound like an invitation to discuss compensation. Both added to E5-8 (checks first, then the prompt fix); no change in this PR.
