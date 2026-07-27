"use client";

import { useEffect, useRef } from "react";

/**
 * Wraps a control so it leans toward the cursor and springs back. Moves a
 * wrapper span (not the child), so the inner button keeps its own hover state
 * with no conflict. Pointer-fine + motion-OK only; a no-op everywhere else.
 */
export default function Magnetic({
  children,
  strength = 0.35,
  radius = 80,
  className = "",
}: {
  children: React.ReactNode;
  strength?: number;
  radius?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    const el = ref.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const range = Math.max(r.width, r.height) / 2 + radius;
      if (Math.hypot(dx, dy) < range) {
        el.style.transform = `translate(${(dx * strength).toFixed(1)}px, ${(dy * strength).toFixed(1)}px)`;
      } else if (el.style.transform) {
        el.style.transform = "";
      }
    };
    const reset = () => {
      if (el.style.transform) el.style.transform = "";
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", reset);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", reset);
    };
  }, [strength, radius]);

  return (
    <span
      ref={ref}
      className={`inline-block transition-transform duration-300 ease-out will-change-transform ${className}`}
    >
      {children}
    </span>
  );
}
