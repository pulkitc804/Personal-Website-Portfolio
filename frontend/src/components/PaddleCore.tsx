"use client";

import { useEffect, useRef, useState } from "react";
import type { SkillsPayload } from "@/lib/types";
import SectionHead from "./SectionHead";
import { pop, resume } from "@/lib/sound";

/**
 * "In the Bag" as the paddle itself, cut away to its core. Real paddles hide a
 * polymer honeycomb under the face — here every hex cell of that core holds a
 * skill, the strongest ones packed at the sweet spot. Your cursor IS the sweet
 * spot: cells light and lift as it passes, and a readout names the exact cell
 * under your hand. Fully readable with no cursor; the sweep is the reward.
 */

// short labels sized for a hex; full names surface in the readout
const CELLS: { short: string; full: string; g: number }[] = [
  // g: 0 AI Agents & Cloud · 1 Languages & Frameworks · 2 ML, Data & Sim · 3 Clubs
  { short: "Python", full: "Python", g: 1 },
  { short: "PyTorch", full: "PyTorch", g: 2 },
  { short: "Claude", full: "Claude Code", g: 0 },
  { short: "SQL", full: "SQL", g: 1 },
  { short: "MCP", full: "Model Context Protocol (MCP)", g: 0 },
  { short: "Pandas", full: "Pandas", g: 2 },
  { short: "FastAPI", full: "FastAPI", g: 1 },
  { short: "NumPy", full: "NumPy", g: 2 },
  { short: "TF", full: "TensorFlow", g: 2 },
  { short: "Sklearn", full: "Scikit-learn", g: 2 },
  { short: "Docker", full: "Docker", g: 1 },
  { short: "Agents", full: "Multi-agent orchestration", g: 0 },
  { short: "Swift", full: "Swift", g: 1 },
  { short: "Java", full: "Java", g: 1 },
  { short: "Git", full: "Git", g: 1 },
  { short: "Linux", full: "Linux", g: 1 },
  { short: "R", full: "R", g: 1 },
  { short: "CI/CD", full: "CI/CD", g: 1 },
  { short: "Azure AI", full: "Azure AI Foundry", g: 0 },
  { short: "Tool-use", full: "LLM tool-use / function-calling", g: 0 },
  { short: "Agentic", full: "Agentic pipeline design", g: 0 },
  { short: "S3", full: "AWS S3", g: 0 },
  { short: "Blob", full: "Azure Blob Storage", g: 0 },
  { short: "CoreML", full: "CoreML", g: 2 },
  { short: "Policy nets", full: "Convolutional policy networks", g: 2 },
  { short: "Monte Carlo", full: "Monte Carlo methods", g: 2 },
  { short: "SDEs", full: "Stochastic processes & SDEs", g: 2 },
  { short: "BFS", full: "BFS / classical search", g: 2 },
  { short: "Quant club", full: "Rutgers Quant Finance Club", g: 3 },
  { short: "Solar Car", full: "Rutgers Solar Car", g: 3 },
  { short: "RTSV/A", full: "Road to Silicon V/Alley", g: 3 },
  { short: "DS Club", full: "Data Science Club", g: 3 },
  { short: "SEED2S", full: "SEED2S", g: 3 },
];

const GROUPS = [
  { label: "AI Agents & Cloud", fill: "rgba(200,241,53,0.10)", lit: "#c8f135" },
  { label: "Languages & Frameworks", fill: "rgba(242,238,226,0.07)", lit: "#f2eee2" },
  { label: "ML, Data & Simulation", fill: "rgba(204,91,56,0.13)", lit: "#e07c58" },
  { label: "Clubs & Organizations", fill: "rgba(90,200,190,0.09)", lit: "#6fd8cc" },
];

// ---- deterministic geometry (SSR-safe: everything rounded) ----
const VB_W = 560;
const VB_H = 700;
const FACE = { x: 63, y: 26, w: 434, h: 452, r: 96 }; // rounded face
const SWEET = { x: 280, y: 232 }; // real sweet spot sits above center
const HEX_R = 34; // circumradius, flat-top

function r2(n: number) {
  return Math.round(n * 100) / 100;
}

function hexPath(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i);
    pts.push(`${r2(cx + r * Math.cos(a))},${r2(cy + r * Math.sin(a))}`);
  }
  return `M${pts.join("L")}Z`;
}

