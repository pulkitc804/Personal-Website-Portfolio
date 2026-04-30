# Pulkit Chaudhary — Full-Stack Portfolio

Standalone repository: **Next.js** (App Router) + **Tailwind** + **Framer Motion** frontend, **FastAPI** backend with JSON routes ready for ML inference and telemetry. This project is not tied to any other app (for example Guardian).

## Directory layout

```
.
├── README.md
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── __init__.py
│       ├── main.py
│       ├── schemas.py
│       └── data.py
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── next.config.mjs
    ├── tailwind.config.ts
    ├── postcss.config.mjs
    ├── tsconfig.json
    ├── .env.example
    └── src/
        ├── app/
        ├── components/
        └── lib/
```

## Run locally

### 1. Backend (FastAPI)

Use **Python 3.11–3.13** (3.12 is ideal). **`pydantic-core` does not build on Python 3.14** with the current pins (PyO3 supports only through 3.13), so a plain `pip install` with system `python3` on 3.14 will fail and **`uvicorn` will not exist** until the install succeeds.

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**macOS:** if `python3.12` is not found, run `brew install python@3.12`, then use e.g. `$(brew --prefix python@3.12)/bin/python3.12` in place of `python3.12` above.

**Shell tips:** Lines that start with `#` are comments—do not paste them as commands (zsh reports `command not found: #`). Only run the real commands. Always **`source .venv/bin/activate`** in that terminal before `pip` / `uvicorn` so they use the venv.

- API docs: `http://127.0.0.1:8000/docs`
- Health: `GET http://127.0.0.1:8000/api/health`

### 2. Frontend (Next.js)

Second terminal:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

- Site: `http://localhost:3000`

`API_URL` in `.env.local` is read on the **server** when Next fetches the API. If the API is down, the UI falls back to embedded data.

### 3. Production builds (no Docker)

```bash
# Terminal A
cd backend && source .venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000

# Terminal B
cd frontend && npm run build && npm start
```

## Deploy (production)

You deploy **two pieces**: the **FastAPI API** first, then the **Next.js site** with `API_URL` pointing at the API. The UI still works if the API is unreachable (embedded fallbacks), but live data needs a reachable `API_URL`.

### A. Deploy the API (Railway — recommended)

1. Push this repo to GitHub. Confirm the **`backend/`** folder is tracked: `git ls-files backend | head` (if empty, run `git add backend && git commit -m "Add API" && git push`).
2. [Railway](https://railway.app) → **New project** → **Deploy from GitHub** → pick the repo.
3. **Important:** This repo includes **`railway.toml`** (uses **Docker**) and a **root `Dockerfile`** that builds only `backend/`. You do **not** need to set Root Directory to `frontend` for the API service — leave the service source as the **repo root** so that Dockerfile is used. (If you prefer, you can instead set **Root Directory** to `backend` and delete or ignore the root Dockerfile for that service — both work.)
4. Railway assigns a public URL like `https://your-api.up.railway.app`. Open `/api/health` to verify.
5. Under **Variables**, set:
   - **`CORS_ORIGINS`** = your future frontend origin, e.g. `https://your-portfolio.vercel.app` (comma-separate if you add more).
   - Optional: **`CORS_ORIGIN_REGEX`** = `https://.*\.vercel\.app` if you want **all** Vercel preview URLs allowed (broader than a single production domain).

Railway sets **`PORT`**; the Docker image already respects it.

**Alternatives:** [Render](https://render.com) (Docker or Python), [Fly.io](https://fly.io), [Google Cloud Run](https://cloud.google.com/run) using `backend/Dockerfile`.

### B. Deploy the frontend (Vercel)

1. [Vercel](https://vercel.com) → **Add New** → **Project** → import the same GitHub repo.
2. **Root Directory:** set to **`frontend`** (important).
3. **Environment variables** (Production — and Preview if you want previews to hit the real API):
   - **`API_URL`** = your API’s public base URL, e.g. `https://your-api.up.railway.app` (**no trailing slash**).
4. Deploy. Visit the `.vercel.app` URL; confirm the page loads and sections show API-driven content (not only fallbacks).

### C. One VPS (Docker Compose)

On any server with Docker, from the repo root:

```bash
docker compose up --build -d
```

Set **`API_URL`** for a separate Next build only if you terminate TLS on another host; for a single-machine compose stack, the default `http://api:8000` in `docker-compose.yml` is for **container-to-container** use. For a public site you’d usually put **Caddy/nginx** in front and set the frontend’s `API_URL` to the public API hostname you expose.

## Docker (local)

From the **repository root**:

```bash
docker compose up --build
```

Open `http://localhost:3000` and `http://localhost:8000/docs`.

## Extending the backend

- **Live models:** implement `POST /api/inference/preview` in `backend/app/main.py`.
- **Telemetry:** replace `GET /api/telemetry/preview` with your buffer or WebSocket fan-out.
- **CORS:** set `CORS_ORIGINS` (and optionally `CORS_ORIGIN_REGEX`) on the API host; see **Deploy**.

## Environment

| Variable              | Where        | Purpose |
|-----------------------|--------------|---------|
| `API_URL`             | Next (build + server) | Base URL for server-side API fetches; **no trailing slash** |
| `CORS_ORIGINS`        | FastAPI      | Comma-separated allowed browser origins (e.g. your Vercel URL) |
| `CORS_ORIGIN_REGEX`   | FastAPI      | Optional regex for origins (e.g. Vercel previews) |
| `PORT`                | FastAPI (Docker / hosts) | Listen port; defaulted in Dockerfile |
