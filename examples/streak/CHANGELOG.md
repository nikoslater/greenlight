# CHANGELOG.md — append-only, one entry per loop

> Semantic history: what changed and why. Code diffs live in git; entries link commits/PRs.

---

## v0.2.0 — loop 1 — 2026-02-18T09:02Z
- Did: built magic-link auth (SEC-001) — the repo scaffold, Security Baseline, threat model (DECISIONS loop=0) and Playwright harness all came from bootstrap, before this loop
- Why: Build rung (first PLANNED feature); a new registry feature merged, so minor bump 0.1.0 → 0.2.0. The Security rung did not fire: at the start of this loop no code existed, so no unchecked §4 item was actionable yet
- Touched: SEC-001 → UNVERIFIED; F-006 → RETIRED (the same DECISIONS call that chose magic link kills password login — bookkeeping, not a second rung)
- Commits/PRs: 4a1c9e
- Follow-ups filed: auth decision in DECISIONS. The §4 boxes for auth enforcement, input validation, output encoding and PII-free logs are now checked — the route was built to STANDARDS

## v0.3.0 — loop 2 — 2026-02-18T09:15Z
- Did: built rate limiting (SEC-002) — 5/min per IP on unauthenticated magic-link requests, 30/min per user on authenticated routes, applied as middleware so routes added later inherit it; least-privilege DB user
- Why: **Security rung** — public routes now exist, so the last unchecked §4 item ("rate limiting on public endpoints") became actionable, and the Security rung outranks BUILD. A new registry feature merged, so it is still a minor bump
- Touched: SEC-002 → UNVERIFIED · §4 now fully checked
- Commits/PRs: e5518b
- Follow-ups filed: DECISIONS — authenticated routes limited per user (not per IP), so shared NAT can't 429 legitimate users; the unauthenticated magic-link route keeps its tight per-IP limit

## v0.3.0 — loop 3 — 2026-02-18T09:34Z
- Did: verified SEC-001 and SEC-002
- Why: Verify rung — both were UNVERIFIED, and VERIFY outranks BUILD
- Touched: SEC-001 → PASSING (1/3), SEC-002 → PASSING (1/3)

## v0.4.0 — loop 4 — 2026-02-18T09:48Z
- Did: built the daily check-in flow (F-001), idempotent per calendar day in the user's timezone
- Why: Build rung (next PLANNED). The check-in route inherits SEC-002's per-user limiter, so §4 stays checked and the Security rung stays quiet
- Touched: F-001 → UNVERIFIED
- Commits/PRs: PR #7 / 8d22f1

