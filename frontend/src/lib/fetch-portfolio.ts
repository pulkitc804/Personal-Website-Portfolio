import type {
  ExperienceItem,
  Profile,
  ProjectItem,
  SkillsPayload,
} from "@/lib/types";

const FALLBACK_PROFILE: Profile = {
  name: "Pulkit Chaudhary",
  headline:
    "B.S. candidate — Data Science, Computer Science, Mathematics & Statistics @ Rutgers · Part-time Data 101 lecturer",
  bio: `I'm a Rutgers student in the NYC metro area pursuing a quadruple major in data science, computer science, mathematics, and statistics (Dean's List, 4.0 GPA). I learn as much from teaching as from coursework: as a part-time Data Science lecturer for Data 101, I run weekly R recitations and statistical labs for 40+ undergraduates, help design predictive modeling challenges grounded in real datasets, and grade 250+ quizzes and assignments each month with detailed feedback and a fast turnaround on grade entry.

Most of my build time goes into analytics and systems that have to work under pressure. On the Rutgers Solar Car Team I develop Python dashboards with Dash, Plotly, and Pandas over large telemetry pulls—dozens of car metrics, interactive charts, efficiency tooling, and monitoring that supports race strategy. Before that I spent years in hands-on education roles—Kumon for math and English; Code Ninjas teaching JavaScript, Python, and Java, coaching robotics teams, and supporting 150+ students; and a summer at Inspirit AI doing object-detection research with optimized training pipelines on real-world imagery. On campus I'm also active in quantitative finance research, data-science club leadership, and Road to Silicon V/Alley Cohort 7. I've built end-to-end quant/ML prototypes (stochastic simulation, neural nets, and backtesting). I've experimented with on-device ML in hackathon settings too, but the through-line is careful modeling, honest evaluation, and tools that teammates and students can rely on.`,
  gpa: "4.0 / 4.0",
  coursework: [
    "Probability",
    "Multivariable Calculus",
    "Statistical Analysis",
    "Differential Equations",
    "Data Structures",
    "Computer Architecture",
    "Data Wrangling",
    "Proofs",
    "Linear Algebra",
  ],
  linkedin_url: "https://www.linkedin.com/in/pc804/",
  github_url: "https://github.com/pulkitc804",
};

const FALLBACK_EXPERIENCE: ExperienceItem[] = [
  {
    id: "ds101",
    title: "Part-Time Data Science Lecturer (Data 101)",
    org: "Rutgers University",
    period: "Present",
    bullets: [
      "Facilitate weekly R recitations and statistical analysis sessions for 40+ undergraduates; collaborate on course design.",
      "Grade 250+ assignments monthly with a 100% on-time SLA.",
    ],
    metrics: ["+20% engagement", "250+ submissions / mo", "100% SLA"],
  },
  {
    id: "solar-car",
    title: "Software Developer",
    org: "Rutgers Solar Car Team",
    period: "Present",
    bullets: [
      "Build Python telemetry pipelines with Dash, Plotly, and Pandas for high-throughput sensor streams and race-strategy analytics.",
      "Deliver interactive dashboards for operators and strategy support.",
    ],
    metrics: ["10k+ records/sec", "Dash / Plotly"],
  },
  {
    id: "rqfc",
    title: "Quantitative Researcher",
    org: "Rutgers Quantitative Finance Club",
    period: "Present",
    bullets: [
      "Spearheaded SABR stochastic volatility model research and nonlinear least-squares calibration.",
      "Benchmarked across 500+ simulated option chains.",
    ],
    metrics: ["500+ chains", "<2 bps pricing error"],
  },
  {
    id: "rdsc",
    title: "Lead Events Manager",
    org: "Rutgers Data Science Club",
    period: "Present",
    bullets: [
      "Directed datathons and programming events for 100+ members.",
      "Streamlined planning workflows to reduce overhead.",
    ],
    metrics: ["100+ members", "−30% planning overhead"],
  },
  {
    id: "rtsv",
    title: "Cohort Member",
    org: "Road to Silicon Valley",
    period: "Cohort 7",
    bullets: [
      "Selected participant in RTSV cohort programming focused on tech career readiness and industry exposure.",
    ],
    metrics: ["RTSV Cohort 7"],
  },
  {
    id: "inspirit",
    title: "Object Detection Research — AI Engineer",
    org: "Inspirit AI",
    period: "Previous",
    bullets: [
      "Research and engineering on object-detection pipelines and model evaluation for structured datasets.",
      "Collaborated on training workflows and presentation of results.",
    ],
    metrics: ["Computer vision", "PyTorch / Python"],
  },
  {
    id: "code-ninjas",
    title: "Coding Instructor",
    org: "Code Ninjas",
    period: "Previous",
    bullets: [
      "Taught programming fundamentals and project-based curriculum to K–12 students.",
      "Supported classroom pacing, debugging, and parent communication.",
    ],
    metrics: ["Instruction", "Curriculum delivery"],
  },
  {
    id: "kumon",
    title: "Mathematics & English Tutor",
    org: "Kumon",
    period: "2.5+ yrs",
    bullets: [
      "Long-form tutoring in mathematics and English with individualized progress tracking.",
      "Reinforced problem-solving habits and exam readiness.",
    ],
    metrics: ["2.5+ yrs", "K–12 focus"],
  },
];

