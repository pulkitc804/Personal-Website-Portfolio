import type { Profile } from "@/lib/types";
import KineticName from "./KineticName";
import Magnetic from "./Magnetic";

/**
 * The front door, built as a magazine spread rather than a centred stack: the
 * type holds the left seven columns and the photograph the right five, running
 * full height and bleeding off the bottom of the frame so it reads as a cover
 * rather than a pasted-in avatar.
 *
 * The split is deliberately not 50/50. An even split is the most copied hero
 * on the web; an editorial ratio with the name overlapping the photograph's
 * edge is the same idea without the cliche.
 *
 * Nothing here moves on its own. The only motion is the name's letters leaning
 * away from the cursor.
 */
export default function Hero({ profile }: { profile: Profile }) {
  const ribbon: [string, string][] = [
    ["School", "Rutgers · " + profile.location.split(",")[0]],
    ["Studying", "Data Sci · CS · Math · Stats"],
    ["GPA", profile.gpa.split(" ")[0]],
    ["On court", "AI Eng @ Blaze (YC S24)"],
  ];

  return (
    <section
      id="top"
      className="court-night relative flex min-h-[100svh] flex-col overflow-hidden bg-court-deep text-chalk"
      style={{ ["--sel" as string]: "#c8f135" }}
    >
      {/* ---------- the photograph ---------- */}
      {/* Desktop: a full-height column on the right, bleeding off the bottom.
          It sits at z-0 so the name can cross over its left edge. */}
      <div
        className="portrait-grade pointer-events-none absolute bottom-0 right-0 top-0 z-0 hidden w-[42%] overflow-hidden lg:block xl:w-[38%]"
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/profile-headshot.png"
          alt=""
          /* scale crops the black studio border baked into the file */
          className="h-full w-full scale-[1.18] object-cover object-[center_18%]"
        />
        {/* a chalk hairline where the photograph meets the type */}
        <span className="absolute inset-y-0 left-0 w-px bg-chalk/15" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 pt-24 lg:pt-28">
        <div className="grid flex-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
          {/* ---------- the photograph, mobile and tablet ---------- */}
          {/* First in the DOM below lg so the face is on screen the moment the
              page opens, rather than pushed under the fold by the copy. The
              desktop column below is hidden here and takes over at lg. */}
          <div className="portrait-grade relative h-[34svh] min-h-[240px] overflow-hidden rounded-xl lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/profile-headshot.png"
              alt="Pulkit Chaudhary"
              className="h-full w-full scale-[1.18] object-cover object-[center_32%]"
            />
          </div>

          {/* ---------- type ---------- */}
          <div className="pointer-events-none lg:col-span-7">
            <p className="mb-6 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.16em] text-ball">
              <span className="h-2 w-2 shrink-0 rounded-full bg-ball" aria-hidden />
              {profile.location} · open to SWE / DS / quant
            </p>

            <KineticName />

            <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-chalk/85 [text-wrap:pretty]">
              AI engineer at a YC startup, ML researcher at WINLAB, quant on the
              side. I build systems that hold up under pressure, and I spend my
              weekends at the kitchen line.
            </p>

            <div className="pointer-events-auto mt-8 flex flex-wrap items-center gap-3">
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

      {/* ---------- credibility line + scorecard ---------- */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-8">
        <div className="mb-7 flex flex-wrap items-center gap-x-10 gap-y-4">
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
    </section>
  );
}
