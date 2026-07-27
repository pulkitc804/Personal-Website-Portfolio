"use client";

import { useEffect, useRef } from "react";
import { pop, resume } from "@/lib/sound";

/**
 * The pickleball NET as an interactive spring-cloth. A mesh of strands hangs
 * from the tape; move the cursor and the net bulges and ripples around it
 * (neighbor-coupled springs), click to pluck a wave through it. The optic ball
 * rallies along the tape and dips it as it passes. Calm at rest, alive on touch.
 * Full reduced-motion fallback (a still, drawn net).
 */
const OPTIC = "#c8f135";

export default function HeroNet({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let dpr = 1;

    const COLS = 46;
    const ROWS = 9;
    type N = { x: number; y: number; ox: number; oy: number; vx: number; vy: number; pin: boolean };
    let nodes: N[][] = [];
    let topY = 0;
    let botY = 0;

    function buildMesh() {
      nodes = [];
      topY = H * 0.42;
      botY = H * 0.82;
      for (let r = 0; r < ROWS; r++) {
        const row: N[] = [];
        const sag = 8 * Math.sin(0); // placeholder
        for (let c = 0; c < COLS; c++) {
          const fx = c / (COLS - 1);
          // tape dips slightly at center (real net: 34" center / 36" posts)
          const tape = topY + Math.sin(fx * Math.PI) * 10;
          const y = tape + ((botY - tape) * r) / (ROWS - 1);
          const x = fx * W;
          const pin = r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1;
          row.push({ x, y, ox: x, oy: y, vx: 0, vy: 0, pin });
          void sag;
        }
        nodes.push(row);
      }
    }

    function resize() {
      const r = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildMesh();
    }
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const m = { x: -999, y: -999, on: false, px: -999, py: -999 };
    const onMove = (e: PointerEvent) => {
      const r = canvas!.getBoundingClientRect();
      m.x = e.clientX - r.left;
      m.y = e.clientY - r.top;
      m.on = true;
    };
    const onLeave = () => (m.on = false);
    const onDown = (e: PointerEvent) => {
      resume();
      pop(0.5);
      // pluck: impulse on nearby nodes
      const r = canvas!.getBoundingClientRect();
      const cx = e.clientX - r.left;
      const cy = e.clientY - r.top;
      for (const row of nodes)
        for (const n of row) {
          if (n.pin) continue;
          const d = Math.hypot(n.x - cx, n.y - cy);
          if (d < 150) {
            const f = (1 - d / 150) * 9;
            const a = Math.atan2(n.y - cy, n.x - cx);
            n.vx += Math.cos(a) * f;
            n.vy += Math.sin(a) * f;
          }
        }
    };
    window.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerleave", onLeave);

    // ball state (rides the tape)
    let bc = 0.1; // 0..1 across
    let phase = 0;
    let raf = 0;
    let last = performance.now();

    function step() {
      const K_ANCHOR = 0.012;
      const K_LINK = 0.16;
      const DAMP = 0.9;
      const R = 130;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const n = nodes[r][c];
          if (n.pin) continue;
          let fx = (n.ox - n.x) * K_ANCHOR;
          let fy = (n.oy - n.y) * K_ANCHOR;
          // neighbor coupling (follow neighbors' displacement)
          const nb = [nodes[r - 1]?.[c], nodes[r + 1]?.[c], nodes[r][c - 1], nodes[r][c + 1]];
          for (const o of nb) {
            if (!o) continue;
            fx += (o.x - o.ox - (n.x - n.ox)) * K_LINK;
            fy += (o.y - o.oy - (n.y - n.oy)) * K_LINK;
          }
          // cursor bulge (push the net away from the cursor)
          if (m.on) {
            const dx = n.x - m.x;
            const dy = n.y - m.y;
            const d = Math.hypot(dx, dy) || 1;
            if (d < R) {
              const push = (1 - d / R) * 2.6;
              fx += (dx / d) * push;
              fy += (dy / d) * push;
            }
          }
          n.vx = (n.vx + fx) * DAMP;
          n.vy = (n.vy + fy) * DAMP;
          n.x += n.vx;
          n.y += n.vy;
        }
      }
      m.px = m.x;
      m.py = m.y;
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);

      // net mesh
      ctx!.lineWidth = 1;
      ctx!.strokeStyle = "rgba(242,238,226,0.13)";
      ctx!.beginPath();
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const n = nodes[r][c];
          if (c < COLS - 1) {
            const right = nodes[r][c + 1];
            ctx!.moveTo(n.x, n.y);
            ctx!.lineTo(right.x, right.y);
          }
          if (r < ROWS - 1) {
            const down = nodes[r + 1][c];
            ctx!.moveTo(n.x, n.y);
            ctx!.lineTo(down.x, down.y);
          }
        }
      }
      ctx!.stroke();

      // tape (top row) — the bright band
      ctx!.lineWidth = 3;
      ctx!.strokeStyle = "rgba(242,238,226,0.85)";
      ctx!.beginPath();
      for (let c = 0; c < COLS; c++) {
        const n = nodes[0][c];
        c === 0 ? ctx!.moveTo(n.x, n.y) : ctx!.lineTo(n.x, n.y);
      }
      ctx!.stroke();
      // a thin clay accent just under the tape
      ctx!.lineWidth = 1.5;
      ctx!.strokeStyle = "rgba(204,91,56,0.5)";
      ctx!.beginPath();
      for (let c = 0; c < COLS; c++) {
        const n = nodes[1][c];
        c === 0 ? ctx!.moveTo(n.x, n.y) : ctx!.lineTo(n.x, n.y);
      }
      ctx!.stroke();

      // posts
      ctx!.fillStyle = "#0a2b29";
      [0, COLS - 1].forEach((c) => {
        const t = nodes[0][c];
        const b = nodes[ROWS - 1][c];
        ctx!.fillRect(t.x - 3, t.y - 6, 6, b.y - t.y + 6);
      });

      // ball on the tape
      const fc = bc * (COLS - 1);
      const ci = Math.min(COLS - 2, Math.floor(fc));
      const t = fc - ci;
      const a = nodes[0][ci];
      const b = nodes[0][ci + 1];
      const bx = a.x + (b.x - a.x) * t;
      const by = a.y + (b.y - a.y) * t - 11; // sit on top of the tape
      // shadow on the net
      ctx!.fillStyle = "rgba(0,0,0,0.25)";
      ctx!.beginPath();
      ctx!.ellipse(bx, by + 12, 13, 4, 0, 0, Math.PI * 2);
      ctx!.fill();
      const rg = ctx!.createRadialGradient(bx - 4, by - 4, 1, bx, by, 14);
      rg.addColorStop(0, "#eaff86");
      rg.addColorStop(0.5, OPTIC);
      rg.addColorStop(1, "#98c01a");
      ctx!.fillStyle = rg;
      ctx!.beginPath();
      ctx!.arc(bx, by, 11, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.fillStyle = "rgba(11,68,70,0.5)";
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2 + phase * 3;
        ctx!.beginPath();
        ctx!.arc(bx + Math.cos(ang) * 4.5, by + Math.sin(ang) * 4.5, 1.3, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.fillStyle = "rgba(255,255,255,0.45)";
      ctx!.beginPath();
      ctx!.ellipse(bx - 3.5, by - 3.8, 3, 2, -0.6, 0, Math.PI * 2);
      ctx!.fill();
    }

    function frame(now: number) {
      const dt = Math.min((now - last) / 16.67, 2);
      last = now;
      if (!reduce) {
        for (let i = 0; i < Math.ceil(dt); i++) step();
        bc += 0.0016 * dt;
        if (bc > 1.05) bc = -0.05;
        phase += 0.05 * dt;
      }
      draw();
      raf = requestAnimationFrame(frame);
    }
    draw();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden />;
}
