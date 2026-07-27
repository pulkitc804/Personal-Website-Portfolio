"use client";

import { useEffect, useRef, useState } from "react";
import SectionHead from "./SectionHead";
import { pop, resume } from "@/lib/sound";

/* ------------------------------------------------------------------ */
/* Court geometry, 10px per foot. Real pickleball proportions:        */
/* 20ft x 44ft drawn portrait, net across the middle, non-volley zone */
/* (kitchen) 7ft each side of the net, centerline splitting the       */
/* service courts. The baseline band is the last 7ft of each half,    */
/* the transition zone is the 8ft between kitchen line and baseline.  */
/* ------------------------------------------------------------------ */

const r2 = (n: number): number => Math.round(n * 100) / 100;

const M = 30; // clay out-of-bounds surround
const W = 200; // 20ft
const H = 440; // 44ft
const VB_W = W + M * 2; // 260
const VB_H = H + M * 2; // 500
const NET_Y = M + H / 2; // 250
const KITCHEN = 70; // 7ft each side of the net
const BASE_BAND = 70; // last 7ft of each half
const CX = M + W / 2; // 130

type ZoneId = "kitchen" | "transition" | "baseline";
type Rect = { x: number; y: number; w: number; h: number };
type Dot = { x: number; y: number; optic: boolean };

/* Interactive overlays: kitchen straddles the net, the other two are
   mirrored near/far for symmetry but select a single concept. */
const ZONE_RECTS: Record<ZoneId, Rect[]> = {
  kitchen: [{ x: M, y: NET_Y - KITCHEN, w: W, h: KITCHEN * 2 }],
  transition: [
    { x: M, y: M + BASE_BAND, w: W, h: H / 2 - KITCHEN - BASE_BAND },
    { x: M, y: NET_Y + KITCHEN, w: W, h: H / 2 - KITCHEN - BASE_BAND },
  ],
  baseline: [
    { x: M, y: M, w: W, h: BASE_BAND },
    { x: M, y: M + H - BASE_BAND, w: W, h: BASE_BAND },
  ],
};

/* Where shot dots may land (kitchen split so nothing sits under the net). */
const DOT_RECTS: Record<ZoneId, Rect[]> = {
  kitchen: [
    { x: M, y: NET_Y - KITCHEN, w: W, h: KITCHEN - 8 },
    { x: M, y: NET_Y + 8, w: W, h: KITCHEN - 8 },
  ],
  transition: ZONE_RECTS.transition,
  baseline: ZONE_RECTS.baseline,
};

/* Deterministic seeded scatter: identical on server and client, all
   coordinates rounded to 2 decimals so hydration never mismatches. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function scatter(seed: number, rects: Rect[], count: number): Dot[] {
  const rand = mulberry32(seed);
  const pad = 9;
  const out: Dot[] = [];
  for (let i = 0; i < count; i++) {
    const rect = rects[i % rects.length];
    if (!rect) continue;
    out.push({
      x: r2(rect.x + pad + rand() * (rect.w - pad * 2)),
      y: r2(rect.y + pad + rand() * (rect.h - pad * 2)),
      optic: rand() > 0.35,
    });
  }
  return out;
}

const DOTS: Record<ZoneId, Dot[]> = {
  kitchen: scatter(11, DOT_RECTS.kitchen, 14),
  transition: scatter(29, DOT_RECTS.transition, 14),
  baseline: scatter(47, DOT_RECTS.baseline, 14),
};

/* ------------------------------------------------------------------ */
/* Zone facts. Shares are the self-tracked split; receipts are real.  */
/* ------------------------------------------------------------------ */

type Zone = {
  id: ZoneId;
  name: string;
  courtLabel: string;
  discipline: string;
  share: number;
  receipts: string[];
  ringR: number;
  ringClass: string;
  swatchClass: string;
  labelY: number;
};

