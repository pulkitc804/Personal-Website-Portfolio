/**
 * One accurate pickleball court, drawn once, shown only in fragments.
 *
 * The research behind this: supergraphics scale-and-crop (you recognize the
 * form from a fragment), blueprint discipline (uniform hairline strokes, 0/45
 * degree lines, sparse monospace dimension labels with leader lines), and
 * strict two-color chalk-on-teal. Real proportions from published court
 * drawings: 20ft x 44ft, net across the middle, non-volley zone 7ft each side,
 * centerline splitting each service court. 1ft = 10 SVG units.
 *
 * Each section shows a DIFFERENT crop (variety through subject, never a tiled
 * motif), authored via viewBox so the framing is deliberate at every size.
 * Strokes stay hairline under any scaling via non-scaling-stroke. The wrapper
 * is expected to mask the edges so the drawing dissolves into the surface.
 */
const W = 200; // 20ft
const L = 440; // 44ft
const NET = 220;
const KIT = 70; // 7ft

type Crop = "baseline" | "kitchen" | "service";

const VIEWBOX: Record<Crop, string> = {
  /* hero: the near baseline corner, sideline running off-frame */
  baseline: "-36 250 300 240",
  /* projects: the net band and both kitchen lines */
  kitchen: "-24 118 260 204",
  /* contact: the right service box, where a serve lands */
  service: "64 244 232 216",
};

export default function CourtDiagram({
  crop,
  className = "",
}: {
  crop: Crop;
  className?: string;
}) {
  const chalk = "#f2eee2";
  const line = {
    stroke: chalk,
    strokeOpacity: 0.14,
    strokeWidth: 1.5,
    vectorEffect: "non-scaling-stroke" as const,
    fill: "none" as const,
  };
  const label = {
    fill: chalk,
    fillOpacity: 0.17,
    fontSize: 7.5,
    letterSpacing: 1.2,
  };

  return (
    <svg
      viewBox={VIEWBOX[crop]}
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none select-none ${className}`}
      aria-hidden
    >
      {/* boundary */}
      <rect x={0} y={0} width={W} height={L} {...line} />
      {/* net line */}
      <line x1={-14} y1={NET} x2={W + 14} y2={NET} {...line} />
      {/* non-volley (kitchen) lines */}
      <line x1={0} y1={NET - KIT} x2={W} y2={NET - KIT} {...line} />
      <line x1={0} y1={NET + KIT} x2={W} y2={NET + KIT} {...line} />
      {/* centerlines, baseline to kitchen on both halves */}
      <line x1={W / 2} y1={0} x2={W / 2} y2={NET - KIT} {...line} />
      <line x1={W / 2} y1={NET + KIT} x2={W / 2} y2={L} {...line} />

      {crop === "baseline" && (
        <g className="font-mono">
          {/* the one optic accent this section is allowed: a serve arc landing
              past the kitchen, with its bounce point marked */}
          <path
            d="M 26 478 Q 112 308 216 342"
            fill="none"
            stroke="#c8f135"
            strokeOpacity={0.2}
            strokeWidth={1.5}
            strokeDasharray="5 7"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx={216} cy={342} r={2.4} fill="#c8f135" fillOpacity={0.3} />
          {/* one dimension callout: the court length, noted at the sideline */}
          <line
            x1={214}
            y1={290}
            x2={214}
            y2={440}
            {...line}
            strokeDasharray="3 5"
          />
          <circle cx={214} cy={290} r={1.6} fill={chalk} fillOpacity={0.16} />
          <circle cx={214} cy={440} r={1.6} fill={chalk} fillOpacity={0.16} />
          <text x={222} y={368} {...label}>
            44&apos;-0&quot;
          </text>
        </g>
      )}
      {crop === "kitchen" && (
        <g className="font-mono">
          <line
            x1={-12}
            y1={NET - KIT}
            x2={-12}
            y2={NET}
            {...line}
            strokeDasharray="3 5"
          />
          <circle cx={-12} cy={NET - KIT} r={1.6} fill={chalk} fillOpacity={0.16} />
          <circle cx={-12} cy={NET} r={1.6} fill={chalk} fillOpacity={0.16} />
          <text x={8} y={NET - KIT - 8} {...label}>
            NON-VOLLEY ZONE 7&apos;-0&quot;
          </text>
        </g>
      )}
      {crop === "service" && (
        <g className="font-mono">
          <text x={116} y={368} {...label}>
            SERVICE
          </text>
        </g>
      )}
    </svg>
  );
}
