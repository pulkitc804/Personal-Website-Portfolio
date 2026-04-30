"use client";

import type { ProjectItem } from "@/lib/types";
import {
  appleEase,
  fadeUpAnimate,
  fadeUpInitial,
  scrollTransition,
  scrollViewport,
} from "@/lib/motion-presets";
import { motion } from "framer-motion";

export function ProjectsSection({ items }: { items: ProjectItem[] }) {
  return (
    <section
      id="projects"
      className="relative snap-start snap-always border-t border-white/[0.06] px-4 py-28 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={fadeUpInitial}
          whileInView={fadeUpAnimate}
          viewport={scrollViewport}
          transition={scrollTransition}
          className="mb-14 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="font-mono text-sm font-medium uppercase tracking-[0.24em] text-violet-glow sm:text-base">
              Personal projects
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              Selected builds
            </h2>
          </div>
          <p className="max-w-md text-sm text-slate-400">
            Each card opens the matching public GitHub repository (or your profile
            when the codebase is private).
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {items.map((project, i) => (
            <motion.div
              key={project.id}
              initial={fadeUpInitial}
              whileInView={fadeUpAnimate}
              viewport={scrollViewport}
              transition={{
                delay: i * 0.1,
                duration: 0.8,
                ease: appleEase,
              }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.99 }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-b from-white/[0.08] to-white/[0.03] shadow-card outline-none ring-cyan-glow/0 transition hover:border-cyan-glow/35 hover:ring-2 hover:ring-cyan-glow/25"
            >
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 z-20 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-glow focus-visible:ring-offset-2 focus-visible:ring-offset-void"
                aria-label={`Open ${project.title} on GitHub`}
              />
              <div className="pointer-events-none relative z-10 flex flex-1 flex-col gap-4 p-6">
                <div className="pointer-events-none absolute inset-px rounded-2xl opacity-0 blur-2xl transition group-hover:opacity-100">
                  <div className="h-full w-full bg-gradient-to-br from-cyan-glow/35 via-transparent to-violet-glow/35" />
                </div>
                <div className="relative flex flex-1 flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-white">
                      {project.title}
                    </h3>
                    <span className="shrink-0 rounded-full border border-cyan-glow/35 bg-cyan-glow/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-cyan-glow">
                      GitHub ↗
                    </span>
                  </div>
                  <p className="text-sm text-violet-glow">{project.subtitle}</p>
                  <p className="text-sm text-slate-300">{project.description}</p>
                  <ul className="mt-auto space-y-2 text-xs text-slate-400">
                    {project.highlights.map((h) => (
                      <li key={h} className="flex gap-2">
                        <span className="mt-0.5 text-cyan-glow">▹</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md border border-white/10 bg-black/30 px-2 py-0.5 font-mono text-[10px] text-slate-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