function insideFace(cx: number, cy: number, inset: number): boolean {
  const x0 = FACE.x + inset;
  const y0 = FACE.y + inset;
  const x1 = FACE.x + FACE.w - inset;
  const y1 = FACE.y + FACE.h - inset;
  if (cx < x0 || cx > x1 || cy < y0 || cy > y1) return false;
  const r = Math.max(0, FACE.r - inset);
  const qx = Math.max(x0 + r - cx, cx - (x1 - r), 0);
  const qy = Math.max(y0 + r - cy, cy - (y1 - r), 0);
  return qx * qx + qy * qy <= r * r;
}

function buildGrid() {
  // flat-top hex lattice: col pitch 1.5r, row pitch r*sqrt(3), odd cols offset
  const spots: { x: number; y: number; d: number }[] = [];
  const rim: { x: number; y: number }[] = [];
  const px = HEX_R * 1.5;
  const py = HEX_R * Math.sqrt(3);
  for (let c = 0; c < 12; c++) {
    for (let row = 0; row < 12; row++) {
      const x = FACE.x + 30 + c * px;
      const y = FACE.y + 26 + row * py + (c % 2 ? py / 2 : 0);
      if (insideFace(x, y, HEX_R * 0.92)) {
        // room for a label — candidate skill cell
        spots.push({ x: r2(x), y: r2(y), d: Math.hypot(x - SWEET.x, y - SWEET.y) });
      } else if (insideFace(x, y, -HEX_R * 0.4)) {
        // partial rim cell — empty core, clipped by the face
        rim.push({ x: r2(x), y: r2(y) });
      }
    }
  }
  // strongest skills claim the sweet spot, outward; the rest stay empty core
  spots.sort((a, b) => a.d - b.d);
  const filled = spots
    .slice(0, CELLS.length)
    .map((s, i) => ({ ...CELLS[i], x: s.x, y: s.y }));
  const empty = spots
    .slice(CELLS.length)
    .map((s) => ({ x: s.x, y: s.y }))
    .concat(rim);
  return { filled, empty };
}

const { filled: GRID, empty: EMPTY } = buildGrid();

