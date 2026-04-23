"use client";

import type { SkillsPayload } from "@/lib/types";
import { motion } from "framer-motion";

export function SkillsSection({ data }: { data: SkillsPayload }) {
  return (
    <section
      id="skills"
      className="relative border-t border-white/[0.06] px-4 py-24 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-glow">
            Skills & recognition
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
            Tooling grid and credibility layer
          </h2>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55 }}
            className="glass lg:col-span-2 rounded-2xl p-6 sm:p-8"
          >
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-slate-500">
              Languages & tools
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.languages_tools.map((tool, i) => (
                <motion.span
                  key={tool}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.02, duration: 0.25 }}
                  whileHover={{ y: -2, borderColor: "rgba(34,211,238,0.45)" }}
                  className="cursor-default rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-100"
                >
                  {tool}
                </motion.span>
              ))}
            </div>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: 0.05, duration: 0.55 }}
              className="glass-strong rounded-2xl p-6"
            >
              <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-slate-500">
                Awards
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-100">
                {data.awards.map((a) => (
                  <li key={a} className="flex gap-2">
                    <span className="text-amber-300">★</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: 0.1, duration: 0.55 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-slate-500">
                Certifications
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                {data.certifications.map((c) => (
                  <li key={c} className="flex gap-2">
                    <span className="text-cyan-glow">◇</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
