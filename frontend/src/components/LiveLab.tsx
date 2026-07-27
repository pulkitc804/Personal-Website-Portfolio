"use client";

import { useEffect, useRef, useState } from "react";
import SectionHead from "./SectionHead";
import { pop, resume } from "@/lib/sound";

/**
 * The Lab: two of the real systems, running live in your browser instead of
 * being described. Left, the WINLAB maze environment: a procedurally generated
 * maze, BFS expanding to ground truth, then an agent stepping it one move at a
 * time. Right, the AI-SDE engine: Monte Carlo paths fanning out and the
 * terminal distribution they build. Both are the honest algorithms, labeled
 * for exactly what they are. Canvas + rAF, paused off screen, static under
 * reduced motion.
 */

const OPTIC = "#c8f135";
const CHALK = "#f2eee2";
const CLAY = "#cc5b38";

/* ------------------------------- maze lab ------------------------------- */

type Cell = { n: boolean; e: boolean; s: boolean; w: boolean; seen: boolean };

const COLS = 15;
const ROWS = 11;

function buildMaze(): Cell[][] {
  const g: Cell[][] = [];
  for (let y = 0; y < ROWS; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < COLS; x++) row.push({ n: true, e: true, s: true, w: true, seen: false });
    g.push(row);
  }
  // recursive backtracker
  const stack: [number, number][] = [[0, 0]];
  g[0][0].seen = true;
  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1];
    const opts: [number, number, string][] = [];
    if (cy > 0 && !g[cy - 1][cx].seen) opts.push([cx, cy - 1, "n"]);
    if (cx < COLS - 1 && !g[cy][cx + 1].seen) opts.push([cx + 1, cy, "e"]);
    if (cy < ROWS - 1 && !g[cy + 1][cx].seen) opts.push([cx, cy + 1, "s"]);
    if (cx > 0 && !g[cy][cx - 1].seen) opts.push([cx - 1, cy, "w"]);
    if (!opts.length) {
      stack.pop();
      continue;
    }
    const [nx, ny, dir] = opts[Math.floor(Math.random() * opts.length)];
    if (dir === "n") (g[cy][cx].n = false), (g[ny][nx].s = false);
    if (dir === "e") (g[cy][cx].e = false), (g[ny][nx].w = false);
    if (dir === "s") (g[cy][cx].s = false), (g[ny][nx].n = false);
    if (dir === "w") (g[cy][cx].w = false), (g[ny][nx].e = false);
    g[ny][nx].seen = true;
    stack.push([nx, ny]);
  }
  return g;
}

/** BFS from (0,0) to the far corner: the ground truth the policy is scored on. */
function bfs(g: Cell[][]) {
  const key = (x: number, y: number) => y * COLS + x;
  const prev = new Map<number, number>();
  const order: [number, number][] = [];
  const seen = new Set<number>([key(0, 0)]);
  const q: [number, number][] = [[0, 0]];
  const goal = key(COLS - 1, ROWS - 1);
  let found = false;
  while (q.length && !found) {
    const [x, y] = q.shift()!;
    order.push([x, y]);
    const c = g[y][x];
    const steps: [number, number][] = [];
    if (!c.n) steps.push([x, y - 1]);
    if (!c.e) steps.push([x + 1, y]);
    if (!c.s) steps.push([x, y + 1]);
    if (!c.w) steps.push([x - 1, y]);
    for (const [nx, ny] of steps) {
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
      const k = key(nx, ny);
      if (seen.has(k)) continue;
      seen.add(k);
      prev.set(k, key(x, y));
      if (k === goal) found = true;
      q.push([nx, ny]);
    }
  }
  const path: [number, number][] = [];
  let cur = goal;
  while (cur !== key(0, 0)) {
    path.push([cur % COLS, Math.floor(cur / COLS)]);
    const p = prev.get(cur);
    if (p === undefined) break;
    cur = p;
  }
  path.push([0, 0]);
  path.reverse();
  return { order, path };
}

