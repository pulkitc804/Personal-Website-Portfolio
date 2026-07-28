"use client";

import { useEffect, useRef } from "react";
import { pop, resume } from "@/lib/sound";

/**
 * The court, in perspective. A real 20 x 44 ft pickleball court projected
 * through a pinhole camera standing behind the baseline, drawn in chalk that
 * fades with distance.
 *
 * The important property: it does not move on its own. Every previous hero
 * ran a perpetual animation behind the type, and continuous motion behind
 * text always reads as noise. Here the scene is perfectly still until the
 * cursor moves, and then the camera yaws and pitches a few degrees, so the
 * court parallaxes like you shifted your weight at the baseline. Motion is a
 * response, never a background process. Click and the ball hops once and
 * settles: one finite event, not a loop.
 */
const OPTIC = "#c8f135";

// court in feet, origin at the centre of the near baseline
const HALF_W = 10; // 20 ft wide
const LEN = 44; // 44 ft long
const NET_Z = 22;
const KIT = 7; // non-volley zone, 7 ft either side of the net

export default function HeroCourt({ className = "" }: { className?: string }) {
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

    // camera: standing behind the near baseline, slightly raised, looking down
    const cam = { yaw: 0, pitch: 0, tYaw: 0, tPitch: 0 };
    const ball = { z: 15.5, y: 0.12, vy: 0, hop: 0 };
    let fade = 1; // scroll fade

    function resize() {
      const r = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /** pinhole projection; returns null for anything behind the camera */
    function project(x: number, y: number, z: number) {
      // Low and close: the near baseline runs off the bottom of the frame, so
      // the court reads as receding away from where you're standing rather
      // than as a diagram floating in the lower corner.
      const camY = 7;
      const camZ = -8;
      // world -> camera
      let dx = x;
      let dy = y - camY;
      let dz = z - camZ;
      // yaw about the vertical axis
      const cy = Math.cos(cam.yaw);
      const sy = Math.sin(cam.yaw);
      const rx = dx * cy - dz * sy;
      const rz = dx * sy + dz * cy;
      dx = rx;
      dz = rz;
      // pitch: the camera looks down the court
      const basePitch = 0.09;
      const cp = Math.cos(basePitch + cam.pitch);
      const sp = Math.sin(basePitch + cam.pitch);
      const ry = dy * cp - dz * sp;
      const rz2 = dy * sp + dz * cp;
      dy = ry;
      dz = rz2;
      if (dz <= 0.35) return null;
      const f = Math.max(W, 640) * 0.42;
      return {
        x: W / 2 + (f * dx) / dz,
        y: H * 0.565 - (f * dy) / dz,
        z: dz,
      };
    }

    /**
     * Chalk fades with distance so the far end sinks into the night. Kept low
     * overall: the court sits behind the type, so it has to read as the room
     * the words are standing in, never as something competing with them.
     */
    function depthAlpha(z: number) {
      return Math.max(0.04, Math.min(0.34, 11 / (z + 8))) * fade;
    }

    function seg(
      x1: number,
      z1: number,
      x2: number,
      z2: number,
      width = 1.4,
      y = 0
    ) {
      const a = project(x1, y, z1);
      const b = project(x2, y, z2);
      if (!a || !b) return;
      const alpha = depthAlpha((a.z + b.z) / 2);
      ctx!.strokeStyle = `rgba(242,238,226,${alpha.toFixed(3)})`;
      ctx!.lineWidth = width;
      ctx!.beginPath();
      ctx!.moveTo(a.x, a.y);
      ctx!.lineTo(b.x, b.y);
      ctx!.stroke();
    }

    function drawNet() {
      const postH = 3;
      const tapeL = project(-HALF_W, postH, NET_Z);
      const tapeR = project(HALF_W, postH, NET_Z);
      const baseL = project(-HALF_W, 0, NET_Z);
      const baseR = project(HALF_W, 0, NET_Z);
      if (!tapeL || !tapeR || !baseL || !baseR) return;

      // mesh: verticals, thinned so it reads as fabric rather than a grid
      ctx!.lineWidth = 1;
      for (let i = 0; i <= 34; i++) {
        const t = i / 34;
        const x = -HALF_W + t * HALF_W * 2;
        // a real net dips at the centre: 36in at the posts, 34in at centre
        const sag = 0.17 * Math.sin(Math.PI * t);
        const top = project(x, postH - sag, NET_Z);
        const bot = project(x, 0, NET_Z);
        if (!top || !bot) continue;
        ctx!.strokeStyle = `rgba(242,238,226,${(0.055 * fade).toFixed(3)})`;
        ctx!.beginPath();
        ctx!.moveTo(top.x, top.y);
        ctx!.lineTo(bot.x, bot.y);
        ctx!.stroke();
      }
      // the tape along the top
      ctx!.strokeStyle = `rgba(242,238,226,${(0.3 * fade).toFixed(3)})`;
      ctx!.lineWidth = 2.4;
      ctx!.beginPath();
      for (let i = 0; i <= 34; i++) {
        const t = i / 34;
        const x = -HALF_W + t * HALF_W * 2;
        const sag = 0.17 * Math.sin(Math.PI * t);
        const p = project(x, postH - sag, NET_Z);
        if (!p) continue;
        i === 0 ? ctx!.moveTo(p.x, p.y) : ctx!.lineTo(p.x, p.y);
      }
      ctx!.stroke();
      // posts
      ctx!.strokeStyle = `rgba(242,238,226,${(0.26 * fade).toFixed(3)})`;
      ctx!.lineWidth = 2.6;
      [tapeL, tapeR].forEach((t, i) => {
        const b = i === 0 ? baseL : baseR;
        ctx!.beginPath();
        ctx!.moveTo(t.x, t.y);
        ctx!.lineTo(b.x, b.y);
        ctx!.stroke();
      });
    }

    function drawBall() {
      const p = project(0, ball.y, ball.z);
      if (!p) return;
      const shadow = project(0, 0, ball.z);
      // same focal length as project(), so the ball scales with the scene
      const r = Math.max(3, (Math.max(W, 640) * 0.42 * 0.115) / p.z);

      if (shadow) {
        ctx!.fillStyle = `rgba(0,0,0,${(0.34 * fade).toFixed(3)})`;
        ctx!.beginPath();
        ctx!.ellipse(shadow.x, shadow.y, r * 1.1, r * 0.4, 0, 0, Math.PI * 2);
        ctx!.fill();
      }
      const g = ctx!.createRadialGradient(p.x - r * 0.35, p.y - r * 0.4, r * 0.1, p.x, p.y, r * 1.05);
      g.addColorStop(0, "#f4ffb2");
      g.addColorStop(0.45, OPTIC);
      g.addColorStop(1, "#8fb015");
      ctx!.globalAlpha = fade;
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx!.fill();
      // drilled holes, only when the ball is large enough to read
      if (r > 6) {
        ctx!.fillStyle = "rgba(46,64,8,0.65)";
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 + 0.6;
          ctx!.beginPath();
          ctx!.arc(p.x + Math.cos(a) * r * 0.42, p.y + Math.sin(a) * r * 0.42, r * 0.11, 0, Math.PI * 2);
          ctx!.fill();
        }
        ctx!.fillStyle = "rgba(255,255,255,0.55)";
        ctx!.beginPath();
        ctx!.ellipse(p.x - r * 0.3, p.y - r * 0.35, r * 0.18, r * 0.11, -0.6, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
    }

    function draw() {
      if (W <= 0) return;
      ctx!.clearRect(0, 0, W, H);

      // service boxes first, so the boundary reads on top
      seg(0, 0, 0, KIT === 7 ? NET_Z - KIT : 15, 1); // near centre line
      seg(0, NET_Z + KIT, 0, LEN, 1); // far centre line
      seg(-HALF_W, NET_Z - KIT, HALF_W, NET_Z - KIT, 1.6); // near kitchen
      seg(-HALF_W, NET_Z + KIT, HALF_W, NET_Z + KIT, 1.6); // far kitchen

      // boundary
      seg(-HALF_W, 0, HALF_W, 0, 1.8); // near baseline
      seg(-HALF_W, LEN, HALF_W, LEN, 1.6); // far baseline
      seg(-HALF_W, 0, -HALF_W, LEN, 1.8); // left sideline
      seg(HALF_W, 0, HALF_W, LEN, 1.8); // right sideline

      drawNet();
      drawBall();
    }

    // ---- interaction: the camera answers the cursor, nothing else moves ----
    const onMove = (e: PointerEvent) => {
      const r = canvas!.getBoundingClientRect();
      const nx = (e.clientX - r.left) / Math.max(r.width, 1) - 0.5;
      const ny = (e.clientY - r.top) / Math.max(r.height, 1) - 0.5;
      cam.tYaw = nx * 0.115;
      cam.tPitch = -ny * 0.05;
      wake();
    };
    const onLeave = () => {
      cam.tYaw = 0;
      cam.tPitch = 0;
      wake();
    };
    const onDown = (e: PointerEvent) => {
      const r = canvas!.getBoundingClientRect();
      if (e.clientY - r.top < 0 || e.clientY - r.top > r.height) return;
      resume();
      pop(0.45);
      ball.vy = 0.34; // one hop, then it settles
      wake();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerleave", onLeave);

    // ---- the loop only runs while something is actually settling ----
    let raf = 0;
    let idleFrames = 0;
    let running = false;

    function tick() {
      // ease the camera toward the cursor
      const dy = cam.tYaw - cam.yaw;
      const dp = cam.tPitch - cam.pitch;
      cam.yaw += dy * 0.075;
      cam.pitch += dp * 0.075;

      // the ball's hop, under gravity, resting on the surface
      if (ball.vy !== 0 || ball.y > 0.121) {
        ball.vy -= 0.022;
        ball.y += ball.vy;
        if (ball.y <= 0.12) {
          ball.y = 0.12;
          ball.vy = Math.abs(ball.vy) > 0.06 ? Math.abs(ball.vy) * 0.42 : 0;
        }
      }

      const settled =
        Math.abs(dy) < 0.0004 && Math.abs(dp) < 0.0004 && ball.vy === 0 && ball.y <= 0.121;
      draw();

      if (settled) {
        idleFrames++;
        // a few frames of grace, then stop entirely: no background process
        if (idleFrames > 6) {
          running = false;
          return;
        }
      } else {
        idleFrames = 0;
      }
      raf = requestAnimationFrame(tick);
    }

    function wake() {
      if (reduce) {
        draw();
        return;
      }
      idleFrames = 0;
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    }

    const onScroll = () => {
      const next = Math.max(0, Math.min(1, 1 - window.scrollY / (H * 0.7 || 1)));
      if (Math.abs(next - fade) > 0.01) {
        fade = next;
        wake();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    resize();
    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden />;
}
