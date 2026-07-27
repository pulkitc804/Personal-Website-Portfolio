"use client";

import { useEffect, useRef } from "react";
import { pop, resume } from "@/lib/sound";

/**
 * One ball, not a mesh. The optic ball drifts a calm figure-eight at rest; as
 * the cursor nears, it curves into orbit around you and trails a soft
 * long-exposure ribbon — a rally you draw together. A single faint kitchen line
 * grounds it as a court. Click drops one dink ripple. Calm untouched, playful
 * on approach. Reduced-motion: a still ball at rest over the line.
 */
const OPTIC = "#c8f135";

type Pt = { x: number; y: number };

export default function HeroRally({ className = "" }: { className?: string }) {
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
    // resizing clears the canvas; reseed once a real width arrives and repaint
    // immediately so a hidden tab (rAF throttled) or a layout settle never
    // leaves the hero blank or strands the ball in the corner.
    const ro = new ResizeObserver(() => {
      resize();
      if (!seeded && W > 0) seed();
      if (seeded) draw();
    });
    ro.observe(canvas);
    resize();

    // pointer
    const m = { x: -9999, y: -9999, on: false };
    const onMove = (e: PointerEvent) => {
      const r = canvas!.getBoundingClientRect();
      m.x = e.clientX - r.left;
      m.y = e.clientY - r.top;
      m.on = e.clientY - r.top >= 0 && e.clientY - r.top <= r.height;
    };
    const onLeave = () => (m.on = false);

    // ripples on click
    type Ring = { x: number; y: number; r: number; life: number };
    const rings: Ring[] = [];
    const onDown = (e: PointerEvent) => {
      const r = canvas!.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < 0 || x > r.width || y < 0 || y > r.height) return;
      rings.push({ x, y, r: 6, life: 1 });
      resume();
      pop(0.42);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerleave", onLeave);

    // ball physics
    const ball = { x: 0, y: 0, vx: 0, vy: 0 };
    let seeded = false;
    const trail: Pt[] = [];
    let t = 0;
    let orbit = 0;
    let raf = 0;
    let last = performance.now();
    let phase = 0;

    function idleTarget(): Pt {
      const cx = W * 0.66;
      const cy = H * 0.4;
      return {
        x: cx + Math.sin(t * 0.012) * W * 0.17,
        y: cy + Math.sin(t * 0.017 + 0.8) * H * 0.15,
      };
    }

    function seed() {
      const idle = idleTarget();
      ball.x = idle.x;
      ball.y = idle.y;
      ball.vx = 0;
      ball.vy = 0;
      trail.length = 0;
      trail.push({ x: ball.x, y: ball.y });
      seeded = true;
    }

    function step(dt: number) {
      if (W <= 0) return;
      t += dt;
      if (!seeded) seed();
      const idle = idleTarget();
      // blend idle drift with an orbit around the cursor by proximity
      let tx = idle.x;
      let ty = idle.y;
      if (m.on) {
        const dist = Math.hypot(m.x - ball.x, m.y - ball.y);
        const w = Math.max(0, Math.min(1, 1 - dist / 360));
        if (w > 0) {
          orbit += 0.06 * dt;
          const ox = m.x + Math.cos(orbit) * 66;
          const oy = m.y + Math.sin(orbit) * 66;
          tx = idle.x + (ox - idle.x) * w;
          ty = idle.y + (oy - idle.y) * w;
        }
      }
      // spring toward target with damping (the lag draws the ribbon)
      ball.vx = (ball.vx + (tx - ball.x) * 0.02) * 0.86;
      ball.vy = (ball.vy + (ty - ball.y) * 0.02) * 0.86;
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      phase += 0.04 * dt;

      trail.push({ x: ball.x, y: ball.y });
      if (trail.length > 38) trail.shift();

      for (let i = rings.length - 1; i >= 0; i--) {
        rings[i].r += 2.6 * dt;
        rings[i].life -= 0.018 * dt;
        if (rings[i].life <= 0) rings.splice(i, 1);
      }
    }

    function drawBall(bx: number, by: number) {
      const rg = ctx!.createRadialGradient(bx - 4, by - 4, 1, bx, by, 15);
      rg.addColorStop(0, "#eaff86");
      rg.addColorStop(0.5, OPTIC);
      rg.addColorStop(1, "#98c01a");
      ctx!.fillStyle = rg;
      ctx!.beginPath();
      ctx!.arc(bx, by, 12, 0, Math.PI * 2);
      ctx!.fill();
      // holes
      ctx!.fillStyle = "rgba(11,68,70,0.5)";
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2 + phase * 2.4;
        ctx!.beginPath();
        ctx!.arc(bx + Math.cos(ang) * 5, by + Math.sin(ang) * 5, 1.4, 0, Math.PI * 2);
        ctx!.fill();
      }
      // highlight
      ctx!.fillStyle = "rgba(255,255,255,0.5)";
      ctx!.beginPath();
      ctx!.ellipse(bx - 3.6, by - 4, 3.2, 2.1, -0.6, 0, Math.PI * 2);
      ctx!.fill();
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);

      // ripples (dink rings)
      for (const ring of rings) {
        ctx!.strokeStyle = `rgba(200,241,53,${(ring.life * 0.4).toFixed(3)})`;
        ctx!.lineWidth = 1.4;
        ctx!.beginPath();
        ctx!.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx!.stroke();
      }

      // the rally ribbon — tapered, fading, soft
      ctx!.lineCap = "round";
      ctx!.lineJoin = "round";
      for (let i = 1; i < trail.length; i++) {
        const a = trail[i - 1];
        const b = trail[i];
        const f = i / trail.length; // 0 tail .. 1 head
        // soft wide underlay reads as motion blur, not glow
        ctx!.strokeStyle = `rgba(200,241,53,${(f * 0.05).toFixed(3)})`;
        ctx!.lineWidth = 2 + f * 8;
        ctx!.beginPath();
        ctx!.moveTo(a.x, a.y);
        ctx!.lineTo(b.x, b.y);
        ctx!.stroke();
        // crisp core
        ctx!.strokeStyle = `rgba(216,247,120,${(0.04 + f * 0.42).toFixed(3)})`;
        ctx!.lineWidth = 0.5 + f * 2.6;
        ctx!.beginPath();
        ctx!.moveTo(a.x, a.y);
        ctx!.lineTo(b.x, b.y);
        ctx!.stroke();
      }

      if (seeded) drawBall(ball.x, ball.y);
    }

    function frame(now: number) {
      const dt = Math.min((now - last) / 16.67, 2);
      last = now;
      if (!reduce) step(dt);
      draw();
      raf = requestAnimationFrame(frame);
    }

    // paint a correct first frame synchronously when width is already known
    // (robust if rAF is throttled / the tab starts hidden); otherwise the
    // ResizeObserver seeds + paints as soon as a real width arrives.
    if (W > 0) {
      seed();
      draw();
    }
    if (!reduce) raf = requestAnimationFrame(frame);

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
