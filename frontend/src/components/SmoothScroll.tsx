"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Weighted smooth scroll. Lenis drives the real window scroll position (it
 * does not transform a wrapper), so everything already keyed to scrollY keeps
 * working untouched: the hero net cord's tension, the rally timeline's ball on
 * its wave, IntersectionObserver reveals. Disabled entirely under
 * prefers-reduced-motion and on coarse pointers, where native inertia is better.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // touch devices already have good native inertia; smoothing fights it
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // in-page anchors (side rail, nav, CTAs) route through Lenis
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href")?.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -8 });
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
