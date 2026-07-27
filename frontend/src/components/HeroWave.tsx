"use client";

import { useEffect, useRef } from "react";
import { pop, resume } from "@/lib/sound";

/**
 * The signature motion as the front door: an optic ball perpetually rallies
 * along a chalk sine wave. The wave swells toward your cursor (the ball rides
 * the bump), and a click sends a pulse ringing down the line. Calm, not a game,
 * but alive and yours to nudge. Full reduced-motion fallback (static wave).
 */
export default function HeroWave({ className = "" }: { className?: string }) {
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
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const s = {
      phase: 0,
      bx: 0.1,
      mouseX: -1,
      mouseOn: false,
      pulse: 0,
      trail: [] as { x: number; y: number }[],
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas!.getBoundingClientRect();
      s.mouseX = e.clientX - r.left;
      s.mouseOn = e.clientY - r.top > 0 && e.clientY - r.top < H;
    };
    const onLeave = () => (s.mouseOn = false);
    const onDown = () => {
      resume();
      s.pulse = 1;
      pop(0.55);
    };
    window.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerleave", onLeave);

    const midY = () => H * 0.56;
    const A = () => Math.min(H * 0.16, 86);
    const K = () => (Math.PI * 2 * 2.4) / Math.max(W, 1); // ~2.4 waves across

    function waveY(x: number) {
      const base = midY() + A() * Math.sin(x * K() + s.phase);
      let bump = 0;
      if (s.mouseOn && s.mouseX >= 0) {
        const sigma = Math.max(W * 0.1, 80);
        const g = Math.exp(-((x - s.mouseX) ** 2) / (2 * sigma * sigma));
        bump = -g * A() * 1.15; // swell up toward the cursor
      }
      const ring = s.pulse * A() * 0.7 * Math.sin(x * K() * 2 - s.phase * 2);
      return base + bump + ring;
    }

    let raf = 0;
    let last = performance.now();
    function frame(now: number) {
      const dt = Math.min((now - last) / 16.67, 2.2);
      last = now;
      if (!reduce) {
        s.phase += 0.012 * dt;
        s.bx += 0.0016 * dt;
        if (s.bx > 1.08) s.bx = -0.08;
        s.pulse *= Math.pow(0.94, dt);
      }
      draw();
      raf = requestAnimationFrame(frame);
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);

      // baseline (a faint court line)
      ctx!.strokeStyle = "rgba(242,238,226,0.08)";
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.moveTo(0, midY() + A() + 26);
      ctx!.lineTo(W, midY() + A() + 26);
      ctx!.stroke();

      // the wave (chalk, dashed — the rally trajectory)
      ctx!.strokeStyle = "rgba(242,238,226,0.5)";
      ctx!.lineWidth = 2;
      ctx!.setLineDash([2, 9]);
      ctx!.beginPath();
      for (let x = 0; x <= W; x += 6) {
        const y = waveY(x);
        x === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
      }
      ctx!.stroke();
      ctx!.setLineDash([]);

      // ball on the wave
      const bxPx = s.bx * W;
      const by = waveY(bxPx);
      const baseY = midY() + A() + 26;
      // shadow on the baseline
      const h = clamp((baseY - by) / (A() * 2 + 26), 0, 1);
      ctx!.fillStyle = `rgba(0,0,0,${0.26 - h * 0.14})`;
      ctx!.beginPath();
      ctx!.ellipse(bxPx, baseY, 16 - h * 5, 5, 0, 0, Math.PI * 2);
      ctx!.fill();
      // trail
      s.trail.push({ x: bxPx, y: by });
      if (s.trail.length > 14) s.trail.shift();
      s.trail.forEach((t, i) => {
        const a = i / s.trail.length;
        ctx!.fillStyle = `rgba(200,241,53,${a * 0.18})`;
        ctx!.beginPath();
        ctx!.arc(t.x, t.y, a * 8, 0, Math.PI * 2);
        ctx!.fill();
      });
      // ball
      const r = 12;
      const g = ctx!.createRadialGradient(bxPx - r * 0.3, by - r * 0.3, r * 0.1, bxPx, by, r * 1.1);
      g.addColorStop(0, "#eaff86");
      g.addColorStop(0.45, "#cdf03e");
      g.addColorStop(1, "#98c01a");
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(bxPx, by, r, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.fillStyle = "rgba(11,68,70,0.5)";
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + s.phase * 3;
        ctx!.beginPath();
        ctx!.arc(bxPx + Math.cos(a) * 5, by + Math.sin(a) * 5, 1.4, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.fillStyle = "rgba(255,255,255,0.45)";
      ctx!.beginPath();
      ctx!.ellipse(bxPx - r * 0.32, by - r * 0.34, r * 0.26, r * 0.17, -0.6, 0, Math.PI * 2);
      ctx!.fill();
    }

    function clamp(v: number, a: number, b: number) {
      return Math.max(a, Math.min(b, v));
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
