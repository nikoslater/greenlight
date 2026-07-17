# DECISIONS.md — append-only rationale, feature ideas, security calls

> Why things are the way they are. Append-only, except an idea's `Status:` line, which tracks
> its fate in place (see the loop-5 nudge idea below).

---

## 2026-02-18T09:00Z loop=0 — Threat model (5 lines)
Type: security
1. Users = individuals tracking personal habits; attackers = credential stuffers, scrapers, spammers.
2. Sensitive data = email addresses + check-in history (behavioral). No payments, no PII beyond email.
3. Trust boundary = the API; the browser client is untrusted.
4. Biggest realistic abuse = check-in endpoint spam / fake streaks, and magic-link token replay.
5. Stance = passwordless with short-lived single-use tokens, httpOnly sessions, per-user rate limits.

## 2026-02-18T09:01Z loop=0 — Stack + bootstrap assumptions (recorded per STACKS.md)
Type: decision
Call: STACKS.md web default as-is — Next.js/TS/Tailwind, Supabase Postgres + Drizzle, Supabase Auth
(magic link), Resend, Vercel, Vitest + Playwright. Zero deviations. Deps: 9 total, each justified
in PR #1. Assumed at bootstrap (marked cheap-to-change until v1.0): single-tenant per user, ~100
users year one, no offline mode beyond retry-on-reconnect.

## 2026-02-18T09:02Z loop=1 — Auth: magic link over password
Type: decision
Context: the braindump asked for email+password, so bootstrap registered it as F-006. STACKS is
explicit — never hand-roll password hashing or session crypto — and email is already the identity.
Call: email magic link (SEC-001), single-use tokens with 10-min expiry, httpOnly + SameSite cookies.
Consequence: retire F-006 entirely — less attack surface, no hash storage.

## 2026-02-18T09:15Z loop=2 — Rate limits: per-IP on the unauthenticated route, per-user on authenticated routes
Type: security
Context: the Security rung fired as soon as public routes existed. The obvious implementation —
5/min per IP on everything — would 429 legitimate users behind shared NAT (offices, mobile carriers)
the moment the authenticated check-in route lands.
Call: SEC-002 keeps the tight per-IP limit only on the unauthenticated magic-link route; authenticated
routes are limited per user (30/min) by middleware, so routes added later inherit the right behavior.

## 2026-02-18T10:05Z loop=5 — Idea: streak-break notification
Type: idea
Context: while verifying the check-in flow (F-001), realized users have no reason to return the day
a streak is at risk. A nudge is the natural retention lever and falls straight out of the core loop.
Call: propose a notification that fires when a user hasn't checked in and their streak will break tonight.
Status: pending review → **approved by the human 2026-02-19** (autonomous_feature_add is false, so only they can
green-light an idea) → **promoted to F-004** (contract written, PLANNED) by loop 18.

## 2026-02-19T08:30Z loop=12 — UX regression class: mobile overflow
Type: decision
Context: the interaction pass caught heatmap overflow at 390px and streak-number clipping under 320px —
invisible in desktop-only screenshots. This is exactly why the interaction pass exists.
Call: the heatmap becomes horizontally scrollable on narrow viewports (DESIGN.md updated);
minimum supported width set to 360px and added to the UX-001 contract.

## 2026-02-19T09:26Z loop=15 — Blocker: friend accountability pairing (F-005)
Type: blocker
Context: the Build rung reached F-005 — "pair with a friend so they see if you miss" — and it needs
product calls I won't guess: invite model (link vs email), what the partner can see (privacy), and
whether it needs a 3rd-party push service. autonomous_feature_add is false.
Call: mark F-005 BLOCKED. Needs human: (a) invite mechanism, (b) partner visibility scope.
Until it is answered, F-005 is not STABLE and it holds the DONE rung.

## 2026-02-19T09:58Z loop=17 — Major rollover to v1.0.0
Type: decision
Context: every live feature — SEC-001, SEC-002, F-001, F-002, F-003, UX-001, UX-002 — is STABLE, not
merely PASSING, which is what the rollover rung requires. F-005 is BLOCKED (no contract to re-prove)
and F-006 is RETIRED, so neither is counted here.
Call: bump to v1.0.0 as a full-retest milestone. Per the rollover rule, demote every green feature to
UNVERIFIED and retest from scratch — cheap insurance before layering new work on top.

## 2026-02-20T09:12Z loop=20 — F-004 one-email-per-day guard
Type: decision
Context: the contract says never more than one nudge per day; cron retries could double-send.
Call: a `nudges_sent(user_id, date)` unique-constraint table is checked before send — idempotent by
construction, not by timing. Send failures log the Resend error ID, never the user's email address.

## 2026-02-20T09:40Z loop=21 — Issue: streak double-counts the DST spring-forward day
Type: issue
Feature: F-002
Context: the verify pass caught the count going up twice across the spring-forward boundary —
the shared helper introduced at v1.1.0 cuts days at UTC midnight instead of local.
Status: fixed in v1.1.1

## 2026-02-20T10:30Z loop=22 — Postmortem: the shared timezone helper broke F-002
Type: decision
Context: the F-004 build (v1.1.0) needed the day boundary for its 19:00-local cron and pulled F-002's
inline date math into one shared helper *in the same change* — which STANDARDS forbids ("never refactor
and add features in the same change"). That bundled refactor quietly switched the cut-off to UTC
midnight. F-002 was demoted to UNVERIFIED because its code changed, the next Verify loop caught the DST
spring-forward double-count, and the LEDGER named v1.1.0 as the break version.
Call: the helper takes an explicit timezone and cuts days at local midnight; both callers pass the
user's TZ. Lesson logged: this is exactly the regression that "never refactor and add features in the
same change" prevents — the clean sequence was a separate refactor loop (extract the helper, re-prove
F-002) *before* building F-004. Bundling them is what let a silent bug in; demoting a feature whose
code changed is what caught it before DONE.

## 2026-02-21T08:00Z loop=25 — Issue: dashboard heatmap tooltip shows the wrong date
Type: issue
Feature: F-003
Context: reported by the human after GREENLIGHT — hovering a heatmap cell shows the previous day.
Status: open

## 2026-02-21T08:02Z loop=25 — Issue: heatmap cell click opens the wrong day's detail
Type: issue
Feature: F-003
Context: same report — clicking a cell opens the day after; an off-by-one shared with the tooltip bug.
Status: open

## 2026-02-21T08:05Z loop=25 — Issue: check-in button double-fires on a slow connection
Type: issue
Feature: F-001
Context: reported by the human — tapping check-in on a bad connection records two check-ins before the first response returns.
Status: open
