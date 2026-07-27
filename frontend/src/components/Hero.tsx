import type { Profile } from "@/lib/types";
import HeroNetCord from "./HeroNetCord";
import KineticName from "./KineticName";
import Magnetic from "./Magnetic";

/**
 * Hero, fully symmetric: everything on the center axis. Kinetic name (letters
 * lean from your cursor), centered intro + CTAs, and the net cord below — one
 * flowing chalk sine the optic ball surfs forever; the cursor swells it, a
 * click rings it, and scrolling pulls it taut into the ribbon's rule while
 * pushing the rally forward. Scorecard ribbon closes the frame at the base.
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
      {/* the net cord — one flowing wave, surfed, swelled, rung, pulled taut */}
      <HeroNetCord className="absolute inset-0 z-0 h-full w-full" />

      <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-start px-5 pt-28 text-center sm:pt-32">
        <p className="mb-6 flex items-center justify-center gap-2.5 font-mono text-xs uppercase tracking-[0.16em] text-ball">
          <span className="h-2 w-2 rounded-full bg-ball" aria-hidden />
          {profile.location} · open to SWE / DS / quant
          <span className="h-2 w-2 rounded-full bg-ball" aria-hidden />
        </p>
        <KineticName className="text-center" />
        <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-chalk/85 [text-wrap:pretty]">
          AI engineer at a YC startup, ML researcher at WINLAB, quant on the
          side. I build systems that hold up under pressure, and I spend my
          weekends at the kitchen line.
        </p>
        <div className="pointer-events-auto mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={profile.github_url}
            target="_blank"
            rel="noreferrer"
            className="pressable rounded-full border border-chalk/30 px-6 py-3 text-sm font-semibold text-chalk transition-colors hover:border-chalk"
          >
            GitHub
          </a>
          <Magnetic strength={0.4} radius={70}>
            <a
              href="#experience"
              className="pressable inline-block rounded-full bg-ball px-6 py-3 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              See the work
            </a>
          </Magnetic>
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

      {/* honest scorecard ribbon */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-8">
        {/* credibility line: the marks of where the work actually happens.
            Only wordmarks that invert cleanly to chalk are used here. */}
        <div className="mb-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
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
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-center sm:grid-cols-4">
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
