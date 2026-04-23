export type Profile = {
  name: string;
  headline: string;
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
};

export type SkillsPayload = {
  languages_tools: string[];
  awards: string[];
  certifications: string[];
};
