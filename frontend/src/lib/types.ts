export type Profile = {
  name: string;
  headline: string;
  bio: string;
  gpa: string;
  coursework: string[];
  linkedin_url: string;
  github_url: string;
};

export type ExperienceItem = {
  id: string;
  title: string;
  org: string;
  period: string;
  bullets: string[];
  metrics: string[];
};

export type ProjectItem = {
  id: string;
  title: string;
  subtitle: string;
  tags: string[];
  description: string;
  highlights: string[];
  github_url: string;
};

export type SkillGroup = {
  label: string;
  items: string[];
};

export type SkillsPayload = {
  skill_groups: SkillGroup[];
  awards: string[];
  certifications: string[];
};
