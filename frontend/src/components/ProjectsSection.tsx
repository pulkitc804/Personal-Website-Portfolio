"use client";

import type { ProjectItem } from "@/lib/types";
import { motion } from "framer-motion";

export function ProjectsSection({ items }: { items: ProjectItem[] }) {
  return (
    <section
      id="projects"
      className="relative px-4 py-24 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-violet-glow">
              Technical projects
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
              Systems at the intersection of ML, markets, and hardware
            </h2>
          </div>
          <p className="max-w-md text-sm text-slate-400">
            From on-device inference and voice AI to telemetry-scale Python
            pipelines and SDE-backed simulators.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {items.map((project, i) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 shadow-card"
            >
              <div className="pointer-events-none absolute inset-px rounded-2xl opacity-0 blur-2xl transition group-hover:opacity-100">
                <div className="h-full w-full bg-gradient-to-br from-cyan-glow/40 via-transparent to-violet-glow/40" />
              </div>
              <div className="relative flex flex-1 flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">
                    {project.title}
                  </h3>
                  <span className="rounded-full border border-white/10 bg-black/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-400">
                    build
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
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
