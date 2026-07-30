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
        <h3 className="display text-lg uppercase text-chalk">Maze Policy Network</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-chalk/40">
          winlab · conv policy
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="h-[260px] w-full rounded-lg border border-chalk/12 bg-white/[0.03]"
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
        <h3 className="display text-lg uppercase text-chalk">AI-SDE Engine</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-chalk/40">
          quant · monte carlo
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="h-[260px] w-full rounded-lg border border-chalk/12 bg-white/[0.03]"
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

/* ----------------------------- scarletai lab ---------------------------- */

/**
 * The retrieval half of ScarletAI, running for real. Ask a question and this
 * scores it against every passage with TF-IDF cosine similarity, computed in
 * the browser, and shows the ranking it produces. That is the step that stops
 * the assistant guessing: the model only ever writes from what comes back.
 *
 * The passages below are a small SAMPLE corpus, labelled as such, kept to
 * general facts about the university. The production index is built from
 * official Rutgers pages and embedded with Gemini or Ollama into a vector
 * store; TF-IDF is the honest offline stand-in for that similarity search.
 */
const CORPUS: { topic: string; text: string }[] = [
  {
    topic: "Buses",
    text: "Rutgers New Brunswick runs a campus bus system connecting its campuses, and riders track routes and arrival times through the university transit app.",
  },
  {
    topic: "Campuses",
    text: "Rutgers New Brunswick is spread across several campuses including College Avenue, Busch, Livingston, Cook and Douglass, which is why getting between classes usually means a bus.",
  },
  {
    topic: "Dining",
    text: "The university operates dining halls across the campuses along with retail food locations, and meal plans are what most students use to eat on campus.",
  },
  {
    topic: "Majors",
    text: "Undergraduates choose from a wide range of majors across schools such as Arts and Sciences and the School of Engineering, and declaring a major has its own requirements and deadlines.",
  },
  {
    topic: "Schedule of Classes",
    text: "The Schedule of Classes lists course sections, meeting times, instructors and open seats for each term, and students use it to plan and register for courses.",
  },
  {
    topic: "Academic calendar",
    text: "The academic calendar sets the start and end of each term along with registration windows, breaks, reading days and final exam periods.",
  },
  {
    topic: "Libraries",
    text: "Rutgers libraries provide study space, research databases and course reserves, with separate library buildings serving different campuses.",
  },
  {
    topic: "Advising",
    text: "Academic advising helps students pick courses, track degree requirements and stay on plan toward graduation.",
  },
];

const tokenize = (s: string): string[] => s.toLowerCase().match(/[a-z0-9]+/g) ?? [];

/* index built once at module scope: document frequency, then a tf-idf vector
   per passage. Deterministic, so server and client agree. */
const DOC_TOKENS = CORPUS.map((d) => tokenize(`${d.topic} ${d.text}`));
const DF = new Map<string, number>();
for (const toks of DOC_TOKENS) {
  // Array.from keeps this valid under the project's compile target
  Array.from(new Set(toks)).forEach((t) => DF.set(t, (DF.get(t) ?? 0) + 1));
}
const idf = (t: string) => Math.log((CORPUS.length + 1) / ((DF.get(t) ?? 0) + 1)) + 1;

function tfidf(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  const v = new Map<string, number>();
  tf.forEach((count, t) => v.set(t, (count / Math.max(1, tokens.length)) * idf(t)));
  return v;
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  a.forEach((va, t) => {
    na += va * va;
    const vb = b.get(t);
    if (vb) dot += va * vb;
  });
  b.forEach((vb) => (nb += vb * vb));
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d === 0 ? 0 : dot / d;
}

const DOC_VECS = DOC_TOKENS.map(tfidf);

const SAMPLE_QUESTIONS = [
  "how do I get between campuses",
  "where can I eat on campus",
  "when does registration open",
  "how do I find open seats in a course",
];

