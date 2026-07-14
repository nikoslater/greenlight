# Self-loop improvement log (append-only)

One line per loop iteration:
`[ISO-timestamp] loop=N | defect: <one sentence> | fix: <what changed, which file> | verified: <how>`
[2026-07-14T03:14:55Z] loop=1 | defect: templates/CHANGELOG.md format line said 'Touched: <feature IDs> → <resulting dots>', stale vocabulary from the retired colored-dot status system that contradicts the word statuses (PLANNED/UNVERIFIED/…) used in its own sample entry and everywhere else | fix: changed '<resulting dots>' to '<resulting statuses>' in templates/CHANGELOG.md | verified: grep for 'dot' across product files returns nothing; emoji-vocab check still clean; sample entries still use word statuses
[2026-07-14T03:20:00Z] loop=2 | defect: install.sh gated BOTH gitignore lines on whether '.env' was already present, so a target repo that already ignored .env never got 'greenlight/state/' added and would commit runtime state | fix: split into two independent grep-guarded appends (one per pattern) in install.sh | verified: bash -n passes; tempdir test of 3 scenarios (no .gitignore, existing .env-only .gitignore, re-run) all end with both lines exactly once
