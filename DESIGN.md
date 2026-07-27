# DESIGN.md — "Court Side"

## Scene
A bright outdoor pickleball court at a weekend tournament. Crisp white lines on a colored acrylic surface, the optic ball, a paper scorecard clipped to the fence. Confident and tactile, not a dark dashboard.

## Color strategy: Committed / two-tone court
Real court resurfacing colors. The page alternates court-teal bands (light text) with chalk bands (ink text), the way a two-tone court alternates playing surface and surround.

| Token | Hex | Role |
|---|---|---|
| `court` | `#0d5a5e` | deep tournament teal — primary drenched surface |
| `court-deep` | `#083538` | darker teal for depth / footer |
| `clay` | `#c2553a` | terracotta surround — secondary accent, used sparingly |
| `chalk` | `#f2eee2` | warm off-white — the painted line; light-section bg + all court lines |
| `ink` | `#10211f` | near-black green-tinted — body text on chalk |
| `ball` | `#c8f135` | optic yellow-green — the ONE signal accent (ball, key marks). Never body text. |

Contrast: ink-on-chalk and chalk-on-court both clear AA. Ball is accent/large-only.

## Type — one family, committed
- **Archivo Expanded** (700/800) — display / signage. Athletic, wide, scoreboard energy.
- **Archivo** (400/500/600) — body + UI. Same family, readable at length.
- Tabular numerals for any score/number.
- No Space Grotesk, Inter, or the reflex-reject set.

## Section system (pickleball vocabulary, used as real headings)
Serve (hero) · The Player (about) · The Season / Match Log (experience) · In the Bag (skills/loadout) · Highlight Reel (projects) · Your Serve (contact). This is the deliberate named system that replaces numbered eyebrows.

## Centerpiece
An accurately proportioned top-down SVG pickleball court (kitchen / non-volley zone, net, four service boxes, baselines) is the hero "imagery" and a recurring motif. A served ball arcs in on load. Interactive but not a game.

## Motion
Restrained, athletic. Served-ball arc on load (ease-out), scroll reveals that enhance an already-visible default, ball hover/press feedback. Full `prefers-reduced-motion` fallbacks. No bounce, no glow pulses.

## Bans honored
No glow, no glass, no gradient text, no hero-metric grid, no numbered/uppercase eyebrows, no fake ratings.
