# Deploying & keeping this site online — permanently, for free

Your site is now a **fully static Next.js app** (no backend, no database). That
makes hosting dead simple and **permanently free**. You no longer need Railway.

## Recommended: Vercel (free forever for personal sites)

Vercel's Hobby plan is free with no time limit and is built by the Next.js team.
This is the most reliable "set it and forget it" option.

### One-time setup (5 minutes)

1. Go to **https://vercel.com** → sign up with your **GitHub** account.
2. Click **Add New → Project** and import
   `pulkitc804/Personal-Website-Portfolio`.
3. In the import screen set:
   - **Root Directory:** `frontend`  ← important (your Next app lives in a subfolder)
   - Framework Preset: **Next.js** (auto-detected)
   - Build Command / Output: leave defaults.
4. Click **Deploy**. Done — you get a live URL like
   `pulkit-chaudhary.vercel.app`.

### After that

Every `git push` to `main` auto-deploys. Pull requests get preview URLs.
Nothing sleeps, nothing expires.

### Or deploy from the terminal

```bash
cd frontend
npx vercel          # first run links the project (pick "frontend" as root)
npx vercel --prod   # ship to production
```

## A custom domain (free for a year via GitHub Student Pack)

You're a Rutgers student, so the **GitHub Student Developer Pack** gets you a
**free domain for one year** (Namecheap `.me`, or `.tech`, etc.) plus extra
Vercel/hosting credits.

1. Apply: **https://education.github.com/pack** — verify with your
   `@scarletmail.rutgers.edu` email (instant approval most of the time).
2. Claim the **Namecheap** offer in the pack → register e.g. `pulkitchaudhary.me`.
3. In Vercel → your project → **Settings → Domains** → add the domain, and
   point Namecheap's nameservers/records to Vercel (Vercel shows the exact
   records to paste). Propagates in minutes.

> Note: the free domain renews after year 1 (~$10–20/yr). The `.vercel.app`
> subdomain is free **forever** as a fallback, so you're never offline.

## Alternative: GitHub Pages

Also free/permanent, but needs a static export. If you ever want this:

1. In `frontend/next.config.mjs` set `output: "export"` and
   `images: { unoptimized: true }`.
2. `npm run build` produces an `out/` folder → push to a `gh-pages` branch or
   use the official `actions/deploy-pages` workflow.

Vercel is the lower-effort, higher-quality choice — recommend starting there.

## Editing your content later

Everything (bio, experience, projects, skills, stat ratings) lives in one file:
`frontend/src/lib/portfolio-data.ts`. Edit it, `git push`, and Vercel redeploys.
