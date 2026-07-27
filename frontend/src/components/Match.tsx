"use client";

import { useEffect, useRef, useState } from "react";
import { pop, resume } from "@/lib/sound";

/**
 * THE MATCH — the site's front door is a playable pickleball rally.
 * A 2.5-D perspective court: the ball arcs with real height + a ground shadow
 * (not flat pong), you slide a paddle to keep the rally alive, and when a shot
 * lands in a labeled service box you "scout" that section of the résumé.
 * Forgiving on purpose. "Just read it" always skips to the readable version.
 */

type Zone = {
  id: string;
  label: string;
  href: string;
  cxSign: -1 | 1;
  cy: [number, number];
};

// far-side service boxes live BEYOND the (big) kitchen: cy 0.66 -> 1.0
const ZONES: Zone[] = [
  { id: "about", label: "The Player", href: "#about", cxSign: -1, cy: [0.66, 0.83] },
  { id: "skills", label: "In the Bag", href: "#skills", cxSign: 1, cy: [0.66, 0.83] },
  { id: "experience", label: "The Season", href: "#experience", cxSign: -1, cy: [0.83, 1.0] },
  { id: "projects", label: "Highlights", href: "#projects", cxSign: 1, cy: [0.83, 1.0] },
];

// the kitchen (non-volley zone) is 7ft of each 22ft half = 0.318 of a half
const KIT_NEAR = 0.5 - 0.318 * 0.5; // 0.341
const KIT_FAR = 0.5 + 0.318 * 0.5; // 0.659

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export default function Match() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scouted, setScouted] = useState<string[]>([]);
  const [toast, setToast] = useState<Zone | null>(null);
  const [reduced, setReduced] = useState(false);

  const scoutedRef = useRef<Set<string>>(new Set());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(rm);

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

    // ---- projection (court space -> screen) ----
    function proj(cx: number, cy: number) {
      const t = clamp(cy, 0, 1);
      // ease the depth so the court recedes more naturally (not linear)
      const td = t * (1.18 - 0.18 * t);
      const halfW = lerp(W * 0.46, W * 0.165, td);
      const y = lerp(H * 0.955, H * 0.32, td);
      const s = lerp(1, 0.46, td);
      return { x: W / 2 + cx * halfW, y, s };
    }

    // ---- game state ----
    const PLAYER_CY = 0.13;
    const AI_CY = 0.95;
    const g = {
      paddle: 0,
      paddleTarget: 0,
      ai: 0,
      bx: 0,
      by: AI_CY,
      bz: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      spin: 0,
      side: "toNear" as "toNear" | "toFar",
      bounced: false,
      scoredThisRally: false,
      rally: 0,
      dead: 0,
      serveBy: "ai" as "ai" | "player",
      trail: [] as { x: number; y: number; r: number }[],
      puffs: [] as { x: number; y: number; vx: number; vy: number; life: number }[],
      shake: 0,
      aiFlash: 0,
      playerFlash: 0,
      ready: true,
      settleT: 0,
      zoneFlash: {} as Record<string, number>,
    };

    // Serve the ball from the baseline toward where the cursor is aiming.
    // No opponent, no score — just a satisfying serve you can repeat.
    function serve() {
      const aimX = clamp(g.paddleTarget, -0.9, 0.9);
      g.bx = g.paddle;
      g.by = PLAYER_CY + 0.02;
      g.bz = 1;
      g.side = "toFar";
      g.vy = 0.0135;
      g.vx = (aimX - g.bx) * 0.018;
      g.vz = 0.052;
      g.playerFlash = 1;
      g.shake = 3;
      g.ready = false;
      pop(0.8);
    }
    function rest() {
      g.bx = clamp(g.paddleTarget, -0.9, 0.9);
      g.by = PLAYER_CY + 0.02;
      g.bz = 0;
      g.vx = g.vy = g.vz = 0;
      g.ready = true;
    }

    function zoneAt(cx: number, cy: number): Zone | null {
      const sign = cx < 0 ? -1 : 1;
      return (
        ZONES.find((z) => z.cxSign === sign && cy >= z.cy[0] && cy <= z.cy[1]) ??
        null
      );
    }

    function puff(x: number, y: number, n = 7) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        g.puffs.push({
          x,
          y,
          vx: Math.cos(a) * (Math.random() * 1.4 + 0.3),
          vy: Math.sin(a) * (Math.random() * 1.4 + 0.3) - 0.5,
          life: 1,
        });
      }
    }

    function showToast(z: Zone) {
      setToast(z);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 2600);
    }

    // The ball lands; if it's in a service box, scout that section. No return.
    function onBounce() {
      const ps = proj(g.bx, g.by);
      puff(ps.x, ps.y, g.by > 0.5 ? 8 : 5);
      pop(g.by > 0.5 ? 0.4 : 0.25);
      if (g.by > 0.5) {
        const z = zoneAt(g.bx, g.by);
        if (z) {
          g.zoneFlash[z.id] = 1;
          if (!scoutedRef.current.has(z.id)) {
            scoutedRef.current.add(z.id);
            setScouted(Array.from(scoutedRef.current));
            showToast(z);
          }
        }
      }
    }

    // ---- input ----
    function setPaddleFromClient(clientX: number) {
      const r = canvas!.getBoundingClientRect();
      g.paddleTarget = clamp(((clientX - r.left) / r.width) * 2 - 1, -0.95, 0.95);
    }
    const onPointer = (e: PointerEvent) => setPaddleFromClient(e.clientX);
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0]) setPaddleFromClient(e.touches[0].clientX);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") g.paddleTarget = clamp(g.paddleTarget - 0.12, -0.95, 0.95);
      if (e.key === "ArrowRight") g.paddleTarget = clamp(g.paddleTarget + 0.12, -0.95, 0.95);
    };
    const onDown = () => {
      resume();
      serve();
    };
    canvas.addEventListener("pointermove", onPointer);
    canvas.addEventListener("touchmove", onTouch, { passive: true });
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);

    const ro = new ResizeObserver(resize);
    rest();
    const introTimer = setTimeout(() => {
      if (g.ready) serve();
    }, 1100);
    ro.observe(canvas);
    resize();

    // ---- draw helpers ----
    function poly(pts: { x: number; y: number }[], fill: string) {
      ctx!.beginPath();
      pts.forEach((p, i) => (i ? ctx!.lineTo(p.x, p.y) : ctx!.moveTo(p.x, p.y)));
      ctx!.closePath();
      ctx!.fillStyle = fill;
      ctx!.fill();
    }
    function line(c1: number, y1: number, c2: number, y2: number, w = 2.5, col = "rgba(242,238,226,0.85)") {
      const a = proj(c1, y1);
      const b = proj(c2, y2);
      ctx!.beginPath();
      ctx!.moveTo(a.x, a.y);
      ctx!.lineTo(b.x, b.y);
      ctx!.strokeStyle = col;
      ctx!.lineWidth = w;
      ctx!.stroke();
    }

    function rr(x: number, y: number, w: number, h: number, rad: number) {
      ctx!.beginPath();
      ctx!.roundRect(x, y, w, h, rad);
    }
    function surfacePath() {
      const nl = proj(-1, 0), nr = proj(1, 0), ffr = proj(1, 1), ffl = proj(-1, 1);
      ctx!.beginPath();
      ctx!.moveTo(nl.x, nl.y);
      ctx!.lineTo(nr.x, nr.y);
      ctx!.lineTo(ffr.x, ffr.y);
      ctx!.lineTo(ffl.x, ffl.y);
      ctx!.closePath();
    }

    function drawCourt() {
      // surround (acrylic, two-tone for depth)
      poly(
        [proj(-1.2, -0.06), proj(1.2, -0.06), proj(1.42, 1.07), proj(-1.42, 1.07)],
        "#b34d31"
      );
      poly(
        [proj(-1.3, 1.07), proj(1.3, 1.07), proj(1.16, 0.55), proj(-1.16, 0.55)],
        "rgba(0,0,0,0.12)"
      );

      // playing surface
      poly([proj(-1, 0), proj(1, 0), proj(1, 1), proj(-1, 1)], "#0f6164");

      // surface lighting: lit toward the near court, darker as it recedes
      ctx!.save();
      surfacePath();
      ctx!.clip();
      const top = proj(0, 1).y, bot = proj(0, 0).y;
      const lg = ctx!.createLinearGradient(0, top, 0, bot);
      lg.addColorStop(0, "rgba(0,0,0,0.34)");
      lg.addColorStop(0.55, "rgba(255,255,255,0.045)");
      lg.addColorStop(1, "rgba(255,255,255,0.11)");
      ctx!.fillStyle = lg;
      ctx!.fillRect(0, top - 12, W, bot - top + 24);
      ctx!.restore();

      // THE KITCHEN — a big, contrasting-color non-volley zone (the signature
      // pickleball feature; spans ~32% of the court so it never reads as tennis)
      poly(
        [proj(-1, KIT_NEAR), proj(1, KIT_NEAR), proj(1, KIT_FAR), proj(-1, KIT_FAR)],
        "#11567a"
      );
      poly(
        [proj(-1, KIT_NEAR), proj(1, KIT_NEAR), proj(1, KIT_FAR), proj(-1, KIT_FAR)],
        "rgba(255,255,255,0.04)"
      );
      // kitchen stencil — far half labeled, near half pays off Pulkit's bio
      // ("off the keyboard, you'll find me at the kitchen line")
      ([[0.58, "THE KITCHEN", 0.3], [0.42, "WHERE YOU'LL FIND ME", 0.5]] as const).forEach(
        ([cy, text, op]) => {
          const c = proj(0, cy);
          ctx!.save();
          ctx!.font = `700 ${Math.round(11 * c.s + 4)}px var(--font-archivo), sans-serif`;
          ctx!.fillStyle = `rgba(231,240,238,${op})`;
          ctx!.textAlign = "center";
          (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "3px";
          ctx!.fillText(text, c.x, c.y);
          ctx!.restore();
        }
      );

      // zone fills + labels
      ZONES.forEach((z) => {
        const x0 = z.cxSign < 0 ? -1 : 0;
        const x1 = z.cxSign < 0 ? 0 : 1;
        const p = [proj(x0, z.cy[0]), proj(x1, z.cy[0]), proj(x1, z.cy[1]), proj(x0, z.cy[1])];
        const fl2 = g.zoneFlash[z.id] ?? 0;
        const lit = scoutedRef.current.has(z.id);
        const op = Math.max(fl2 * 0.34, lit ? 0.13 : 0);
        if (op > 0.001) poly(p, `rgba(200,241,53,${op})`);
        if (fl2 > 0) g.zoneFlash[z.id] = Math.max(0, fl2 - 0.04);
        const c = proj((x0 + x1) / 2, (z.cy[0] + z.cy[1]) / 2);
        ctx!.save();
        ctx!.font = `700 ${Math.round(12 * c.s + 6)}px var(--font-archivo), sans-serif`;
        ctx!.fillStyle = lit ? "#c8f135" : "rgba(242,238,226,0.42)";
        ctx!.textAlign = "center";
        (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "1.5px";
        ctx!.fillText(z.label.toUpperCase(), c.x, c.y);
        ctx!.restore();
      });

      // crisp chalk lines
      const LC = "rgba(245,241,231,0.92)";
      line(-1, 0, 1, 0, 4.5, LC); // near baseline (closest = boldest)
      line(-1, 0, -1, 1, 3, LC); // left sideline
      line(1, 0, 1, 1, 3, LC); // right sideline
      line(-1, 1, 1, 1, 2, LC); // far baseline
      line(-1, KIT_NEAR, 1, KIT_NEAR, 2.6, "rgba(245,241,231,0.78)"); // near kitchen line
      line(-1, KIT_FAR, 1, KIT_FAR, 2, "rgba(245,241,231,0.66)"); // far kitchen line
      line(0, 0, 0, KIT_NEAR, 2.4, "rgba(245,241,231,0.6)"); // centerline near (stops at kitchen)
      line(0, KIT_FAR, 0, 1, 1.8, "rgba(245,241,231,0.55)"); // centerline far (stops at kitchen)

      // ---- net (mesh + tape + posts + center strap) ----
      const y0 = proj(0, 0.5).y;
      const xL = proj(-1.07, 0.5).x;
      const xR = proj(1.07, 0.5).x;
      const xMid = (xL + xR) / 2;
      const netH = 24 * proj(0, 0.5).s; // low pickleball net (34"), not a tall tennis net
      const topAt = (x: number) => {
        const tn = Math.abs((x - xMid) / ((xR - xL) / 2)); // 0 center .. 1 posts
        return y0 - netH * (0.82 + 0.18 * tn); // posts taller than center
      };
      ctx!.save();
      ctx!.beginPath();
      ctx!.moveTo(xL, topAt(xL));
      ctx!.quadraticCurveTo(xMid, y0 - netH * 0.82, xR, topAt(xR));
      ctx!.lineTo(xR, y0);
      ctx!.lineTo(xL, y0);
      ctx!.closePath();
      ctx!.fillStyle = "rgba(6,32,32,0.46)";
      ctx!.fill();
      ctx!.clip();
      ctx!.strokeStyle = "rgba(245,241,231,0.15)";
      ctx!.lineWidth = 1;
      for (let i = 0; i <= 32; i++) {
        const x = xL + ((xR - xL) * i) / 32;
        ctx!.beginPath();
        ctx!.moveTo(x, topAt(x));
        ctx!.lineTo(x, y0);
        ctx!.stroke();
      }
      for (let j = 1; j <= 4; j++) {
        const y = y0 - netH * 0.82 * (j / 5);
        ctx!.beginPath();
        ctx!.moveTo(xL, y);
        ctx!.lineTo(xR, y);
        ctx!.stroke();
      }
      ctx!.restore();
      // tape
      ctx!.strokeStyle = "rgba(245,241,231,0.95)";
      ctx!.lineWidth = 3 * proj(0, 0.5).s + 1.5;
      ctx!.beginPath();
      ctx!.moveTo(xL, topAt(xL));
      ctx!.quadraticCurveTo(xMid, y0 - netH * 0.82, xR, topAt(xR));
      ctx!.stroke();
      // center strap
      ctx!.strokeStyle = "rgba(245,241,231,0.55)";
      ctx!.lineWidth = 2;
      ctx!.beginPath();
      ctx!.moveTo(xMid, y0 - netH * 0.82);
      ctx!.lineTo(xMid, y0);
      ctx!.stroke();
      // posts
      ctx!.fillStyle = "#0a2624";
      [xL, xR].forEach((x) => ctx!.fillRect(x - 2.5, topAt(x), 5, y0 - topAt(x) + 4));
    }

    function drawPaddle(cx: number, cy: number, flash: number) {
      const p = proj(cx, cy);
      const s = p.s;
      const fw = 30 * s, fh = 40 * s, eg = 3.2 * s, rad = 9 * s;
      const hw = 10 * s, hh = 24 * s, throat = 7 * s;
      const top = -fh * 0.62;
      ctx!.save();
      ctx!.translate(p.x, p.y);
      // edge guard
      ctx!.fillStyle = "#0b2a28";
      rr(-fw / 2 - eg, top - eg, fw + 2 * eg, fh + 2 * eg, rad + eg * 0.6);
      ctx!.fill();
      // face (lit gradient)
      const c1 = flash > 0.3 ? "#f1814a" : "#d2613f";
      const c2 = flash > 0.3 ? "#c85a30" : "#9c4327";
      const fg = ctx!.createLinearGradient(0, top, 0, top + fh);
      fg.addColorStop(0, c1);
      fg.addColorStop(1, c2);
      ctx!.fillStyle = fg;
      rr(-fw / 2, top, fw, fh, rad);
      ctx!.fill();
      // sheen
      ctx!.fillStyle = "rgba(255,255,255,0.14)";
      rr(-fw / 2 + 2 * s, top + 2 * s, fw * 0.46, fh * 0.5, rad * 0.6);
      ctx!.fill();
      // logo
      ctx!.fillStyle = "#c8f135";
      ctx!.beginPath();
      ctx!.arc(0, top + fh * 0.42, 2.4 * s, 0, Math.PI * 2);
      ctx!.fill();
      // throat
      const fbY = top + fh;
      ctx!.fillStyle = "#10302d";
      ctx!.beginPath();
      ctx!.moveTo(-hw * 0.85, fbY - 1);
      ctx!.lineTo(hw * 0.85, fbY - 1);
      ctx!.lineTo(hw / 2, fbY + throat);
      ctx!.lineTo(-hw / 2, fbY + throat);
      ctx!.closePath();
      ctx!.fill();
      // handle + grip wrap
      const hY = fbY + throat;
      ctx!.fillStyle = "#163230";
      rr(-hw / 2, hY, hw, hh, 3 * s);
      ctx!.fill();
      ctx!.strokeStyle = "rgba(0,0,0,0.35)";
      ctx!.lineWidth = 1.3 * s;
      for (let i = 0; i < 5; i++) {
        const yy = hY + 4 * s + (i * (hh - 5 * s)) / 5;
        ctx!.beginPath();
        ctx!.moveTo(-hw / 2, yy);
        ctx!.lineTo(hw / 2, yy - 3 * s);
        ctx!.stroke();
      }
      ctx!.fillStyle = "#0a1f1c";
      rr(-hw / 2 - 1, hY + hh - 3 * s, hw + 2, 4.5 * s, 2 * s);
      ctx!.fill();
      ctx!.restore();
    }

    function drawBall() {
      const p = proj(g.bx, g.by);
      const screenY = p.y - g.bz * 92 * p.s;
      const r = 11.5 * p.s * (1 + g.bz * 0.025);
      // shadow (shrinks + fades with height)
      const shA = clamp(0.42 - g.bz * 0.12, 0.06, 0.42);
      const shS = 1 + g.bz * 0.12;
      ctx!.fillStyle = `rgba(0,0,0,${shA})`;
      ctx!.beginPath();
      ctx!.ellipse(p.x, p.y, r * 1.1 * shS, r * 0.4 * shS, 0, 0, Math.PI * 2);
      ctx!.fill();
      // trail
      g.trail.forEach((t, i) => {
        const a = i / g.trail.length;
        ctx!.fillStyle = `rgba(200,241,53,${a * 0.22})`;
        ctx!.beginPath();
        ctx!.arc(t.x, t.y, t.r * a * 0.9, 0, Math.PI * 2);
        ctx!.fill();
      });
      // ball body
      const squash = clamp(1 - Math.abs(g.vz) * 5, 0.62, 1);
      ctx!.save();
      ctx!.translate(p.x, screenY);
      ctx!.scale(1, g.bz < 0.16 ? squash : 1);
      const rg = ctx!.createRadialGradient(-r * 0.32, -r * 0.34, r * 0.1, 0, 0, r * 1.12);
      rg.addColorStop(0, "#eaff86");
      rg.addColorStop(0.45, "#cdf03e");
      rg.addColorStop(1, "#98c01a");
      ctx!.fillStyle = rg;
      ctx!.beginPath();
      ctx!.arc(0, 0, r, 0, Math.PI * 2);
      ctx!.fill();
      // rim shade
      ctx!.strokeStyle = "rgba(11,68,70,0.3)";
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.arc(0, 0, r - 0.6, 0, Math.PI * 2);
      ctx!.stroke();
      // perforations (center + ring of 6, rotating with spin)
      ctx!.fillStyle = "rgba(18,56,40,0.55)";
      ctx!.beginPath();
      ctx!.arc(0, 0, r * 0.12, 0, Math.PI * 2);
      ctx!.fill();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + g.spin;
        ctx!.beginPath();
        ctx!.arc(Math.cos(a) * r * 0.52, Math.sin(a) * r * 0.52, r * 0.11, 0, Math.PI * 2);
        ctx!.fill();
      }
      // specular highlight
      ctx!.fillStyle = "rgba(255,255,255,0.5)";
      ctx!.beginPath();
      ctx!.ellipse(-r * 0.34, -r * 0.36, r * 0.26, r * 0.17, -0.6, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.restore();
      g.trail.push({ x: p.x, y: screenY, r });
      if (g.trail.length > 10) g.trail.shift();
    }

    let raf = 0;
    let last = performance.now();
    function tick(now: number) {
      const dt = clamp((now - last) / 16.67, 0.2, 2.4);
      last = now;

      if (!rm) {
        // paddle easing (follows the cursor)
        g.paddle += (g.paddleTarget - g.paddle) * 0.25 * dt;

        if (g.ready) {
          // ball waits in hand at the baseline, tracking your aim, with a bob
          g.bx += (clamp(g.paddleTarget, -0.9, 0.9) - g.bx) * 0.2 * dt;
          g.by = PLAYER_CY + 0.02;
          g.bz = 0.18 + Math.sin(now * 0.004) * 0.05;
          g.spin += 0.03 * dt;
        } else {
          // in flight
          g.bx += g.vx * dt;
          g.by += g.vy * dt;
          g.vz -= 0.0022 * dt;
          g.bz += g.vz * dt;
          g.spin += (g.vx * 8 + 0.05) * dt;

          if (g.bx < -1) { g.bx = -1; g.vx = Math.abs(g.vx); }
          if (g.bx > 1) { g.bx = 1; g.vx = -Math.abs(g.vx); }

          // bounce — lose energy, scout on the far side, eventually settle
          if (g.bz <= 0 && g.vz < 0) {
            g.bz = 0;
            g.vz = -g.vz * 0.58;
            g.vx *= 0.82;
            g.vy *= 0.84;
            onBounce();
            if (g.vz < 0.014) g.vz = 0;
          }

          // came to rest, or rolled out of bounds -> reset to ready at baseline
          const stopped = g.bz === 0 && Math.abs(g.vz) < 0.01 && Math.hypot(g.vx, g.vy) < 0.002;
          if (stopped || g.by < -0.04 || g.by > 1.06) {
            g.settleT += dt;
            if (g.settleT > 36 || g.by < -0.04 || g.by > 1.06) {
              g.settleT = 0;
              rest();
            }
          } else {
            g.settleT = 0;
          }
        }

        // particles
        g.puffs.forEach((pf) => {
          pf.x += pf.vx * dt;
          pf.y += pf.vy * dt;
          pf.vy += 0.05 * dt;
          pf.life -= 0.03 * dt;
        });
        g.puffs = g.puffs.filter((pf) => pf.life > 0);

        g.shake *= 0.86;
        g.aiFlash = Math.max(0, g.aiFlash - 0.05);
        g.playerFlash = Math.max(0, g.playerFlash - 0.05);
      }

      render();
      raf = requestAnimationFrame(tick);
    }

    function render() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.save();
      ctx!.translate((Math.random() - 0.5) * g.shake, (Math.random() - 0.5) * g.shake);
      drawCourt();
      // only the player's paddle now — no opponent, no rally
      drawBall();
      drawPaddle(g.paddle, PLAYER_CY, g.playerFlash);
      g.puffs.forEach((pf) => {
        ctx!.fillStyle = `rgba(242,238,226,${pf.life * 0.6})`;
        ctx!.beginPath();
        ctx!.arc(pf.x, pf.y, 2.5 * pf.life + 0.5, 0, Math.PI * 2);
        ctx!.fill();
      });
      ctx!.restore();
    }

    render(); // paint the first frame immediately (no blank flash / works when rAF is throttled)
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("touchmove", onTouch);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
      clearTimeout(introTimer);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  return (
    <section
      id="top"
      className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-court-deep text-chalk"
      style={{ ["--sel" as string]: "#c8f135" }}
      aria-label="Playable pickleball rally. The full readable portfolio is below."
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

      {/* title (clears the fixed nav) */}
      <div className="pointer-events-none absolute left-5 top-20 z-10">
        <div className="display text-3xl uppercase leading-none">
          The <span className="text-ball">Warm-up</span>
        </div>
        <div className="mt-1 font-mono text-[11px] uppercase tracking-widest text-chalk/45">
          serve the ball &middot; scout the deck
        </div>
      </div>

      {/* scouted legend */}
      <div className="pointer-events-auto absolute left-5 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-1.5 md:flex">
        <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-chalk/45">
          Scouted {scouted.length}/4
        </div>
        {ZONES.map((z) => {
          const lit = scouted.includes(z.id);
          return (
            <a
              key={z.id}
              href={z.href}
              className={`flex items-center gap-2 text-sm transition-colors ${
                lit ? "text-ball" : "text-chalk/40 hover:text-chalk/70"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${lit ? "bg-ball" : "bg-chalk/25"}`} />
              {z.label}
            </a>
          );
        })}
      </div>

      {/* controls hint (upper band, above the court — clear of the player paddle) */}
      <div className="pointer-events-none absolute inset-x-0 top-[104px] z-10 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-chalk/45">
        {reduced
          ? "scroll to read ↓"
          : "aim with your mouse · click to serve · land it in a box to scout that section"}
      </div>

      {/* just-read CTA (corner, out of the paddle's lane) */}
      <a
        href="#about"
        className="pressable absolute bottom-6 right-6 z-10 rounded-full bg-ball px-5 py-2.5 text-sm font-semibold text-ink"
      >
        Just read it ↓
      </a>

      {/* scout toast */}
      {toast && (
        <a
          href={toast.href}
          className="pointer-events-auto absolute left-1/2 top-[140px] z-20 -translate-x-1/2 rounded-full border border-ball/50 bg-court-deep/90 px-4 py-2 text-sm text-chalk backdrop-blur-sm"
        >
          Scouted <span className="font-semibold text-ball">{toast.label}</span> — view ↓
        </a>
      )}
    </section>
  );
}
