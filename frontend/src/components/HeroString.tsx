"use client";

import { useEffect, useRef } from "react";
import { pop, resume } from "@/lib/sound";

/**
 * The cord, simulated rather than drawn. Instead of evaluating sin(kx - wt)
 * each frame, this integrates the 1D wave equation
 *
 *     d2y/dt2 = c^2 * d2y/dx2
 *
 * on a fixed-end string by finite differences, so what you put into the cord
 * behaves properly: a pluck launches two pulses that travel out, reflect off
 * the posts, and die away. The cursor presses it like a finger, a click plucks
 * it, and scrolling pulls it taut into the ribbon's rule.
 *
 * The resting motion is deliberately NOT simulated. Driving the string every
 * frame made reflections pile up and the line read as noise; the idle swell is
 * analytic (see idleY) so it stays calm no matter how long the page sits open,
 * and the simulation only ever carries what a visitor adds, then decays to nil.
 *
 * Stability: the Courant number C = c*dt/dx must satisfy C <= 1. C^2 = 0.28
 * here, comfortably inside the limit.
 */
const OPTIC = "#c8f135";
const N = 240; // nodes along the cord
const C2 = 0.28; // Courant^2, stability requires <= 1
/**
 * Damping is the difference between a cord and a mess. At 0.9985 the string
 * kept roughly 84% of its energy each second, so reflections off the two
 * fixed ends piled up faster than they died and the line turned to noise.
 * At 0.9905 a pluck falls to about a third within a second and is gone
 * within three, which is what a real net cord does.
 */
const DAMP = 0.9905;

