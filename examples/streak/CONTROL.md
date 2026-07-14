---
project: "Streak"
one_liner: "A daily habit check-in app that tracks streaks and nudges you when one is about to break."
version: "1.1.1"
status: "HARDENING"
greenlight: "no"
loop_count: 24
last_loop: "2026-02-20T11:42Z"
surface: "web"
auth: "magic-link"
data_sensitivity: "low"
persistence: "postgres"
external_services: [resend]
deploy_target: "vercel"
test_commands:
  unit: "npm test"
  smoke: "npx playwright test smoke"
  interaction: "npx playwright test ui"
autonomous_feature_add: false
stable_threshold: 3
notify: "file"
---

# CONTROL.md — source of truth for Streak

> Read this file, STANDARDS.md (Always + web + auth + persistence + external-services
> sections per the Profile), DESIGN.md for any UI work, and the ledger tails. Append only.

*(§0 Loop rules identical to the template — omitted here for brevity; keep them in a real file.)*

## 1. Charter
**Problem / user:** people who quit habits the first day they miss. One-tap daily check-in,
a visible streak, a nudge the moment a streak is at risk.
**The one job to nail:** the daily check-in must feel instant and satisfying — under 1s, one tap.
**Success:** logged-in user checks in daily, sees an accurate streak across timezones, gets
notified before a streak breaks; all features STABLE, security baseline green.
**Non-goals (v1):** native mobile apps, social feed, badges/gamification, teams.

## 2. Feature Registry (canonical spec — README derives from this)

| ID | Name | Type | Contract | Tests required |
|--------|------|------|----------|----------------|
| SEC-001 | Magic-link auth | security | Email link with single-use token, 10-min expiry; session is httpOnly+SameSite cookie; no passwords exist anywhere. | unit + smoke |
| SEC-002 | Rate limiting | security | Unauthenticated magic-link requests: 5/min per IP. Authenticated check-in: 30/min per user; a legit single daily check-in can never be blocked. | unit + abuse test |
| F-001 | Daily check-in | flow | Logged-in user taps once to check in; a second tap the same calendar day (user's TZ) is a no-op showing "already checked in"; completes <1s. | unit + interaction + screenshot |
| F-002 | Streak counter | logic | Streak = consecutive calendar days with a check-in in the user's TZ, DST-safe; missing a day resets to 0 at local midnight. | unit (TZ/DST edges) |
| F-003 | Dashboard | screen | Shows current streak (hero number) + 12-week calendar heatmap; loads <1.5s. | unit + interaction + screenshot |
| F-004 | Streak-break notification | feature | If a user hasn't checked in by 19:00 local and their streak is ≥2, send ONE email that day via Resend; never more than one/day. | unit + integration |
| UX-001 | Dashboard edge states | ux | Empty (new-user welcome + single CTA), loading skeleton, offline check-in error with auto-retry — all per DESIGN.md. | interaction + screenshot |
| UX-002 | Auth edge states | ux | Expired/used magic link shows friendly one-tap resend screen; invalid email shows inline validation. | interaction + screenshot |
| F-005 | Friend pairing | feature | BLOCKED — contract to be written after human decides invite model + partner visibility. | (spec first) |
| F-006 | Password login | security | RETIRED — replaced by SEC-001. | — |

## 3. Status Board (current state only)

| ID | Feature | Status | Passes | Last verified | Evidence |
|--------|---------|--------|--------|---------------|----------|
| SEC-001 | Magic-link auth | PASSING | 2/3 | 2026-02-20T11:42Z | sec-001-l24.txt |
| SEC-002 | Rate limiting | PASSING | 2/3 | 2026-02-20T11:42Z | sec-002-l24.txt |
| F-001 | Daily check-in | PASSING | 2/3 | 2026-02-20T11:42Z | f-001-l24.txt |
| F-002 | Streak counter | PASSING | 2/3 | 2026-02-20T11:42Z | f-002-l24.txt |
| F-003 | Dashboard | PASSING | 2/3 | 2026-02-20T11:42Z | f-003-l24-mobile.png |
| F-004 | Streak-break notify | PASSING | 2/3 | 2026-02-20T11:42Z | f-004-l24.txt |
| UX-001 | Dashboard edge states | PASSING | 2/3 | 2026-02-20T11:42Z | ux-001-l24.png |
| UX-002 | Auth edge states | PASSING | 2/3 | 2026-02-20T11:42Z | ux-002-l24.png |
| F-005 | Friend pairing | BLOCKED | — | — | DECISIONS 02-19T09:26Z |
| F-006 | Password login | RETIRED | — | 2026-02-18T09:02Z | — |

## 4. Security Baseline — all checked ✅ (threat model: DECISIONS 2026-02-18T09:00Z)
- [x] Secrets env-only; `.env.example` committed · [x] Auth+authz enforced per route
- [x] Server-side validation; parameterized queries · [x] Output encoding; CSP set
- [x] Deps vetted+pinned; audit clean · [x] No PII/stack traces in responses or logs
- [x] Rate limiting (SEC-002); least-privilege DB user + send-only Resend key
- [x] 5-line threat model in DECISIONS

## 5. Next Action
**→ HARDEN: one more re-run of all eight greens takes them from 2/3 to 3/3 → STABLE. F-005
stays BLOCKED awaiting the human's invite-model decision — BLOCKED is not STABLE, so it holds
the DONE rung: even with everything else STABLE the loop cannot greenlight until the human
answers in DECISIONS and F-005 is built to STABLE or RETIRED.**
