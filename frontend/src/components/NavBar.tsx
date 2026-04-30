"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

const links = [
  { href: "#hero", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
];

export function NavBar() {
  const { scrollY } = useScroll();
  const headerBg = useTransform(
    scrollY,
    [0, 100],
    ["rgba(7, 16, 24, 0.42)", "rgba(7, 16, 24, 0.9)"],
  );

  return (
    <motion.header
      style={{ backgroundColor: headerBg }}
      className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] backdrop-blur-xl"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="#hero"
          className="font-mono text-xs tracking-[0.2em] text-slate-400 transition-colors hover:text-cyan-glow"
        >
          PC<span className="text-cyan-glow">::</span>SYS
        </Link>
        <nav className="hidden items-center gap-6 sm:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-slate-300 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <motion.div
          className="font-mono text-[10px] uppercase tracking-widest text-slate-500"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          live
        </motion.div>
      </div>
    </motion.header>
  );
}
