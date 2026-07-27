"use client";

import { useEffect, useRef, useState } from "react";
import type { CardSpec } from "@/lib/deck";
import CardArt from "./CardArt";
import { pop } from "@/lib/sound";

const RARITY_LABEL: Record<CardSpec["rarity"], string> = {
  holo: "HOLO RARE",
  rare: "RARE",
  uncommon: "UNCOMMON",
};

export default function Card({ spec }: { spec: CardSpec }) {
  const [flipped, setFlipped] = useState(false);
  const flippedRef = useRef(false);
  const mounted = useRef(false);

  const tiltRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const flipBtnRef = useRef<HTMLButtonElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const backBtnRef = useRef<HTMLButtonElement>(null);

  const [fineHover, setFineHover] = useState(false);

  useEffect(() => {
    setFineHover(
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  // keep the hidden face out of the tab order + AT tree; move focus to the
  // newly revealed face so keyboard flow follows the flip.
  useEffect(() => {
    flippedRef.current = flipped;
    const f = frontRef.current as (HTMLDivElement & { inert: boolean }) | null;
    const b = backRef.current as (HTMLDivElement & { inert: boolean }) | null;
    if (f) f.inert = flipped;
    if (b) b.inert = !flipped;
    if (tiltRef.current) tiltRef.current.style.transform = "";

    if (!mounted.current) {
      mounted.current = true;
      return; // don't steal focus on initial render
    }
    if (flipped) (linkRef.current ?? backBtnRef.current)?.focus();
    else flipBtnRef.current?.focus();
  }, [flipped]);

  const onMove = (e: React.PointerEvent) => {
    if (!fineHover || flippedRef.current) return;
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  };
  const onLeave = () => {
    if (tiltRef.current) tiltRef.current.style.transform = "";
  };

  const frame = `frame frame-${spec.rarity}`;

  return (
    <article className="card-scene" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div ref={tiltRef} className="card-tilt">
        <div className={`card-inner ${flipped ? "is-flipped" : ""}`}>
          {/* ---------- FRONT (semantic content + overlay flip button) ---------- */}
          <div
            ref={frontRef}
            className={`card-face card-front ${frame}`}
            aria-hidden={flipped}
          >
            <div className="flex h-full flex-col px-3.5 py-3 text-chalk">
              <div className="flex items-center justify-between">
                <span className="rounded bg-black/25 px-2 py-0.5 font-mono text-[10px] tracking-wider text-ball">
                  {spec.badge}
                </span>
                <span
                  className={`font-mono text-[10px] tracking-wider ${
                    spec.rarity === "holo" ? "text-ball" : "text-chalk/60"
                  }`}
                >
                  ◆ {RARITY_LABEL[spec.rarity]}
                </span>
              </div>

              <div className="mt-2 h-[42%] rounded-lg border border-chalk/12 bg-court-deep/40 p-1">
                {spec.logo ? (
                  <div
                    className={`flex h-full w-full items-center justify-center rounded-md px-4 py-3 ${
                      spec.logoDark ? "bg-[#0b0f0e]" : "bg-white"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={spec.logo}
                      alt={`${spec.title} logo`}
                      className="max-h-full max-w-full object-contain"
                      style={{ imageRendering: spec.id === "blaze" ? "pixelated" : "auto" }}
                    />
                  </div>
                ) : (
                  <CardArt kind={spec.art} />
                )}
              </div>

              <div className="mt-2.5">
                <h3 className="display text-[1.15rem] uppercase leading-none">
                  {spec.title}
                </h3>
                <div className="mt-1 text-[11px] text-chalk/55">{spec.sub}</div>
              </div>

              <p className="mt-2 text-[12px] leading-snug text-chalk/80">
                {spec.ability}
              </p>

              <dl className="mt-auto space-y-1 border-t border-chalk/12 pt-2">
                {spec.stats.map((s) => (
                  <div key={s.k} className="flex items-baseline justify-between gap-2">
                    <dt className="font-mono text-[9px] uppercase tracking-wider text-chalk/45">
                      {s.k}
                    </dt>
                    <dd className="tnum text-right text-[11px] font-semibold text-chalk">
                      {s.v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <button
              ref={flipBtnRef}
              type="button"
              className="card-flip-btn pressable"
              aria-label={`${spec.title} — ${spec.badge} card. Flip to read details.`}
              aria-expanded={flipped}
              tabIndex={flipped ? -1 : 0}
              onClick={() => {
                pop(0.7);
                setFlipped(true);
              }}
            >
              <span aria-hidden className="font-mono text-[9px] text-chalk/45">
                tap to flip ↻
              </span>
            </button>
          </div>

          {/* ---------- BACK ---------- */}
          <div
            ref={backRef}
            className={`card-face card-back ${frame}`}
            aria-hidden={!flipped}
          >
            <div className="flex h-full flex-col px-3.5 py-3 text-chalk">
              <div className="flex items-center justify-between">
                <h3 className="display text-[0.95rem] uppercase leading-none">
                  {spec.title}
                </h3>
                <span className="font-mono text-[9px] tracking-wider text-chalk/45">
                  {spec.badge}
                </span>
              </div>

              <ul className="mt-2.5 space-y-2 overflow-y-auto pr-1 text-[11.5px] leading-snug text-chalk/85">
                {spec.back.lines.map((l, i) => (
                  <li key={i} className="flex gap-1.5">
                    <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-ball" />
                    <span>{l}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
                {spec.back.link ? (
                  <a
                    ref={linkRef}
                    href={spec.back.link}
                    target="_blank"
                    rel="noreferrer"
                    tabIndex={flipped ? 0 : -1}
                    className="pressable rounded-full bg-ball px-3 py-1.5 text-[11px] font-semibold text-ink"
                  >
                    {spec.back.linkLabel ?? "Open →"}
                  </a>
                ) : (
                  <span className="font-mono text-[9px] text-chalk/35">
                    from the résumé
                  </span>
                )}
                <button
                  ref={backBtnRef}
                  type="button"
                  tabIndex={flipped ? 0 : -1}
                  className="pressable rounded-full border border-chalk/30 px-3 py-1.5 text-[11px] font-medium text-chalk/80"
                  aria-label={`Flip ${spec.title} card back to front`}
                  onClick={() => {
                    pop(0.4);
                    setFlipped(false);
                  }}
                >
                  ↩ back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