const ZONE_MAP: Record<ZoneId, Zone> = {
  kitchen: {
    id: "kitchen",
    name: "The Kitchen",
    courtLabel: "KITCHEN",
    discipline: "Frontend and UI engineering",
    share: 30,
    receipts: [
      "this site: canvas physics at 60fps",
      "Dash/Plotly race console, -40% decision time",
    ],
    ringR: 38,
    ringClass: "stroke-chalk",
    swatchClass: "bg-chalk",
    labelY: 285,
  },
  transition: {
    id: "transition",
    name: "The Transition Zone",
    courtLabel: "TRANSITION",
    discipline: "CI/CD, testing, benchmarks",
    share: 25,
    receipts: [
      "1,000-maze benchmark harness",
      "500+ option chains validated against live surfaces",
    ],
    ringR: 26,
    ringClass: "stroke-clay",
    swatchClass: "bg-clay",
    labelY: 360,
  },
  baseline: {
    id: "baseline",
    name: "The Baseline",
    courtLabel: "BASELINE",
    discipline: "Backend, ML and cloud infrastructure",
    share: 45,
    receipts: [
      "10,000+ records/sec telemetry pipeline",
      "sub-2 bps SABR calibration error",
      "multi-agent pipeline ships production sites",
    ],
    ringR: 50,
    ringClass: "stroke-ball",
    swatchClass: "bg-ball",
    labelY: 435,
  },
};

const ZONES: Zone[] = [ZONE_MAP.kitchen, ZONE_MAP.transition, ZONE_MAP.baseline];

const RING_W = 9;
const RINGS: Record<ZoneId, { c: number; done: number }> = {
  kitchen: {
    c: r2(2 * Math.PI * ZONE_MAP.kitchen.ringR),
    done: r2(2 * Math.PI * ZONE_MAP.kitchen.ringR * (1 - ZONE_MAP.kitchen.share / 100)),
  },
  transition: {
    c: r2(2 * Math.PI * ZONE_MAP.transition.ringR),
    done: r2(2 * Math.PI * ZONE_MAP.transition.ringR * (1 - ZONE_MAP.transition.share / 100)),
  },
  baseline: {
    c: r2(2 * Math.PI * ZONE_MAP.baseline.ringR),
    done: r2(2 * Math.PI * ZONE_MAP.baseline.ringR * (1 - ZONE_MAP.baseline.share / 100)),
  },
};

/* ------------------------------------------------------------------ */

