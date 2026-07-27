import type { ArtKind } from "@/lib/deck";

/**
 * Small illustrative schematics drawn chalk-on-court, one optic accent each.
 * They depict what the card's work *does* — not plotted real data — and each
 * carries a label so it can't be mistaken for a real chart.
 */
const CHALK = "#f2eee2";
const BALL = "#c8f135";

export default function CardArt({ kind }: { kind: ArtKind }) {
  return (
    <svg
      viewBox="0 0 220 130"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      {render(kind)}
    </svg>
  );
}

function label(t: string) {
  return (
    <text
      x="110"
      y="122"
      textAnchor="middle"
      fill={CHALK}
      fillOpacity="0.55"
      fontSize="9"
      fontFamily="monospace"
      letterSpacing="1.5"
    >
      {t}
    </text>
  );
}

function render(kind: ArtKind) {
  const s = { stroke: CHALK, strokeWidth: 1.6, fill: "none", strokeOpacity: 0.85 } as const;
  switch (kind) {
    case "monogram":
      return (
        <g>
          <rect x="70" y="20" width="80" height="80" rx="10" fill="#cc5b38" />
          <text x="110" y="78" textAnchor="middle" fill={CHALK} fontSize="46" fontWeight="800" fontFamily="sans-serif">
            PC
          </text>
          <circle cx="150" cy="24" r="5" fill={BALL} />
          {label("TRAINER")}
        </g>
      );
    case "agent-flow":
      return (
        <g>
          {[28, 110, 192].map((x, i) => (
            <g key={x}>
              <rect x={x - 22} y="40" width="44" height="34" rx="7" {...s} />
              {i < 2 && <line x1={x + 22} y1="57" x2={x + 38} y2="57" {...s} markerEnd="" />}
              {i < 2 && <path d={`M${x + 34} 53 L${x + 40} 57 L${x + 34} 61`} {...s} />}
            </g>
          ))}
          <circle cx="192" cy="57" r="6" fill={BALL} />
          {label("RESEARCH → IMPL → REVIEW")}
        </g>
      );
    case "maze-bfs": {
      const cells: JSX.Element[] = [];
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 7; c++)
          cells.push(
            <rect key={`${r}-${c}`} x={40 + c * 20} y={20 + r * 20} width="18" height="18" rx="2" stroke={CHALK} strokeOpacity="0.25" fill="none" />
          );
      return (
        <g>
          {cells}
          <polyline points="49,29 69,29 69,49 109,49 109,89 149,89 149,49 169,49" {...s} strokeOpacity="0.95" />
          <circle cx="169" cy="49" r="6" fill={BALL} />
          {label("BFS-OPTIMAL PATH")}
        </g>
      );
    }
    case "vol-smile":
      return (
        <g>
          <line x1="30" y1="100" x2="200" y2="100" stroke={CHALK} strokeOpacity="0.3" strokeWidth="1" />
          <path d="M36 40 Q110 118 196 40" {...s} />
          <circle cx="116" cy="92" r="6" fill={BALL} />
          {label("SABR VOL SMILE")}
        </g>
      );
    case "motion-sos":
      return (
        <g>
          <polyline points="30,70 46,70 52,40 60,96 68,52 78,70 96,70" {...s} />
          <line x1="96" y1="70" x2="120" y2="70" {...s} strokeOpacity="0.4" />
          <circle cx="120" cy="70" r="6" fill={BALL} />
          <path d="M134 70 q14 -22 28 0 q14 22 28 0" {...s} strokeOpacity="0.7" />
          {label("FALL → SOS")}
        </g>
      );
    case "telemetry-spark":
      return (
        <g>
          <polyline points="28,80 52,66 76,74 100,50 124,60 148,38 172,52 196,30" {...s} />
          <polyline points="28,96 52,90 76,94 100,84 124,90 148,80 172,86 196,76" {...s} strokeOpacity="0.4" />
          <circle cx="148" cy="38" r="6" fill={BALL} />
          {label("10K REC/SEC · 38 SIGNALS")}
        </g>
      );
    case "teach-grade":
      return (
        <g>
          <line x1="28" y1="92" x2="200" y2="92" stroke={CHALK} strokeOpacity="0.3" strokeWidth="1" />
          <path d="M30 92 C70 92 78 30 114 30 C150 30 158 92 198 92" {...s} />
          {[44, 64, 84, 104, 124, 144, 164].map((x, i) => (
            <line key={i} x1={x} y1="96" x2={x} y2={i === 3 ? 102 : 99} stroke={CHALK} strokeOpacity="0.5" strokeWidth="1.4" />
          ))}
          <circle cx="114" cy="30" r="6" fill={BALL} />
          <path d="M150 40 l5 6 l10 -13" {...s} strokeOpacity="0.95" strokeLinecap="round" />
          {label("R RECITATIONS · STATS")}
        </g>
      );
    case "mc-fan":
      return (
        <g>
          {[18, 30, 44, 58, 74].map((dy, i) => (
            <path key={i} d={`M30 70 Q110 ${70 - (dy - 46)} 196 ${30 + dy}`} {...s} strokeOpacity="0.4" />
          ))}
          <path d="M30 70 Q110 64 196 56" {...s} strokeOpacity="0.95" />
          <circle cx="196" cy="56" r="6" fill={BALL} />
          {label("MONTE-CARLO PATHS")}
        </g>
      );
  }
}
