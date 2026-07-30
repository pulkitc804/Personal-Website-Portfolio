"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import SectionHead from "./SectionHead";
import Reveal from "./Reveal";
import { pop, resume } from "@/lib/sound";
import CourtDiagram from "./CourtDiagram";

/* ------------------------------------------------------------------ */
/* Data (real projects, seeded by complexity)                          */
/* ------------------------------------------------------------------ */

type ProjectId = "ai-sde" | "guardian" | "solar" | "scarlet" | "maze";

type Metric = { label: string; value: string };

type Project = {
  id: ProjectId;
  seed: number;
  standing: string;
  title: string;
  /** compact name for the bracket rows, where the column is narrow */
  short: string;
  period: string;
  pitch: string;
  description: string;
  arch: string[];
  metrics: Metric[];
  tags: string[];
  github: string | null;
  rowMetric: string;
};

const PROJECTS: Record<ProjectId, Project> = {
  scarlet: {
    id: "scarlet",
    seed: 4,
    standing: "Play-in winner",
    title: "ScarletAI",
    short: "ScarletAI",
    period: "2026 to Present",
    pitch:
      "A grounded AI assistant for Rutgers: retrieval-augmented over official campus sources, so it answers from the corpus instead of guessing.",
    description:
      "A TypeScript monorepo that answers questions about Rutgers New Brunswick without hallucinating. Retrieval-augmented generation runs over a corpus of official Rutgers pages covering majors, academics, dining, buses and campus services, alongside a Schedule of Classes planner backed by live data. A multi-provider LLM layer (Gemini, Groq, Ollama, Anthropic) fails over between models, and one shared agent runtime drives the web chat app, a browser extension, and a React Native client.",
    arch: [
      "Official Rutgers page corpus",
      "Embeddings + vector search",
      "Multi-provider LLM layer, with fallback",
      "Shared agent runtime",
      "Next.js chat + SOC planner",
    ],
    metrics: [
      { label: "Grounding", value: "answers retrieved from the corpus" },
      { label: "Providers", value: "Gemini, Groq, Ollama, Anthropic" },
      { label: "Clients", value: "web, extension, mobile" },
    ],
    tags: ["TypeScript", "Next.js", "RAG", "Vector search", "Turborepo"],
    github: "https://github.com/pulkitc804/Rutgers-GPT",
    rowMetric: "RAG over official Rutgers pages",
  },
  "ai-sde": {
    id: "ai-sde",
    seed: 1,
    standing: "Champion",
    title: "AI-SDE Portfolio Optimization Engine",
    short: "AI-SDE Engine",
    period: "May 2025 to Jan 2026",
    pitch:
      "Stochastic differential equations fused with deep learning to forecast volatility, simulated at 2,000+ price paths per second.",
    description:
      "A PyTorch engine that fuses stochastic differential equations with deep learning to forecast volatility, outperforming GBM baselines. A Monte Carlo simulator generates 2,000+ price paths per second and feeds a real-time Streamlit risk dashboard.",
    arch: [
      "Market data",
      "SDE calibrator",
      "PyTorch vol model",
      "Monte Carlo engine (2k paths/s)",
      "Streamlit dashboard",
    ],
    metrics: [
      { label: "Forecast", value: "beats GBM baselines" },
      { label: "Throughput", value: "2,000+ paths/sec" },
      { label: "Risk view", value: "real-time risk dashboard" },
    ],
    tags: ["Python", "PyTorch", "Streamlit", "Monte Carlo"],
    github: "https://github.com/pulkitc804/AI-SDE-Powered-Portfolio-Optimizer",
    rowMetric: "2,000+ paths/sec",
  },
  guardian: {
    id: "guardian",
    seed: 2,
    standing: "Finalist",
    title: "Guardian (SOS App)",
    short: "Guardian",
    period: "HackPrinceton, Apr 2026",
    pitch:
      "CoreML and K2 Think reasoning over motion data for a voice-first fall SOS.",
    description:
      "CoreML plus K2 Think reasoning over high-frequency motion data cut false-positive fall detections by 45%. ElevenLabs drives a voice-first SOS flow, built native in Swift for iOS with Firebase handling alerts.",
    arch: [
      "Motion sensors",
      "CoreML fall classifier",
      "K2 Think reasoning",
      "ElevenLabs voice SOS",
      "Firebase alerts",
    ],
    metrics: [
      { label: "Detection", value: "45% fewer false positives" },
      { label: "Interface", value: "voice-first SOS" },
      { label: "Stack", value: "native iOS + Firebase" },
    ],
    tags: ["Swift", "CoreML", "K2 Think", "ElevenLabs", "Firebase"],
    github: "https://github.com/TheAryanAnode/Guardian-PrincetonHacks",
    rowMetric: "45% fewer false positives",
  },
  solar: {
    id: "solar",
    seed: 3,
    standing: "Semifinalist",
    title: "Solar Car Telemetry Dashboard",
    short: "Solar Telemetry",
    period: "Sep 2025 to Present",
    pitch:
      "A race console ingesting 10,000+ sensor records per second across 38 metrics.",
    description:
      "A Python pipeline ingesting 10,000+ sensor records per second across 38 race metrics. Pandas vectorization cut latency by 25%, and a Dash/Plotly console with anomaly detection cut strategy decision time by 40%.",
    arch: [
      "CAN telemetry (10k rec/s)",
      "Pandas vectorized ingest",
      "Anomaly detection",
      "Dash/Plotly race console",
    ],
    metrics: [
      { label: "Ingest", value: "10,000+ records/sec" },
      { label: "Pipeline", value: "-25% latency" },
      { label: "Strategy", value: "-40% decision time" },
    ],
    tags: ["Python", "Pandas", "Dash", "Plotly"],
    github: "https://github.com/RayaneSkiker/KPI_Dashboard",
    rowMetric: "10,000+ records/sec",
  },
  maze: {
    id: "maze",
    seed: 5,
    standing: "Play-in",
    title: "Maze Policy Network",
    short: "Maze Policy",
    period: "WINLAB research, 2026",
    pitch:
      "A convolutional policy network that solves procedurally generated mazes move by move.",
    description:
      "A convolutional policy network, 5 conv layers with batch-norm and a dense head, solves procedurally generated mazes move by move from a 6-channel maze encoding. Benchmarked over 1,000 mazes against BFS optimal paths, with MACs profiled against classical search.",
    arch: [
      "Maze generator",
      "6-channel encoder",
      "Conv policy network",
      "BFS ground truth",
      "1,000-maze benchmark",
    ],
    metrics: [
      { label: "Scale", value: "1,000-maze benchmark" },
      { label: "Accuracy", value: "near-optimal short horizons" },
      { label: "Compute", value: "MACs vs BFS profiled" },
    ],
    tags: ["Conv policy net", "Batch-norm", "6-channel encoding", "BFS baseline"],
    github: null,
    rowMetric: "1,000-maze benchmark",
  },
};

