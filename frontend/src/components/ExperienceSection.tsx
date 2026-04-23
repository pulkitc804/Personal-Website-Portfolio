"use client";

import type { ExperienceItem } from "@/lib/types";
import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export function ExperienceSection({ items }: { items: ExperienceItem[] }) {
  return (
    <section
      id="experience"
      className="relative border-t border-white/[0.06] bg-gradient-to-b from-transparent via-panel/40 to-transparent px-4 py-24 sm:px-6"
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
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-glow">
              Experience
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
              Roles with measurable impact
            </h2>
          </div>
          <p className="max-w-md text-sm text-slate-400">
            Teaching, quantitative research, and club leadership — each lane
            optimized for throughput, rigor, and engagement.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="relative pl-6 sm:pl-10"
        >
          <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-gradient-to-b from-cyan-glow/70 via-white/15 to-violet-glow/50" />

          <div className="space-y-8">
            {items.map((role, idx) => (
              <motion.article
                key={role.id}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 shadow-card transition hover:border-cyan-glow/35 hover:shadow-glow sm:p-8"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-glow/5 via-transparent to-violet-glow/10 opacity-0 transition group-hover:opacity-100" />
                <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2 lg:max-w-xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full border border-white/10 bg-black/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-400">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-lg font-semibold text-white sm:text-xl">
                        {role.title}
                      </h3>
                    </div>
                    <p className="text-sm text-violet-glow">{role.org}</p>
                    <p className="font-mono text-xs text-slate-500">{role.period}</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-300">
                      {role.bullets.map((b) => (
                        <li key={b} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-glow/80" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
                    {role.metrics.map((m) => (
                      <span
                        key={m}
                        className="rounded-lg border border-emerald-400/25 bg-emerald-400/5 px-3 py-1 text-xs font-mono text-emerald-200"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