export default function HeroString({ className = "" }: { className?: string }) {
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
    let ruleY = 0;

    // string state: displacement now and one step ago
    const y = new Float64Array(N);
    const yPrev = new Float64Array(N);
    const yNext = new Float64Array(N);

    const s = {
      t: 0,
      bx: 0.12, // ball position, 0..1
      roll: 0,
      p: 0, // scroll tension
      mx: -9999,
      my: -9999,
      on: false,
      pressing: false,
    };

    function resize() {
      const r = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const rule = document.querySelector("[data-net-rule]");
      ruleY = rule ? rule.getBoundingClientRect().top - r.top : H * 0.9;
    }

    const smooth = (a: number, b: number, v: number) => {
      const t = Math.max(0, Math.min(1, (v - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };
    /** rest height of the cord, dropping to the ribbon rule as you scroll out */
    const baseY = () => H * 0.775 + (ruleY - H * 0.775) * smooth(0.25, 1, s.p);
    /** displacement scale, dying late in the scroll so the cord pulls taut */
    const amp = () => (1 - smooth(0.35, 1, s.p)) * Math.min(1.6, Math.max(1, H / 620));

    const xOf = (i: number) => (i / (N - 1)) * W;
    const iOf = (px: number) => Math.round((px / Math.max(W, 1)) * (N - 1));

    /**
     * The resting shape: one slow, shallow travelling swell, tapered to zero
     * at the posts so it meets the fixed ends cleanly. This is what the cord
     * looks like when nobody is touching it, and being analytic it can never
     * build up the way the simulation could.
     */
    function idleY(px: number) {
      const f = px / Math.max(W, 1);
      const taper = Math.sin(Math.PI * f); // 0 at both posts, 1 at centre
      return (
        taper *
        (Math.sin(f * Math.PI * 2 * 1.6 - s.t * 0.011) * 9 +
          Math.sin(f * Math.PI * 2 * 2.7 - s.t * 0.007) * 3)
      );
    }

    /** integrate one step of the wave equation, ends pinned to the posts */
    function step() {
      for (let i = 1; i < N - 1; i++) {
        yNext[i] =
          (2 * y[i] - yPrev[i] + C2 * (y[i + 1] - 2 * y[i] + y[i - 1])) * DAMP;
      }
      yNext[0] = 0;
      yNext[N - 1] = 0;

      // No driver. The simulation carries only what you put into it, and
      // decays back to nothing; the calm idle motion is the analytic swell
      // in idleY(), which cannot accumulate.

      // the cursor presses the cord like a finger holding a string
      if (s.on && s.pressing) {
        const ci = iOf(s.mx);
        const target = s.my - baseY();
        for (let d = -14; d <= 14; d++) {
          const i = ci + d;
          if (i <= 0 || i >= N - 1) continue;
          const w = Math.exp(-(d * d) / 60);
          yNext[i] += (Math.max(-70, Math.min(70, target)) - yNext[i]) * w * 0.5;
        }
      }

      yPrev.set(y);
      y.set(yNext);
      s.t += 1;
    }

    /** a pluck: displace a neighbourhood and let go, so two pulses travel out */
    function pluck(px: number, strength = 26) {
      const ci = iOf(px);
      for (let d = -18; d <= 18; d++) {
        const i = ci + d;
        if (i <= 0 || i >= N - 1) continue;
        const w = Math.exp(-(d * d) / 90);
        y[i] += strength * w;
        yPrev[i] += strength * w * 0.6; // slight lag gives the pulse direction
      }
    }

    // ---- input ----
    const onMove = (e: PointerEvent) => {
      const r = canvas!.getBoundingClientRect();
      s.mx = e.clientX - r.left;
      s.my = e.clientY - r.top;
      s.on = s.my > 0 && s.my < H;
      // only "hold" the cord when the pointer is near it
      s.pressing = s.on && Math.abs(s.my - baseY()) < 90;
    };
    const onLeave = () => {
      s.on = false;
      s.pressing = false;
    };
    const onDown = (e: PointerEvent) => {
      const r = canvas!.getBoundingClientRect();
      const x = e.clientX - r.left;
      const yy = e.clientY - r.top;
      if (x < 0 || x > W || yy < 0 || yy > H) return;
      resume();
      pop(0.5);
      pluck(x, Math.abs(yy - baseY()) < 120 ? 20 : 11);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerleave", onLeave);

    // ---- ball ----
    function ballY(px: number) {
      const f = (px / Math.max(W, 1)) * (N - 1);
      const i = Math.max(0, Math.min(N - 2, Math.floor(f)));
      const t = f - i;
      const sim = y[i] + (y[i + 1] - y[i]) * t;
      return baseY() + (idleY(px) + sim) * amp();
    }

    function drawBall(bx: number, by: number) {
      const r = 12;
      const g = ctx!.createRadialGradient(bx - r * 0.35, by - r * 0.4, r * 0.1, bx, by, r * 1.05);
      g.addColorStop(0, "#f4ffb2");
      g.addColorStop(0.45, OPTIC);
      g.addColorStop(1, "#8fb015");
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(bx, by, r, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.fillStyle = "rgba(46,64,8,0.7)";
      const spin = s.roll / r;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + spin;
        ctx!.beginPath();
        ctx!.arc(bx + Math.cos(a) * 5, by + Math.sin(a) * 5, 1.4, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.fillStyle = "rgba(255,255,255,0.6)";
      ctx!.beginPath();
      ctx!.ellipse(bx - r * 0.32, by - r * 0.36, r * 0.16, r * 0.1, -0.6, 0, Math.PI * 2);
      ctx!.fill();
    }

    function draw() {
      if (W <= 0) return;
      ctx!.clearRect(0, 0, W, H);
      const A = amp();
      const b = baseY();

      // the cord
      ctx!.strokeStyle = "rgba(242,238,226,0.72)";
      ctx!.lineWidth = W < 640 ? 2 : 2.6;
      ctx!.lineCap = "round";
      ctx!.lineJoin = "round";
      ctx!.beginPath();
      for (let i = 0; i < N; i++) {
        const px = xOf(i);
        const py = b + (idleY(px) + y[i]) * A;
        i === 0 ? ctx!.moveTo(px, py) : ctx!.lineTo(px, py);
      }
      ctx!.stroke();

      // posts: the fixed ends the pulses reflect off
      ctx!.strokeStyle = "rgba(242,238,226,0.3)";
      ctx!.lineWidth = 1.5;
      [0, W].forEach((px) => {
        ctx!.beginPath();
        ctx!.moveTo(px === 0 ? 1 : px - 1, b - 13);
        ctx!.lineTo(px === 0 ? 1 : px - 1, b + 13);
        ctx!.stroke();
      });

      const bx = s.bx * W;
      drawBall(bx, ballY(bx) - 13);
    }

    let raf = 0;
    let visible = true;
    let lastScroll = window.scrollY;
    function frame() {
      if (visible && !document.hidden) {
        const sy = window.scrollY;
        s.p = Math.max(0, Math.min(1, sy / (H * 0.85 || 1)));
        lastScroll = sy;

        step();
        step(); // two substeps: smoother travel at 60fps
        s.bx += 0.0016;
        s.roll += W * 0.0016;
        if (s.bx > 1.04) s.bx = -0.04;
        draw();
      }
      raf = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    resize();

    if (reduce) {
      // a still cord with one settled bow, drawn once
      pluck(W * 0.5, 14);
      for (let k = 0; k < 40; k++) step();
      draw();
      const onScroll = () => {
        s.p = Math.max(0, Math.min(1, window.scrollY / (H * 0.85 || 1)));
        draw();
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        ro.disconnect();
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("scroll", onScroll);
        canvas.removeEventListener("pointerdown", onDown);
        canvas.removeEventListener("pointerleave", onLeave);
      };
    }

    draw();
    const io = new IntersectionObserver((e) => e.forEach((x) => (visible = x.isIntersecting)), {
      threshold: 0.01,
    });
    io.observe(canvas);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden />;
}