## v0.4.0 — loop 5 — 2026-02-18T10:05Z
- Did: verified F-001 happy path + same-day idempotency
- Why: Verify rung · Touched: F-001 → PASSING (1/3)
- Follow-ups filed: idea — nudge the user the evening a streak is at risk (pending the human's review; `autonomous_feature_add: false`)

## v0.5.0 — loop 6 — 2026-02-18T10:19Z
- Did: built the streak counter (F-002) · Why: Build rung · Touched: F-002 → UNVERIFIED · Commits: b90a30

## v0.5.0 — loop 7 — 2026-02-18T10:41Z
- Did: verified F-002 incl. DST/timezone edge cases · Why: Verify rung · Touched: F-002 → PASSING (1/3)

## v0.6.0 — loop 8 — 2026-02-18T11:03Z
- Did: built the dashboard (F-003) — streak hero number + 12-week heatmap · Why: Build rung · Touched: F-003 → UNVERIFIED · Commits: c714aa

## v0.6.0 — loop 9 — 2026-02-18T11:20Z
- Did: verified F-003, captured a clean layout screenshot · Why: Verify rung · Touched: F-003 → PASSING (1/3)

## v0.7.0 — loop 10 — 2026-02-18T11:38Z
- Did: built UX-001 dashboard edge states (empty / loading skeleton / offline retry) per DESIGN.md
- Why: Build rung — the edge states are their own registry feature and get built like any other; nothing hardens while a feature is still PLANNED
- Touched: UX-001 → UNVERIFIED · Commits: 91c2d4

## v0.7.0 — loop 11 — 2026-02-18T11:55Z
- Did: the interaction pass on UX-001 caught mobile overflow — the heatmap runs past the viewport at 390px and the streak number clips under 320px
- Why: Verify rung · Touched: UX-001 → BROKEN

## v0.7.1 — loop 12 — 2026-02-19T08:30Z
- Did: fixed the overflow — the heatmap scrolls horizontally on narrow viewports; screenshots clean at 390px and 1280px
- Why: Broken rung. The change only repairs existing behavior, so it is a patch bump, not a minor
- Touched: UX-001 → PASSING (1/3) · Commits: a3c7f9
- Follow-ups filed: DECISIONS — minimum supported width is 360px, added to the UX-001 contract

## v0.8.0 — loop 13 — 2026-02-19T08:44Z
- Did: built UX-002 auth edge states (expired/used-link resend screen, inline email validation)
- Why: Build rung (last buildable PLANNED feature) · Touched: UX-002 → UNVERIFIED · Commits: d4f0c2

## v0.8.0 — loop 14 — 2026-02-19T09:01Z
- Did: verified UX-002 · Why: Verify rung · Touched: UX-002 → PASSING (1/3)

## v0.8.0 — loop 15 — 2026-02-19T09:26Z
- Did: the Build rung reached F-005 (friend pairing) and could not proceed — the invite model and what a partner may see are product calls only the human can make. Marked it BLOCKED, wrote the ask to DECISIONS and to `greenlight/state/NEEDS_HUMAN`, then took the next actionable rung instead of guessing: hardened all seven greens (2/3)
- Why: Build rung → BLOCKED (a blocked ask never costs a loop), then Harden. No code merged, so no version bump
- Touched: F-005 → BLOCKED; SEC-001, SEC-002, F-001, F-002, F-003, UX-001, UX-002 → 2/3

## v0.8.0 — loop 16 — 2026-02-19T09:40Z
- Did: third consecutive pass for all seven greens → STABLE
- Why: Harden rung · Touched: SEC-001, SEC-002, F-001, F-002, F-003, UX-001, UX-002 → STABLE

## v1.0.0 — loop 17 — 2026-02-19T09:58Z
- Did: MAJOR ROLLOVER milestone — bumped to v1.0.0, demoted every green feature to UNVERIFIED, began the full retest
- Why: Rollover rung — every live feature was STABLE and the version was still 0.x. F-005 (BLOCKED) is excluded here: it has no contract, so a retest milestone has nothing to re-prove, and one unanswered ask must not pin the project below v1.0 forever. F-006 stays RETIRED — a rollover never resurrects a dead feature
- Touched: SEC-001, SEC-002, F-001, F-002, F-003, UX-001, UX-002 → UNVERIFIED

## v1.0.0 — loop 18 — 2026-02-19T10:20Z
- Did: retested SEC-001, SEC-002 and F-001 (1/3 post-rollover); the human approved the loop-5 nudge idea in DECISIONS, so it entered the registry as **F-004** with a contract, status PLANNED
- Why: Verify rung. `autonomous_feature_add: false`, so the loop never promotes its own idea — it waited for the human's approval before F-004 existed as a feature
- Touched: SEC-001, SEC-002, F-001 → PASSING (1/3); F-004 → PLANNED

## v1.0.0 — loop 19 — 2026-02-19T10:44Z
- Did: retested the remaining demoted features (1/3)
- Why: Verify rung — UNVERIFIED features outrank the newly PLANNED F-004, so the retest finishes before anything new is built
- Touched: F-002, F-003, UX-001, UX-002 → PASSING (1/3)

## v1.1.0 — loop 20 — 2026-02-20T09:12Z
- Did: built F-004 streak-break notification (19:00-local cron, idempotent one-per-day guard table) and scoped a send-only Resend key. The build also folded the day-boundary math into a shared timezone helper that F-002 now calls — bundling a refactor into a feature build, which STANDARDS forbids; loop 22's postmortem records the regression that cost
- Why: Build rung (the only PLANNED feature) · Commits: PR #14 / e88a01
- Touched: F-004 → UNVERIFIED; F-002 → UNVERIFIED (its code changed, so it must be re-proven)
- README updated: notifications feature + RESEND_API_KEY documented (matches .env.example)

## v1.1.0 — loop 21 — 2026-02-20T09:40Z
- Did: verified F-004; **detected an F-002 regression** — the shared helper cuts days at UTC midnight, so the DST spring-forward day gets counted twice
- Why: Verify rung surfaced the regression · Touched: F-004 → PASSING (1/3), F-002 → BROKEN

## v1.1.1 — loop 22 — 2026-02-20T10:30Z
- Did: fixed the regression — the shared helper now takes an explicit timezone and cuts days at local midnight; F-002's DST edge tests are green again
- Why: Regression rung. F-002 was PASSING at v1.0.0 and BROKEN at v1.1.0, so the LEDGER pointed straight at the v1.1.0 entry — the F-004 build — as the lead. A fix of existing behavior, so a patch bump
- Touched: F-002 → PASSING (1/3); F-004 → UNVERIFIED (it reads the same helper) · Commits: 7f3b1d
- Follow-ups filed: postmortem in DECISIONS

## v1.1.1 — loop 23 — 2026-02-20T10:55Z
- Did: re-proved F-004 on the fixed helper — still exactly one email per at-risk day
- Why: Verify rung · Touched: F-004 → PASSING (1/3)

## v1.1.1 — loop 24 — 2026-02-20T11:42Z
- Did: hardened all eight greens (2/3 each), interaction pass included — heatmap day-detail and keyboard reachability re-checked
- Why: Harden rung — nothing is PLANNED, UNVERIFIED or BROKEN, so the ladder falls through to hardening
- Next: one more pass takes all eight to 3/3 STABLE. Even then the loop cannot greenlight: F-005 is BLOCKED, BLOCKED is not STABLE, and it holds the DONE rung until the human answers in DECISIONS and it is built to STABLE or RETIRED
