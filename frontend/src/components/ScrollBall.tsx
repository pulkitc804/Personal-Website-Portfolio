"use client";

import { useEffect, useState } from "react";
import { pop, resume } from "@/lib/sound";

/** A fixed optic ball that spins with scroll progress and returns to the serve. */
export default function ScrollBall() {
  const [p, setP] = useState(0); // 0..1 scroll progress
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const prog = max > 0 ? h.scrollTop / max : 0;
      setP(prog);
      setShow(h.scrollTop > h.clientHeight * 0.6);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        resume();
        pop(0.5);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      aria-label="Back to the serve (top)"
      className={`fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-court-deep/80 backdrop-blur-sm transition-all duration-300 ${
        show ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
      style={{ boxShadow: "0 8px 24px -8px rgba(0,0,0,0.6)" }}
    >
      {/* progress ring */}
      <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="24" cy="24" r="21" fill="none" stroke="#f2eee2" strokeOpacity="0.15" strokeWidth="2" />
        <circle
          cx="24"
          cy="24"
          r="21"
          fill="none"
          stroke="#c8f135"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 21}
          strokeDashoffset={(1 - p) * 2 * Math.PI * 21}
        />
      </svg>
      {/* the ball */}
      <svg viewBox="0 0 28 28" className="h-6 w-6" style={{ transform: `rotate(${p * 720}deg)` }} aria-hidden>
        <circle cx="14" cy="14" r="12" fill="#c8f135" />
        {Array.from({ length: 7 }).map((_, i) => {
          const a = (i / 7) * Math.PI * 2;
          return <circle key={i} cx={14 + Math.cos(a) * 5.5} cy={14 + Math.sin(a) * 5.5} r="1.3" fill="#0e4f4c" opacity="0.5" />;
        })}
      </svg>
    </button>
  );
}
