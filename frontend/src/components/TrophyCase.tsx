"use client";

import { useEffect, useRef, useState } from "react";
import SectionHead from "./SectionHead";

/**
 * The hardware shelf: the page's one horizontal move. The masthead stays on
 * the inset grid, then the shelf breaks full bleed and runs off both edges so
 * the rhythm changes exactly once, at the end. Drag to pan, or use the wheel,
 * or Tab: every plate is focusable and scrolls itself into view, so the
 * keyboard path is the same path. Snap points keep it from feeling loose.
 */

type Plate =
  | { kind: "award"; label: string }
  | { kind: "stat"; label: string; value: string }
  | { kind: "course"; label: string };

export default function TrophyCase({
  awards,
  coursework,
  gpa,
}: {
  awards: string[];
  coursework: string[];
  gpa: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const plates: Plate[] = [
    ...awards.map((a) => ({ kind: "award" as const, label: a })),
    { kind: "stat" as const, label: "Cumulative GPA", value: gpa },
    ...coursework.map((c) => ({ kind: "course" as const, label: c })),
  ];

  // drag to pan, plus a progress read for the rail underneath
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let down = false;
    let startX = 0;
    let startLeft = 0;
    const onDown = (e: PointerEvent) => {
      if (!fine) return;
      down = true;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
      el.style.scrollSnapType = "none";
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      el.scrollLeft = startLeft - (e.clientX - startX);
    };
    const onUp = (e: PointerEvent) => {
      if (!down) return;
      down = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* pointer already released */
      }
      el.style.cursor = "";
      el.style.scrollSnapType = "";
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);

    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const nudge = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <section
      id="trophies"
      className="sheen relative overflow-hidden bg-court-deep text-chalk"
      style={{ ["--sel" as string]: "#c8f135" }}
    >
      {/* masthead stays on the inset grid */}
      <div className="mx-auto max-w-6xl px-5 pb-2 pt-20 lg:pt-24">
        <SectionHead
          title="Trophy Case"
          caption="Hardware and the coursework behind it. Push the shelf."
          index="05"
          meta="hardware"
          dark
        />
      </div>

      {/* the shelf breaks full bleed */}
      <div
        ref={trackRef}
        role="group"
        aria-label="Awards and coursework, horizontally scrollable"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") (e.preventDefault(), nudge(1));
          if (e.key === "ArrowLeft") (e.preventDefault(), nudge(-1));
        }}
        className="no-bar flex snap-x snap-proximity gap-4 overflow-x-auto px-5 pb-4 pt-2 lg:px-14"
        style={{ scrollbarWidth: "none", cursor: "grab" }}
      >
        {plates.map((p) => (
          <article
            key={p.label}
            tabIndex={0}
            className={`group relative flex shrink-0 snap-start flex-col justify-between rounded-xl border p-5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ball ${
              p.kind === "award"
                ? "h-40 w-[290px] border-clay/45 bg-clay/[0.07] hover:border-clay"
                : p.kind === "stat"
                  ? "h-40 w-[230px] border-ball/45 bg-ball/[0.06] hover:border-ball"
                  : "h-40 w-[200px] border-chalk/15 bg-white/[0.02] hover:border-chalk/45"
            }`}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-chalk/40">
              {p.kind === "award" ? "award" : p.kind === "stat" ? "record" : "coursework"}
            </span>

            {p.kind === "stat" ? (
              <span className="tnum display text-3xl leading-none text-ball">{p.value}</span>
            ) : (
              <span
                className={`display uppercase leading-tight ${
                  p.kind === "award" ? "text-lg" : "text-[15px] text-chalk/85"
                }`}
              >
                {p.label}
              </span>
            )}

            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-chalk/35">
              {p.kind === "stat" ? p.label : p.kind === "award" ? "verified" : "rutgers"}
            </span>
          </article>
        ))}
        {/* tail spacer so the last plate can snap clear of the edge */}
        <div className="w-5 shrink-0 lg:w-14" aria-hidden />
      </div>

      {/* shelf rail: real position, not decoration */}
      <div className="mx-auto max-w-6xl px-5 pb-20 lg:pb-24">
        <div className="flex items-center gap-4">
          <div className="relative h-px flex-1 bg-chalk/15">
            <span
              aria-hidden
              className="absolute -top-[1.5px] h-1 w-16 rounded-full bg-ball/70 transition-[left] duration-150"
              style={{ left: `calc(${(progress * 100).toFixed(1)}% - ${progress * 64}px)` }}
            />
          </div>
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-chalk/35">
            drag, or arrow keys
          </span>
        </div>
      </div>
    </section>
  );
}