function ScarletLab() {
  const [query, setQuery] = useState(SAMPLE_QUESTIONS[0]);

  const ranked = (() => {
    const qv = tfidf(tokenize(query));
    return CORPUS.map((d, i) => ({ ...d, score: cosine(qv, DOC_VECS[i]) })).sort(
      (a, b) => b.score - a.score,
    );
  })();
  const top = ranked[0];
  const grounded = top.score > 0.01;

  /* ----- the constellation: passages arced over the query, wired by score.
     Every line's weight and brightness is the real cosine similarity, so the
     picture IS the algorithm. Coordinates are rounded for SSR stability. ----- */
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const QX = 280;
  const QY = 252;
  const nodes = CORPUS.map((d, i) => {
    const t = CORPUS.length === 1 ? 0.5 : i / (CORPUS.length - 1);
    const a = Math.PI * (1 - t); // 180deg .. 0deg
    return {
      topic: d.topic,
      x: r2(QX + Math.cos(a) * 236),
      y: r2(QY - Math.sin(a) * 168),
    };
  });
  const scoreOf = (topic: string) => ranked.find((r) => r.topic === topic)!.score;
  const isTop = (topic: string) => grounded && top.topic === topic;

  return (
    <div className="flex flex-col">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="display text-lg uppercase text-chalk">ScarletAI</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-chalk/40">
          rutgers agent · rag
        </span>
      </div>

      <div className="rounded-lg border border-chalk/12 bg-white/[0.03] p-4 lg:p-6">
        {/* ask */}
        <label className="block">
          <span className="sr-only">Ask the sample corpus a question</span>
          <div className="flex items-center gap-2 border-b border-chalk/15 pb-2 focus-within:border-ball">
            <span aria-hidden className="font-mono text-[13px] text-ball">
              ?
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ask about campus"
              className="w-full bg-transparent font-mono text-[13px] text-chalk caret-ball outline-none placeholder:text-chalk/30"
            />
          </div>
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                resume();
                pop(0.22);
                setQuery(q);
              }}
              className={`rounded-full border px-3 py-1 font-mono text-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ball ${
                query === q
                  ? "border-ball/60 bg-ball/10 text-ball"
                  : "border-chalk/20 text-chalk/60 hover:border-chalk/50 hover:text-chalk"
              }`}
            >
              {q}
            </button>
          ))}
        </div>

        {/* the constellation */}
        <svg
          viewBox="0 0 560 290"
          className="mt-2 block h-auto w-full select-none"
          role="img"
          aria-label="Retrieval graph: the question at the base, corpus passages arced above it, each connection weighted by its live similarity score"
        >
          {/* wires, weighted by the real score */}
          {nodes.map((n) => {
            const s = scoreOf(n.topic);
            const hot = isTop(n.topic);
            return (
              <line
                key={`w-${n.topic}`}
                x1={QX}
                y1={QY}
                x2={n.x}
                y2={n.y}
                stroke={hot ? "#c8f135" : "#f2eee2"}
                strokeOpacity={r2(Math.min(0.85, (hot ? 0.5 : 0.08) + s * 1.6))}
                strokeWidth={r2(0.75 + Math.min(1, s * 2.2) * (hot ? 2.6 : 1.4))}
                className="transition-all duration-300"
              />
            );
          })}

          {/* passage nodes */}
          {nodes.map((n) => {
            const s = scoreOf(n.topic);
            const hot = isTop(n.topic);
            return (
              <g key={`n-${n.topic}`} className="transition-all duration-300">
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={r2(4 + Math.min(1, s * 2.2) * 5)}
                  fill={hot ? "#c8f135" : "#0e4f4c"}
                  stroke={hot ? "#c8f135" : "#f2eee2"}
                  strokeOpacity={hot ? 1 : 0.35}
                  strokeWidth={1.2}
                />
                <text
                  x={n.x}
                  y={n.y - 13}
                  textAnchor="middle"
                  fontSize={9.5}
                  letterSpacing={0.8}
                  fill={hot ? "#c8f135" : "#f2eee2"}
                  fillOpacity={hot ? 0.95 : 0.42}
                  className="font-mono uppercase transition-all duration-300"
                >
                  {n.topic}
                </text>
                {hot && (
                  <text
                    x={n.x}
                    y={n.y + 20}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#c8f135"
                    fillOpacity={0.8}
                    className="font-mono"
                  >
                    {s.toFixed(3)}
                  </text>
                )}
              </g>
            );
          })}

          {/* the query node */}
          <circle cx={QX} cy={QY} r={7} fill="#c8f135" />
          <circle cx={QX} cy={QY} r={12} fill="none" stroke="#c8f135" strokeOpacity={0.35} strokeWidth={1} />
          <text
            x={QX}
            y={QY + 26}
            textAnchor="middle"
            fontSize={9.5}
            letterSpacing={1}
            fill="#f2eee2"
            fillOpacity={0.5}
            className="font-mono uppercase"
          >
            your question
          </text>
        </svg>

        {/* the answer */}
        <div
          aria-live="polite"
          className="mt-1 rounded-md border border-chalk/12 bg-[#04120f] p-4"
        >
          {grounded ? (
            <>
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-chalk/45">
                answer, grounded in
                <span className="rounded border border-ball/30 px-1.5 py-0.5 text-ball/80">
                  {top.topic}
                </span>
              </p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-chalk/85">
                {top.text}
              </p>
            </>
          ) : (
            <>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-clay">
                nothing retrieved
              </p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-chalk/70">
                Not in the corpus, so it declines instead of guessing. That
                refusal is the entire point of grounding.
              </p>
            </>
          )}
        </div>

        <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.12em] text-chalk/30">
          live tf-idf cosine over a labelled sample corpus · production: full
          Rutgers corpus, vector store, routed across Gemini · Groq · Ollama ·
          Anthropic
        </p>
      </div>
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
          caption="ScarletAI, the maze policy network and the AI-SDE engine are not screenshots here. These are the actual algorithms, running right now in your browser."
          index="04"
          meta="live compute"
          dark
        />

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <MazeLab live={live} />
          <MonteCarloLab live={live} />
          {/* retrieval spans both columns: it needs the width for prose */}
          <div className="lg:col-span-2">
            <ScarletLab />
          </div>
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
