# Self-loop defect backlog

Defects FOUND by a loop but not yet fixed — parked here so no find is lost when a loop
fixes something else first. One line per defect:
`- [ ] rung=<1-4> | <one-sentence defect> | files: <paths>`

Entries are claims, not verified truths: the next loop re-verifies each against the current
files before acting, and deletes entries that are already fixed or refutable (logging why).
Delete the line entirely when the defect is fixed (the fix's IMPROVEMENTS.md line is the record).

- [ ] rung=2 | Re-running install.sh unconditionally re-downloads greenlight/run-loop.sh, wiping the notify() edit CONTROL.md tells the user to make; but guarding it means run-loop.sh bug-fixes won't propagate on re-install — weigh the tradeoff (guard-if-exists vs. document that re-running resets run-loop.sh) before acting | files: install.sh, templates/CONTROL.md
