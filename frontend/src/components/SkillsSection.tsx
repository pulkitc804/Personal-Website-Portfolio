import type { SkillsPayload } from "@/lib/types";
import SectionHead from "./SectionHead";
import Reveal from "./Reveal";

export default function SkillsSection({ skills }: { skills: SkillsPayload }) {
  return (
    <section
      id="skills"
      className="court-lines relative bg-court-deep text-chalk"
      style={{ ["--sel" as string]: "#c8f135" }}
    >
      <div className="mx-auto max-w-6xl px-5 py-20 lg:py-24">
        <SectionHead
          title="In the Bag"
          caption="The gear I actually reach for, grouped by what it's for."
          dark
        />

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {skills.skill_groups.map((g, i) => (
            <Reveal key={g.label} delay={i * 70}>
              <div className="h-full rounded-2xl border border-chalk/12 bg-white/[0.03] p-5">
                <div className="mb-3 flex items-center gap-2 border-b border-chalk/12 pb-2.5">
                  <span className="h-2 w-2 rounded-full bg-clay" />
                  <h3 className="display text-lg uppercase">{g.label}</h3>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {g.items.map((it) => (
                    <li
                      key={it}
                      className="rounded-md border border-chalk/12 bg-white/[0.04] px-2.5 py-1 text-[13px] text-chalk/80"
                    >
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
