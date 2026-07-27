import { EXPERIENCE, PROJECTS, PROFILE } from "./portfolio-data";

export type ArtKind =
  | "monogram"
  | "agent-flow"
  | "maze-bfs"
  | "vol-smile"
  | "motion-sos"
  | "telemetry-spark"
  | "mc-fan"
  | "teach-grade";

export type Rarity = "holo" | "rare" | "uncommon";

export type CardSpec = {
  id: string;
  badge: string; // TYPE
  rarity: Rarity;
  title: string;
  sub: string;
  ability: string;
  art: ArtKind;
  logo?: string; // real org logo (shown in the card window instead of the schematic)
  logoDark?: boolean; // logo needs a dark plate (e.g. a yellow/white wordmark)
  stats: { k: string; v: string }[];
  back: { lines: string[]; link?: string; linkLabel?: string };
};

const byId = <T extends { id: string }>(arr: T[], id: string) =>
  arr.find((x) => x.id === id)!;

/** Hero "Trainer" card — Pulkit himself. Stats are verbatim from PROFILE. */
export const PLAYER_CARD: CardSpec = {
  id: "player",
  badge: "TRAINER",
  rarity: "holo",
  title: "Pulkit Chaudhary",
  sub: "Rutgers · " + PROFILE.location,
  ability: "Quad-major builder — AI, ML, and quant systems that ship.",
  art: "monogram",
  stats: [
    { k: "GPA", v: PROFILE.gpa },
    { k: "MAJORS", v: "DS · CS · Math · Stats" },
    { k: "NOW", v: "AI Eng @ Blaze (YC S24)" },
  ],
  back: {
    lines: [
      "Studying Data Science, Computer Science, Math & Statistics at Rutgers (3.81 GPA).",
      "Shipping an agentic web pipeline at Blaze (YC S24), researching spatial-navigation networks at WINLAB, and modeling stochastic volatility on the side.",
      "Coursework: " + PROFILE.coursework.join(", ") + ".",
      "Off the keyboard: at the kitchen line.",
    ],
  },
};

/** Experience = "Match Log" set. All roles at a company/lab → HOLO RARE. */
export const EXPERIENCE_CARDS: CardSpec[] = [
  {
    id: "blaze",
    badge: "AGENTIC",
    rarity: "holo",
    title: "Blaze",
    sub: "AI Eng · Y Combinator S24 · " + byId(EXPERIENCE, "blaze").period,
    ability: "End-to-end agentic pipeline: raw lead → live production site.",
    art: "agent-flow",
    logo: "/logos/blaze.svg",
    logoDark: true,
    stats: [
      { k: "TEAM", v: "5-person" },
      { k: "PIPELINE", v: "Research → Implementation → Review" },
      { k: "STACK", v: "MCP · Azure AI Foundry" },
    ],
    back: {
      lines: byId(EXPERIENCE, "blaze").bullets,
      link: byId(EXPERIENCE, "blaze").link,
      linkLabel: "Visit Blaze →",
    },
  },
  {
    id: "winlab",
    badge: "RESEARCH",
    rarity: "holo",
    title: "WINLAB",
    sub: "ML Research · " + byId(EXPERIENCE, "winlab").period,
    ability: "A minimal CNN policy that solves mazes one move at a time.",
    art: "maze-bfs",
    logo: "/logos/winlab.png",
    stats: [
      { k: "BENCH", v: "1,000 mazes" },
      { k: "ARCH", v: "5 conv + dense head" },
      { k: "INPUT", v: "6-channel grid" },
    ],
    back: {
      lines: byId(EXPERIENCE, "winlab").bullets,
      link: byId(EXPERIENCE, "winlab").link,
      linkLabel: "Visit WINLAB →",
    },
  },
  {
    id: "ds101",
    badge: "TEACHING",
    rarity: "holo",
    title: "Data 101 Lecturer",
    sub: "Rutgers · " + byId(EXPERIENCE, "ds101").period,
    ability: "Run weekly R recitations + stats labs; grade 250+/mo on time.",
    art: "teach-grade",
    logo: "/logos/rutgers.png",
    stats: [
      { k: "STUDENTS", v: "40+" },
      { k: "GRADED", v: "250+ / mo" },
      { k: "ON-TIME", v: "100%" },
    ],
    back: {
      lines: byId(EXPERIENCE, "ds101").bullets,
    },
  },
  {
    id: "rqfc",
    badge: "QUANT",
    rarity: "holo",
    title: "Quant Finance",
    sub: "Rutgers QFC · " + byId(EXPERIENCE, "rqfc").period,
    ability: "Calibrate SABR stochastic-vol on real options via least-squares.",
    art: "vol-smile",
    logo: "/logos/qfc.png",
    stats: [
      { k: "ERROR", v: "< 2 bps" },
      { k: "CHAINS", v: "500+" },
      { k: "MODEL", v: "SABR" },
    ],
    back: {
      lines: byId(EXPERIENCE, "rqfc").bullets,
      link: byId(EXPERIENCE, "rqfc").link,
      linkLabel: "Visit Rutgers QFC →",
    },
  },
];