function MazeLab({ live }: { live: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statRef = useRef<HTMLSpanElement>(null);
  const [runs, setRuns] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let grid = buildMaze();
    let solved = bfs(grid);
    // phase 0 search, 1 path reveal, 2 walk, 3 hold
    const st = { phase: 0, i: 0, tick: 0, walk: 0 };

    function resize() {
      const r = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function geom() {
      const cs = Math.min((W - 24) / COLS, (H - 24) / ROWS);
      return { cs, ox: (W - cs * COLS) / 2, oy: (H - cs * ROWS) / 2 };
    }

    function draw() {
      if (W <= 0) return;
      const { cs, ox, oy } = geom();
      ctx!.clearRect(0, 0, W, H);

      // frontier fill: the search expanding toward the goal
      const upto = st.phase === 0 ? st.i : solved.order.length;
      for (let k = 0; k < upto; k++) {
        const [x, y] = solved.order[k];
        const age = 1 - k / Math.max(1, solved.order.length);
        ctx!.fillStyle = `rgba(200,241,53,${(0.05 + age * 0.1).toFixed(3)})`;
        ctx!.fillRect(ox + x * cs + 1, oy + y * cs + 1, cs - 2, cs - 2);
      }

      // walls
      ctx!.strokeStyle = "rgba(242,238,226,0.55)";
      ctx!.lineWidth = 1.4;
      ctx!.lineCap = "square";
      ctx!.beginPath();
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const c = grid[y][x];
          const px = ox + x * cs;
          const py = oy + y * cs;
          if (c.n) (ctx!.moveTo(px, py), ctx!.lineTo(px + cs, py));
          if (c.w) (ctx!.moveTo(px, py), ctx!.lineTo(px, py + cs));
          if (y === ROWS - 1 && c.s) (ctx!.moveTo(px, py + cs), ctx!.lineTo(px + cs, py + cs));
          if (x === COLS - 1 && c.e) (ctx!.moveTo(px + cs, py), ctx!.lineTo(px + cs, py + cs));
        }
      }
      ctx!.stroke();

      // goal
      ctx!.fillStyle = "rgba(204,91,56,0.85)";
      ctx!.fillRect(ox + (COLS - 1) * cs + cs * 0.3, oy + (ROWS - 1) * cs + cs * 0.3, cs * 0.4, cs * 0.4);

      // optimal path once the search has resolved it
      if (st.phase >= 1) {
        const shown = st.phase === 1 ? st.i : solved.path.length;
        ctx!.strokeStyle = "rgba(242,238,226,0.5)";
        ctx!.lineWidth = 2;
        ctx!.lineCap = "round";
        ctx!.lineJoin = "round";
        ctx!.beginPath();
        for (let k = 0; k < Math.min(shown, solved.path.length); k++) {
          const [x, y] = solved.path[k];
          const px = ox + x * cs + cs / 2;
          const py = oy + y * cs + cs / 2;
          k === 0 ? ctx!.moveTo(px, py) : ctx!.lineTo(px, py);
        }
        ctx!.stroke();
      }

      // the agent, one move at a time
      if (st.phase >= 2) {
        const k = Math.min(st.walk, solved.path.length - 1);
        const [x, y] = solved.path[k];
        const px = ox + x * cs + cs / 2;
        const py = oy + y * cs + cs / 2;
        const r = Math.max(3.5, cs * 0.26);
        const g = ctx!.createRadialGradient(px - r * 0.35, py - r * 0.4, r * 0.1, px, py, r);
        g.addColorStop(0, "#f4ffb2");
        g.addColorStop(0.5, OPTIC);
        g.addColorStop(1, "#8fb015");
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(px, py, r, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function stat() {
      if (!statRef.current) return;
      const label =
        st.phase === 0
          ? `bfs expanding: ${st.i}/${solved.order.length} cells`
          : st.phase === 1
            ? `optimal path: ${solved.path.length} moves`
            : st.phase === 2
              ? `agent: move ${Math.min(st.walk, solved.path.length - 1) + 1}/${solved.path.length}`
              : `solved in ${solved.path.length} moves`;
      statRef.current.textContent = label;
    }

    function step() {
      st.tick++;
      if (st.phase === 0) {
        st.i += 3;
        if (st.i >= solved.order.length) (st.i = 0), (st.phase = 1);
      } else if (st.phase === 1) {
        st.i += 1;
        if (st.i >= solved.path.length) (st.phase = 2), (st.walk = 0), (st.tick = 0);
      } else if (st.phase === 2) {
        if (st.tick % 5 === 0) st.walk++;
        if (st.walk >= solved.path.length) (st.phase = 3), (st.tick = 0);
      } else if (st.tick > 90) {
        grid = buildMaze();
        solved = bfs(grid);
        st.phase = 0;
        st.i = 0;
        st.tick = 0;
        setRuns((r) => r + 1);
      }
      stat();
    }

    let raf = 0;
    let visible = true;
    function frame() {
      if (visible && !document.hidden && live) step();
      draw();
      raf = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    resize();
    if (!live) {
      // static: show the finished board
      st.phase = 3;
      st.i = solved.order.length;
      st.walk = solved.path.length - 1;
      draw();
      stat();
      return () => ro.disconnect();
    }
    draw();
    stat();
    const io = new IntersectionObserver((e) => e.forEach((x) => (visible = x.isIntersecting)), {
      threshold: 0.05,
    });
    io.observe(canvas);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [live]);

  return (
    <div className="flex flex-col">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="display text-lg uppercase text-chalk">Maze environment</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-chalk/40">
          winlab
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="h-[260px] w-full rounded-lg border border-chalk/12 bg-court-deep/70"
        aria-hidden
      />
      <p className="mt-3 font-mono text-[11px] text-ball" aria-live="polite">
        <span ref={statRef}>ready</span>
        <span className="text-chalk/35"> · maze {runs}</span>
      </p>
      <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-chalk/65">
        The environment my research runs on, live: a procedurally generated maze,
        BFS expanding to the optimal path (the ground truth I score against), then
        an agent stepping it one move at a time. The trained policy itself is a
        5-layer conv net in PyTorch, benchmarked over 1,000 of these.
      </p>
    </div>
  );
}

/* ---------------------------- monte carlo lab --------------------------- */

function MonteCarloLab({ live }: { live: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const N = 220;
    const STEPS = 200;
    const MU = 0.06;
    const SIG = 0.32;
    const DT = 1 / STEPS;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let s = new Float64Array(N).fill(1);
    let py = new Float64Array(N);
    let step = 0;
    let terminal: number[] = [];
    let hold = 0;
    let drawnCount = 0;

    // Box-Muller
    function gauss() {
      let u = 0;
      let v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    const LO = 0.35;
    const HI = 2.1;
    const plotW = () => W * 0.72;
    const yOf = (v: number) => H - ((v - LO) / (HI - LO)) * (H - 16) - 8;
    const xOf = (k: number) => (k / STEPS) * plotW();

    function resize() {
      const r = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      reset();
    }

    function reset() {
      s = new Float64Array(N).fill(1);
      for (let i = 0; i < N; i++) py[i] = yOf(1);
      step = 0;
      terminal = [];
      hold = 0;
      drawnCount = 0;
      base();
    }

    /** the static furniture: axes, spot line, histogram gutter */
    function base() {
      if (W <= 0) return;
      ctx!.clearRect(0, 0, W, H);
      ctx!.strokeStyle = "rgba(242,238,226,0.14)";
      ctx!.lineWidth = 1;
      ctx!.setLineDash([2, 6]);
      ctx!.beginPath();
      ctx!.moveTo(0, yOf(1));
      ctx!.lineTo(plotW(), yOf(1));
      ctx!.stroke();
      ctx!.setLineDash([]);
      ctx!.strokeStyle = "rgba(242,238,226,0.12)";
      ctx!.beginPath();
      ctx!.moveTo(plotW() + 6, 6);
      ctx!.lineTo(plotW() + 6, H - 6);
      ctx!.stroke();
    }

    function advance(steps: number) {
      for (let n = 0; n < steps && step < STEPS; n++) {
        const x0 = xOf(step);
        const x1 = xOf(step + 1);
        ctx!.lineWidth = 1;
        ctx!.strokeStyle = "rgba(200,241,53,0.055)";
        ctx!.beginPath();
        for (let i = 0; i < N; i++) {
          s[i] *= Math.exp((MU - (SIG * SIG) / 2) * DT + SIG * Math.sqrt(DT) * gauss());
          const y1 = yOf(s[i]);
          ctx!.moveTo(x0, py[i]);
          ctx!.lineTo(x1, y1);
          py[i] = y1;
        }
        ctx!.stroke();
        step++;
        drawnCount += N;
      }
      if (step >= STEPS && !terminal.length) {
        terminal = Array.from(s);
        drawHist();
      }
    }

    /** terminal distribution: what the paths actually built */
    function drawHist() {
      const BINS = 26;
      const counts = new Array(BINS).fill(0);
      for (const v of terminal) {
        const b = Math.floor(((v - LO) / (HI - LO)) * BINS);
        if (b >= 0 && b < BINS) counts[b]++;
      }
      const max = Math.max(1, ...counts);
      const gutter = W - plotW() - 14;
      const bh = (H - 12) / BINS;
      for (let b = 0; b < BINS; b++) {
        const w = (counts[b] / max) * gutter;
        const y = H - 6 - (b + 1) * bh;
        ctx!.fillStyle = "rgba(200,241,53,0.5)";
        ctx!.fillRect(plotW() + 10, y + 1, Math.max(0, w), Math.max(1, bh - 2));
      }
      // mean marker
      const mean = terminal.reduce((a, b) => a + b, 0) / terminal.length;
      ctx!.strokeStyle = "rgba(204,91,56,0.8)";
      ctx!.lineWidth = 1.5;
      ctx!.beginPath();
      ctx!.moveTo(plotW() + 8, yOf(mean));
      ctx!.lineTo(W - 4, yOf(mean));
      ctx!.stroke();
    }

    function stat() {
      if (!statRef.current) return;
      statRef.current.textContent = terminal.length
        ? `${N} paths complete · mean ${(terminal.reduce((a, b) => a + b, 0) / terminal.length).toFixed(3)}x spot`
        : `simulating: ${drawnCount.toLocaleString()} path-steps`;
    }

    let raf = 0;
    let visible = true;
    function frame() {
      if (visible && !document.hidden) {
        if (step < STEPS) advance(2);
        else if (++hold > 150) reset();
        stat();
      }
      raf = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    if (!live) {
      // static: draw the finished fan in one pass, no animation
      advance(STEPS);
      stat();
      return () => ro.disconnect();
    }
    stat();
    const io = new IntersectionObserver((e) => e.forEach((x) => (visible = x.isIntersecting)), {
      threshold: 0.05,
    });
    io.observe(canvas);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [live]);

  return (
    <div className="flex flex-col">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="display text-lg uppercase text-chalk">Monte Carlo engine</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-chalk/40">
          ai-sde
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="h-[260px] w-full rounded-lg border border-chalk/12 bg-court-deep/70"
        aria-hidden
      />
      <p className="mt-3 font-mono text-[11px] text-ball" aria-live="polite">
        <span ref={statRef}>ready</span>
      </p>
      <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-chalk/65">
        Real geometric Brownian motion, simulated in your browser: 220 price
        paths under 32% vol, and the terminal distribution they build on the
        right. My production engine swaps the constant vol for a learned model
        in PyTorch and runs 2,000+ paths per second.
      </p>
    </div>
  );
}

/* ------------------------------- section -------------------------------- */

export default function LiveLab() {
  const [live, setLive] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setLive(false);
  }, []);

  return (
    <section
      id="lab"
      className="relative bg-court-deep text-chalk"
      style={{ ["--sel" as string]: "#c8f135" }}
    >
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-10 lg:py-28">
        <SectionHead
          title="The Lab"
          caption="Two of these projects are not screenshots. They are the actual algorithms, running right now in your browser."
          index="05"
          meta="live compute"
          dark
        />

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <MazeLab live={live} />
          <MonteCarloLab live={live} />
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-chalk/12 pt-6">
          <button
            type="button"
            onClick={() => {
              resume();
              pop(0.35);
              setLive((v) => !v);
            }}
            aria-pressed={live}
            className="rounded-full border border-chalk/30 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-chalk/80 transition-colors hover:border-chalk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ball"
          >
            {live ? "pause both" : "run both"}
          </button>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-chalk/35">
            no video, no gifs: every frame is computed live
          </p>
        </div>
      </div>
    </section>
  );
}