type Match = {
  id: string;
  round: string;
  a: ProjectId;
  b: ProjectId;
  winner: ProjectId;
};

const PLAY_IN: Match = {
  id: "playin",
  round: "Play-in",
  a: "scarlet",
  b: "maze",
  winner: "scarlet",
};
const SEMI_1: Match = {
  id: "sf1",
  round: "Semifinal 1",
  a: "ai-sde",
  b: "scarlet",
  winner: "ai-sde",
};
const SEMI_2: Match = {
  id: "sf2",
  round: "Semifinal 2",
  a: "guardian",
  b: "solar",
  winner: "guardian",
};
const FINAL: Match = {
  id: "final",
  round: "Final",
  a: "ai-sde",
  b: "guardian",
  winner: "ai-sde",
};

const TITLE_ID = "film-room-title";

/** Display order: agents and retrieval first, since that is the current work. */
const ORDER: ProjectId[] = ["scarlet", "guardian", "maze", "solar", "ai-sde"];

/**
 * One project, one card, all cards equal. The whole surface is the button, so
 * there is no ambiguity about what is clickable: the border lifts, the title
 * goes optic, and the footer states the action outright.
 */
function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: OpenFn;
}) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={(e) => onOpen(project.id, e.currentTarget)}
      aria-label={`${project.title}: open the film room`}
      className="group/card flex h-full w-full flex-col rounded-xl border border-chalk/15 bg-white/[0.04] p-5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-ball/50 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ball motion-reduce:hover:transform-none"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-chalk/40">
          {project.period}
        </span>
        {project.github === null && (
          <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-clay">
            research
          </span>
        )}
      </div>

      <h3 className="display mt-3 text-[17px] uppercase leading-tight text-chalk transition-colors group-hover/card:text-ball">
        {project.title}
      </h3>

      <p className="mt-2.5 text-[13.5px] leading-relaxed text-chalk/70">
        {project.pitch}
      </p>

      <ul className="mt-4 flex flex-wrap gap-1.5">
        {project.tags.slice(0, 4).map((t) => (
          <li
            key={t}
            className="rounded-md border border-chalk/12 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-chalk/60"
          >
            {t}
          </li>
        ))}
      </ul>

      {/* pinned to the bottom so every card's action line sits on one baseline */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-chalk/10 pt-3.5">
        <span className="tnum font-mono text-[10px] text-ball">
          {project.rowMetric}
        </span>
        <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-chalk/45 transition-colors group-hover/card:text-ball">
          film room
          <svg
            viewBox="0 0 12 12"
            width="11"
            height="11"
            aria-hidden
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-150 group-hover/card:translate-x-0.5"
          >
            <path d="M4 2.5 8 6l-4 3.5" />
          </svg>
        </span>
      </div>
    </button>
  );
}

