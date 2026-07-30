"use client";

import { useEffect, useState } from "react";
import SoundToggle from "./SoundToggle";
import Magnetic from "./Magnetic";

/**
 * Just identity and the two controls. Section navigation lives in the floating
 * bar at the bottom of the frame (see BottomNav), which keeps it off the
 * headline and off the photograph.
 */
export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled ? "bg-court-deep/95 backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 text-chalk">
        <a href="#top" className="flex shrink-0 items-baseline gap-2">
          <span className="display text-base uppercase lg:text-lg">
            Pulkit Chaudhary
          </span>
          <span className="h-2 w-2 rounded-full bg-ball" aria-hidden />
        </a>


        <div className="flex shrink-0 items-center gap-3">
          <SoundToggle />
          <Magnetic strength={0.4} radius={60}>
            <a
              href="#contact"
              className="inline-block rounded-full border border-ball/70 px-4 py-1.5 text-sm font-semibold text-ball transition-colors hover:bg-ball hover:text-ink"
            >
              Your serve
            </a>
          </Magnetic>
        </div>
      </nav>
    </header>
  );
}
