"use client";

import { useEffect, useState } from "react";

/**
 * Section navigation as a floating bar at the bottom of the frame.
 *
 * It lived on the right edge first, where being position: fixed meant it sat on
 * top of the headline and the photograph. Down here it runs along an axis the
 * page has no content on: sections are stacked vertically, so the bottom strip
 * is always empty, and a centred pill never crosses type. It also reads as a
 * control surface rather than a list of labels floating in the margin.
 */
const SECTIONS = [
  { id: "top", label: "Player" },
  { id: "experience", label: "Season" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Bracket" },
  { id: "lab", label: "Lab" },
  { id: "trophies", label: "Trophies" },
  { id: "contact", label: "Contact" },
];

export default function BottomNav() {
  const [active, setActive] = useState("top");

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        }),
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <nav
      aria-label="Sections"
      className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 sm:bottom-6"
    >
      <ul className="flex max-w-[calc(100vw-1.5rem)] items-center gap-0.5 overflow-x-auto rounded-full border border-chalk/15 bg-court-deep/85 px-1.5 py-1.5 backdrop-blur-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SECTIONS.map((s) => {
          const on = active === s.id;
          return (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                aria-current={on ? "true" : undefined}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ball ${
                  on
                    ? "bg-ball text-ink"
                    : "text-chalk/60 hover:bg-chalk/10 hover:text-chalk"
                }`}
              >
                {s.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