/** Projects = "Highlight Reel" set. Production system → RARE, hackathon → UNCOMMON. */
export const PROJECT_CARDS: CardSpec[] = [
  {
    id: "guardian",
    badge: "ON-DEVICE ML",
    rarity: "uncommon",
    title: "Guardian (SOS)",
    sub: "HackPrinceton · " + (byId(PROJECTS, "guardian").period ?? ""),
    ability: "On-device reasoning + voice-AI SOS pipeline (K2 Think + CoreML).",
    art: "motion-sos",
    logo: "/logos/hackprinceton.png",
    stats: [
      { k: "FALSE +", v: "−45%" },
      { k: "REASONING", v: "K2 Think · CoreML" },
      { k: "VOICE", v: "ElevenLabs" },
    ],
    back: {
      lines: [
        byId(PROJECTS, "guardian").description,
        ...byId(PROJECTS, "guardian").highlights,
      ],
      link: byId(PROJECTS, "guardian").github_url,
      linkLabel: "View repo →",
    },
  },
  {
    id: "solar-kpi",
    badge: "TELEMETRY",
    rarity: "rare",
    title: "Solar Car Telemetry",
    sub: "Rutgers Solar Car · " + (byId(PROJECTS, "solar-kpi").period ?? ""),
    ability: "Low-latency telemetry pipeline with automated anomaly detection.",
    art: "telemetry-spark",
    logo: "/logos/solarcar.png",
    stats: [
      { k: "THRUPUT", v: "10,000+ rec/sec" },
      { k: "SIGNALS", v: "38" },
      { k: "DECISION", v: "−40%" },
    ],
    back: {
      lines: [
        byId(PROJECTS, "solar-kpi").description,
        ...byId(PROJECTS, "solar-kpi").highlights,
      ],
      link: byId(PROJECTS, "solar-kpi").github_url,
      linkLabel: "View repo →",
    },
  },
  {
    id: "ai-sde",
    badge: "QUANT",
    rarity: "rare",
    title: "AI-SDE Optimizer",
    sub: "Portfolio engine · " + (byId(PROJECTS, "ai-sde").period ?? ""),
    ability: "Fuse SDEs + deep learning to forecast volatility, beating GBM.",
    art: "mc-fan",
    stats: [
      { k: "PATHS", v: "2,000+/sec" },
      { k: "ENGINE", v: "SDE · PyTorch" },
      { k: "BASELINE", v: "beats GBM" },
    ],
    back: {
      lines: [
        byId(PROJECTS, "ai-sde").description,
        ...byId(PROJECTS, "ai-sde").highlights,
      ],
      link: byId(PROJECTS, "ai-sde").github_url,
      linkLabel: "View repo →",
    },
  },
];
