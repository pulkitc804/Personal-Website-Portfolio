"use client";

import { useEffect, useRef } from "react";
import { pop, resume } from "@/lib/sound";

/**
 * NET CORD — the signature wave, promoted to the hero's governing physics.
 * One thick flowing chalk sine (exactly 3 periods, +12% second harmonic so it
 * reads hand-drawn) with the optic ball surfing a crest face (0.92x phase
 * velocity: it glides, never bobs). The wave swells toward your cursor (the
 * beloved move), a click rings it (pock + chalk ring + two pulse packets
 * racing outward along the cord), and SCROLL is tension: leaving the hero
 * pulls the wave taut into the ribbon's rule while scroll velocity injects
 * momentum into the rally. Fully scrubbed and reversible. First click calls
 * the serve: "0–0–2". Reduced-motion: a still crest-centered poster frame.
 */
const OPTIC = "#c8f135";

// hole directions on the unit sphere (fibonacci lattice) — a real pickleball
// has ~40 drilled holes; we render the front hemisphere with foreshortening
const HOLE_DIRS: [number, number, number][] = (() => {
  const pts: [number, number, number][] = [];
  const GA = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < 42; i++) {
    const y = 1 - (i / 41) * 2;
    const rr = Math.sqrt(Math.max(0, 1 - y * y));
    const th = GA * i;
    pts.push([Math.cos(th) * rr, y, Math.sin(th) * rr]);
  }
  return pts;
})();

