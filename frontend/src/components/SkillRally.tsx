"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SectionHead from "./SectionHead";
import { pop, resume } from "@/lib/sound";

/**
 * Skill Rally: the stack as a rack of pickleballs. On big screens with a fine
 * pointer (and motion allowed) the balls drift in a canvas arena and your
 * cursor becomes a paddle; striking a ball selects that tech and streams its
 * production log into the terminal below. Chips above the arena are the
 * keyboard / touch path to the exact same logs, so nothing is gated behind
 * the physics toy.
 */

type TechId =
  | "python"
  | "pytorch"
  | "claude-mcp"
  | "swift-coreml"
  | "pandas-sql"
  | "fastapi-docker"
  | "azure-aws"
  | "r";

type LogLine = { tag: string; text: string };

type Tech = {
  id: TechId;
  chip: string;
  short: string;
  lines: LogLine[];
  mastery: string;
};

const TECHS: Tech[] = [
  {
    id: "python",
    chip: "Python",
    short: "python",
    lines: [
      {
        tag: "blaze",
        text: "YC S24 agentic pipeline: researches, builds and deploys production websites end to end",
      },
      {
        tag: "quant",
        text: "SABR calibration in Python/NumPy, sub-2 bps pricing error across 500+ option chains",
      },
      {
        tag: "telemetry",
        text: "solar-car pipeline ingesting 10,000+ sensor records/sec",
      },
    ],
    mastery: "production",
  },
  {
    id: "pytorch",
    chip: "PyTorch",
    short: "pytorch",
    lines: [
      {
        tag: "winlab",
        text: "convolutional policy network, 5 conv layers + batch-norm, solves procedurally generated mazes",
      },
      { tag: "bench", text: "scored on 1,000 mazes against BFS ground truth" },
      { tag: "ai-sde", text: "volatility model outperforms GBM baselines" },
    ],
    mastery: "research",
  },
  {
    id: "claude-mcp",
    chip: "Claude Code / MCP",
    short: "claude/mcp",
    lines: [
      {
        tag: "agents",
        text: "three-stage multi-agent system: Research, Implementation, Review",
      },
      {
        tag: "stack",
        text: "LLM tool use + MCP + Azure AI Foundry, orchestrated with Claude Code",
      },
      { tag: "output", text: "ships real client sites autonomously" },
    ],
    mastery: "production",
  },
  {
    id: "swift-coreml",
    chip: "Swift + CoreML",
    short: "swift",
    lines: [
      { tag: "guardian", text: "SOS app built at HackPrinceton" },
      {
        tag: "coreml",
        text: "motion classifier cut false-positive fall detections 45%",
      },
      {
        tag: "voice",
        text: "ElevenLabs voice-first emergency pipeline on Swift/iOS + Firebase",
      },
    ],
    mastery: "prototype",
  },
  {
    id: "pandas-sql",
    chip: "Pandas + SQL",
    short: "pandas/sql",
    lines: [
      { tag: "ingest", text: "38 race metrics at 10,000+ records/sec" },
      { tag: "perf", text: "vectorized the ingestion loops, 25% latency cut" },
      {
        tag: "signal",
        text: "automated anomaly detection cut strategy decision time 40%",
      },
    ],
    mastery: "production",
  },
  {
    id: "fastapi-docker",
    chip: "FastAPI + Docker",
    short: "fastapi",
    lines: [
      { tag: "deploy", text: "the deploy path for Blaze's generated sites" },
      { tag: "docker", text: "services shipped as containers" },
      { tag: "ci", text: "CI/CD gates on the release path" },
    ],
    mastery: "production",
  },
  {
    id: "azure-aws",
    chip: "Azure + AWS",
    short: "azure/aws",
    lines: [
      { tag: "azure", text: "AI Foundry runs the agent orchestration" },
      { tag: "blob", text: "Azure Blob, pipeline artifact store" },
      { tag: "s3", text: "AWS S3, pipeline artifact store" },
    ],
    mastery: "production",
  },
  {
    id: "r",
    chip: "R",
    short: "r",
    lines: [
      { tag: "rutgers", text: "Data 101 lecturer" },
      { tag: "recitation", text: "weekly sessions for 40+ undergrads" },
      { tag: "grading", text: "250+ assignments per month, 100% on-time" },
    ],
    mastery: "teaching",
  },
];

