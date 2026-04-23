"""
FastAPI service for Pulkit Chaudhary's portfolio.

Placeholder routes return structured JSON suitable for the Next.js frontend.
Extend with:
  - POST /api/inference — load and serve ML models
  - WebSocket /ws/telemetry — live sensor or trading streams
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.data import EXPERIENCE, PROFILE, PROJECTS, SKILLS
from app.schemas import ExperienceItem, ProfileResponse, ProjectItem, SkillsResponse

app = FastAPI(
    title="Portfolio API",
    description="Backend for portfolio — ML and telemetry hooks reserved.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "portfolio-api"}


@app.get("/api/profile", response_model=ProfileResponse)
def get_profile():
    return ProfileResponse(**PROFILE)


@app.get("/api/experience", response_model=list[ExperienceItem])
def get_experience():
    return [ExperienceItem(**item) for item in EXPERIENCE]


@app.get("/api/projects", response_model=list[ProjectItem])
def get_projects():
    return [ProjectItem(**item) for item in PROJECTS]


@app.get("/api/skills", response_model=SkillsResponse)
def get_skills():
    return SkillsResponse(**SKILLS)


# --- Placeholders for future ML / telemetry ---------------------------------


@app.post("/api/inference/preview")
def inference_preview():
    """
    Stub for batch or single-row model inference.
    Replace body with Pydantic model + torch.load / onnxruntime session.
    """
    return {
        "message": "Inference stub — plug in your model artifact and schema here.",
        "example_output": {"score": None, "latency_ms_estimate": None},
    }


@app.get("/api/telemetry/preview")
def telemetry_preview():
    """Stub for latest aggregated telemetry slice (e.g. solar car or trading)."""
    return {
        "message": "Telemetry stub — connect to Redis, Timescale, or stream buffer.",
        "series": [],
    }