export default function HeroNetCord({ className = "" }: { className?: string }) {
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
    let ruleY = 0; // where the taut line lands: the ribbon's top hairline

    function resize() {
      const r = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const rule = document.querySelector("[data-net-rule]");
      ruleY = rule ? rule.getBoundingClientRect().top - r.top : H * 0.87;
    }

    // ---- state ----
    const s = {
      phase: 0,
      bx: 0.12, // ball progress 0..1 of W (autonomous)
      roll: 0, // accumulated roll distance for hole rotation
      mx: -9999, // spring-lagged swell center
      mxTarget: -9999,
      my: -9999,
      mouseOn: false,
      momentum: 0, // scroll-injected current
      lastScroll: 0,
      p: 0, // scroll tension progress
      served: false,
      serveT: -1, // serve-call age; <0 = inactive
      trail: [] as { x: number; y: number }[],
    };
    type Ring = { x: number; y: number; r: number; a: number };
    const rings: Ring[] = [];
    type Packet = { x0: number; age: number; dir: 1 | -1 };
    const packets: Packet[] = [];

    // the cord rides low, in clear space between the copy and the ribbon: it
    // must never cut through the CTAs
    const yc = () => H * 0.775;
    // amplitude is capped so the cord always clears the copy above it and the
    // credibility line below it: it is a rule that breathes, not a feature
    const A0 = () => Math.min(24, Math.max(15, H * 0.032));
    const k = () => (Math.PI * 6) / Math.max(W, 1); // exactly 3 periods

    const smooth = (a: number, b: number, v: number) => {
      const t = Math.max(0, Math.min(1, (v - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };

    // baseline drift for the taut line: at rest 0.76H, at p=1 the ribbon's rule
    function baseY(): number {
      return yc() + (ruleY - yc()) * smooth(0.25, 1, s.p);
    }

    // envelope + displacement
    function waveY(x: number): number {
      const kk = k();
      const taut = smooth(0.35, 1, s.p); // amplitude dies late in the scroll
      const A = A0() * (1 - taut);
      const base =
        baseY() +
        A * (Math.sin(kk * x - s.phase) + 0.12 * Math.sin(2 * kk * x - 2 * s.phase + 0.6));
      // cursor swell: the line lifts toward your hand (spring-lagged x)
      let lift = 0;
      if (s.mouseOn && s.mx > -9000) {
        const prox = Math.max(0, 1 - Math.abs(s.my - yc()) / (H * 0.35));
        const g = Math.exp(-((x - s.mx) ** 2) / (2 * 110 * 110));
        lift -= g * A0() * 1.15 * prox * (1 - taut);
      }
      // click pulses: packets racing outward along the cord
      for (const pk of packets) {
        const cx = pk.x0 + pk.dir * pk.age * (W / 9.6) * 1.8;
        const g = Math.exp(-((x - cx) ** 2) / (2 * 60 * 60));
        lift -= g * 14 * Math.exp(-pk.age / 1.2) * (1 - taut);
      }
      return base + lift;
    }

    // ---- input ----
    const onMove = (e: PointerEvent) => {
      const r = canvas!.getBoundingClientRect();
      s.mxTarget = e.clientX - r.left;
      s.my = e.clientY - r.top;
      s.mouseOn = s.my > 0 && s.my < H;
    };
    const onLeave = () => (s.mouseOn = false);
    const onDown = (e: PointerEvent) => {
      const r = canvas!.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < 0 || x > W || y < 0 || y > H) return;
      resume();
      // put-away if you strike the ball itself
      const bxPx = ballX();
      const byPx = waveY(bxPx) - 15;
      const onBall = Math.hypot(x - bxPx, y - byPx) < 30;
      pop(onBall ? 0.8 : 0.5);
      rings.push({ x, y, r: 8, a: 0.5 });
      packets.push({ x0: x, age: 0, dir: 1 }, { x0: x, age: 0, dir: -1 });
      if (packets.length > 12) packets.splice(0, packets.length - 12);
      if (onBall) s.momentum += 2.4; // burst of forward speed, friction brings it home
      if (!s.served) {
        s.served = true;
        s.serveT = 0;
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerleave", onLeave);

    // ---- ball ----
    function ballX(): number {
      const auto = s.bx * W;
      // as tension takes over, the ball converges to center court
      return auto + (W / 2 - auto) * smooth(0.5, 1, s.p);
    }

    function drawBall(bx: number, by: number) {
      const r = 13;

      // polymer sphere under a high top-left floodlight
      const g = ctx!.createRadialGradient(bx - r * 0.38, by - r * 0.42, r * 0.08, bx, by, r * 1.02);
      g.addColorStop(0, "#f4ffb2");
      g.addColorStop(0.22, "#e4f873");
      g.addColorStop(0.5, OPTIC);
      g.addColorStop(0.8, "#9abd18");
      g.addColorStop(1, "#6d8b0e");
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(bx, by, r, 0, Math.PI * 2);
      ctx!.fill();

      // drilled holes: roll about z + slow tumble about y, front hemisphere
      // only, each foreshortened along its radial direction (ellipse ratio =
      // facing amount) — this is what makes it read as a real ball
      const a = s.roll / r;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const b = a * 0.37;
      const cb = Math.cos(b);
      const sb = Math.sin(b);
      for (const [px, py, pz] of HOLE_DIRS) {
        const x1 = px * cb + pz * sb;
        const z1 = -px * sb + pz * cb;
        const x2 = x1 * ca - py * sa;
        const y2 = x1 * sa + py * ca;
        if (z1 < 0.24) continue;
        const hx = bx + x2 * r * 0.86;
        const hy = by + y2 * r * 0.86;
        const hr = r * 0.15 * (0.55 + z1 * 0.45);
        ctx!.save();
        ctx!.translate(hx, hy);
        ctx!.rotate(Math.atan2(y2, x2));
        ctx!.scale(Math.max(0.15, z1), 1);
        // hole interior, darker toward the shadowed side of the sphere
        const shade = 0.5 + 0.35 * ((x2 + y2) * 0.5 + 0.5);
        ctx!.fillStyle = `rgba(46,64,8,${shade.toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(0, 0, hr, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }

      // ambient-occlusion terminator: the sphere falls off at its limb
      const ao = ctx!.createRadialGradient(bx, by, r * 0.6, bx, by, r);
      ao.addColorStop(0, "rgba(20,30,0,0)");
      ao.addColorStop(1, "rgba(14,22,0,0.42)");
      ctx!.fillStyle = ao;
      ctx!.beginPath();
      ctx!.arc(bx, by, r, 0, Math.PI * 2);
      ctx!.fill();

      // bounce light off the court on the lower rim
      ctx!.strokeStyle = "rgba(255,255,255,0.1)";
      ctx!.lineWidth = 1.1;
      ctx!.beginPath();
      ctx!.arc(bx, by, r - 0.8, Math.PI * 0.2, Math.PI * 0.75);
      ctx!.stroke();

      // specular: hard hit + soft sheen
      ctx!.fillStyle = "rgba(255,255,255,0.12)";
      ctx!.beginPath();
      ctx!.ellipse(bx - r * 0.3, by - r * 0.34, r * 0.36, r * 0.24, -0.6, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.fillStyle = "rgba(255,255,255,0.7)";
      ctx!.beginPath();
      ctx!.ellipse(bx - r * 0.34, by - r * 0.4, r * 0.15, r * 0.09, -0.6, 0, Math.PI * 2);
      ctx!.fill();
    }

    // ---- draw ----
    function draw() {
      ctx!.clearRect(0, 0, W, H);
      if (W <= 0) return;

      // center-court tick: the axis of symmetry, riding the baseline
      const by0 = baseY();
      ctx!.strokeStyle = "rgba(242,238,226,0.35)";
      ctx!.lineWidth = 1.5;
      ctx!.beginPath();
      ctx!.moveTo(W / 2, by0 + A0() + 10);
      ctx!.lineTo(W / 2, by0 + A0() + 22);
      ctx!.stroke();

      // the cord — one confident chalk line
      ctx!.strokeStyle = "rgba(242,238,226,0.72)";
      ctx!.lineWidth = W < 640 ? 2.25 : 3;
      ctx!.lineCap = "round";
      ctx!.lineJoin = "round";
      ctx!.beginPath();
      for (let x = 0; x <= W; x += 4) {
        const y = waveY(x);
        x === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
      }
      ctx!.stroke();

      // click rings
      for (const ring of rings) {
        ctx!.strokeStyle = `rgba(242,238,226,${ring.a.toFixed(3)})`;
        ctx!.lineWidth = 1.4;
        ctx!.beginPath();
        ctx!.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx!.stroke();
      }

      // ball: motion streak (long-exposure blur, not dots), contact shadow on
      // the cord, then the sphere
      const bx = ballX();
      const by = waveY(bx) - 15;
      s.trail.push({ x: bx, y: by });
      if (s.trail.length > 16) s.trail.shift();
      ctx!.lineCap = "round";
      for (let i = 1; i < s.trail.length; i++) {
        const t0 = s.trail[i - 1];
        const t1 = s.trail[i];
        const f = i / s.trail.length;
        ctx!.strokeStyle = `rgba(214,244,120,${(f * 0.2).toFixed(3)})`;
        ctx!.lineWidth = 0.5 + f * 5;
        ctx!.beginPath();
        ctx!.moveTo(t0.x, t0.y);
        ctx!.lineTo(t1.x, t1.y);
        ctx!.stroke();
      }
      ctx!.fillStyle = "rgba(0,4,2,0.38)";
      ctx!.beginPath();
      ctx!.ellipse(bx, waveY(bx) + 1.5, 9, 2.4, 0, 0, Math.PI * 2);
      ctx!.fill();
      drawBall(bx, by);

      // the serve call, first click only: pickleball starts at 0–0–2
      if (s.serveT >= 0 && s.serveT < 1.6) {
        const a = s.serveT < 0.25 ? s.serveT / 0.25 : 1 - (s.serveT - 0.25) / 1.35;
        ctx!.fillStyle = `rgba(242,238,226,${(a * 0.85).toFixed(3)})`;
        ctx!.font = "600 13px ui-monospace, Menlo, monospace";
        ctx!.textAlign = "center";
        ctx!.fillText("0–0–2", bx, by - 30);
      }
    }

    // ---- loop ----
    let raf = 0;
    let last = performance.now();
    function frame(now: number) {
      const dt = Math.min((now - last) / 16.67, 2.2);
      last = now;

      // scroll: tension (p) + current (momentum from scroll velocity)
      const sy = window.scrollY;
      s.p = Math.max(0, Math.min(1, sy / (H * 0.85 || 1)));
      const dScroll = sy - s.lastScroll;
      s.lastScroll = sy;
      s.momentum += dScroll * 0.004;
      s.momentum *= Math.pow(0.92, dt);
      if (s.momentum > 6) s.momentum = 6;
      if (s.momentum < -6) s.momentum = -6;

      // flow: one wavelength drifts by in ~3.2s; ball surfs at 0.92x phase velocity
      const dPhase = (0.033 + s.momentum * 0.01) * dt;
      s.phase += dPhase;
      const phaseVelPx = dPhase / k(); // px this frame
      const ballStep = (phaseVelPx * 0.92) / Math.max(W, 1);
      s.bx += ballStep;
      s.roll += phaseVelPx * 0.92;
      if (s.bx > 1.06) {
        s.bx = -0.06;
        s.trail.length = 0;
      }

      // swell center spring-follows the cursor (~120ms lag)
      if (s.mxTarget > -9000) {
        if (s.mx < -9000) s.mx = s.mxTarget;
        else s.mx += (s.mxTarget - s.mx) * Math.min(1, 0.13 * dt);
      }

      // decay transient elements
      for (let i = rings.length - 1; i >= 0; i--) {
        rings[i].r += 2.4 * dt;
        rings[i].a -= 0.016 * dt;
        if (rings[i].a <= 0) rings.splice(i, 1);
      }
      for (let i = packets.length - 1; i >= 0; i--) {
        packets[i].age += dt / 60;
        if (packets[i].age > 3) packets.splice(i, 1);
      }
      if (s.serveT >= 0) s.serveT += dt / 60;

      draw();
      raf = requestAnimationFrame(frame);
    }

    // ---- boot: synchronous first frame; RO reseeds on real width ----
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    resize();
    s.lastScroll = window.scrollY;

    if (reduce) {
      // still poster: upward crest dead-center (canvas y is inverted, so the
      // crest needs sin = -1), ball seated just ahead on its forward face
      s.phase = k() * (W / 2) + Math.PI / 2;
      s.bx = 0.54;
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
