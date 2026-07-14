# DECISIONS.md — append-only rationale, feature ideas, security calls

> Why things are the way they are. Append-only.

---

## 2026-02-18T09:00Z loop=1 — Threat model (5 lines)
Type: security
1. Users = individuals tracking personal habits; attackers = credential stuffers, scrapers, spammers.
2. Sensitive data = email addresses + check-in history (behavioral). No payments, no PII beyond email.
3. Trust boundary = the API; the browser client is untrusted.
4. Biggest realistic abuse = check-in endpoint spam / fake streaks, and magic-link token replay.
5. Stance = passwordless with short-lived single-use tokens, httpOnly sessions, per-user rate limits.

## 2026-02-18T09:15Z loop=2 — Auth: magic link over password
Type: decision
Context: v1 has no need to store password hashes; email is already the identity.
Call: email magic link (SEC-001), single-use tokens with 10-min expiry, httpOnly + SameSite cookies.
Consequence: retire F-006 (email/password login) entirely — less attack surface, no hash storage.

## 2026-02-18T10:05Z loop=5 — Idea: streak-break notification
Type: idea
Context: while building the streak counter (F-002), realized users have no reason to return the day
a streak is at risk. A nudge is the natural retention lever and falls straight out of the core loop.
Call: propose a notification that fires when a user hasn't checked in and their streak will break tonight.
Status: pending review → **promoted to F-004 on 2026-02-19 (loop 14 review)**.

## 2026-02-18T10:05Z loop=5 — Blocker: friend accountability pairing (F-005)
Type: blocker
Context: user floated "pair with a friend so they see if you miss." Needs product calls I won't guess:
invite model (link vs email), what the partner can see (privacy), and whether it needs a 3rd-party
push service. autonomous_feature_add is false.
Call: mark F-005 BLOCKED. Needs human: (a) invite mechanism, (b) partner visibility scope.

## 2026-02-19T08:30Z loop=12 — Major rollover to v1.0.0
Type: decision
Context: SEC-001, F-001, F-002 and F-003 have all hit STABLE — the rollover rung needs every live
feature STABLE, not merely PASSING, so hardening F-003 first (loops 9-10) was the higher rung.
Call: bump to v1.0.0 as a full-retest milestone. Per the rollover rule, demote every green feature to
UNVERIFIED and retest from scratch — cheap insurance before layering new work on top.

## 2026-02-19T09:58Z loop=17 — Postmortem: SEC-002 broke F-001
Type: security
Context: v1.1.0 added rate limiting (SEC-002) keyed per-IP at 5 req/min. Users behind shared NAT
(offices, mobile carriers) tripped the limit on a single legit check-in → 429. Regression caught by
F-001's smoke test at loop 16, traced to the v1.1.0 changelog entry.
Call: re-key the limiter per authenticated user, give the check-in route its own generous bucket, keep
the tight per-IP limit only on the unauthenticated magic-link request route. Lesson logged: any change
touching the check-in endpoint must re-run F-001 before merge.

## 2026-02-19T10:05Z loop=14-review — Stack (recorded per STACKS.md)
Type: decision
Call: STACKS.md web default as-is — Next.js/TS/Tailwind, Supabase Postgres + Drizzle, Supabase Auth
(magic link), Resend, Vercel, Vitest + Playwright. Zero deviations. Deps: 9 total, each justified
in PR #1. Assumed at bootstrap (marked cheap-to-change): single-tenant per user, ~100 users year one,
no offline mode beyond retry-on-reconnect.

## 2026-02-19T10:44Z loop=19 — UX regression class: mobile overflow
Type: decision
Context: interaction pass caught heatmap overflow at 390px and streak-number clipping <320px —
invisible in desktop-only screenshots. This is exactly why the interaction pass exists.
Call: heatmap becomes horizontally scrollable on narrow viewports (DESIGN.md updated);
minimum supported width set to 360px and added to UX-001 contract.

## 2026-02-20T10:30Z loop=22 — F-004 one-email-per-day guard
Type: decision
Context: contract says never more than one nudge/day; cron retries could double-send.
Call: `nudges_sent(user_id, date)` unique-constraint table checked before send — idempotent by
construction, not by timing. Send failures log the Resend error ID, never the user's email address.
