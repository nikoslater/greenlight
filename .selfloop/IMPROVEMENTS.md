# Self-loop improvement log (append-only)

One line per loop iteration:
`[ISO-timestamp] loop=N | defect: <one sentence> | fix: <what changed, which file> | verified: <how>`
[2026-07-14T03:14:55Z] loop=1 | defect: templates/CHANGELOG.md format line said 'Touched: <feature IDs> → <resulting dots>', stale vocabulary from the retired colored-dot status system that contradicts the word statuses (PLANNED/UNVERIFIED/…) used in its own sample entry and everywhere else | fix: changed '<resulting dots>' to '<resulting statuses>' in templates/CHANGELOG.md | verified: grep for 'dot' across product files returns nothing; emoji-vocab check still clean; sample entries still use word statuses
