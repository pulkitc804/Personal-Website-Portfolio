"use client";

import type { Profile } from "@/lib/types";
import {
  fadeUpAnimate,
  fadeUpInitial,
  scrollTransition,
  scrollViewport,
} from "@/lib/motion-presets";
import { motion } from "framer-motion";
import Link from "next/link";

export function Footer({ profile }: { profile: Profile }) {
  return (
    <motion.footer
      initial={fadeUpInitial}
      whileInView={fadeUpAnimate}
      viewport={scrollViewport}
      transition={scrollTransition}
      className="snap-start border-t border-white/[0.08] bg-black/40 px-4 py-12 sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 text-sm text-slate-500 sm:flex-row sm:items-center">
        <p className="font-mono text-xs">
          © {new Date().getFullYear()} {profile.name} — engineered stack: Next.js ·
          FastAPI
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href={profile.linkedin_url}
            className="transition-colors hover:text-cyan-glow"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </Link>
          <Link
            href={profile.github_url}
            className="transition-colors hover:text-violet-glow"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </Link>
          <Link href="#hero" className="transition-colors hover:text-slate-200">
            Back to top
          </Link>
        </div>
      </div>
    </motion.footer>
  );
}
