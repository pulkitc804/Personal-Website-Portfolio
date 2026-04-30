"use client";

import type { SkillsPayload } from "@/lib/types";
import {
  appleEase,
  fadeUpAnimate,
  fadeUpInitial,
  scrollTransition,
  scrollTransitionFast,
  scrollViewport,
} from "@/lib/motion-presets";
import { motion } from "framer-motion";

export function SkillsSection({ data }: { data: SkillsPayload }) {
  return (
    <section
      id="skills"
      className="relative snap-start snap-always border-t border-white/[0.06] px-4 py-28 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={fadeUpInitial}
          whileInView={fadeUpAnimate}
          viewport={scrollViewport}
          transition={scrollTransition}
          className="mb-12"
        >
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-glow">
            Technical depth
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
            A track record across research, engineering, and delivery
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-400">
            Grouped by how I actually work: core languages, modeling and
            simulation, data platforms, and shipping in production contexts.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2">
          {data.skill_groups.map((group, gi) => (
            <motion.div
              key={group.label}
              initial={fadeUpInitial}
              whileInView={fadeUpAnimate}
              viewport={scrollViewport}
              transition={{
                delay: gi * 0.08,
                duration: 0.8,
                ease: appleEase,
              }}
              className="glass rounded-2xl p-6 sm:p-7"
            >
              <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-slate-400">
                {group.label}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item, i) => (
                  <motion.span
                    key={item}
                    initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                    }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      delay: i * 0.025,
                      duration: 0.45,
                      ease: appleEase,
                    }}
                    whileHover={{
                      y: -2,
                      borderColor: "rgba(248,113,113,0.45)",
                    }}
                    className="cursor-default rounded-xl border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-slate-100"
                  >
                    {item}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={fadeUpInitial}
            whileInView={fadeUpAnimate}
            viewport={scrollViewport}
            transition={{ ...scrollTransitionFast, delay: 0.05 }}
            className="glass-strong rounded-2xl p-6"
          >
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-slate-400">
              Awards & competitions
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
            initial={fadeUpInitial}
            whileInView={fadeUpAnimate}
            viewport={scrollViewport}
            transition={{ ...scrollTransitionFast, delay: 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-slate-400">
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
    </section>
  );
}
