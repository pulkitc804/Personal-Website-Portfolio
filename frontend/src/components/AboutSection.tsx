import type { Profile } from "@/lib/types";
import SectionHead from "./SectionHead";
import Reveal from "./Reveal";
import Portrait from "./Portrait";

/**
 * The profile block. The photograph and the record carry this section; the
 * court language is held to the labels, where sports vocabulary and real
 * engineering facts sit in the same table (Position: AI Engineer, Club:
 * Blaze). That is the blend: the metaphor names things, the substance is
 * the work.
 */
export default function AboutSection({ profile }: { profile: Profile }) {
  const paragraphs = profile.bio.split("\n\n");

  const roster: [string, string][] = [
    ["Position", "AI Engineer"],
    ["Club", "Blaze (YC S24)"],
    ["School", "Rutgers, New Brunswick"],
    ["Rating", profile.gpa],
  ];

  const currently: [string, string][] = [
    ["Blaze (YC S24)", "Agentic pipeline, lead to live site"],
    ["WINLAB", "Minimal policy networks for navigation"],
    ["Rutgers Data 101", "Lecturer, weekly R recitations"],
    ["Rutgers QFC", "SABR stochastic-volatility calibration"],
  ];

  return (
    <section
      id="about"
      className="court-lines relative bg-court-deep text-chalk"
      style={{ ["--sel" as string]: "#c8f135" }}
    >
      {/* you just crossed the net into read mode */}
      <div className="net-divider mx-auto max-w-6xl" />
      <div className="mx-auto max-w-6xl px-5 py-24 lg:py-36">
        <SectionHead
          title="The Player"
          caption="Data science and engineering at Rutgers, shipped across a startup, a research lab, and a lecture hall."
          index="01"
          meta="scouting report"
          dark
        />

        <div className="grid gap-12 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-16">
          {/* photograph + roster plate */}
          <Reveal className="lg:sticky lg:top-24 lg:self-start">
            <Portrait />

            <dl className="mt-5 divide-y divide-chalk/12 border-y border-chalk/12">
              {roster.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-chalk/40">
                    {k}
                  </dt>
                  <dd className="tnum text-right text-sm font-semibold text-chalk">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {/* the read */}
          <div>
            <Reveal className="space-y-5 text-[1.05rem] leading-relaxed text-chalk/80">
              {paragraphs.map((p, i) => (
                <p key={i} className="max-w-[64ch] [text-wrap:pretty]">
                  {p}
                </p>
              ))}
            </Reveal>

            <Reveal delay={100} className="mt-10">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-chalk/40">
                On court now
              </h3>
              <ul className="mt-4 divide-y divide-chalk/10 border-t border-chalk/10">
                {currently.map(([org, what]) => (
                  <li
                    key={org}
                    className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                  >
                    <span className="display text-[15px] uppercase leading-tight text-chalk">
                      {org}
                    </span>
                    <span className="text-sm text-chalk/60 sm:text-right">{what}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={160} className="mt-10">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-chalk/40">
                Coursework
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {profile.coursework.map((c) => (
                  <li
                    key={c}
                    className="rounded-md border border-chalk/15 bg-white/[0.03] px-2.5 py-1 text-sm text-chalk/75"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
