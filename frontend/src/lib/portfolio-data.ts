import type {
  ExperienceItem,
  Profile,
  ProjectItem,
  SkillsPayload,
} from "@/lib/types";

/**
 * Single source of truth — fully static, no backend.
 * Content mirrors Pulkit's current resume. Edit here and redeploy.
 */

export const PROFILE: Profile = {
  name: "Pulkit Chaudhary",
  headline:
    "AI engineer at a YC startup building multi-agent pipelines on MCP, ML researcher at WINLAB, and a data science lecturer at Rutgers.",
  bio: `I'm a Rutgers student studying Data Science, Computer Science, Math & Statistics (3.85 GPA), and most of my time goes into shipping real systems, not coursework. At Blaze (Y Combinator S24) I help lead a small engineering team building an agentic pipeline that researches, builds and deploys production websites end to end, designed around LLM tool-use and MCP. I also build ScarletAI, a retrieval-augmented assistant for Rutgers that answers from a corpus of official pages rather than guessing.

At WINLAB I research how small a neural network can be and still navigate space, training convolutional policies that solve mazes one move at a time. I teach data science at Rutgers, and I keep a hand in quantitative research on stochastic volatility. The through-line is the same everywhere: careful modeling, honest benchmarks, and tools that hold up when other people depend on them. Off the keyboard, you'll find me at the kitchen line.`,
  gpa: "3.85 / 4.0",
  location: "New Brunswick, NJ",
  email: "pulkitc804@gmail.com",
  coursework: [
    "Probability Theory",
    "Multivariable Calculus",
    "Data Structures",
    "Linear Algebra",
    "Proofs",
    "Differential Equations",
  ],
  linkedin_url: "https://www.linkedin.com/in/pulkit-chaudhary804/",
  github_url: "https://github.com/pulkitc804",
};

export const EXPERIENCE: ExperienceItem[] = [
  {
    id: "blaze",
    title: "AI Engineering Intern",
    org: "Blaze (Y Combinator S24)",
    period: "May 2026 — Present",
    location: "San Francisco, CA",
    link: "https://www.blaze.money",
    bullets: [
      "Help lead a 5-person engineering team building an end-to-end agentic pipeline that autonomously generates, builds, and deploys production websites for local-service businesses — owning the architecture and execution from raw lead to live site.",
      "Designed a three-stage multi-agent system (Research → Implementation → Review) on LLM tool-use, MCP, and Azure AI Foundry, orchestrated with Claude Code: automated market research, full-site code generation, and QA before deployment.",
      "Built the outreach and lead-acquisition engine that scrapes, dedupes, and enriches local-business leads across multiple metro markets, driving an automated email campaign via Instantly.ai.",
    ],
    metrics: ["5-person team", "Multi-agent · MCP", "Azure AI Foundry"],
  },
  {
    id: "winlab",
    title: "Machine Learning Research Intern",
    org: "WINLAB — Wireless Information Network Laboratory",
    period: "May 2026 — Present",
    location: "North Brunswick, NJ",
    link: "https://winlab.rutgers.edu",
    bullets: [
      "Researching minimal neural-network capacity for spatial navigation: built a convolutional policy network (5 conv layers with batch-norm + dense head) that solves procedurally generated mazes one move at a time, modeled on jumping-spider foraging.",
      "Encoded each maze as a 6-channel grid (four directional wall planes + agent and goal position planes) with BFS-computed optimal paths as ground truth; benchmarked the trained policy over 1,000 generated mazes.",
      "Profiled the network's compute cost (MACs) against classical BFS search and characterized solve rate vs. path length: the network solves short-horizon mazes near-optimally and degrades gracefully as paths grow longer.",
    ],
    metrics: ["1,000 mazes", "CNN policy", "MAC profiling"],
  },
  {
    id: "ds101",
    title: "Part-Time Data Science Lecturer",
    org: "Rutgers University — Data 101",
    period: "Present",
    location: "New Brunswick, NJ",
    link: "https://www.cs.rutgers.edu",
    bullets: [
      "Facilitate weekly R recitations and statistical-analysis sessions for 40+ undergraduates, and collaborate on course design.",
      "Grade 250+ assignments and quizzes each month with a 100% on-time turnaround.",
      "Run office hours and write detailed feedback that lifts student engagement (+20%).",
    ],
    metrics: ["40+ students", "250+ graded / mo", "100% on-time"],
  },
  {
    id: "rqfc",
    title: "Quantitative Research Intern",
    org: "Rutgers Quantitative Finance Club",
    period: "Feb 2026 — Present",
    location: "New Brunswick, NJ",
    link: "https://rutgersqfc.com",
    bullets: [
      "Spearheaded quantitative research on the SABR stochastic-volatility model, formulating closed-form approximations in Python and NumPy.",
      "Benchmarked parameter sensitivity across 500+ simulated option chains, systematically validating precision against live market-quoted volatility surfaces.",
      "Calibrated SABR on real options data via nonlinear least-squares optimization, achieving a sub-2 bps pricing error and proving robustness.",
    ],
    metrics: ["500+ option chains", "< 2 bps error", "SABR"],
  },
];

