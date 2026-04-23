from pydantic import BaseModel, Field


class ProfileResponse(BaseModel):
    name: str
    headline: str
    gpa: str
    coursework: list[str]
    linkedin_url: str
    github_url: str


class ExperienceItem(BaseModel):
    id: str
    title: str
    org: str
    period: str
    bullets: list[str]
    metrics: list[str] = Field(default_factory=list)


class ProjectItem(BaseModel):
    id: str
    title: str
    subtitle: str
    tags: list[str]
    description: str
    highlights: list[str]


class SkillsResponse(BaseModel):
    languages_tools: list[str]
    awards: list[str]
    certifications: list[str]
