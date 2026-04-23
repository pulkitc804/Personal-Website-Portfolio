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

Use **Python 3.11–3.13** (3.12 is ideal). The pinned `pydantic` stack may not install cleanly on **3.14** yet without newer wheels.

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

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

## Docker

From the **repository root**:

```bash
docker compose up --build
```

Open `http://localhost:3000` and `http://localhost:8000/docs`.

## Extending the backend

- **Live models:** implement `POST /api/inference/preview` in `backend/app/main.py`.
- **Telemetry:** replace `GET /api/telemetry/preview` with your buffer or WebSocket fan-out.
- **CORS:** edit `allow_origins` in `main.py` for your production domain.

## Environment

| Variable   | Where         | Purpose                               |
|------------|---------------|---------------------------------------|
| `API_URL`  | Next (server) | Base URL for server-side API fetches  |
