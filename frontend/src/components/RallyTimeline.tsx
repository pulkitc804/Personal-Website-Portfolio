"use client";

import { useEffect, useRef, useState } from "react";
import type { CardSpec } from "@/lib/deck";
import SectionHead from "./SectionHead";
import Reveal from "./Reveal";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/**
 * The career as a rally: each role is a big logo + the real details, and the
 * optic ball travels a court-line path that bounces between the logos as you
 * scroll. The motion is the navigation thread (progress + the eye's guide),
 * not decoration. Logos are the heroes; this is deliberately not a card grid.
 */
export default function RallyTimeline({
  id,
  title,
  caption,
  stations,
  index,
  meta,
}: {
  id: string;
  title: string;
  caption: string;
  stations: CardSpec[];
  index?: string;
  meta?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const plateRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pathRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const ballRef = useRef<SVGGElement>(null);
  const lenRef = useRef(0);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  // Build the path through the measured logo-plate centers.
  useEffect(() => {
    function build() {
      const c = wrap.current;
      if (!c) return;
      const cr = c.getBoundingClientRect();
      const W = cr.width;
      const H = c.scrollHeight;
      const pts = plateRefs.current
        .filter(Boolean)
        .map((el) => {
          const r = el!.getBoundingClientRect();
          return { x: r.left - cr.left + r.width / 2, y: r.top - cr.top + r.height / 2 };
        });
      if (!pts.length) return;
      let d = `M ${W / 2} 0`;
      let prev = { x: W / 2, y: 0 };
      pts.forEach((p) => {
        const my = (prev.y + p.y) / 2;
        d += ` C ${prev.x} ${my}, ${p.x} ${my}, ${p.x} ${p.y}`;
        prev = p;
      });
      const my = (prev.y + H) / 2;
      d += ` C ${prev.x} ${my}, ${W / 2} ${my}, ${W / 2} ${H}`;
      [pathRef.current, trailRef.current].forEach((pl) => pl?.setAttribute("d", d));
      const len = pathRef.current?.getTotalLength() ?? 0;
      lenRef.current = len;
      if (trailRef.current) {
        trailRef.current.style.strokeDasharray = `${len}`;
        trailRef.current.style.strokeDashoffset = `${len}`;
      }
      setDims({ w: W, h: H });
    }
    build();
    const ro = new ResizeObserver(build);
    if (wrap.current) ro.observe(wrap.current);
    // re-measure once images settle
    const t = setTimeout(build, 600);
    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, [stations.length]);

  // Scroll-link the ball + draw the trail behind it.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const c = wrap.current;
        const path = pathRef.current;
        if (!c || !path || !lenRef.current) return;
        const r = c.getBoundingClientRect();
        const prog = clamp(
          (window.innerHeight * 0.5 - r.top) / (r.height || 1),
          0,
          1
        );
        const pt = path.getPointAtLength(prog * lenRef.current);
        ballRef.current?.setAttribute("transform", `translate(${pt.x}, ${pt.y})`);
        if (trailRef.current)
          trailRef.current.style.strokeDashoffset = `${(1 - prog) * lenRef.current}`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [dims]);

  return (
    <section
      id={id}
      className="sheen relative bg-court-deep text-chalk"
      style={{ ["--sel" as string]: "#c8f135" }}
    >
      <div className="mx-auto max-w-6xl px-5 py-20 lg:py-24">
        <SectionHead title={title} caption={caption} index={index} meta={meta} dark />

        <div ref={wrap} className="relative mt-14">
          {/* the rally path (desktop only — measured against the two-column layout) */}
          <svg
            className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
            viewBox={`0 0 ${dims.w || 1} ${dims.h || 1}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            <path ref={pathRef} fill="none" stroke="rgba(242,238,226,0.16)" strokeWidth="2" strokeDasharray="2 10" />
            <path ref={trailRef} fill="none" stroke="#c8f135" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.9" />
            <g ref={ballRef}>
              <circle r="10" fill="#c8f135" />
              {Array.from({ length: 5 }).map((_, i) => {
                const a = (i / 5) * Math.PI * 2;
                const round = (n: number) => Math.round(n * 100) / 100;
                return <circle key={i} cx={round(Math.cos(a) * 4.6)} cy={round(Math.sin(a) * 4.6)} r="1.3" fill="#0b4446" opacity="0.6" />;
              })}
            </g>
          </svg>

          <ol className="space-y-16 lg:space-y-28">
            {stations.map((s, i) => {
              const right = i % 2 === 1;
              return (
                <li
                  key={s.id}
                  className="relative grid items-center gap-6 md:grid-cols-2 md:gap-14"
                >
                  {/* logo plate */}
                  <div className={right ? "md:order-2 md:flex md:justify-start" : "md:flex md:justify-end"}>
                    <div
                      ref={(el) => {
                        plateRefs.current[i] = el;
                      }}
                      className={`flex h-32 w-full max-w-sm items-center justify-center rounded-2xl px-8 ring-1 ring-black/20 ${
                        s.logo ? (s.logoDark ? "bg-[#0b0f0e]" : "bg-white") : "bg-court"
                      }`}
                    >
                      {s.logo ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={s.logo}
                          alt={`${s.title} logo`}
                          className="max-h-14 max-w-[80%] object-contain"
                        />
                      ) : (
                        <span className="display text-2xl uppercase text-chalk">{s.title}</span>
                      )}
                    </div>
                  </div>

                  {/* details */}
                  <Reveal delay={60} className={right ? "md:text-right" : ""}>
                    <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ball">
                      {s.badge}
                    </div>
                    <h3 className="display mt-1.5 text-[1.6rem] uppercase leading-none">
                      {s.title}
                    </h3>
                    <div className="mt-1.5 text-sm text-chalk/55">{s.sub}</div>
                    <p className="mt-3 max-w-[46ch] text-[0.98rem] leading-relaxed text-chalk/80 [text-wrap:pretty] md:ml-auto">
                      {s.ability}
                    </p>
                    <div className={`mt-3.5 flex flex-wrap gap-2 ${right ? "md:justify-end" : ""}`}>
                      {s.stats.map((st) => (
                        <span
                          key={st.k}
                          className="tnum rounded-md bg-white/[0.05] px-2.5 py-1 font-mono text-[11px] text-chalk/85"
                        >
                          <span className="text-chalk/45">{st.k} </span>
                          {st.v}
                        </span>
                      ))}
                    </div>
                    {s.back.link && (
                      <a
                        href={s.back.link}
                        target="_blank"
                        rel="noreferrer"
                        className={`pressable mt-4 inline-flex items-center gap-1.5 rounded-full border border-chalk/25 px-4 py-2 text-sm font-medium text-chalk transition-colors hover:border-ball hover:text-ball ${
                          right ? "md:ml-auto" : ""
                        }`}
                      >
                        {s.back.linkLabel ?? "Open"}
                        <span aria-hidden>→</span>
                      </a>
                    )}
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
