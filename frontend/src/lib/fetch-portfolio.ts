import type {
  ExperienceItem,
  Profile,
  ProjectItem,
  SkillsPayload,
} from "@/lib/types";

const FALLBACK_PROFILE: Profile = {
  name: "Pulkit Chaudhary",
  headline:
    "B.S. in Data Science, Computer Science, Mathematics & Statistics at Rutgers University",
  gpa: "4.0 / 4.0",
  coursework: [
    "Probability Theory",
    "Multivariable Calculus",
    "Data Structures",
    "Linear Algebra",
  ],
  linkedin_url: "https://www.linkedin.com/in/pc804",
  github_url: "https://github.com/pulkitc804",
};

const FALLBACK_EXPERIENCE: ExperienceItem[] = [
  {
    id: "ds101",
    title: "Part-Time Data Science Lecturer (Data 101)",
    org: "Rutgers University",
    period: "Present",
    bullets: [
      "Selected as the sole freshman lecturer; orchestrated R programming recitations for 40+ undergraduates.",
      "Evaluated 250+ submissions monthly with a 100% on-time SLA.",
    ],
    metrics: ["+20% engagement", "250+ submissions / mo", "100% SLA"],
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
];

const FALLBACK_PROJECTS: ProjectItem[] = [
  {
    id: "guardian",
    title: "HackPrinceton — Guardian (SOS)",
    subtitle: "Biomechanics + on-device ML + voice AI",
    tags: ["CoreML", "Swift", "Firebase", "ElevenLabs", "Apple TTS"],
    description:
      "Predictive CoreML model and AI reasoning layer (K2 Think) to analyze biomechanical anomalies and reduce elderly fall risk, with a generative voice pipeline.",
    highlights: [
      "CoreML predictive model + AI reasoning for gait anomalies",
      "Generative AI voice via ElevenLabs + Apple TTS",
      "Swift / Firebase ecosystem for real-time safety workflows",
    ],
  },
  {
    id: "solar-telemetry",
    title: "Rutgers Solar Car — Telemetry Dashboard",
    subtitle: "High-throughput sensor ingestion + Dash",
    tags: ["Python", "Pandas", "Dash", "Plotly"],
    description:
      "Python ingestion pipeline for 10,000+ sensor records/sec with vectorized transforms and interactive visualization.",
    highlights: [
      "10,000+ records/sec ingestion architecture",
      "Pandas vectorization cut processing latency by 25%",
      "Interactive Dash / Plotly operational suite",
    ],
  },
  {
    id: "portfolio-opt",
    title: "AI-SDE Portfolio Optimization Engine",
    subtitle: "SDEs × deep learning × Monte Carlo",
    tags: ["PyTorch", "Streamlit", "Monte Carlo", "SDE"],
    description:
      "PyTorch engine fusing stochastic differential equations with deep learning for portfolio dynamics and risk-aware simulation.",
    highlights: [
      "2,000+ simulated price paths/sec throughput",
      "Live Streamlit dashboard for experiments and metrics",
      "Unified SDE + neural calibration stack",
    ],
  },
];

const FALLBACK_SKILLS: SkillsPayload = {
  languages_tools: [
    "Python",
    "Swift",
    "Java",
    "R",
    "Git",
    "NumPy",
    "Pandas",
    "Scikit-learn",
    "TensorFlow",
    "PyTorch",
    "Firebase",
    "CoreML",
  ],
  awards: ["2nd Place — Jane Street Estimathon", "Dean's List"],
  certifications: ["AWS Cloud Practitioner (In Progress)"],
};

function baseUrl(): string {
  return process.env.API_URL ?? "http://127.0.0.1:8000";
}

async function safeJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${baseUrl()}${path}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function loadPortfolioData() {
  const [profile, experience, projects, skills] = await Promise.all([
    safeJson<Profile>("/api/profile", FALLBACK_PROFILE),
    safeJson<ExperienceItem[]>("/api/experience", FALLBACK_EXPERIENCE),
    safeJson<ProjectItem[]>("/api/projects", FALLBACK_PROJECTS),
    safeJson<SkillsPayload>("/api/skills", FALLBACK_SKILLS),
  ]);

  return { profile, experience, projects, skills };
}