const FALLBACK_PROJECTS: ProjectItem[] = [
  {
    id: "guardian",
    title: "HackPrinceton — Guardian (SOS)",
    subtitle: "Biomechanics + on-device ML + voice AI",
    tags: ["CoreML", "Swift", "Firebase", "ElevenLabs", "Apple TTS"],
    description:
      "Predictive CoreML model and AI reasoning layer (K2 Think) to analyze biomechanical anomalies and reduce elderly fall risk, with a generative voice pipeline. Source lives on the team repository.",
    highlights: [
      "CoreML predictive model + AI reasoning for gait anomalies",
      "Generative AI voice via ElevenLabs + Apple TTS",
      "Team codebase on GitHub — HackPrinceton Guardian",
    ],
    github_url: "https://github.com/TheAryanAnode/Guardian-PrincetonHacks",
  },
  {
    id: "ai-sde",
    title: "AI-SDE Powered Portfolio Optimizer",
    subtitle: "SDEs × deep learning × Monte Carlo",
    tags: ["PyTorch", "Streamlit", "Monte Carlo", "Python"],
    description:
      "PyTorch engine fusing stochastic differential equations with deep learning for portfolio dynamics, simulation, and experiment tracking in Streamlit.",
    highlights: [
      "High-throughput Monte Carlo and SDE-backed experiments",
      "Streamlit dashboard for metrics and runs",
      "Public Python codebase on GitHub",
    ],
    github_url:
      "https://github.com/pulkitc804/AI-SDE-Powered-Portfolio-Optimizer",
  },
  {
    id: "solar-kpi",
    title: "Rutgers Solar Car — KPI Dashboard",
    subtitle: "Telemetry · KPIs · Dash / analytics",
    tags: ["Python", "Dash", "Plotly", "Pandas", "Telemetry"],
    description:
      "KPI dashboard and analytics for the Rutgers Solar Car team—sensor telemetry, operational metrics, and strategy support workflows.",
    highlights: [
      "Team dashboard codebase for race and engineering KPIs",
      "Python stack aligned with Solar Car software workflows",
      "Public team repo (maintainer org on GitHub)",
    ],
    github_url: "https://github.com/RayaneSkiker/KPI_Dashboard",
  },
];

const FALLBACK_SKILLS: SkillsPayload = {
  skill_groups: [
    {
      label: "Languages & core CS",
      items: [
        "Python",
        "TypeScript",
        "JavaScript",
        "R",
        "Swift",
        "Java",
        "SQL",
        "C / systems basics",
        "Bash",
        "Git",
        "LaTeX",
      ],
    },
    {
      label: "ML, CV & simulation",
      items: [
        "PyTorch",
        "TensorFlow",
        "Scikit-learn",
        "CoreML",
        "Computer vision & object detection",
        "LSTM / sequence models",
        "Convex & nonlinear optimization",
        "Monte Carlo methods",
        "Stochastic processes & SDEs",
        "Time series & forecasting",
        "Model evaluation at scale",
      ],
    },
    {
      label: "Data engineering & visualization",
      items: [
        "NumPy",
        "Pandas",
        "Polars",
        "Vectorized ETL",
        "Dash",
        "Plotly",
        "Streamlit",
        "Jupyter workflows",
        "Experiment tracking",
      ],
    },
    {
      label: "Product, web & infrastructure",
      items: [
        "React",
        "Next.js",
        "FastAPI",
        "REST APIs",
        "Firebase",
        "Docker",
        "Linux",
        "AWS (Cloud Practitioner — in progress)",
        "CI basics",
        "Technical writing & teaching",
      ],
    },
  ],
  awards: ["3rd Place — Jane Street Estimathon", "Dean's List"],
  certifications: ["AWS Cloud Practitioner (In Progress)"],
};

function baseUrl(): string {
  const raw = (process.env.API_URL ?? "http://127.0.0.1:8000").trim();
  return raw.replace(/\/+$/, "");
}

/** Coerce API / JSON values so `.map` never runs on null (avoids SSR 500s). */
function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string");
}

