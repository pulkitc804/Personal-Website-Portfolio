"use client";

import { useEffect, useRef } from "react";

/**
 * The section masthead, art-directed as a printed tournament program rather
 * than a generic heading block. A meta rail (game index, a rule that draws
 * itself as the section enters, court stamp), then an asymmetric title row:
 * oversized tight-tracked title on the left seven columns, caption offset to
 * the far right, and a large outlined numeral holding the right margin.
 *
 * Only the rule and numeral animate. The words are visible from first paint,
 * so nothing is gated behind a transition.
 */
export default function SectionHead({
  title,
  caption,
  dark = false,
  index,
  meta,
}: {
  title: string;
  caption?: string;
  dark?: boolean;
  /** two-digit game number, e.g. "03" */
  index?: string;
  /** right-margin stamp, e.g. "kitchen line" */
  meta?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.drawn = "true";
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.dataset.drawn = "true";
            io.disconnect();
          }
        });
      },
      { rootMargin: "0px 0px -18% 0px", threshold: 0.01 }
    );
    io.observe(el);
    // safety: never leave the rule undrawn
    const t = window.setTimeout(() => (el.dataset.drawn = "true"), 2600);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  const dim = dark ? "text-chalk/45" : "text-ink/45";
  const body = dark ? "text-chalk/70" : "text-ink-soft";

  return (
    <header ref={ref} className="section-head relative mb-12 lg:mb-16" data-drawn="false">
      {/* meta rail */}
      <div className="flex items-center gap-4 lg:gap-6">
        {index && (
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.22em] text-ball">
            Game {index}
          </span>
        )}
        <span
          aria-hidden
          className={`head-rule h-px flex-1 origin-left ${dark ? "bg-chalk/25" : "bg-ink/20"}`}
        />
        {meta && (
          <span
            className={`shrink-0 font-mono text-[10px] uppercase tracking-[0.22em] ${dim}`}
          >
            {meta}
          </span>
        )}
      </div>

      {/* asymmetric title row */}
      <div className="relative mt-7 grid gap-x-10 gap-y-5 lg:grid-cols-12 lg:items-end">
        <h2 className="display col-span-full text-[clamp(2.5rem,7vw,4.75rem)] uppercase leading-[0.88] tracking-[-0.035em] lg:col-span-7">
          {title}
        </h2>

        {caption && (
          <p
            className={`col-span-full max-w-[40ch] text-[15px] leading-relaxed lg:col-span-4 lg:col-start-9 ${body}`}
          >
            {caption}
          </p>
        )}

        {/* outlined numeral holding the right margin */}
        {index && (
          <span
            aria-hidden
            className="head-numeral display pointer-events-none absolute -top-6 right-0 hidden select-none text-[7.5rem] leading-none tracking-tight lg:block"
          >
            {index}
          </span>
        )}
      </div>
    </header>
  );
}
