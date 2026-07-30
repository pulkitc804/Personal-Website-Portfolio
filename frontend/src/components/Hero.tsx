import type { Profile } from "@/lib/types";
import KineticName from "./KineticName";
import Magnetic from "./Magnetic";
import CourtDiagram from "./CourtDiagram";

/**
 * The front door: photograph left, type right, then a full-bleed band of
 * credentials across the base.
 *
 * The photograph is on the LEFT by requirement, not taste. Section nav used to
 * float on the right edge and sat across his face; the nav has since moved to a
 * bar at the bottom, and keeping the picture left means nothing fixed can ever
 * cross it again.
 *
 * The base band runs the full width on purpose. Held to the same measure as the
 * copy it read as a half-finished row with dead space either side.
 */
export default function Hero({ profile }: { profile: Profile }) {
  const ribbon: [string, string][] = [
    ["School", "Rutgers · " + profile.location.split(",")[0]],
    ["Quadruple major", "Computer Science · Data Science · Mathematics · Statistics"],
    ["GPA", profile.gpa.split(" ")[0]],
    ["On court", "AI Eng @ Blaze (YC S24)"],
  ];

  /* what he actually wants to be read for, in order */
  const focus: [string, string][] = [
    ["Agents", "Multi-agent pipelines on MCP and LLM tool-use, shipping real software end to end"],
    ["Retrieval", "RAG over real corpora, so an assistant answers from sources instead of guessing"],
    ["ML research", "How small a network can be and still solve the task, benchmarked honestly"],
  ];

  return (
    <section
      id="top"
      className="court-night relative bg-court-deep text-chalk"
      style={{ ["--sel" as string]: "#c8f135" }}
    >
      {/* the court itself, enlarged past the frame: a baseline corner in
          chalk hairline, dissolving into the floodlight */}
      <div className="diagram-mask" aria-hidden>
        <CourtDiagram crop="baseline" className="absolute -right-[10%] top-[-6%] h-[120%] w-auto min-w-[70%]" />
      </div>

      <div className="relative flex min-h-[100svh] flex-col justify-between gap-12">
        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pt-24 lg:pt-28">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-14">
            {/* ---------- the photograph ---------- */}
            <div className="portrait-grade relative aspect-[4/5] max-h-[42svh] w-full max-w-[340px] overflow-hidden rounded-2xl border border-chalk/15 lg:max-h-none lg:max-w-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/profile-headshot.png"
                alt="Pulkit Chaudhary"
                /* scale crops the black studio border baked into the source */
                className="h-full w-full scale-[1.16] object-cover object-[center_20%]"
              />
              <span
                aria-hidden
                className="absolute left-4 top-4 z-[2] h-2 w-2 rounded-full bg-ball"
              />
            </div>

            {/* ---------- type ---------- */}
            {/* container-type sizes the headline against this column, so it can
                never grow past it; min-w-0 stops long words widening the track */}
            <div className="min-w-0 [container-type:inline-size]">
              <p className="mb-5 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.16em] text-ball">
                <span className="h-2 w-2 shrink-0 rounded-full bg-ball" aria-hidden />
                {profile.location} · open to SWE / DS / AI
              </p>

              <KineticName />

              {/* the degree, in full, on ONE line: sized in container units so
                  the whole string always fits the column instead of wrapping */}
              <p className="mt-4 whitespace-nowrap font-mono text-[clamp(7.5px,1.52cqw,11.5px)] uppercase tracking-[0.09em] text-chalk/60">
                <span className="text-ball">Quadruple major</span>
                {" · Computer Science · Data Science · Mathematics · Statistics"}
              </p>

              <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-chalk/85 [text-wrap:pretty]">
                AI engineer at a YC startup, where I build multi-agent pipelines
                on MCP and LLM tool-use that research, write and deploy
                production software end to end. ML researcher at WINLAB. I teach
                data science at Rutgers, keep a hand in quantitative research,
                and spend my weekends at the kitchen line.
              </p>

              {/* the focus list: what replaced the old long-form read */}
              <dl className="mt-8 max-w-[62ch] divide-y divide-chalk/10 border-y border-chalk/10">
                {focus.map(([k, v]) => (
                  <div
                    key={k}
                    className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-5"
                  >
                    <dt className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-ball sm:w-[86px]">
                      {k}
                    </dt>
                    <dd className="min-w-0 text-[14px] leading-relaxed text-chalk/70">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Magnetic strength={0.4} radius={70}>
                  <a
                    href="#experience"
                    className="pressable inline-block rounded-full bg-ball px-6 py-3 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
                  >
                    See the work
                  </a>
                </Magnetic>
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="pressable rounded-full border border-chalk/30 px-6 py-3 text-sm font-semibold text-chalk transition-colors hover:border-chalk"
                >
                  GitHub
                </a>
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="pressable rounded-full border border-chalk/30 px-6 py-3 text-sm font-semibold text-chalk transition-colors hover:border-chalk"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- full-bleed base band ---------- */}
        <div className="relative z-10 w-full px-5 pb-24 sm:px-8 lg:px-12 lg:pb-28">
          <div className="mb-6 flex flex-wrap items-center gap-x-10 gap-y-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-chalk/30">
              Currently
            </span>
            {[
              { src: "/logos/blaze.svg", alt: "Blaze (Y Combinator S24)", h: "h-3.5" },
              { src: "/logos/rutgers.png", alt: "Rutgers University", h: "h-4" },
            ].map((l) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={l.src}
                src={l.src}
                alt={l.alt}
                className={`${l.h} w-auto opacity-55 [filter:brightness(0)_invert(1)]`}
              />
            ))}
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-chalk/50">
              WINLAB
            </span>
          </div>
          <div className="hairline mb-5" data-net-rule />
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
            {ribbon.map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-chalk/45">
                  {k}
                </dt>
                <dd className="tnum mt-1 text-sm font-semibold text-chalk">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
