# LEDGER.md — append-only test history

> One line per test result. NEVER edit or delete a line. Newest at the bottom.
> A fresh AI reads the tail to reconstruct each feature's history and spot regressions
> (e.g. F-001 went PASSING, PASSING, PASSING then BROKEN at v1.4 → check CHANGELOG v1.4).

Format:
`[ISO-8601 timestamp] | loop=N | v=X.Y.Z | ID | STATUS | note | evidence`

- STATUS: UNVERIFIED · PASSING · STABLE · BROKEN · BLOCKED · RETIRED
- evidence: test-output or screenshot path under `greenlight/state/evidence/`, or commit/PR

---

<!-- APPEND BELOW. Example rows: -->

2026-01-01T00:00:00Z | loop=1 | v=0.2.0 | SEC-001 | UNVERIFIED | auth built at the BUILD rung (new feature merged → minor bump), not yet verified with evidence | commit abc123
2026-01-01T00:05:00Z | loop=2 | v=0.2.0 | SEC-001 | PASSING | login/logout unit tests pass | greenlight/state/evidence/sec-001-l2.txt
