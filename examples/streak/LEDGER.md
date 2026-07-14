# LEDGER.md — append-only test history

> One line per result, never edited. Newest at the bottom.
> Format: `[timestamp] | loop=N | v=X.Y.Z | ID | STATUS | note | evidence`

---

2026-02-18T09:02Z | loop=1  | v=0.2.0 | SEC-001 | UNVERIFIED | magic-link auth built, untested | commit 4a1c9e
2026-02-18T09:02Z | loop=1  | v=0.2.0 | F-006  | RETIRED | password login retired for magic link (STACKS: never hand-roll password auth) | see DECISIONS 09:02
2026-02-18T09:15Z | loop=2  | v=0.3.0 | SEC-002 | UNVERIFIED | Security rung: rate limiting built now that public routes exist; per-user middleware + least-privilege DB user | commit e5518b
2026-02-18T09:34Z | loop=3  | v=0.3.0 | SEC-001 | PASSING | login/logout + token-expiry unit tests pass (1/3) | greenlight/state/evidence/sec-001-l3.txt
2026-02-18T09:34Z | loop=3  | v=0.3.0 | SEC-002 | PASSING | abuse test: 6th magic-link request in a minute is refused (1/3) | greenlight/state/evidence/sec-002-l3.txt
2026-02-18T09:48Z | loop=4  | v=0.4.0 | F-001  | UNVERIFIED | daily check-in flow built, PR #7 merged; the route inherits the SEC-002 limiter | commit 8d22f1
2026-02-18T10:05Z | loop=5  | v=0.4.0 | F-001  | PASSING | happy path + idempotent same-day check-in (1/3) | greenlight/state/evidence/f-001-l5.txt
2026-02-18T10:19Z | loop=6  | v=0.5.0 | F-002  | UNVERIFIED | streak counter built | commit b90a30
2026-02-18T10:41Z | loop=7  | v=0.5.0 | F-002  | PASSING | consecutive-day calc, DST + TZ edge tests pass (1/3) | greenlight/state/evidence/f-002-l7.txt
2026-02-18T11:03Z | loop=8  | v=0.6.0 | F-003  | UNVERIFIED | dashboard w/ streak + calendar heatmap built | commit c714aa
2026-02-18T11:20Z | loop=9  | v=0.6.0 | F-003  | PASSING | renders correctly, layout screenshot clean (1/3) | greenlight/state/evidence/f-003-l9.png
2026-02-18T11:38Z | loop=10 | v=0.7.0 | UX-001 | UNVERIFIED | dashboard empty/loading/offline states built per DESIGN.md | commit 91c2d4
2026-02-18T11:55Z | loop=11 | v=0.7.0 | UX-001 | BROKEN | interaction pass: offline retry works, but heatmap overflows viewport at 390px, streak number clips under 320px | greenlight/state/evidence/ux-001-l11-clip.png
2026-02-19T08:30Z | loop=12 | v=0.7.1 | UX-001 | PASSING | fixed: heatmap scrolls horizontally on mobile per DESIGN; screenshots clean at 390/1280 (1/3) | greenlight/state/evidence/ux-001-l12.png
2026-02-19T08:44Z | loop=13 | v=0.8.0 | UX-002 | UNVERIFIED | auth edge states built: expired/used-link resend screen, inline email validation | commit d4f0c2
2026-02-19T09:01Z | loop=14 | v=0.8.0 | UX-002 | PASSING | expired-link resend + inline validation pass interaction test (1/3) | greenlight/state/evidence/ux-002-l14.png
2026-02-19T09:26Z | loop=15 | v=0.8.0 | F-005  | BLOCKED | Build rung reached F-005 (last PLANNED); no contract can be written until the human decides the invite model | see DECISIONS 09:26
2026-02-19T09:26Z | loop=15 | v=0.8.0 | SEC-001 | PASSING | harden re-run (2/3) | greenlight/state/evidence/sec-001-l15.txt
2026-02-19T09:26Z | loop=15 | v=0.8.0 | SEC-002 | PASSING | harden re-run (2/3) | greenlight/state/evidence/sec-002-l15.txt
2026-02-19T09:26Z | loop=15 | v=0.8.0 | F-001  | PASSING | harden re-run (2/3) | greenlight/state/evidence/f-001-l15.txt
2026-02-19T09:26Z | loop=15 | v=0.8.0 | F-002  | PASSING | harden re-run (2/3) | greenlight/state/evidence/f-002-l15.txt
2026-02-19T09:26Z | loop=15 | v=0.8.0 | F-003  | PASSING | harden re-run, screenshot clean (2/3) | greenlight/state/evidence/f-003-l15.png
2026-02-19T09:26Z | loop=15 | v=0.8.0 | UX-001 | PASSING | harden re-run (2/3) | greenlight/state/evidence/ux-001-l15.png
2026-02-19T09:26Z | loop=15 | v=0.8.0 | UX-002 | PASSING | harden re-run (2/3) | greenlight/state/evidence/ux-002-l15.png
2026-02-19T09:40Z | loop=16 | v=0.8.0 | SEC-001 | STABLE | 3 consecutive passes → STABLE | greenlight/state/evidence/sec-001-l16.txt
2026-02-19T09:40Z | loop=16 | v=0.8.0 | SEC-002 | STABLE | 3 consecutive passes → STABLE | greenlight/state/evidence/sec-002-l16.txt
2026-02-19T09:40Z | loop=16 | v=0.8.0 | F-001  | STABLE | 3 consecutive passes → STABLE | greenlight/state/evidence/f-001-l16.txt
2026-02-19T09:40Z | loop=16 | v=0.8.0 | F-002  | STABLE | 3 consecutive passes → STABLE | greenlight/state/evidence/f-002-l16.txt
2026-02-19T09:40Z | loop=16 | v=0.8.0 | F-003  | STABLE | 3 consecutive passes → STABLE | greenlight/state/evidence/f-003-l16.png
2026-02-19T09:40Z | loop=16 | v=0.8.0 | UX-001 | STABLE | 3 consecutive passes → STABLE | greenlight/state/evidence/ux-001-l16.png
2026-02-19T09:40Z | loop=16 | v=0.8.0 | UX-002 | STABLE | 3 consecutive passes → STABLE | greenlight/state/evidence/ux-002-l16.png
--- v1.0.0 MAJOR ROLLOVER (loop 17): every green feature demoted to UNVERIFIED, full retest begins. F-005 stays BLOCKED, F-006 stays RETIRED ---
2026-02-19T09:58Z | loop=17 | v=1.0.0 | SEC-001 | UNVERIFIED | rollover demotion | —
2026-02-19T09:58Z | loop=17 | v=1.0.0 | SEC-002 | UNVERIFIED | rollover demotion | —
2026-02-19T09:58Z | loop=17 | v=1.0.0 | F-001  | UNVERIFIED | rollover demotion | —
2026-02-19T09:58Z | loop=17 | v=1.0.0 | F-002  | UNVERIFIED | rollover demotion | —
2026-02-19T09:58Z | loop=17 | v=1.0.0 | F-003  | UNVERIFIED | rollover demotion | —
2026-02-19T09:58Z | loop=17 | v=1.0.0 | UX-001 | UNVERIFIED | rollover demotion | —
2026-02-19T09:58Z | loop=17 | v=1.0.0 | UX-002 | UNVERIFIED | rollover demotion | —
2026-02-19T10:20Z | loop=18 | v=1.0.0 | SEC-001 | PASSING | retest pass (1/3 post-rollover) | greenlight/state/evidence/sec-001-l18.txt
2026-02-19T10:20Z | loop=18 | v=1.0.0 | SEC-002 | PASSING | retest pass (1/3 post-rollover) | greenlight/state/evidence/sec-002-l18.txt
2026-02-19T10:20Z | loop=18 | v=1.0.0 | F-001  | PASSING | retest pass (1/3 post-rollover) | greenlight/state/evidence/f-001-l18.txt
2026-02-19T10:44Z | loop=19 | v=1.0.0 | F-002  | PASSING | retest pass incl. DST-spring-forward edge (1/3) | greenlight/state/evidence/f-002-l19.txt
2026-02-19T10:44Z | loop=19 | v=1.0.0 | F-003  | PASSING | retest pass, screenshot clean (1/3) | greenlight/state/evidence/f-003-l19.png
2026-02-19T10:44Z | loop=19 | v=1.0.0 | UX-001 | PASSING | retest pass (1/3) | greenlight/state/evidence/ux-001-l19.png
2026-02-19T10:44Z | loop=19 | v=1.0.0 | UX-002 | PASSING | retest pass (1/3) | greenlight/state/evidence/ux-002-l19.png
2026-02-20T09:12Z | loop=20 | v=1.1.0 | F-004  | UNVERIFIED | streak-break email built: 19:00-local cron, one-per-day guard table; send-only Resend key scoped | PR #14 / e88a01
2026-02-20T09:12Z | loop=20 | v=1.1.0 | F-002  | UNVERIFIED | demoted: the F-004 build moved F-002 onto the shared timezone helper — any change is re-proven | PR #14 / e88a01
2026-02-20T09:40Z | loop=21 | v=1.1.0 | F-004  | PASSING | exactly one email in a simulated at-risk day, none when checked in, none when streak <2 (1/3) | greenlight/state/evidence/f-004-l21.txt
2026-02-20T09:40Z | loop=21 | v=1.1.0 | F-002  | BROKEN | REGRESSION: streak double-counts the DST spring-forward day — the shared helper cuts days at UTC midnight, not local | greenlight/state/evidence/f-002-l21-fail.txt
2026-02-20T10:30Z | loop=22 | v=1.1.1 | F-002  | PASSING | fixed: helper takes an explicit tz argument and cuts days at local midnight; DST edges restored (1/3) | greenlight/state/evidence/f-002-l22.txt
2026-02-20T10:30Z | loop=22 | v=1.1.1 | F-004  | UNVERIFIED | demoted: the regression fix changed the same helper F-004's cron reads | commit 7f3b1d
2026-02-20T10:55Z | loop=23 | v=1.1.1 | F-004  | PASSING | re-proved on the fixed helper: still exactly one 19:00-local email per at-risk day (1/3) | greenlight/state/evidence/f-004-l23.txt
2026-02-20T11:42Z | loop=24 | v=1.1.1 | SEC-001 | PASSING | harden re-run (2/3) | greenlight/state/evidence/sec-001-l24.txt
2026-02-20T11:42Z | loop=24 | v=1.1.1 | SEC-002 | PASSING | harden re-run (2/3) | greenlight/state/evidence/sec-002-l24.txt
2026-02-20T11:42Z | loop=24 | v=1.1.1 | F-001  | PASSING | harden re-run; interaction: double-tap same day shows "already checked in" per contract (2/3) | greenlight/state/evidence/f-001-l24.txt
2026-02-20T11:42Z | loop=24 | v=1.1.1 | F-002  | PASSING | harden re-run (2/3) | greenlight/state/evidence/f-002-l24.txt
2026-02-20T11:42Z | loop=24 | v=1.1.1 | F-003  | PASSING | harden re-run; heatmap cells open day detail, keyboard reachable (2/3) | greenlight/state/evidence/f-003-l24-mobile.png
2026-02-20T11:42Z | loop=24 | v=1.1.1 | F-004  | PASSING | harden re-run (2/3) | greenlight/state/evidence/f-004-l24.txt
2026-02-20T11:42Z | loop=24 | v=1.1.1 | UX-001 | PASSING | harden re-run (2/3) | greenlight/state/evidence/ux-001-l24.png
2026-02-20T11:42Z | loop=24 | v=1.1.1 | UX-002 | PASSING | harden re-run (2/3) | greenlight/state/evidence/ux-002-l24.png
