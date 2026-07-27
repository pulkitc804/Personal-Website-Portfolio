"use client";

import { useEffect, useState } from "react";

/**
 * Court-side index: a vertical rail of section nodes on the right edge, like
 * line markers down a court. The node for the section you're in lights optic
 * and its label slides out. Replaces the generic centered nav. Desktop only;
 * the top bar carries the wordmark + controls on mobile.
 */
const SECTIONS = [
  { id: "about", label: "The Player" },
  { id: "experience", label: "The Season" },
  { id: "skills", label: "Skill Rally" },
  { id: "projects", label: "The Bracket" },
  { id: "lab", label: "The Lab" },
  { id: "analytics", label: "Court-Side" },
  { id: "trophies", label: "Trophy Case" },
  { id: "contact", label: "Your Serve" },
];

export default function SideRail() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
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
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
    >
      {SECTIONS.map((s) => {
        const on = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-current={on ? "true" : undefined}
            className="group flex items-center justify-end gap-3"
          >
            <span
              className={`font-mono text-[11px] uppercase tracking-[0.16em] transition-all duration-300 ${
                on
                  ? "text-chalk"
                  : "text-chalk/40 group-hover:text-chalk/75"
              }`}
            >
              {s.label}
            </span>
            <span
              className={`block rounded-full transition-all duration-300 ${
                on
                  ? "h-2.5 w-2.5 bg-ball"
                  : "h-1.5 w-1.5 bg-chalk/30 group-hover:bg-chalk/70"
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}
