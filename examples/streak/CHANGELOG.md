# CHANGELOG.md — append-only, one entry per loop

> Semantic history: what changed and why. Code diffs live in git; entries link commits/PRs.

---

## v0.1.0 — loop 1 — 2026-02-18T09:02Z
- Did: scaffolded repo, wired Security Baseline, added Playwright smoke harness; built magic-link auth (SEC-001)
- Why: BOOTSTRAP rung 0
- Touched: SEC-001 → UNVERIFIED
- Commits/PRs: 4a1c9e
- Follow-ups: threat model filed in DECISIONS

## v0.1.0 — loop 2 — 2026-02-18T09:15Z
- Did: verified SEC-001; formally retired password login
- Why: Verify rung; decision to drop F-006
- Touched: SEC-001 → PASSING, F-006 → RETIRED
- Commits/PRs: —

## v0.2.0 — loop 3 — 2026-02-18T09:34Z
- Did: built daily check-in flow (F-001), idempotent per day
- Why: Build rung (highest-priority PLANNED)
- Touched: F-001 → UNVERIFIED
- Commits/PRs: PR #7 / 8d22f1

## v0.2.0 — loop 4 — 2026-02-18T09:48Z
- Did: verified F-001 happy path + same-day idempotency
- Touched: F-001 → PASSING

## v0.3.0 — loop 5 — 2026-02-18T10:05Z
- Did: built streak counter (F-002)
- Touched: F-002 → UNVERIFIED · Commits: b90a30
- Follow-ups: idea F-004 (notify) + blocker F-005 (pairing) filed

## v0.3.0 — loop 6 — 2026-02-18T10:19Z
- Did: verified F-002 incl. DST/timezone edge cases · Touched: F-002 → PASSING

## v0.4.0 — loop 7 — 2026-02-18T10:41Z
- Did: built dashboard (F-003) with streak + calendar heatmap · Touched: F-003 → UNVERIFIED · Commits: c714aa

## v0.4.0 — loop 8 — 2026-02-18T11:03Z
- Did: verified F-003, captured clean layout screenshot · Touched: F-003 → PASSING

## v0.4.0 — loop 9 — 2026-02-18T11:20Z
- Did: harden SEC-001 (pass 2/3) · Why: Harden rung

## v0.4.0 — loop 10 — 2026-02-18T11:38Z
- Did: SEC-001 → STABLE (3 passes); F-001 harden (pass 2/3)

## v0.4.0 — loop 11 — 2026-02-18T11:55Z
- Did: F-001 and F-002 → STABLE · Core loop feature-complete

## v1.0.0 — loop 12 — 2026-02-19T08:30Z
- Did: MAJOR ROLLOVER milestone — demoted all green features to UNVERIFIED, began full retest
- Why: Rollover rung; insurance before new work
- Touched: SEC-001, F-001, F-002, F-003 → UNVERIFIED

## v1.0.0 — loop 13 — 2026-02-19T08:44Z
- Did: retest SEC-001 (1/3 post-rollover) · Touched: SEC-001 → PASSING

## v1.0.0 — loop 14 — 2026-02-19T09:01Z
- Did: retest F-001, F-002, F-003 (1/3) — all green; reviewed idea backlog and **promoted F-004** to PLANNED
- Touched: F-001, F-002, F-003 → PASSING; F-004 → PLANNED

## v1.1.0 — loop 15 — 2026-02-19T09:26Z
- Did: added rate limiting on check-in endpoint (SEC-002), per-IP 5 req/min
- Why: Security rung (baseline item)
- Touched: SEC-002 → UNVERIFIED · Commits: e5518b

## v1.1.0 — loop 16 — 2026-02-19T09:40Z
- Did: verified SEC-002 abuse test; **detected F-001 regression** — legit check-ins 429 behind shared NAT
- Why: Verify rung surfaced a regression
- Touched: SEC-002 → PASSING, F-001 → BROKEN

## v1.1.1 — loop 17 — 2026-02-19T09:58Z
- Did: fixed regression — re-keyed limiter per-user, gave check-in its own bucket, kept tight per-IP limit on auth route only
- Why: Regression rung (top priority); traced to v1.1.0
- Touched: F-001 → PASSING
- Follow-ups: postmortem in DECISIONS; Next Action set to re-stabilize F-001 then build F-004

## v1.2.0 — loop 18 — 2026-02-19T10:20Z
- Did: built UX-001 dashboard edge states (empty/loading/offline) per DESIGN.md
- Why: Build rung (UX items are first-class features) · Touched: UX-001 → UNVERIFIED · Commits: 91c2d4

## v1.2.0 — loop 19 — 2026-02-19T10:44Z
- Did: interaction pass caught mobile overflow + clipping in UX-001; UX-002 passed
- Why: Verify rung · Touched: UX-001 → BROKEN, UX-002 → PASSING
- Follow-ups: overflow decision + min-width contract update in DECISIONS

## v1.2.1 — loop 20 — 2026-02-20T09:12Z
- Did: fixed heatmap overflow (horizontal scroll on mobile); hardened SEC-001, F-002 → STABLE
- Why: Broken rung, then Harden · Touched: UX-001 → PASSING, SEC-001/F-002 → STABLE · Commits: a3c7f9
- README updated: features + screenshots section reflect edge states

## v1.2.1 — loop 21 — 2026-02-20T09:40Z
- Did: hardened SEC-002, F-001, UX-002 → STABLE (3/3 each)
- Why: Harden rung

## v1.2.2 — loop 22 — 2026-02-20T10:30Z
- Did: built F-004 streak-break notification (19:00-local cron, idempotent one-per-day guard)
- Why: Build rung (last PLANNED feature) · Touched: F-004 → UNVERIFIED · Commits: PR #14 / e88a01
- README updated: notifications feature + RESEND_API_KEY documented (matches .env.example)

## v1.2.2 — loop 23 — 2026-02-20T10:55Z
- Did: hardened F-003 + UX-001 (2/3); heatmap day-detail interaction + keyboard reachability verified
- Why: Harden rung

## v1.2.2 — loop 24 — 2026-02-20T11:42Z
- Did: verified F-004 — exactly one email on simulated at-risk day; zero when checked in or streak <2
- Why: Verify rung · Touched: F-004 → PASSING (1/3)
- Next: harden F-003/UX-001/F-004 to STABLE → DONE rung → greenlight
