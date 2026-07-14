# Streak

A daily habit check-in app. Tap once a day, watch your streak grow, and get a nudge the
evening a streak is about to break.

## Features (current, all tested)
- **Daily check-in** — one tap; tapping again the same day just tells you you're already done.
- **Streak counter** — counts consecutive days in *your* timezone, daylight-saving safe.
- **Dashboard** — your streak front and center plus a 12-week heatmap; works on phones.
- **Streak-break nudge** — if you haven't checked in by 7pm and your streak is 2+ days, one email (never more than one per day).
- **Sign in by email link** — no passwords, ever.

## Run it
```bash
cp .env.example .env   # fill in: DATABASE_URL, RESEND_API_KEY, APP_URL
npm install
npm run db:migrate
npm run dev            # http://localhost:3000
```
Tests: `npm test` (unit) · `npx playwright test` (smoke + UI interaction).

Built with Next.js, Supabase (Postgres + auth), Resend, on Vercel.
This project is run by [Greenlight](../../README.md) — see CONTROL.md for live status.
