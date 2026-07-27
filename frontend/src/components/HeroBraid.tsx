"use client";

import { useEffect, useRef } from "react";
import { pop, resume } from "@/lib/sound";

/**
 * The rally braid: two mirrored standing waves (chalk + clay) crossing at
 * fixed nodes — a perfectly symmetric figure across the hero's lower band.
 * The optic ball rides the chalk wave left-to-right while a dim clay echo
 * rides the mirror right-to-left; they meet at center every cycle. The
 * envelope swells toward your cursor (the beloved sine-wave move), and a
 * click fires a soliton pulse that travels outward along the braid + pop.
 * Reduced-motion: the braid drawn still, balls resting at the center node.
 */
const OPTIC = "#c8f135";

export default function HeroBraid({ className = "" }: { className?: string }) {
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

    function resize() {
      const r = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // ---- interaction state ----
    const m = { x: -9999, y: -9999, on: false };
    const onMove = (e: PointerEvent) => {
      const r = canvas!.getBoundingClientRect();
      m.x = e.clientX - r.left;
      m.y = e.clientY - r.top;
      m.on = m.y >= 0 && m.y <= r.height;
    };
    const onLeave = () => (m.on = false);

    // solitons: gaussian bumps racing outward from a click
    type Pulse = { x0: number; born: number; dir: 1 | -1 };
    const pulses: Pulse[] = [];
    let simT = 0; // simulation clock (only advances when animating)
    const onDown = (e: PointerEvent) => {
      const r = canvas!.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < 0 || x > r.width || y < 0 || y > r.height) return;
      // only when clicking near the braid band, so buttons elsewhere don't fire it
      if (Math.abs(y - yc()) > H * 0.22) return;
      pulses.push({ x0: x, born: simT, dir: 1 }, { x0: x, born: simT, dir: -1 });
      if (pulses.length > 10) pulses.splice(0, pulses.length - 10);
      resume();
      pop(0.45);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerleave", onLeave);

    // ---- wave math ----
    const yc = () => H * 0.76; // braid axis, in the clear band under the copy
    const LAMBDA = 3; // wavelengths across the width (odd → antinode at center)

    function envelope(x: number): number {
      const base = H * 0.052;
      // gentle breath
      let A = base * (1 + 0.12 * Math.sin(simT * 0.011));
      // cursor swell — the move everyone loved, scaled by vertical nearness
      if (m.on) {
        const vy = Math.max(0, 1 - Math.abs(m.y - yc()) / (H * 0.34));
        const dx = x - m.x;
        A += H * 0.055 * vy * Math.exp(-(dx * dx) / (2 * 120 * 120));
      }
      // solitons: traveling gaussians, decaying
      for (const p of pulses) {
        const age = simT - p.born;
        const cx = p.x0 + p.dir * age * 5.2;
        const dx = x - cx;
        A += H * 0.06 * Math.exp(-age / 90) * Math.exp(-(dx * dx) / (2 * 70 * 70));
      }
      return A;
    }

    // standing wave: sin(kx) spatial, cos(wt) temporal — nodes stay fixed
    function waveY(x: number, sign: 1 | -1, tphase: number): number {
      const k = (Math.PI * 2 * LAMBDA) / Math.max(W, 1);
      return yc() + sign * envelope(x) * Math.sin(k * x) * tphase;
    }

    // ---- drawing ----
    let phase = 0; // ball spin
    function drawBall(bx: number, by: number, r: number, dim: boolean) {
      const rg = ctx!.createRadialGradient(bx - r * 0.3, by - r * 0.3, 1, bx, by, r * 1.25);
      if (dim) {
        rg.addColorStop(0, "rgba(224,124,88,0.9)");
        rg.addColorStop(0.6, "rgba(204,91,56,0.85)");
        rg.addColorStop(1, "rgba(150,60,34,0.85)");
      } else {
        rg.addColorStop(0, "#eaff86");
        rg.addColorStop(0.5, OPTIC);
        rg.addColorStop(1, "#98c01a");
      }
      ctx!.fillStyle = rg;
      ctx!.beginPath();
      ctx!.arc(bx, by, r, 0, Math.PI * 2);
      ctx!.fill();
      // drilled holes
      ctx!.fillStyle = dim ? "rgba(30,12,6,0.4)" : "rgba(11,68,70,0.5)";
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2 + phase * (dim ? -2 : 2.4);
        ctx!.beginPath();
        ctx!.arc(bx + Math.cos(ang) * r * 0.42, by + Math.sin(ang) * r * 0.42, r * 0.12, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.fillStyle = dim ? "rgba(255,235,220,0.3)" : "rgba(255,255,255,0.5)";
      ctx!.beginPath();
      ctx!.ellipse(bx - r * 0.3, by - r * 0.33, r * 0.27, r * 0.18, -0.6, 0, Math.PI * 2);
      ctx!.fill();
    }

    let bt = 0.18; // ball position 0..1 across
    function draw() {
      ctx!.clearRect(0, 0, W, H);
      if (W <= 0) return;
      const tphase = reduce ? 1 : Math.cos(simT * 0.032);
      const k = (Math.PI * 2 * LAMBDA) / W;

      // braid ribbon: faint fill between the two curves
      ctx!.beginPath();
      for (let x = 0; x <= W; x += 6) ctx!.lineTo(x, waveY(x, 1, tphase));
      for (let x = W; x >= 0; x -= 6) ctx!.lineTo(x, waveY(x, -1, tphase));
      ctx!.closePath();
      ctx!.fillStyle = "rgba(242,238,226,0.028)";
      ctx!.fill();

      // chalk wave
      ctx!.lineWidth = 1.6;
      ctx!.strokeStyle = "rgba(242,238,226,0.55)";
      ctx!.beginPath();
      for (let x = 0; x <= W; x += 4) {
        const y = waveY(x, 1, tphase);
        x === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
      }
      ctx!.stroke();

      // clay mirror
      ctx!.strokeStyle = "rgba(204,91,56,0.45)";
      ctx!.beginPath();
      for (let x = 0; x <= W; x += 4) {
        const y = waveY(x, -1, tphase);
        x === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
      }
      ctx!.stroke();

      // fixed nodes — where the braid crosses, like stitches on a net cord
      ctx!.fillStyle = "rgba(242,238,226,0.5)";
      for (let n = 0; n <= LAMBDA * 2; n++) {
        const x = (n * Math.PI) / k;
        if (x < -1 || x > W + 1) continue;
        ctx!.beginPath();
        ctx!.arc(x, yc(), 2, 0, Math.PI * 2);
        ctx!.fill();
      }

      // the rally: optic ball on the chalk wave, clay echo mirrored opposite
      const bx = bt * W;
      const by = waveY(bx, 1, tphase) - 13;
      const ex = W - bx;
      const ey = waveY(ex, -1, tphase) + 13;
      drawBall(ex, ey, 9, true);
      drawBall(bx, by, 12, false);
    }

    function frame() {
      simT += 1;
      bt += 0.0021;
      if (bt > 1.04) bt = -0.04;
      phase += 0.045;
      // retire dead pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        if (simT - pulses[i].born > 400) pulses.splice(i, 1);
      }
      draw();
      raf = requestAnimationFrame(frame);
    }

    let raf = 0;
    // seed + synchronous first paint; RO repaints on real width (resize clears)
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    resize();
    if (reduce) {
      bt = 0.5; // resting at the center antinode, both balls meeting
      draw();
    } else {
      draw();
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden />;
}