/* ------------------------------- terminal ------------------------------- */

type TermLine = { head: string; body: string; kind: "cmd" | "log" | "mastery" };

const PAUSE = 8; // phantom chars at each line end = a beat between lines
const MS_PER_CHAR = 18;

function termLines(t: Tech): TermLine[] {
  return [
    { head: "$", body: ` rally --inspect ${t.id}`, kind: "cmd" },
    ...t.lines.map(
      (l): TermLine => ({ head: `[${l.tag}]`, body: ` ${l.text}`, kind: "log" }),
    ),
    { head: "mastery:", body: ` ${t.mastery}`, kind: "mastery" },
  ];
}

const HEAD_CLASS: Record<TermLine["kind"], string> = {
  cmd: "text-ball",
  log: "text-ball/70",
  mastery: "text-chalk/50",
};
const BODY_CLASS: Record<TermLine["kind"], string> = {
  cmd: "text-chalk",
  log: "text-chalk/80",
  mastery: "text-ball",
};

function Terminal({ tech, run }: { tech: Tech; run: number }) {
  const lines = useMemo(() => termLines(tech), [tech]);
  const total = useMemo(
    () => lines.reduce((s, l) => s + l.head.length + l.body.length + PAUSE, 0),
    [lines],
  );
  // First render (run 0) shows the full log: content is never gated on JS.
  const [progress, setProgress] = useState(99999);

  useEffect(() => {
    if (run === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(99999);
      return;
    }
    setProgress(0);
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const chars = Math.floor((t - t0) / MS_PER_CHAR);
      setProgress(chars);
      if (chars < total) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, total]);

  const typing = run > 0 && progress < total;

  let rem = Math.min(progress, total);
  let cursorRow = 0;
  const rows = lines.map((l, i) => {
    const len = l.head.length + l.body.length;
    const shown = Math.max(0, Math.min(len, rem));
    rem -= len + PAUSE;
    if (shown > 0 || i === 0) cursorRow = i;
    return {
      line: l,
      headShown: l.head.slice(0, Math.min(shown, l.head.length)),
      bodyShown: shown > l.head.length ? l.body.slice(0, shown - l.head.length) : "",
    };
  });

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-chalk/15 bg-[#04120f]">
      <div className="flex items-center gap-2 border-b border-chalk/10 px-4 py-2.5">
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-clay" />
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-chalk/30" />
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-ball" />
        <span className="ml-2 font-mono text-[12px] text-chalk/45">
          pulkit@courtside: ~/rally
        </span>
      </div>
      <div
        role="log"
        aria-live="polite"
        aria-busy={typing}
        aria-label={`production log: ${tech.chip}`}
        className="min-h-[148px] whitespace-pre-wrap break-words px-4 py-3.5 font-mono text-[13px] leading-[1.75]"
      >
        {rows.map((r, i) => {
          const isCursor = i === cursorRow;
          if (r.headShown.length === 0 && !isCursor) return null;
          return (
            <div key={`${tech.id}-${i}`}>
              <span className={HEAD_CLASS[r.line.kind]}>{r.headShown}</span>
              <span className={BODY_CLASS[r.line.kind]}>{r.bodyShown}</span>
              {isCursor && (
                <span
                  aria-hidden
                  className="ml-1 inline-block h-[15px] w-[7px] translate-y-[3px] rounded-[1px] bg-ball/90 animate-pulse motion-reduce:animate-none"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------- arena --------------------------------- */

const ARENA_H = 340;
const BALL_R = 26;
const REST = 0.75;
const GRAV = 170;
const MAX_V = 720;
const PADDLE_R = 32;

export default function SkillRally() {
  const [sel, setSel] = useState<{ id: TechId; run: number }>({
    id: "python",
    run: 0,
  });
  const selRef = useRef<TechId>("python");
  const [arenaOn, setArenaOn] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectTech = useCallback((id: TechId) => {
    selRef.current = id;
    setSel((s) => ({ id, run: s.run + 1 }));
  }, []);

  // Arena only on lg+ fine-pointer, motion-OK devices.
  useEffect(() => {
    const mqArena = window.matchMedia(
      "(min-width: 1024px) and (hover: hover) and (pointer: fine)",
    );
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setArenaOn(mqArena.matches && !mqReduce.matches);
    update();
    mqArena.addEventListener("change", update);
    mqReduce.addEventListener("change", update);
    return () => {
      mqArena.removeEventListener("change", update);
      mqReduce.removeEventListener("change", update);
    };
  }, []);

  // Physics + drawing live in refs; React state only changes on selection.
  useEffect(() => {
    if (!arenaOn) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const section = sectionRef.current;
    if (!canvas || !wrap || !section) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type Ball = {
      id: TechId;
      short: string;
      x: number;
      y: number;
      vx: number;
      vy: number;
      lastHit: number;
    };

    const st = {
      w: 0,
      balls: [] as Ball[],
      inited: false,
      px: -200,
      py: -200,
      pvx: 0,
      pvy: 0,
      pIn: false,
      lastMove: 0,
      visible: false,
      running: false,
      raf: 0,
      lastT: 0,
    };
    const floorY = ARENA_H - 42;

    function clampV(b: Ball) {
      const s = Math.hypot(b.vx, b.vy);
      if (s > MAX_V) {
        b.vx = (b.vx / s) * MAX_V;
        b.vy = (b.vy / s) * MAX_V;
      }
    }

    function rrect(x: number, y: number, w: number, h: number, r: number) {
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function initBalls(w: number) {
      const gap = w / (TECHS.length + 1);
      st.balls = TECHS.map((t, i) => ({
        id: t.id,
        short: t.short,
        x: Math.min(Math.max(gap * (i + 1), BALL_R + 8), w - BALL_R - 8),
        y: 64 + (i % 3) * 42,
        vx: (i % 2 === 0 ? 1 : -1) * (26 + ((i * 17) % 34)),
        vy: 10 + (i % 4) * 8,
        lastHit: 0,
      }));
    }

    function step(dt: number, now: number) {
      const w = st.w;
      // paddle momentum fades when the pointer rests
      if (now - st.lastMove > 50) {
        st.pvx *= 0.82;
        st.pvy *= 0.82;
      }
      const paddleSpeed = Math.hypot(st.pvx, st.pvy);

      st.balls.forEach((b, i) => {
        b.vy += GRAV * dt;
        b.vx += Math.sin(now * 0.00035 + i * 1.9) * 12 * dt; // faint court breeze
        const drag = Math.max(0, 1 - 0.12 * dt);
        b.vx *= drag;
        b.vy *= drag;
        clampV(b);
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        if (b.x < BALL_R + 4) {
          b.x = BALL_R + 4;
          b.vx = Math.abs(b.vx) * REST;
        }
        if (b.x > w - BALL_R - 4) {
          b.x = w - BALL_R - 4;
          b.vx = -Math.abs(b.vx) * REST;
        }
        if (b.y < BALL_R + 4) {
          b.y = BALL_R + 4;
          b.vy = Math.abs(b.vy) * REST;
        }
        if (b.y > floorY - BALL_R) {
          b.y = floorY - BALL_R;
          b.vy = -Math.abs(b.vy) * REST;
          b.vx *= 0.985;
          if (Math.abs(b.vy) < 26) b.vy = 0; // settle on the chalk line
        }
      });

      // paddle vs balls
      if (st.pIn) {
        st.balls.forEach((b) => {
          const dx = b.x - st.px;
          const dy = b.y - st.py;
          const d = Math.hypot(dx, dy);
          const min = BALL_R + PADDLE_R;
          if (d < min && d > 0.001) {
            const nx = dx / d;
            const ny = dy / d;
            b.x = st.px + nx * min;
            b.y = st.py + ny * min;
            if (paddleSpeed > 70) {
              const imp = Math.min(620, 140 + paddleSpeed * 0.75);
              b.vx = nx * imp + st.pvx * 0.25;
              b.vy = ny * imp + st.pvy * 0.25;
              clampV(b);
              if (now - b.lastHit > 280) {
                b.lastHit = now;
                pop(0.4);
                selectTech(b.id);
              }
            } else {
              b.vx += nx * 260 * dt;
              b.vy += ny * 260 * dt;
            }
          }
        });
      }

      // ball vs ball: keep the rack from stacking
      for (let i = 0; i < st.balls.length; i++) {
        for (let j = i + 1; j < st.balls.length; j++) {
          const a = st.balls[i];
          const c = st.balls[j];
          const dx = c.x - a.x;
          const dy = c.y - a.y;
          const d = Math.hypot(dx, dy);
          const min = BALL_R * 2;
          if (d > 0.001 && d < min) {
            const nx = dx / d;
            const ny = dy / d;
            const half = (min - d) / 2;
            a.x -= nx * half;
            a.y -= ny * half;
            c.x += nx * half;
            c.y += ny * half;
            const rvn = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
            if (rvn < 0) {
              const imp = (-(1 + REST) * rvn) / 2;
              a.vx -= imp * nx;
              a.vy -= imp * ny;
              c.vx += imp * nx;
              c.vy += imp * ny;
            }
          }
        }
      }

      // hard containment: never leave the arena
      st.balls.forEach((b) => {
        b.x = Math.min(Math.max(b.x, BALL_R + 4), w - BALL_R - 4);
        b.y = Math.min(Math.max(b.y, BALL_R + 4), floorY - BALL_R);
      });
    }

    function draw() {
      if (!ctx || st.w < 10) return;
      const w = st.w;
      ctx.clearRect(0, 0, w, ARENA_H);

      // chalk floor line
      ctx.strokeStyle = "rgba(242,238,226,0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(14, floorY);
      ctx.lineTo(w - 14, floorY);
      ctx.stroke();

      st.balls.forEach((b) => {
        const isSel = selRef.current === b.id;
        const g = ctx.createRadialGradient(
          b.x - BALL_R * 0.35,
          b.y - BALL_R * 0.4,
          BALL_R * 0.2,
          b.x,
          b.y,
          BALL_R,
        );
        g.addColorStop(0, "#e4ff73");
        g.addColorStop(0.55, "#c8f135");
        g.addColorStop(1, "#87a71e");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
        ctx.fill();

        // pickleball holes
        ctx.fillStyle = "rgba(14,54,38,0.16)";
        const holes: [number, number][] = [
          [-0.34, -0.1],
          [0.18, -0.4],
          [0.3, 0.28],
          [-0.12, 0.42],
        ];
        holes.forEach(([hx, hy]) => {
          ctx.beginPath();
          ctx.arc(b.x + hx * BALL_R, b.y + hy * BALL_R, BALL_R * 0.11, 0, Math.PI * 2);
          ctx.fill();
        });

        if (isSel) {
          ctx.strokeStyle = "rgba(242,238,226,0.9)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(b.x, b.y, BALL_R + 5, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.font = "500 11px ui-monospace, Menlo, monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = isSel ? "rgba(242,238,226,0.95)" : "rgba(242,238,226,0.6)";
        ctx.fillText(b.short, b.x, b.y + BALL_R + 17);
      });

      // the paddle rides the cursor, leaning into its swing
      if (st.pIn) {
        const tilt = Math.max(-0.38, Math.min(0.38, st.pvx * 0.00045));
        ctx.save();
        ctx.translate(st.px, st.py);
        ctx.rotate(tilt);
        ctx.fillStyle = "#10211f";
        ctx.strokeStyle = "rgba(242,238,226,0.92)";
        ctx.lineWidth = 2;
        rrect(-22, -34, 44, 54, 14); // face
        ctx.fill();
        ctx.stroke();
        rrect(-5, 22, 10, 20, 4); // grip
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#c8f135"; // sweet spot
        ctx.beginPath();
        ctx.arc(0, -7, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function frame(t: number) {
      if (!st.running) return;
      const dt = Math.min(0.032, Math.max(0.001, (t - st.lastT) / 1000));
      st.lastT = t;
      step(dt, t);
      draw();
      st.raf = requestAnimationFrame(frame);
    }
    function start() {
      if (st.running || !st.visible || document.hidden) return;
      st.running = true;
      st.lastT = performance.now();
      st.raf = requestAnimationFrame(frame);
    }
    function stop() {
      st.running = false;
      cancelAnimationFrame(st.raf);
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = e.clientX - rect.left;
      const ny = e.clientY - rect.top;
      const now = performance.now();
      if (st.pIn) {
        const dtm = Math.max(8, now - st.lastMove) / 1000;
        const ivx = Math.max(-1500, Math.min(1500, (nx - st.px) / dtm));
        const ivy = Math.max(-1500, Math.min(1500, (ny - st.py) / dtm));
        st.pvx = st.pvx * 0.6 + ivx * 0.4;
        st.pvy = st.pvy * 0.6 + ivy * 0.4;
      }
      st.px = nx;
      st.py = ny;
      st.pIn = true;
      st.lastMove = now;
    };
    const onLeave = () => {
      st.pIn = false;
      st.pvx = 0;
      st.pvy = 0;
    };
    const onDown = () => resume();
    const onVis = () => {
      if (document.hidden) stop();
      else start();
    };

    const ro = new ResizeObserver((entries) => {
      const cw = Math.floor(entries[0]?.contentRect.width ?? wrap.clientWidth);
      if (cw < 10) return; // canvas ops guarded for zero width
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ARENA_H * dpr);
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ARENA_H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      st.w = cw;
      if (!st.inited) {
        initBalls(cw);
        st.inited = true;
      } else {
        st.balls.forEach((b) => {
          b.x = Math.min(Math.max(b.x, BALL_R + 4), cw - BALL_R - 4);
        });
      }
      draw(); // synchronous first frame, no blank flash
    });
    ro.observe(wrap);

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        st.visible = e.isIntersecting;
        if (st.visible) start();
        else stop();
      },
      { rootMargin: "60px" },
    );
    io.observe(section);

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onDown);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [arenaOn, selectTech]);

  const selected = TECHS.find((t) => t.id === sel.id) ?? TECHS[0];

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative bg-court text-chalk"
      style={{ ["--sel" as string]: "#c8f135" }}
    >
      <div className="mx-auto max-w-[1560px] px-5 py-20 lg:px-14 lg:py-24">
        <SectionHead
          title="Skill Rally"
          caption="Strike a ball to pull the production log behind it."
          index="03"
          meta="the bag"
          dark
        />

        <div role="group" aria-label="Tech roster" className="flex flex-wrap gap-2.5">
          {TECHS.map((t) => {
            const active = sel.id === t.id;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  resume();
                  pop(0.35);
                  selectTech(t.id);
                }}
                className={`rounded-full border px-3.5 py-1.5 font-mono text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ball focus-visible:ring-offset-2 focus-visible:ring-offset-court ${
                  active
                    ? "border-ball bg-ball text-ink"
                    : "border-chalk/25 text-chalk/85 hover:border-chalk/60 hover:text-chalk"
                }`}
              >
                {t.chip}
              </button>
            );
          })}
        </div>

        {arenaOn && (
          <div className="mt-6 hidden lg:block">
            <div ref={wrapRef}>
              <canvas
                ref={canvasRef}
                aria-hidden="true"
                data-cursor
                className="block h-[340px] w-full rounded-lg border border-chalk/12 bg-court-deep/40"
              />
            </div>
            <p className="mt-2 hidden font-mono text-[11px] text-chalk/40 lg:block">
              swing the paddle: drift into a ball to strike it
            </p>
          </div>
        )}

        <Terminal tech={selected} run={sel.run} />
      </div>
    </section>
  );
}
