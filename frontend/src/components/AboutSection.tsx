import type { Profile } from "@/lib/types";
import SectionHead from "./SectionHead";
import Reveal from "./Reveal";

export default function AboutSection({ profile }: { profile: Profile }) {
  const paragraphs = profile.bio.split("\n\n");

  return (
    <section
      id="about"
      className="court-lines relative bg-court-deep text-chalk"
      style={{ ["--sel" as string]: "#c8f135" }}
    >
      {/* you just crossed the net into "read mode" */}
      <div className="net-divider mx-auto max-w-6xl" />
      <div className="mx-auto max-w-5xl px-5 py-24 lg:py-36">
        <SectionHead
          title="The Player"
          caption="The long version, for when you'd rather read than rally."
          index="01"
          meta="new brunswick, nj"
          dark
        />

        <div className="mt-10 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <Reveal className="space-y-5 text-[1.05rem] leading-relaxed text-chalk/80">
            {paragraphs.map((p, i) => (
              <p key={i} className="max-w-[66ch] [text-wrap:pretty]">
                {p}
              </p>
            ))}
          </Reveal>

          <Reveal delay={120}>
            <dl className="divide-y divide-chalk/12 border-y border-chalk/12">
              {[
                ["GPA", profile.gpa],
                ["Location", profile.location],
                ["Studying", "Data Science · CS · Math · Statistics"],
                ["Now", "AI Engineer @ Blaze (YC S24)"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-2.5">
                  <dt className="text-sm uppercase tracking-wide text-chalk/45">
                    {k}
                  </dt>
                  <dd className="tnum text-right text-sm font-semibold text-chalk">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-6">
              <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-chalk/45">
                Coursework
              </div>
              <ul className="flex flex-wrap gap-2">
                {profile.coursework.map((c) => (
                  <li
                    key={c}
                    className="rounded-md border border-chalk/15 bg-white/[0.04] px-2.5 py-1 text-sm text-chalk/75"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
