"use client";

import { useEffect, useRef } from "react";
import type { SkillsPayload } from "@/lib/types";
import SectionHead from "./SectionHead";
import { pop, resume } from "@/lib/sound";

/**
 * "In the Bag" as a tactile board: sweep the cursor and chips nearby lift and
 * brighten (a magnetic field), the closest one giving a soft pop, like running
 * a paddle over your gear. Static + readable by default; the field is the
 * enhancement. Reduced-motion keeps the chips still.
 */
export default function SkillsBag({ skills }: { skills: SkillsPayload }) {
  const wrap = useRef<HTMLDivElement>(null);
  const chips = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;

    const cursor = { x: 0, y: 0, on: false };
    let raf = 0;
    let lastNearest = -1;
    let lastPop = 0;
    const R = 170;

    const onMove = (e: PointerEvent) => {
      const c = wrap.current;
      if (!c) return;
      const r = c.getBoundingClientRect();
      cursor.x = e.clientX - r.left;
      cursor.y = e.clientY - r.top;
      if (!cursor.on) {
        cursor.on = true;
        loop();
      }
    };
    const onLeave = () => {
      cursor.on = false;
    };

    function loop() {
      const c = wrap.current;
      if (!c) return;
      const cr = c.getBoundingClientRect();
      let nearest = -1;
      let nearestD = R;
      chips.current.forEach((chip, i) => {
        if (!chip) return;
        const b = chip.getBoundingClientRect();
        const cx = b.left - cr.left + b.width / 2;
        const cy = b.top - cr.top + b.height / 2;
        const dx = cursor.x - cx;
        const dy = cursor.y - cy;
        const d = Math.hypot(dx, dy);
        const f = cursor.on ? Math.max(0, 1 - d / R) : 0;
        const ease = f * f;
        chip.style.setProperty("--lit", ease.toFixed(3));
        chip.style.transform = `translate(${(dx * ease * 0.12).toFixed(1)}px, ${(dy * ease * 0.12 - ease * 6).toFixed(1)}px) scale(${(1 + ease * 0.14).toFixed(3)})`;
        if (cursor.on && d < nearestD) {
          nearestD = d;
          nearest = i;
        }
      });

      if (cursor.on && nearest !== -1 && nearest !== lastNearest) {
        const t = performance.now();
        if (t - lastPop > 70) {
          pop(0.28);
          lastPop = t;
        }
        lastNearest = nearest;
      }

      if (cursor.on) {
        raf = requestAnimationFrame(loop);
      } else {
        // settle back to rest
        chips.current.forEach((chip) => {
          if (chip) {
            chip.style.setProperty("--lit", "0");
            chip.style.transform = "";
          }
        });
        lastNearest = -1;
      }
    }

    const c = wrap.current;
    c?.addEventListener("pointermove", onMove);
    c?.addEventListener("pointerleave", onLeave);
    c?.addEventListener("pointerdown", () => resume());
    return () => {
      cancelAnimationFrame(raf);
      c?.removeEventListener("pointermove", onMove);
      c?.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  let idx = 0;
  return (
    <section
      id="skills"
      className="court-lines relative bg-court text-chalk"
      style={{ ["--sel" as string]: "#c8f135" }}
    >
      <div className="mx-auto max-w-6xl px-5 py-20 lg:py-24">
        <SectionHead
          title="In the Bag"
          caption="The gear I reach for. Sweep your cursor across the bag."
          dark
        />
        <div ref={wrap} className="mt-10 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {skills.skill_groups.map((g) => (
            <div key={g.label}>
              <div className="mb-4 flex items-center gap-2 border-b border-chalk/12 pb-2.5">
                <span className="h-2 w-2 rounded-full bg-clay" />
                <h3 className="display text-lg uppercase">{g.label}</h3>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {g.items.map((it) => {
                  const my = idx++;
                  return (
                    <span
                      key={it}
                      ref={(el) => {
                        if (el) chips.current[my] = el;
                      }}
                      className="skill-chip rounded-lg px-3 py-1.5 text-[13px]"
                    >
                      {it}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
