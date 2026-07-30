"use client";

import { useEffect, useRef } from "react";

/**
 * The name is the art: each letter of "PULKIT CHAUDHARY" leans away from the
 * cursor on a smooth spring (CSS-eased, set only on move), so the headline
 * parts around you and reforms when you leave. Restrained displacement — it
 * reads as designed, never chaotic. Pointer-fine + motion-OK only.
 */
export default function KineticName({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ok =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ok) return;
    const el = ref.current;
    if (!el) return;
    const letters = Array.from(el.querySelectorAll<HTMLElement>("[data-l]"));
    const R = 190;
    const MAX = 15;

    let raf = 0;
    const cur = { x: -9999, y: -9999 };
    const onMove = (e: PointerEvent) => {
      cur.x = e.clientX;
      cur.y = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    function apply() {
      raf = 0;
      for (const l of letters) {
        const b = l.getBoundingClientRect();
        const dx = b.left + b.width / 2 - cur.x;
        const dy = b.top + b.height / 2 - cur.y;
        const d = Math.hypot(dx, dy);
        if (d < R) {
          const f = 1 - d / R;
          const tx = ((dx / (d || 1)) * f * MAX).toFixed(2);
          const ty = ((dy / (d || 1)) * f * MAX).toFixed(2);
          l.style.transform = `translate(${tx}px, ${ty}px)`;
          l.style.opacity = `${(0.82 + f * 0.18).toFixed(2)}`;
        } else if (l.style.transform) {
          l.style.transform = "";
          l.style.opacity = "";
        }
      }
    }
    const reset = () => {
      for (const l of letters) {
        l.style.transform = "";
        l.style.opacity = "";
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", reset);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", reset);
    };
  }, []);

  const render = (word: string) =>
    word.split("").map((ch, i) => (
      <span
        key={i}
        data-l
        className="inline-block transition-[transform,opacity] duration-[450ms] ease-out will-change-transform"
      >
        {ch}
      </span>
    ));

  return (
    /**
     * The size is capped against the CONTAINER, not the viewport. An 8.5vw
     * headline overflowed its grid column on wide screens and ran into
     * whatever sat to the right of it. Sizing in cqw (container query width)
     * ties the type to the column it actually lives in, and max-w-full plus a
     * per-letter break guard means it can never push past its own box.
     */
    <h1
      className={`display max-w-full text-[clamp(2.25rem,11cqw,4.5rem)] uppercase [overflow-wrap:anywhere] [text-wrap:balance] ${className}`}
      ref={ref}
    >
      <span className="block">{render("PULKIT")}</span>
      <span className="block">{render("CHAUDHARY")}</span>
    </h1>
  );
}
