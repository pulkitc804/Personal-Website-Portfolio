"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A pickleball replaces the pointer on fine-pointer, motion-OK devices.
 * The ball tracks instantly; a chalk "aiming ring" trails and expands over
 * anything clickable. Native cursor is only hidden after this mounts (JS on),
 * so no-JS / touch / reduced-motion users keep the normal pointer.
 */
export default function PickleCursor() {
  const ballRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [hot, setHot] = useState(false);
  const hotRef = useRef(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setOn(true);
    document.documentElement.classList.add("pickle-cursor");

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let bx = tx;
    let by = ty;
    let rx = tx;
    let ry = ty;
    let raf = 0;

    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const el = e.target as Element | null;
      const inter = !!el?.closest?.(
        "a,button,[role=button],.card-hit,input,textarea,summary,label,[data-cursor]"
      );
      if (inter !== hotRef.current) {
        hotRef.current = inter;
        setHot(inter);
      }
    };
    const down = () => ballRef.current?.classList.add("down");
    const up = () => ballRef.current?.classList.remove("down");

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);

    let tilt = 0;
    const loop = () => {
      // the paddle leans into its own swing: tilt follows horizontal velocity
      const tiltTarget = Math.max(-22, Math.min(22, (tx - bx) * 1.1));
      tilt += (tiltTarget - tilt) * 0.18;
      bx += (tx - bx) * 0.4;
      by += (ty - by) * 0.4;
      rx += (tx - rx) * 0.18;
      ry += (ty - ry) * 0.18;
      if (ballRef.current)
        ballRef.current.style.transform = `translate(${bx}px, ${by}px) translate(-50%, -50%) rotate(${tilt.toFixed(2)}deg)`;
      if (ringRef.current)
        ringRef.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.classList.remove("pickle-cursor");
    };
  }, []);

  if (!on) return null;

  return (
    <>
      {/* aiming ring — mix-blend keeps it visible on dark courts and cream alike */}
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] rounded-full border transition-[width,height,border-width,opacity] duration-200"
        style={{
          width: hot ? 48 : 28,
          height: hot ? 48 : 28,
          borderColor: "#ffffff",
          borderWidth: hot ? 2.5 : 1.5,
          opacity: hot ? 0.9 : 0.55,
          mixBlendMode: "difference",
          willChange: "transform",
        }}
      />
      {/* the paddle silhouette — leans with its own swing (rotate set in loop) */}
      <div
        ref={ballRef}
        aria-hidden
        className="cursor-ball pointer-events-none fixed left-0 top-0 z-[9999]"
        style={{ willChange: "transform" }}
      >
        <svg width="22" height="27" viewBox="0 0 24 30">
          {/* face */}
          <rect
            x="3.5"
            y="1.5"
            width="17"
            height="17.5"
            rx="7.5"
            fill="rgba(7,33,31,0.92)"
            stroke="#f2eee2"
            strokeWidth="1.6"
          />
          {/* throat + grip */}
          <path d="M9.5 18.5 L10.5 21 L13.5 21 L14.5 18.5 Z" fill="#f2eee2" opacity="0.85" />
          <rect x="10.4" y="21" width="3.2" height="7" rx="1.5" fill="#f2eee2" opacity="0.9" />
          {/* sweet spot */}
          <circle cx="12" cy="10" r="2.1" fill="#c8f135" />
        </svg>
      </div>
    </>
  );
}
