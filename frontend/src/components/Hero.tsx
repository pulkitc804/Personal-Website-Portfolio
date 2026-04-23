"use client";

import type { Profile } from "@/lib/types";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";

function MagneticGlow() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  const background = useMotionTemplate`radial-gradient(520px circle at ${mx}px ${my}px, rgba(34,211,238,0.14), transparent 55%), radial-gradient(420px circle at ${mx}px ${my}px, rgba(167,139,250,0.12), transparent 50%)`;

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 -z-10 opacity-80"
      style={{ background }}
    />
  );
}

export function Hero({ profile }: { profile: Profile }) {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col justify-center px-4 pb-24 pt-28 sm:px-6"
    >
      <MagneticGlow />
      <div className="pointer-events-none absolute inset-x-0 top-24 mx-auto h-px max-w-3xl bg-gradient-to-r from-transparent via-cyan-glow/40 to-transparent" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[11px] text-slate-400 backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            <span className="tracking-[0.18em] uppercase">portfolio / terminal</span>
            <span className="text-slate-600">v0.1.0</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            <span className="text-gradient">{profile.name}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="max-w-2xl text-lg text-slate-300 sm:text-xl"
          >
            {profile.headline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.65 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href={profile.linkedin_url}
              target="_blank"
              rel="noreferrer"
              className="group relative overflow-hidden rounded-xl px-6 py-3 font-medium text-slate-950"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-glow to-sky-400 opacity-100 transition group-hover:opacity-90" />
              <span className="relative flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-widest">
                  LinkedIn
                </span>
                <motion.span
                  aria-hidden
                  className="text-lg"
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                >
                  ↗
                </motion.span>
              </span>
            </Link>
            <Link
              href={profile.github_url}
              target="_blank"
              rel="noreferrer"
              className="glass-strong group relative overflow-hidden rounded-xl px-6 py-3 font-medium text-slate-100 shadow-glow transition hover:border-violet-glow/40"
            >
              <span className="relative flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-widest text-violet-glow">
                  GitHub
                </span>
                <motion.span
                  aria-hidden
                  className="text-lg text-slate-200"
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                >
                  ↗
                </motion.span>
              </span>
            </Link>
          </motion.div>
        </div>

        <motion.aside
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.28, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="glass relative w-full max-w-md overflow-hidden rounded-2xl p-6 shadow-card lg:mb-2"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-glow/10 via-transparent to-violet-glow/10" />
          <div className="relative space-y-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
                Key stat
              </p>
              <div className="mt-2 flex flex-wrap items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  {profile.gpa}
                </span>
                <span className="text-sm text-slate-400">cumulative GPA</span>
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
                Coursework signal
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.coursework.map((c) => (
                  <span
                    key={c}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-slate-200"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-glow/25 to-transparent opacity-40"
            animate={{ y: ["-100%", "120%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
        </motion.aside>
      </div>

      <div className="pointer-events-none absolute bottom-10 left-1/2 hidden -translate-x-1/2 sm:block">
        <motion.div
          className="h-10 w-6 rounded-full border border-white/15"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        >
          <motion.div
            className="mx-auto mt-2 h-1.5 w-1 rounded-full bg-cyan-glow"
            animate={{ opacity: [0.2, 1, 0.2], y: [0, 10, 0] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          />
        </motion.div>
      </div>
    </section>
  );
}
