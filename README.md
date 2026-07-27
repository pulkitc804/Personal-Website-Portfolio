# Pulkit Chaudhary — Portfolio

**Live: https://frontend-one-weld-82.vercel.app**

A pickleball-themed personal site built as a static Next.js app. No backend, no
database, no API calls: every section renders from a single content file, and
the interactive pieces compute their own frames in the browser.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Lenis ·
HTML5 canvas. Deployed on Vercel (Hobby, free).

## Layout

```
.
├── DEPLOY.md          hosting notes
├── DESIGN.md          palette, type, motion rules
├── PRODUCT.md         what the site is and who it is for
└── frontend/
    ├── public/logos/  real org marks (Blaze, WINLAB, Rutgers, QFC, Solar Car)
    └── src/
        ├── app/       layout, page, globals.css
        ├── components/
        └── lib/       portfolio-data.ts (single source of truth), deck.ts, sound.ts
```

## Run locally

```bash
cd frontend && npm install && npm run dev
```

Site: `http://localhost:3000`.

## Editing content

All copy, roles, projects, and skills live in
`frontend/src/lib/portfolio-data.ts`. Edit that file and redeploy; nothing else
holds content.

## The interactive sections

| Section | What it does |
|---|---|
| Hero | A flowing chalk sine wave the optic ball surfs. The cursor swells it, a click rings it, and scrolling pulls it taut into the page rule. |
| The Season | Experience laid on a vertical wave; the ball travels the path as you scroll. |
| Skill Rally | A paddle-cursor physics arena. Strike a tech ball to stream that stack's production log into a terminal. |
| The Bracket | Projects seeded into a tournament. Any match opens a film room with architecture, metrics, and links. |
| The Lab | Two real algorithms running live: a procedurally generated maze solved by BFS with an agent walking the path, and a Monte Carlo engine simulating GBM price paths plus their terminal distribution. |
| Court-Side Analytics | A shot map over a vector court; each zone maps to an engineering discipline. |
| Trophy Case | A full-bleed horizontal shelf you drag, wheel, or arrow through. |
| Your Serve | The contact form as a CLI terminal. |

Every interaction has a keyboard path, an `aria-live` region where content
updates, and a static fallback under `prefers-reduced-motion`.

## Deploy

See [DEPLOY.md](DEPLOY.md). Short version, from `frontend/`:

```bash
npx vercel --prod
```