export default function CourtAnalytics() {
  const [zone, setZone] = useState<ZoneId>("baseline");
  const [revealed, setRevealed] = useState(false);
  const [reduced, setReduced] = useState(false);
  const zoneRef = useRef<ZoneId>("baseline");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      // Static fallback: rings render at their final state, no sweep.
      setReduced(true);
      setRevealed(true);
      return;
    }
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    // Never leave the rings empty if the observer misses (background tabs).
    const t = setTimeout(() => setRevealed(true), 2200);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, []);

  function select(id: ZoneId) {
    if (zoneRef.current === id) return;
    zoneRef.current = id;
    setZone(id);
    resume();
    pop(0.2 + ZONE_MAP[id].share / 100);
  }

  const sel = ZONE_MAP[zone];

  return (
    <section
      id="analytics"
      className="relative bg-court text-chalk"
      style={{ ["--sel" as string]: "#c8f135" }}
    >
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-10 lg:py-24">
        <SectionHead
          title="Court-Side Analytics"
          caption="Where the last 12 months of work actually landed, mapped onto the court. Self-tracked split, real numbers underneath."
          index="06"
          meta="shot chart"
          dark
        />

        <div
          ref={cardRef}
          className="rounded-2xl border border-chalk/12 bg-court-deep p-6 lg:p-8"
        >
          <div className="mb-6 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-chalk/45">
            <span>Shot map · last 12 months</span>
            <span className="hidden sm:block">hover, tap or tab the zones</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
            {/* ------------------------- SHOT MAP ------------------------- */}
            <div className="flex items-center justify-center">
              <svg
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                className="block h-[420px] w-auto max-w-full select-none sm:h-[480px] lg:h-[580px]"
                aria-label="Top-down pickleball court shot map with three selectable zones: kitchen, transition zone and baseline"
              >
                {/* clay out-of-bounds surround */}
                <rect x={0} y={0} width={VB_W} height={VB_H} rx={10} fill="#cc5b38" />
                <rect
                  x={0}
                  y={0}
                  width={VB_W}
                  height={VB_H}
                  rx={10}
                  fill="#07211f"
                  fillOpacity={0.28}
                />

                {/* court surface + chalk lines */}
                <rect x={M} y={M} width={W} height={H} fill="#0e4f4c" />
                <rect
                  x={M}
                  y={M}
                  width={W}
                  height={H}
                  fill="none"
                  stroke="#f2eee2"
                  strokeWidth={1.5}
                />
                {/* kitchen lines, 7ft each side of the net */}
                <line x1={M} y1={NET_Y - KITCHEN} x2={M + W} y2={NET_Y - KITCHEN} stroke="#f2eee2" strokeWidth={1.5} />
                <line x1={M} y1={NET_Y + KITCHEN} x2={M + W} y2={NET_Y + KITCHEN} stroke="#f2eee2" strokeWidth={1.5} />
                {/* centerlines splitting the service courts */}
                <line x1={CX} y1={M} x2={CX} y2={NET_Y - KITCHEN} stroke="#f2eee2" strokeWidth={1.5} />
                <line x1={CX} y1={NET_Y + KITCHEN} x2={CX} y2={M + H} stroke="#f2eee2" strokeWidth={1.5} />

                {/* dimension callouts */}
                <text x={CX} y={19} textAnchor="middle" fontSize={8} letterSpacing={1.2} fill="#f2eee2" fillOpacity={0.45} className="font-mono">
                  20 FT
                </text>
                <text x={VB_W - 12} y={NET_Y} transform={`rotate(90 ${VB_W - 12} ${NET_Y})`} textAnchor="middle" fontSize={8} letterSpacing={1.2} fill="#f2eee2" fillOpacity={0.45} className="font-mono">
                  44 FT
                </text>

                {/* interactive zones: hover, focus or tap selects */}
                {ZONES.map((z) => (
                  <g
                    key={z.id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={zone === z.id}
                    aria-label={`${z.name}: ${z.discipline}, ${z.share} percent of shipped work`}
                    className="group cursor-pointer outline-none"
                    onMouseEnter={() => select(z.id)}
                    onFocus={() => select(z.id)}
                    onClick={() => select(z.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        select(z.id);
                      }
                    }}
                  >
                    {ZONE_RECTS[z.id].map((rc, i) => (
                      <rect
                        key={i}
                        x={rc.x}
                        y={rc.y}
                        width={rc.w}
                        height={rc.h}
                        pointerEvents="all"
                        fill="#c8f135"
                        fillOpacity={zone === z.id ? 0.08 : 0}
                        stroke="#c8f135"
                        strokeOpacity={zone === z.id ? 0.7 : 0}
                        strokeWidth={1.5}
                        className="transition-[fill-opacity,stroke-opacity] duration-200 group-focus-visible:stroke-2"
                      />
                    ))}
                  </g>
                ))}

                {/* shot scatter, deterministic, dimmed when not selected */}
                {ZONES.map((z) => (
                  <g
                    key={`dots-${z.id}`}
                    className="pointer-events-none transition-opacity duration-200"
                    opacity={zone === z.id ? 1 : 0.5}
                  >
                    {DOTS[z.id].map((d, i) => (
                      <circle
                        key={i}
                        cx={d.x}
                        cy={d.y}
                        r={d.optic ? 3 : 2.5}
                        fill={d.optic ? "#c8f135" : "#cc5b38"}
                        fillOpacity={d.optic ? 0.65 : 0.75}
                      />
                    ))}
                  </g>
                ))}

                {/* zone names only, and only the active one reads bright: the
                    percentages live in the rings, printing them here too just
                    stacked type over the shot dots */}
                {ZONES.map((z) => (
                  <text
                    key={`label-${z.id}`}
                    x={CX}
                    y={z.labelY}
                    textAnchor="middle"
                    fontSize={8.5}
                    letterSpacing={1.4}
                    fill={zone === z.id ? "#c8f135" : "#f2eee2"}
                    fillOpacity={zone === z.id ? 0.95 : 0.28}
                    className="pointer-events-none font-mono uppercase transition-[fill-opacity] duration-200"
                  >
                    {z.courtLabel}
                  </text>
                ))}

                {/* net band on top, posts past the sidelines */}
                <g className="pointer-events-none">
                  <rect x={M - 8} y={NET_Y - 3} width={W + 16} height={6} fill="#10211f" />
                  <line x1={M - 8} y1={NET_Y - 3} x2={M + W + 8} y2={NET_Y - 3} stroke="#f2eee2" strokeWidth={1.5} />
                  <circle cx={M - 8} cy={NET_Y} r={2.5} fill="#f2eee2" fillOpacity={0.85} />
                  <circle cx={M + W + 8} cy={NET_Y} r={2.5} fill="#f2eee2" fillOpacity={0.85} />
                  <text x={16} y={NET_Y} transform={`rotate(-90 16 ${NET_Y})`} textAnchor="middle" fontSize={7} letterSpacing={1.2} fill="#f2eee2" fillOpacity={0.4} className="font-mono">
                    NET
                  </text>
                </g>
              </svg>
            </div>

            {/* ------------------------- READOUT ------------------------- */}
            <div aria-live="polite" className="flex flex-col justify-center gap-6">
              <div className="flex items-center gap-5">
                <svg
                  viewBox="0 0 120 120"
                  className="h-36 w-36 shrink-0"
                  role="img"
                  aria-label="Activity rings: baseline 45 percent, kitchen 30 percent, transition zone 25 percent of shipped work"
                >
                  <g transform="rotate(-90 60 60)">
                    {ZONES.map((z) => (
                      <g key={`ring-${z.id}`}>
                        <circle
                          cx={60}
                          cy={60}
                          r={z.ringR}
                          fill="none"
                          strokeWidth={RING_W}
                          className="stroke-chalk"
                          strokeOpacity={0.08}
                        />
                        <circle
                          cx={60}
                          cy={60}
                          r={z.ringR}
                          fill="none"
                          strokeWidth={RING_W}
                          strokeLinecap="round"
                          strokeDasharray={RINGS[z.id].c}
                          strokeDashoffset={revealed ? RINGS[z.id].done : RINGS[z.id].c}
                          opacity={zone === z.id ? 1 : 0.45}
                          className={z.ringClass}
                          style={{
                            transition: reduced
                              ? "none"
                              : "stroke-dashoffset 1.2s ease-out, opacity 0.3s ease",
                          }}
                        />
                      </g>
                    ))}
                  </g>
                  <text x={60} y={58} textAnchor="middle" fontSize={17} fill="#f2eee2" className="font-mono">
                    {sel.share}%
                  </text>
                  <text x={60} y={71} textAnchor="middle" fontSize={6.5} letterSpacing={1.2} fill="#f2eee2" fillOpacity={0.5} className="font-mono uppercase">
                    {sel.courtLabel}
                  </text>
                </svg>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  {ZONES.map((z) => (
                    <button
                      key={`legend-${z.id}`}
                      type="button"
                      aria-pressed={zone === z.id}
                      onClick={() => select(z.id)}
                      className={`flex items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left outline-none transition-colors hover:bg-white/[0.05] focus-visible:ring-2 focus-visible:ring-ball ${
                        zone === z.id ? "bg-white/[0.06]" : ""
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${z.swatchClass}`} />
                        <span className={`truncate text-xs ${zone === z.id ? "text-chalk" : "text-chalk/60"}`}>
                          {z.name}
                        </span>
                      </span>
                      <span className={`font-mono text-[11px] ${zone === z.id ? "text-ball" : "text-chalk/50"}`}>
                        {z.share}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-chalk/12 bg-white/[0.03] p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="display text-xl uppercase leading-tight">{sel.name}</h3>
                  <span className="shrink-0 font-mono text-[11px] text-ball">
                    {sel.share}% OF WORK
                  </span>
                </div>
                <p className="mt-1 text-sm text-chalk/70">{sel.discipline}</p>
                <ul className="mt-4 space-y-2.5">
                  {sel.receipts.map((receipt) => (
                    <li
                      key={receipt}
                      className="flex items-start gap-2.5 font-mono text-xs leading-relaxed text-chalk/85"
                    >
                      <span aria-hidden className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-ball" />
                      {receipt}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-chalk/10 pt-3 font-mono text-[10px] text-chalk/40">
                  split is self-tracked across shipped work, receipts above
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