export const PROJECTS: ProjectItem[] = [
  {
    id: "guardian",
    title: "Guardian (SOS App)",
    subtitle: "HackPrinceton · on-device ML + voice AI",
    period: "Apr 2026",
    tags: ["Swift / iOS", "CoreML", "K2 Think", "ElevenLabs", "Firebase"],
    description:
      "Engineered an AI reasoning layer leveraging K2 Think and CoreML to parse high-frequency motion data, reducing false-positive fall detections for elderly users by 45%. Integrated a generative AI voice-first SOS pipeline via ElevenLabs for hands-free emergency alerts, deployed across a native Swift/iOS + Firebase stack.",
    highlights: [
      "45% fewer false-positive fall detections",
      "Voice-first SOS via ElevenLabs + CoreML",
      "Native Swift/iOS + Firebase",
    ],
    github_url: "https://github.com/TheAryanAnode/Guardian-PrincetonHacks",
  },
  {
    id: "solar-kpi",
    title: "Solar Car Telemetry Dashboard",
    subtitle: "Rutgers Solar Car · race analytics",
    period: "Sep 2025 — Present",
    tags: ["Python", "Pandas", "Dash", "Plotly"],
    description:
      "Engineered a low-latency Python telemetry pipeline ingesting 10,000+ sensor records/sec across 38 critical race metrics. Refactored ingestion loops with Pandas vectorization, cutting processing latency 25% while guaranteeing data integrity, and architected a Dash/Plotly visualization suite with automated anomaly detection that reduced strategy decision times by 40%.",
    highlights: [
      "10,000+ records/sec, 38 race metrics",
      "−25% processing latency via vectorization",
      "−40% strategy decision time",
    ],
    github_url: "https://github.com/RayaneSkiker/KPI_Dashboard",
  },
  {
    id: "ai-sde",
    title: "AI-SDE Portfolio Optimization Engine",
    subtitle: "SDEs × deep learning × Monte Carlo",
    period: "May 2025 — Jan 2026",
    tags: ["Python", "PyTorch", "Streamlit", "Monte Carlo"],
    description:
      "Developed a PyTorch financial engine fusing stochastic differential equations with deep learning to forecast market volatility, outperforming standard GBM baselines. Constructed a Monte Carlo simulator generating 2,000+ price paths/sec, integrated into a real-time Streamlit dashboard for actionable risk analysis.",
    highlights: [
      "SDE + deep learning, beats GBM baselines",
      "2,000+ Monte Carlo price paths/sec",
      "Real-time Streamlit risk dashboard",
    ],
    github_url:
      "https://github.com/pulkitc804/AI-SDE-Powered-Portfolio-Optimizer",
  },
];

export const SKILLS: SkillsPayload = {
  skill_groups: [
    {
      label: "AI Agents & Cloud",
      items: [
        "Claude Code",
        "Model Context Protocol (MCP)",
        "Azure AI Foundry",
        "Multi-agent orchestration",
        "LLM tool-use / function-calling",
        "Agentic pipeline design",
        "AWS S3",
        "Azure Blob Storage",
      ],
    },
    {
      label: "Languages & Frameworks",
      items: [
        "Python",
        "SQL",
        "Swift",
        "Java",
        "R",
        "FastAPI",
        "Docker",
        "CI/CD",
        "Git",
        "Linux",
      ],
    },
    {
      label: "ML, Data & Simulation",
      items: [
        "PyTorch",
        "TensorFlow",
        "Scikit-learn",
        "CoreML",
        "NumPy",
        "Pandas",
        "Convolutional policy networks",
        "Monte Carlo methods",
        "Stochastic processes & SDEs",
        "BFS / classical search",
      ],
    },
    {
      label: "Clubs & Organizations",
      items: [
        "Road to Silicon V/Alley",
        "Quant Finance Club",
        "Rutgers Solar Car",
        "Data Science Club",
        "SEED2S",
      ],
    },
  ],
  awards: ["2nd Place — Jane Street Estimathon", "Dean's List"],
  certifications: [],
};

export function loadPortfolioData() {
  return {
    profile: PROFILE,
    experience: EXPERIENCE,
    projects: PROJECTS,
    skills: SKILLS,
  };
}
