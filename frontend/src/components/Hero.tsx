"use client";

import type { Profile } from "@/lib/types";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

const heroReveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

function linkedinDisplayUrl(url: string) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const path = u.pathname.replace(/\/$/, "") || u.pathname;
    return `${host}${path}`;
  } catch {
    return "linkedin.com/in/pc804";
  }
}

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

  const background = useMotionTemplate`radial-gradient(520px circle at ${mx}px ${my}px, rgba(248,113,113,0.16), transparent 55%), radial-gradient(420px circle at ${mx}px ${my}px, rgba(253,164,175,0.14), transparent 50%)`;

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 -z-10 opacity-90"
      style={{ background }}
    />
  );
}

export function Hero({ profile }: { profile: Profile }) {
  const linkedinLabel = linkedinDisplayUrl(profile.linkedin_url);

  return (
    <section
      id="hero"
      className="relative flex min-h-screen snap-start snap-always flex-col justify-center px-4 pb-24 pt-28 sm:px-6"
    >
      <MagneticGlow />
      <div className="pointer-events-none absolute inset-x-0 top-24 mx-auto h-px max-w-3xl bg-gradient-to-r from-transparent via-cyan-glow/50 to-transparent" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl space-y-8">
          <motion.div
            {...heroReveal}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-3 rounded-full border border-white/18 bg-white/[0.07] px-4 py-1.5 font-mono text-[11px] text-slate-300 backdrop-blur-md"
          >
            <span
              className="relative inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 border-white/85 bg-white/15 shadow-[0_0_22px_rgba(255,255,255,0.45)]"
              aria-hidden
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.95)]" />
            </span>
            <span className="tracking-[0.14em] uppercase">
              Portfolio · builds · research
            </span>
            <span className="text-slate-500">v0.2.1</span>
          </motion.div>

          <motion.h1
            {...heroReveal}
            transition={{ delay: 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-visible text-5xl font-bold leading-[1.25] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            <span className="hero-name">{profile.name}</span>
          </motion.h1>

          <motion.p
            {...heroReveal}
            transition={{ delay: 0.1, duration: 0.62 }}
            className="max-w-2xl text-lg leading-relaxed text-slate-200 sm:text-xl"
          >
            {profile.headline}
          </motion.p>

          <div className="max-w-2xl space-y-4">
            {profile.bio.split("\n\n").map((para, i) => (
              <motion.p
                key={i}
                {...heroReveal}
                transition={{ delay: 0.14 + i * 0.05, duration: 0.6 }}
                className="text-base leading-relaxed text-slate-300 sm:text-lg"
              >
                {para}
              </motion.p>
            ))}
          </div>

          <motion.div
            {...heroReveal}
            transition={{ delay: 0.22, duration: 0.6 }}
            className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center"
          >
            <Link
              href={profile.linkedin_url}
              target="_blank"
              rel="noreferrer"
              className="group relative order-first overflow-hidden rounded-xl px-8 py-4 text-center font-semibold text-slate-950 shadow-glow ring-2 ring-cyan-glow/55 transition hover:ring-cyan-glow/80 sm:order-none sm:text-left"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-glow via-red-200 to-red-300 opacity-100 transition group-hover:brightness-110" />
              <span className="relative flex flex-col items-center gap-0.5 sm:items-start">
                <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-slate-900/90">
                  LinkedIn
                  <motion.span
                    aria-hidden
                    className="text-base font-normal"
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 380, damping: 20 }}
                  >
                    ↗
                  </motion.span>
                </span>
                <span className="text-sm font-sans font-medium tracking-tight text-slate-900/80">
                  {linkedinLabel}
                </span>
              </span>
            </Link>
            <Link
              href={profile.github_url}
              target="_blank"
              rel="noreferrer"
              className="glass-strong group relative overflow-hidden rounded-xl px-6 py-3.5 font-medium text-slate-100 shadow-glow transition hover:border-cyan-glow/35 hover:brightness-110"
            >
              <span className="relative flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-violet-glow">
                GitHub
                <motion.span
                  aria-hidden
                  className="text-lg text-slate-100"
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 380, damping: 20 }}
                >
                  ↗
                </motion.span>
              </span>
            </Link>
          </motion.div>
        </div>

        <div className="flex w-full max-w-md flex-shrink-0 flex-col gap-6 lg:mx-0 lg:ml-auto">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 0.16,
              duration: 0.75,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative w-full"
          >
            <div
              className="relative overflow-hidden rounded-2xl bg-void shadow-[0_0_40px_-8px_rgba(248,113,113,0.22)]"
              style={{ aspectRatio: "3 / 4" }}
            >
              <Image
                src="/profile-headshot.png"
                alt={`${profile.name} — professional photo`}
                fill
                className="object-cover object-[center_18%] scale-[1.12] [transform-origin:center]"
                sizes="(max-width: 1024px) 100vw, 28rem"
                priority
              />
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-void/35 via-transparent to-transparent" />
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 26 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.22, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="glass relative w-full overflow-hidden rounded-2xl p-6 shadow-card"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-glow/12 via-transparent to-violet-glow/12" />
            <div className="relative space-y-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  LinkedIn
                </p>
                <Link
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block rounded-xl border border-cyan-glow/35 bg-cyan-glow/10 px-4 py-3 text-sm font-medium text-rose-50 transition hover:border-cyan-glow/55 hover:bg-cyan-glow/15"
                >
                  <span className="font-mono text-xs text-cyan-glow/90">
                    {linkedinLabel}
                  </span>
                  <span className="mt-1 block text-xs text-slate-300">
                    Roles, coursework, and project highlights — best viewed on
                    LinkedIn.
                  </span>
                </Link>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  Focus areas
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-lg border border-cyan-glow/35 bg-cyan-glow/15 px-2.5 py-1 text-xs text-rose-50">
                    Quant Research
                  </span>
                  <span className="rounded-lg border border-violet-glow/35 bg-violet-glow/15 px-2.5 py-1 text-xs text-rose-50">
                    ML Systems
                  </span>
                  <span className="rounded-lg border border-emerald-300/35 bg-emerald-300/15 px-2.5 py-1 text-xs text-emerald-50">
                    AI Engineering
                  </span>
                  <span className="rounded-lg border border-cyan-glow/35 bg-cyan-glow/15 px-2.5 py-1 text-xs text-rose-50">
                    Software Engineering
                  </span>
                  <span className="rounded-lg border border-violet-glow/35 bg-violet-glow/15 px-2.5 py-1 text-xs text-rose-50">
                    Data Science
                  </span>
                </div>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  Academic profile
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-200">
                  <span className="rounded-md border border-white/14 bg-white/[0.06] px-2 py-0.5 font-mono text-xs text-slate-100">
                    GPA {profile.gpa}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span>
                    Math, statistics, systems, and data-focused coursework (see
                    below)
                  </span>
                </div>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  Core coursework
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.coursework.map((c) => (
                    <span
                      key={c}
                      className="rounded-lg border border-white/14 bg-white/[0.06] px-2.5 py-1 text-xs text-slate-100"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-10 left-1/2 hidden -translate-x-1/2 sm:block">
        <motion.div
          className="h-10 w-6 rounded-full border border-white/25"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <motion.div
            className="mx-auto mt-2 h-1.5 w-1 rounded-full bg-cyan-glow"
            animate={{ opacity: [0.2, 1, 0.2], y: [0, 9, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        </motion.div>
      </div>
    </section>
  );
}
