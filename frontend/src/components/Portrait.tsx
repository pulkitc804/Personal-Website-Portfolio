"use client";

import { useState } from "react";

/**
 * The headshot, framed to sit in the court palette without being costumed:
 * a real photograph, a chalk hairline, and a soft court-deep gradient at the
 * base so the crop resolves into the page instead of ending on a hard edge.
 * If the file is missing the frame falls back to a monogram, so a dropped
 * asset never ships a broken image.
 */
export default function Portrait({
  src = "/profile-headshot.png",
  alt = "Pulkit Chaudhary",
}: {
  src?: string;
  alt?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-chalk/15 bg-court">
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          /* the source has a black studio border baked in; the scale crops it
             out rather than framing a frame */
          className="h-full w-full scale-[1.16] object-cover object-top"
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-court-deep">
          <span className="display text-6xl uppercase tracking-tight text-chalk/20">
            PC
          </span>
        </div>
      )}

      {/* base gradient: the crop resolves into the section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background:
            "linear-gradient(to top, rgba(7,33,31,0.92), rgba(7,33,31,0.35) 45%, transparent)",
        }}
      />

      {/* one optic tick: the only themed mark on the photo */}
      <span
        aria-hidden
        className="absolute left-4 top-4 h-2 w-2 rounded-full bg-ball"
      />
    </div>
  );
}