function normalizeProfile(raw: unknown, fallback: Profile): Profile {
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Partial<Profile>;
  const merged = { ...fallback, ...r };
  const coursework = asStringArray(merged.coursework);
  return {
    name:
      typeof merged.name === "string" && merged.name.trim()
        ? merged.name
        : fallback.name,
    headline:
      typeof merged.headline === "string" && merged.headline.trim()
        ? merged.headline
        : fallback.headline,
    bio:
      typeof merged.bio === "string" && merged.bio.trim()
        ? merged.bio
        : fallback.bio,
    gpa:
      typeof merged.gpa === "string" && merged.gpa.trim()
        ? merged.gpa
        : fallback.gpa,
    coursework: coursework.length > 0 ? coursework : fallback.coursework,
    linkedin_url:
      typeof merged.linkedin_url === "string" && merged.linkedin_url.trim()
        ? merged.linkedin_url
        : fallback.linkedin_url,
    github_url:
      typeof merged.github_url === "string" && merged.github_url.trim()
        ? merged.github_url
        : fallback.github_url,
  };
}

function normalizeExperience(
  raw: unknown,
  fallback: ExperienceItem[],
): ExperienceItem[] {
  if (!Array.isArray(raw)) return fallback;
  const out: ExperienceItem[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (!item || typeof item !== "object") continue;
    const e = item as Partial<ExperienceItem>;
    const title = typeof e.title === "string" ? e.title.trim() : "";
    if (!title) continue;
    out.push({
      id:
        typeof e.id === "string" && e.id.trim()
          ? e.id
          : `exp-${i}`,
      title,
      org: typeof e.org === "string" ? e.org : "",
      period: typeof e.period === "string" ? e.period : "",
      bullets: asStringArray(e.bullets),
      metrics: asStringArray(e.metrics),
    });
  }
  return out.length > 0 ? out : fallback;
}

function normalizeProjects(
  raw: unknown,
  fallback: ProjectItem[],
): ProjectItem[] {
  if (!Array.isArray(raw)) return fallback;
  const byId = Object.fromEntries(fallback.map((p) => [p.id, p])) as Record<
    string,
    ProjectItem
  >;
  const out: ProjectItem[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (!item || typeof item !== "object") continue;
    const p = item as Partial<ProjectItem>;
    const id =
      typeof p.id === "string" && p.id.trim() ? p.id : `proj-${i}`;
    const base = byId[id];
    const title =
      (typeof p.title === "string" && p.title.trim()) ||
      base?.title ||
      "Project";
    const github_url =
      (typeof p.github_url === "string" && p.github_url.trim()) ||
      base?.github_url ||
      FALLBACK_PROFILE.github_url;
    const tags = asStringArray(p.tags);
    const highlights = asStringArray(p.highlights);
    out.push({
      id,
      title,
      subtitle:
        typeof p.subtitle === "string"
          ? p.subtitle
          : base?.subtitle ?? "",
      tags: tags.length > 0 ? tags : base?.tags ?? [],
      description:
        typeof p.description === "string"
          ? p.description
          : base?.description ?? "",
      highlights:
        highlights.length > 0 ? highlights : base?.highlights ?? [],
      github_url,
    });
  }
  return out.length > 0 ? out : fallback;
}

function normalizeSkills(raw: unknown, fallback: SkillsPayload): SkillsPayload {
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Partial<SkillsPayload>;
  const merged = { ...fallback, ...r };

  const rawGroups = merged.skill_groups;
  const skill_groups = Array.isArray(rawGroups)
    ? rawGroups
        .filter(
          (g) =>
            !!g &&
            typeof g === "object" &&
            typeof (g as { label?: string }).label === "string",
        )
        .map((g) => {
          const row = g as { label: string; items?: unknown };
          return {
            label: row.label,
            items: asStringArray(row.items),
          };
        })
        .filter((g) => g.items.length > 0 || g.label)
    : [];

  const awards = Array.isArray(merged.awards)
    ? asStringArray(merged.awards)
    : fallback.awards;
  const certifications = Array.isArray(merged.certifications)
    ? asStringArray(merged.certifications)
    : fallback.certifications;

  return {
    skill_groups:
      skill_groups.length > 0 ? skill_groups : fallback.skill_groups,
    awards: awards.length > 0 ? awards : fallback.awards,
    certifications:
      certifications.length > 0 ? certifications : fallback.certifications,
  };
}

async function fetchJson(path: string): Promise<unknown | null> {
  try {
    const res = await fetch(`${baseUrl()}${path}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function loadPortfolioData() {
  const [profileRaw, experienceRaw, projectsRaw, skillsRaw] = await Promise.all([
    fetchJson("/api/profile"),
    fetchJson("/api/experience"),
    fetchJson("/api/projects"),
    fetchJson("/api/skills"),
  ]);

  const profile = normalizeProfile(profileRaw, FALLBACK_PROFILE);
  const experience = normalizeExperience(experienceRaw, FALLBACK_EXPERIENCE);
  const projects = normalizeProjects(projectsRaw, FALLBACK_PROJECTS);
  const skills = normalizeSkills(skillsRaw, FALLBACK_SKILLS);

  return { profile, experience, projects, skills };
}
