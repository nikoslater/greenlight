# LEDGER.md — append-only test history

> One line per result, never edited. Newest at the bottom.
> Format: `[timestamp] | loop=N | v=X.Y.Z | ID | STATUS | note | evidence`

---

2026-02-18T09:02Z | loop=1  | v=0.1.0 | SEC-001 | UNVERIFIED | magic-link auth scaffolded, untested | commit 4a1c9e
2026-02-18T09:15Z | loop=2  | v=0.1.0 | SEC-001 | PASSING | login/logout + token-expiry unit tests pass | .greenlight/evidence/sec-001-l2.txt
2026-02-18T09:15Z | loop=2  | v=0.1.0 | F-006  | RETIRED | password login retired for magic link | see DECISIONS 09:15
2026-02-18T09:34Z | loop=3  | v=0.2.0 | F-001  | UNVERIFIED | daily check-in flow built, PR #7 merged | commit 8d22f1
2026-02-18T09:48Z | loop=4  | v=0.2.0 | F-001  | PASSING | happy path + idempotent same-day check-in | .greenlight/evidence/f-001-l4.txt
2026-02-18T10:05Z | loop=5  | v=0.3.0 | F-002  | UNVERIFIED | streak counter built | commit b90a30
2026-02-18T10:19Z | loop=6  | v=0.3.0 | F-002  | PASSING | consecutive-day calc, DST + TZ edge tests pass | .greenlight/evidence/f-002-l6.txt
2026-02-18T10:41Z | loop=7  | v=0.4.0 | F-003  | UNVERIFIED | dashboard w/ streak + calendar heatmap built | commit c714aa
2026-02-18T11:03Z | loop=8  | v=0.4.0 | F-003  | PASSING | renders correctly, layout screenshot clean | .greenlight/evidence/f-003-l8.png
2026-02-18T11:20Z | loop=9  | v=0.4.0 | SEC-001 | PASSING | harden re-run (pass 2/3) | .greenlight/evidence/sec-001-l9.txt
2026-02-18T11:38Z | loop=10 | v=0.4.0 | SEC-001 | STABLE | 3 consecutive passes → STABLE | .greenlight/evidence/sec-001-l10.txt
2026-02-18T11:38Z | loop=10 | v=0.4.0 | F-001  | PASSING | harden re-run (pass 2/3) | .greenlight/evidence/f-001-l10.txt
2026-02-18T11:55Z | loop=11 | v=0.4.0 | F-001  | STABLE | 3 consecutive passes → STABLE | .greenlight/evidence/f-001-l11.txt
2026-02-18T11:55Z | loop=11 | v=0.4.0 | F-002  | STABLE | 3 consecutive passes → STABLE | .greenlight/evidence/f-002-l11.txt
--- v1.0.0 MAJOR ROLLOVER (loop 12): all STABLE/PASSING demoted to UNVERIFIED, full retest begins ---
2026-02-19T08:30Z | loop=12 | v=1.0.0 | SEC-001 | UNVERIFIED | rollover demotion | —
2026-02-19T08:30Z | loop=12 | v=1.0.0 | F-001  | UNVERIFIED | rollover demotion | —
2026-02-19T08:30Z | loop=12 | v=1.0.0 | F-002  | UNVERIFIED | rollover demotion | —
2026-02-19T08:30Z | loop=12 | v=1.0.0 | F-003  | UNVERIFIED | rollover demotion | —
2026-02-19T08:44Z | loop=13 | v=1.0.0 | SEC-001 | PASSING | retest pass (1/3 post-rollover) | .greenlight/evidence/sec-001-l13.txt
2026-02-19T09:01Z | loop=14 | v=1.0.0 | F-001  | PASSING | retest pass (1/3) | .greenlight/evidence/f-001-l14.txt
2026-02-19T09:01Z | loop=14 | v=1.0.0 | F-002  | PASSING | retest pass (1/3) | .greenlight/evidence/f-002-l14.txt
2026-02-19T09:01Z | loop=14 | v=1.0.0 | F-003  | PASSING | retest pass, screenshot clean (1/3) | .greenlight/evidence/f-003-l14.png
2026-02-19T09:26Z | loop=15 | v=1.1.0 | SEC-002 | UNVERIFIED | rate limiting added to check-in endpoint | commit e5518b
2026-02-19T09:40Z | loop=16 | v=1.1.0 | SEC-002 | PASSING | blocks >5 req/min, abuse test passes | .greenlight/evidence/sec-002-l16.txt
2026-02-19T09:40Z | loop=16 | v=1.1.0 | F-001  | BROKEN | REGRESSION: legit daily check-in now 429s (limiter keyed per-IP, not per-user) | .greenlight/evidence/f-001-l16-fail.txt
2026-02-19T09:58Z | loop=17 | v=1.1.1 | F-001  | PASSING | fixed: limiter re-keyed per-user + higher check-in bucket; happy path restored | .greenlight/evidence/f-001-l17.txt
2026-02-19T10:20Z | loop=18 | v=1.2.0 | UX-001 | UNVERIFIED | dashboard empty/loading/offline states built per DESIGN.md | commit 91c2d4
2026-02-19T10:44Z | loop=19 | v=1.2.0 | UX-001 | BROKEN | interaction pass: offline retry works, but heatmap overflows viewport at 390px, streak number clips under 320px | .greenlight/evidence/ux-001-l19-clip.png
2026-02-19T10:44Z | loop=19 | v=1.2.0 | UX-002 | PASSING | expired-link resend + inline email validation pass interaction test (1/3) | .greenlight/evidence/ux-002-l19.png
2026-02-20T09:12Z | loop=20 | v=1.2.1 | UX-001 | PASSING | heatmap now scrolls horizontally on mobile per DESIGN; screenshots clean at 390/1280 (1/3) | .greenlight/evidence/ux-001-l20.png
2026-02-20T09:12Z | loop=20 | v=1.2.1 | SEC-001 | STABLE | 3/3 post-rollover | .greenlight/evidence/sec-001-l20.txt
2026-02-20T09:12Z | loop=20 | v=1.2.1 | F-002 | STABLE | 3/3 incl. DST-spring-forward edge | .greenlight/evidence/f-002-l20.txt
2026-02-20T09:40Z | loop=21 | v=1.2.1 | SEC-002 | STABLE | 3/3 | .greenlight/evidence/sec-002-l21.txt
2026-02-20T09:40Z | loop=21 | v=1.2.1 | F-001 | STABLE | 3/3; interaction: double-tap same day shows "already checked in" per contract | .greenlight/evidence/f-001-l21.txt
2026-02-20T09:40Z | loop=21 | v=1.2.1 | UX-002 | STABLE | 3/3 | .greenlight/evidence/ux-002-l21.png
2026-02-20T10:30Z | loop=22 | v=1.2.2 | F-004 | UNVERIFIED | streak-break email built: 19:00-local cron, one-per-day guard table | PR #14 / e88a01
2026-02-20T10:55Z | loop=23 | v=1.2.2 | F-003 | PASSING | 2/3; interaction: heatmap cells open day detail, keyboard reachable | .greenlight/evidence/f-003-l23-mobile.png
2026-02-20T10:55Z | loop=23 | v=1.2.2 | UX-001 | PASSING | 2/3 | .greenlight/evidence/ux-001-l23.png
2026-02-20T11:42Z | loop=24 | v=1.2.2 | F-004 | PASSING | 1/3; integration: exactly one email sent in simulated at-risk day, none when checked in, none when streak <2 | .greenlight/evidence/f-004-l24.txt