export default function PaddleCore({ skills }: { skills: SkillsPayload }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const cellRefs = useRef<(SVGGElement | null)[]>([]);
  const [read, setRead] = useState<{ full: string; g: number } | null>(null);
  void skills; // content is curated above; prop kept for parity with page data flow

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const svg = svgRef.current;
    if (!svg) return;

    let raf = 0;
    let lastNearest = -1;
    let lastPop = 0;
    const cur = { x: -9999, y: -9999, on: false };

    const toLocal = (e: PointerEvent) => {
      const r = svg.getBoundingClientRect();
      cur.x = ((e.clientX - r.left) / r.width) * VB_W;
      cur.y = ((e.clientY - r.top) / r.height) * VB_H;
    };
    const onMove = (e: PointerEvent) => {
      toLocal(e);
      if (!cur.on) {
        cur.on = true;
        loop();
      }
    };
    const onLeave = () => {
      cur.on = false;
    };

    function loop() {
      const R = 130;
      let nearest = -1;
      let nearestD = R;
      GRID.forEach((cell, i) => {
        const el = cellRefs.current[i];
        if (!el) return;
        const dx = cur.x - cell.x;
        const dy = cur.y - cell.y;
        const d = Math.hypot(dx, dy);
        const f = cur.on ? Math.max(0, 1 - d / R) : 0;
        const ease = f * f;
        el.style.setProperty("--lit", ease.toFixed(3));
        // lift toward the cursor, gently — the core flexing under the sweet spot
        el.style.transform = `translate(${(dx * ease * 0.06).toFixed(1)}px, ${(dy * ease * 0.06).toFixed(1)}px)`;
        if (cur.on && d < nearestD) {
          nearestD = d;
          nearest = i;
        }
      });
      if (cur.on && nearest !== -1 && nearest !== lastNearest) {
        const t = performance.now();
        if (t - lastPop > 90) {
          pop(0.24);
          lastPop = t;
        }
        lastNearest = nearest;
        setRead({ full: GRID[nearest].full, g: GRID[nearest].g });
      }
      if (cur.on) {
        raf = requestAnimationFrame(loop);
      } else {
        GRID.forEach((_, i) => {
          const el = cellRefs.current[i];
          if (el) {
            el.style.setProperty("--lit", "0");
            el.style.transform = "";
          }
        });
        lastNearest = -1;
        setRead(null);
      }
    }

    svg.addEventListener("pointermove", onMove);
    svg.addEventListener("pointerleave", onLeave);
    svg.addEventListener("pointerdown", () => resume());
    return () => {
      cancelAnimationFrame(raf);
      svg.removeEventListener("pointermove", onMove);
      svg.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const readout = read ?? null;

  return (
    <section
      id="skills"
      className="court-lines relative bg-court text-chalk"
      style={{ ["--sel" as string]: "#c8f135" }}
    >
      <div className="mx-auto max-w-6xl px-5 py-20 lg:py-24">
        <SectionHead
          title="In the Bag"
          caption="Every paddle hides a honeycomb core. Here's what mine is made of: the strongest cells at the sweet spot. Run your cursor over the face."
          dark
        />

        <div className="mt-6 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
          {/* the paddle, cut away */}
          <div className="mx-auto w-full max-w-[560px]">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              className="block h-auto w-full select-none"
              role="img"
              aria-label="A pickleball paddle cut away to its honeycomb core; each cell is a skill"
            >
              <defs>
                <clipPath id="paddle-face">
                  <rect x={FACE.x + 4} y={FACE.y + 4} width={FACE.w - 8} height={FACE.h - 8} rx={FACE.r - 4} />
                </clipPath>
                {/* materials: lit thermoformed face, brushed-metal guard,
                    polymer cell bevel, leather grip, blurred backdrop shadow */}
                <radialGradient id="pc-face" cx="0.5" cy="0.4" r="0.78">
                  <stop offset="0" stopColor="rgba(15,56,52,0.92)" />
                  <stop offset="1" stopColor="rgba(4,18,17,0.96)" />
                </radialGradient>
                <linearGradient id="pc-metal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#cfcabb" />
                  <stop offset="0.45" stopColor="#8d897b" />
                  <stop offset="1" stopColor="#45423a" />
                </linearGradient>
                <linearGradient id="pc-cell" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="rgba(255,255,255,0.08)" />
                  <stop offset="0.45" stopColor="rgba(255,255,255,0)" />
                  <stop offset="1" stopColor="rgba(0,0,0,0.18)" />
                </linearGradient>
                <linearGradient id="pc-grip" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#191411" />
                  <stop offset="0.5" stopColor="#332921" />
                  <stop offset="1" stopColor="#120e0b" />
                </linearGradient>
                <linearGradient id="pc-butt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#d8724a" />
                  <stop offset="1" stopColor="#93401f" />
                </linearGradient>
                <pattern
                  id="pc-carbon"
                  width="7"
                  height="7"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <line x1="0" y1="0" x2="0" y2="7" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
                </pattern>
                <filter id="pc-blur" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="14" />
                </filter>
              </defs>

              {/* backdrop shadow: lifts the paddle off the court wall */}
              <rect
                x={FACE.x + 6}
                y={FACE.y + 18}
                width={FACE.w - 12}
                height={FACE.h - 6}
                rx={FACE.r}
                fill="rgba(0,0,0,0.42)"
                filter="url(#pc-blur)"
              />

              {/* face + brushed-metal edge guard */}
              <rect
                x={FACE.x}
                y={FACE.y}
                width={FACE.w}
                height={FACE.h}
                rx={FACE.r}
                fill="url(#pc-face)"
                stroke="rgba(242,238,226,0.18)"
                strokeWidth={2}
              />
              <rect
                x={FACE.x}
                y={FACE.y}
                width={FACE.w}
                height={FACE.h}
                rx={FACE.r}
                fill="url(#pc-carbon)"
                clipPath="url(#paddle-face)"
              />
              <rect
                x={FACE.x - 7}
                y={FACE.y - 7}
                width={FACE.w + 14}
                height={FACE.h + 14}
                rx={FACE.r + 7}
                fill="none"
                stroke="url(#pc-metal)"
                strokeWidth={4.5}
              />

              {/* throat + leather-wrapped handle + butt cap */}
              <path
                d={`M${VB_W / 2 - 46} ${FACE.y + FACE.h - 8} L${VB_W / 2 - 17} ${FACE.y + FACE.h + 54} L${VB_W / 2 + 17} ${FACE.y + FACE.h + 54} L${VB_W / 2 + 46} ${FACE.y + FACE.h - 8}`}
                fill="url(#pc-face)"
                stroke="rgba(242,238,226,0.18)"
                strokeWidth={2}
              />
              <rect
                x={VB_W / 2 - 17}
                y={FACE.y + FACE.h + 54}
                width={34}
                height={128}
                rx={8}
                fill="url(#pc-grip)"
                stroke="rgba(0,0,0,0.4)"
                strokeWidth={1.5}
              />
              {/* overlap wrap: each band casts a hairline shadow and catches light */}
              {[0, 1, 2, 3, 4].map((i) => (
                <g key={i}>
                  <line
                    x1={VB_W / 2 - 17}
                    y1={FACE.y + FACE.h + 77 + i * 22}
                    x2={VB_W / 2 + 17}
                    y2={FACE.y + FACE.h + 67 + i * 22}
                    stroke="rgba(0,0,0,0.45)"
                    strokeWidth={2}
                  />
                  <line
                    x1={VB_W / 2 - 17}
                    y1={FACE.y + FACE.h + 75.5 + i * 22}
                    x2={VB_W / 2 + 17}
                    y2={FACE.y + FACE.h + 65.5 + i * 22}
                    stroke="rgba(255,255,255,0.07)"
                    strokeWidth={1}
                  />
                </g>
              ))}
              <rect
                x={VB_W / 2 - 23}
                y={FACE.y + FACE.h + 180}
                width={46}
                height={16}
                rx={7}
                fill="url(#pc-butt)"
                stroke="rgba(0,0,0,0.35)"
                strokeWidth={1}
              />

              {/* empty core cells — the honeycomb continues where no skill sits */}
              <g clipPath="url(#paddle-face)">
                {EMPTY.map((s) => (
                  <path
                    key={`${s.x}-${s.y}`}
                    d={hexPath(s.x, s.y, HEX_R - 2.5)}
                    fill="rgba(242,238,226,0.02)"
                    stroke="rgba(242,238,226,0.08)"
                    strokeWidth={1}
                  />
                ))}
              </g>

              {/* the honeycomb core */}
              {GRID.map((cell, i) => {
                const g = GROUPS[cell.g];
                const twoLine = cell.short.includes(" ");
                const [l1, l2] = twoLine
                  ? [cell.short.slice(0, cell.short.indexOf(" ")), cell.short.slice(cell.short.indexOf(" ") + 1)]
                  : [cell.short, null];
                return (
                  <g
                    key={cell.full}
                    ref={(el) => {
                      cellRefs.current[i] = el;
                    }}
                    className="paddle-cell"
                    style={{ ["--lit" as string]: 0, ["--glit" as string]: g.lit }}
                  >
                    <path d={hexPath(cell.x, cell.y, HEX_R - 2.5)} className="paddle-hex" style={{ fill: g.fill }} />
                    <path d={hexPath(cell.x, cell.y, HEX_R - 2.5)} fill="url(#pc-cell)" />
                    <text
                      x={cell.x}
                      y={l2 ? cell.y - 1.5 : cell.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="paddle-label"
                    >
                      {l1}
                      {l2 && (
                        <tspan x={cell.x} dy={12}>
                          {l2}
                        </tspan>
                      )}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* sweet-spot readout */}
            <p
              aria-live="polite"
              className="mt-4 hidden h-5 text-center font-mono text-[11px] uppercase tracking-[0.16em] lg:block"
            >
              {readout ? (
                <>
                  <span style={{ color: GROUPS[readout.g].lit }}>●</span>{" "}
                  <span className="text-chalk">{readout.full}</span>{" "}
                  <span className="text-chalk/45">· {GROUPS[readout.g].label}</span>
                </>
              ) : (
                <span className="text-chalk/35">sweet spot idle: sweep the core</span>
              )}
            </p>
          </div>

          {/* legend */}
          <aside className="lg:pt-8">
            <p className="mb-5 max-w-[30ch] text-sm leading-relaxed text-chalk/65">
              Polymer honeycomb is what gives a paddle its pop. Same idea here:
              small cells, packed tight, each one earning its place.
            </p>
            <ul className="space-y-3">
              {GROUPS.map((g) => (
                <li key={g.label} className="flex items-center gap-3">
                  <span
                    className="inline-block h-3 w-3 shrink-0"
                    style={{
                      background: g.fill,
                      border: `1.5px solid ${g.lit}`,
                      clipPath: "polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)",
                    }}
                  />
                  <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-chalk/80">
                    {g.label}
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
