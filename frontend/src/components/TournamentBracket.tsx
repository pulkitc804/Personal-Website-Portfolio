"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import SectionHead from "./SectionHead";
import Reveal from "./Reveal";
import { pop, resume } from "@/lib/sound";

/* ------------------------------------------------------------------ */
/* Data (real projects, seeded by complexity)                          */
/* ------------------------------------------------------------------ */

type ProjectId = "ai-sde" | "guardian" | "solar" | "maze";

type Metric = { label: string; value: string };

type Project = {
  id: ProjectId;
  seed: number;
  standing: string;
  title: string;
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
  "ai-sde": {
    id: "ai-sde",
    seed: 1,
    standing: "Champion",
    title: "AI-SDE Portfolio Optimization Engine",
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
    seed: 4,
    standing: "Semifinalist",
    title: "Maze Policy Network",
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

const SEMI_1: Match = {
  id: "sf1",
  round: "Semifinal 1",
  a: "ai-sde",
  b: "maze",
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

/* Bracket geometry (lg+): two h-44 (176px) cards with a 48px gap = 400px
   column. Semi midpoints y=88 / y=312, final midpoint y=200. All coords
   are static integers, already exact to 2 decimals. */
const ELBOW_TOP = "M0 88H14Q22 88 22 96V192Q22 200 30 200";
const ELBOW_BOTTOM = "M0 312H14Q22 312 22 304V208Q22 200 30 200";
const ELBOW_STUB = "M30 200H48";
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
      className="flex w-full flex-col gap-0.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-chalk/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ball"
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
          {project.title}
        </span>
        {isWinner && (
          <span className="ml-auto shrink-0 font-mono text-[9px] uppercase tracking-widest text-ball">
            adv.
          </span>
        )}
      </span>
      <span
        className={`pl-[26px] font-mono text-[10px] ${
          isWinner ? "text-chalk/55" : "text-chalk/35"
        }`}
      >
        {project.rowMetric}
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
      <div className="mx-auto max-w-6xl px-5 py-20 lg:py-24">
        <SectionHead
          title="The Bracket"
          caption="Every entrant is a real, shipped build, seeded by complexity. Open any match for the film room."
          index="04"
          meta="main draw"
          dark
        />

        {/* -------- lg+: three-column bracket with SVG connectors -------- */}
        <Reveal className="hidden lg:block">
          <div className="grid grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)_3rem_minmax(0,1.2fr)] items-center">
            <div className="flex h-[400px] flex-col justify-between">
              <MatchCard match={SEMI_1} onOpen={openFilmRoom} className="h-44" />
              <MatchCard match={SEMI_2} onOpen={openFilmRoom} className="h-44" />
            </div>

            <svg
              viewBox="0 0 48 400"
              className="h-[400px] w-12 text-chalk/25"
              aria-hidden
            >
              <path d={ELBOW_TOP} fill="none" stroke="currentColor" strokeWidth="1" />
              <path d={ELBOW_BOTTOM} fill="none" stroke="currentColor" strokeWidth="1" />
              <path d={ELBOW_STUB} fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>

            <div className="flex h-[400px] items-center">
              <MatchCard match={FINAL} onOpen={openFilmRoom} className="h-44 w-full" />
            </div>

            <svg
              viewBox="0 0 48 400"
              className="h-[400px] w-12 text-chalk/25"
              aria-hidden
            >
              <path d={FINAL_STUB} fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>

            <div className="flex h-[400px] items-center">
              <ChampionCard onOpen={openFilmRoom} />
            </div>
          </div>
        </Reveal>

        {/* -------- <lg: stacked list grouped by round -------- */}
        <div className="space-y-10 lg:hidden">
          <Reveal>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.25em] text-chalk/45">
              Semifinals
            </h3>
            <div className="mt-3 space-y-4">
              <MatchCard match={SEMI_1} onOpen={openFilmRoom} />
              <MatchCard match={SEMI_2} onOpen={openFilmRoom} />
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.25em] text-chalk/45">
              Final
            </h3>
            <div className="mt-3">
              <MatchCard match={FINAL} onOpen={openFilmRoom} />
            </div>
          </Reveal>
          <Reveal delay={160}>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.25em] text-chalk/45">
              Champion
            </h3>
            <div className="mt-3">
              <ChampionCard onOpen={openFilmRoom} />
            </div>
          </Reveal>
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
