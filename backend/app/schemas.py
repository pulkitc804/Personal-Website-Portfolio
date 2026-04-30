from pydantic import BaseModel, Field


class ProfileResponse(BaseModel):
    name: str
    headline: str
    bio: str
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
    github_url: str


class SkillGroup(BaseModel):
    label: str
    items: list[str]


class SkillsResponse(BaseModel):
    skill_groups: list[SkillGroup]
    awards: list[str]
    certifications: list[str]