/* Bracket geometry (lg+): two h-44 (176px) cards with a 48px gap = 400px
   column. Semi midpoints y=88 / y=312, final midpoint y=200. All coords
   are static integers, already exact to 2 decimals. */
const ELBOW_TOP = "M0 88H14Q22 88 22 96V192Q22 200 30 200";
const ELBOW_BOTTOM = "M0 312H14Q22 312 22 304V208Q22 200 30 200";
const ELBOW_STUB = "M30 200H48";
/* Play-in sits level with Semifinal 1 (both midpoints y=88), so its feed is a
   straight run rather than an elbow. */
const PLAYIN_STUB = "M0 88H40";
const FINAL_STUB = "M0 200H48";

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

type OpenFn = (id: ProjectId, trigger: HTMLElement) => void;

/* ------------------------------------------------------------------ */
/* Small marks                                                         */
/* ------------------------------------------------------------------ */

function TrophyMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 text-chalk"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5H4v2a3 3 0 0 0 3 3" />
      <path d="M17 5h3v2a3 3 0 0 1-3 3" />
      <path d="M12 14v4" />
      <path d="M8 20h8" />
    </svg>
  );
}

function CloseMark() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Bracket pieces                                                      */
/* ------------------------------------------------------------------ */

function MatchRow({
  project,
  isWinner,
  onOpen,
}: {
  project: Project;
  isWinner: boolean;
  onOpen: OpenFn;
}) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={(e) => onOpen(project.id, e.currentTarget)}
      /* the affordance: a real bordered surface that lifts and brightens, plus
         a chevron that slides. A row that only changes colour on hover reads
         as text; this reads as a control. */
      className="group/row flex w-full flex-col gap-0.5 rounded-md border border-transparent px-2 py-1.5 text-left transition-all duration-150 hover:border-chalk/25 hover:bg-chalk/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ball active:scale-[0.99]"
      aria-label={`${project.title}, seed ${project.seed}: open the film room`}
    >
      <span className="flex min-w-0 items-center gap-2">
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            isWinner ? "bg-ball" : "bg-chalk/20"
          }`}
          aria-hidden
        />
        <span className="shrink-0 font-mono text-[10px] text-chalk/45">
          {project.seed}
        </span>
        <span
          className={`min-w-0 truncate text-[13px] leading-snug ${
            isWinner ? "text-chalk" : "text-chalk/45"
          }`}
        >
          {project.short}
        </span>
        {isWinner && (
          <span className="ml-auto shrink-0 font-mono text-[9px] uppercase tracking-widest text-ball">
            adv.
          </span>
        )}
        {/* chevron: always present so the row looks actionable at rest, and it
            slides + brightens on hover or keyboard focus */}
        <svg
          viewBox="0 0 12 12"
          aria-hidden
          className={`shrink-0 transition-all duration-150 group-hover/row:translate-x-0.5 group-hover/row:text-ball group-focus-visible/row:text-ball ${
            isWinner ? "ml-2 text-chalk/40" : "ml-auto text-chalk/25"
          }`}
          width="11"
          height="11"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 2.5 8 6l-4 3.5" />
        </svg>
      </span>
      <span className="flex items-baseline gap-2 pl-[26px]">
        <span
          className={`font-mono text-[10px] ${
            isWinner ? "text-chalk/55" : "text-chalk/35"
          }`}
        >
          {project.rowMetric}
        </span>
        {/* the instruction, revealed on approach so it never adds clutter */}
        <span className="ml-auto shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-ball opacity-0 transition-opacity duration-150 group-hover/row:opacity-100 group-focus-visible/row:opacity-100">
          film room →
        </span>
      </span>
    </button>
  );
}

function MatchCard({
  match,
  onOpen,
  className = "",
}: {
  match: Match;
  onOpen: OpenFn;
  className?: string;
}) {
  const a = PROJECTS[match.a];
  const b = PROJECTS[match.b];
  return (
    <div
      className={`flex flex-col rounded-lg border border-chalk/15 bg-court/30 p-3 transition-transform duration-150 hover:-translate-y-0.5 focus-within:-translate-y-0.5 motion-reduce:transform-none ${className}`}
    >
      <p className="px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-chalk/45">
        {match.round}
      </p>
      <div className="mt-1 flex flex-1 flex-col justify-center">
        <MatchRow project={a} isWinner={match.winner === a.id} onOpen={onOpen} />
        <div className="mx-2 h-px bg-chalk/10" aria-hidden />
        <MatchRow project={b} isWinner={match.winner === b.id} onOpen={onOpen} />
      </div>
    </div>
  );
}

function ChampionCard({ onOpen }: { onOpen: OpenFn }) {
  const p = PROJECTS["ai-sde"];
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={(e) => onOpen(p.id, e.currentTarget)}
      className="w-full rounded-xl border border-ball/60 bg-court/30 p-5 text-left transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ball focus-visible:ring-offset-2 focus-visible:ring-offset-court-deep motion-reduce:transform-none"
    >
      <span className="flex items-center gap-2.5">
        <TrophyMark />
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-clay">
          Champion: seed 1
        </span>
      </span>
      <span className="display mt-3 block text-xl uppercase leading-tight text-chalk">
        {p.title}
      </span>
      <span className="mt-2 block text-sm leading-relaxed text-chalk/70">
        {p.pitch}
      </span>
      <span className="mt-4 flex flex-wrap gap-2">
        {p.metrics.map((m) => (
          <span
            key={m.label}
            className="rounded border border-chalk/20 px-2 py-1 font-mono text-[10px] text-chalk/80"
          >
            {m.value}
          </span>
        ))}
      </span>
      <span className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ball">
        open the film room
        <svg
          viewBox="0 0 12 12"
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M2 6h8M7 3l3 3-3 3" />
        </svg>
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Film room: architecture diagram                                     */
/* ------------------------------------------------------------------ */

function ArchDiagram({ stages }: { stages: string[] }) {
  const width = 320;
  const nodeW = 288;
  const nodeH = 40;
  const gap = 30;
  const x = r2((width - nodeW) / 2);
  const cx = r2(width / 2);
  const height = r2(stages.length * nodeH + (stages.length - 1) * gap);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label={`Architecture pipeline: ${stages.join(", then ")}`}
    >
      {stages.map((stage, i) => {
        const y = r2(i * (nodeH + gap));
        const arrowStart = r2(y + nodeH + 3);
        const arrowEnd = r2(y + nodeH + gap - 3);
        return (
          <g key={stage}>
            <rect
              x={x}
              y={y}
              width={nodeW}
              height={nodeH}
              rx={8}
              fill="#0e4f4c"
              fillOpacity={0.2}
              stroke="#f2eee2"
              strokeOpacity={0.3}
              strokeWidth={1}
            />
            <text
              x={cx}
              y={r2(y + nodeH / 2 + 4)}
              textAnchor="middle"
              fontSize={11}
              fill="#f2eee2"
              fillOpacity={0.92}
              className="font-mono"
            >
              {stage}
            </text>
            {i < stages.length - 1 && (
              <g stroke="#f2eee2" strokeOpacity={0.4} strokeWidth={1}>
                <line x1={cx} y1={arrowStart} x2={cx} y2={arrowEnd} />
                <path
                  d={`M${r2(cx - 4)} ${r2(arrowEnd - 5)}L${cx} ${arrowEnd}L${r2(
                    cx + 4
                  )} ${r2(arrowEnd - 5)}`}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Main section                                                        */
/* ------------------------------------------------------------------ */

export default function TournamentBracket() {
  const [openId, setOpenId] = useState<ProjectId | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const reduceMotion = useReducedMotion();
  const triggerRef = useRef<HTMLElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const openFilmRoom = useCallback<OpenFn>((id, trigger) => {
    triggerRef.current = trigger;
    resume();
    pop(0.35);
    setOpenId(id);
  }, []);

  const closeFilmRoom = useCallback(() => {
    setOpenId(null);
    const trigger = triggerRef.current;
    if (trigger) {
      requestAnimationFrame(() => trigger.focus());
    }
  }, []);

  /* Body scroll lock + Escape + initial focus while the drawer is open. */
  useEffect(() => {
    if (openId === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFilmRoom();
    };
    document.addEventListener("keydown", onKey);
    const raf = requestAnimationFrame(() => closeBtnRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
    };
  }, [openId, closeFilmRoom]);

  /* Minimal focus trap inside the dialog. */
  const trapTab = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = panel.querySelectorAll<HTMLElement>(
      "button, a[href]"
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  const project = openId ? PROJECTS[openId] : null;

  const panelInitial = reduceMotion
    ? { opacity: 0 }
    : isDesktop
      ? { x: "100%" }
      : { y: "100%" };
  const panelAnimate = reduceMotion
    ? { opacity: 1 }
    : isDesktop
      ? { x: 0 }
      : { y: 0 };
  const panelTransition = reduceMotion
    ? { duration: 0.18 }
    : { type: "spring" as const, stiffness: 340, damping: 36 };

  return (
    <section
      id="projects"
      className="relative bg-court-deep text-chalk"
      style={{ ["--sel" as string]: "#c8f135" }}
    >
      <div className="diagram-mask" aria-hidden>
        <CourtDiagram crop="kitchen" className="absolute -left-[8%] top-0 h-full w-auto min-w-[60%]" />
      </div>
      <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <SectionHead
          title="The Work"
          caption="Five shipped builds, each with its own film room: architecture, metrics and the code. Click any card."
          index="03"
          meta="projects"
          dark
        />

        {/* Equal layout, deliberately. This was a seeded tournament bracket,
            which forced a hierarchy onto the work: one champion, a play-in, and
            losers. Every one of these is real and shipped, so they get the same
            card, the same size and the same weight. */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* h-full on each wrapper so the grid's stretch reaches the card and
              every card in a row ends on the same baseline */}
          {ORDER.map((id, i) => (
            <Reveal key={id} delay={i * 60} className="h-full">
              <ProjectCard project={PROJECTS[id]} onOpen={openFilmRoom} />
            </Reveal>
          ))}
        </div>
      </div>

      {/* -------- Film room drawer -------- */}
      <AnimatePresence>
        {project && (
          <>
            <motion.div
              key="film-room-backdrop"
              className="fixed inset-0 z-40 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeFilmRoom}
              aria-hidden
            />
            <motion.div
              key="film-room-panel"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={TITLE_ID}
              onKeyDown={trapTab}
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85svh] flex-col rounded-t-2xl border-t border-chalk/15 bg-[#04120f] text-chalk lg:left-auto lg:top-0 lg:max-h-none lg:w-full lg:max-w-md lg:rounded-none lg:border-l lg:border-t-0"
              initial={panelInitial}
              animate={panelAnimate}
              exit={panelInitial}
              transition={panelTransition}
            >
              <div className="flex items-start justify-between gap-4 px-6 pt-6">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ball">
                    Seed {project.seed} · {project.standing}
                  </p>
                  <h3
                    id={TITLE_ID}
                    className="display mt-2 text-2xl uppercase leading-tight"
                  >
                    {project.title}
                  </h3>
                  <p className="mt-1 font-mono text-[11px] text-chalk/50">
                    {project.period}
                  </p>
                </div>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={closeFilmRoom}
                  aria-label="Close film room"
                  className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-md border border-chalk/20 text-chalk/70 transition-colors hover:text-chalk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ball"
                >
                  <CloseMark />
                </button>
              </div>

              <div className="mt-5 flex-1 overflow-y-auto px-6 pb-8">
                <p className="text-sm leading-relaxed text-chalk/75">
                  {project.description}
                </p>

                <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.25em] text-chalk/45">
                  Architecture
                </p>
                <div className="mt-3 rounded-lg border border-chalk/10 p-4">
                  <ArchDiagram stages={project.arch} />
                </div>

                <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.25em] text-chalk/45">
                  Metrics
                </p>
                <dl className="mt-3 divide-y divide-chalk/10 border-y border-chalk/10">
                  {project.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="flex items-baseline justify-between gap-4 py-2.5"
                    >
                      <dt className="font-mono text-[10px] uppercase tracking-widest text-chalk/45">
                        {m.label}
                      </dt>
                      <dd className="text-right text-sm text-chalk">
                        {m.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.25em] text-chalk/45">
                  Tags
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-chalk/20 px-2 py-1 font-mono text-[10px] text-chalk/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {project.github ? (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md bg-ball px-4 py-2 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chalk motion-reduce:transform-none"
                    >
                      View source
                    </a>
                  ) : (
                    <span className="rounded-md border border-clay/60 px-4 py-2 font-mono text-[11px] text-chalk/75">
                      Research build: write-up on request
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={closeFilmRoom}
                    className="rounded-md px-4 py-2 text-sm text-chalk/70 transition-colors hover:text-chalk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ball"
                  >
                    Back to bracket
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
