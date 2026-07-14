# CHANGELOG.md — append-only, one entry per loop

> Semantic history: what changed and *why*, in plain language. The actual code
> diffs live in git — link commits/PRs, don't paste code here. Newest at the bottom.

Format:

```
## v<X.Y.Z> — loop <N> — <ISO timestamp>
- Did: <what advanced this loop>
- Why: <reason / which ladder rung>
- Touched: <feature IDs> → <resulting statuses>
- Commits/PRs: <code commits or PRs; omit on a verify/harden/rollover loop that changed no code — its doc/status commit is in git>
- Follow-ups filed: <DECISIONS entries, if any>
```

---

## v0.1.0 — loop 0 — 2026-01-01T00:00:00Z
- Did: scaffolded repo, wired Security Baseline, added Playwright smoke harness
- Why: bootstrap — written before the first loop; the ladder has no rung for scaffolding (its rungs are 1-9) and bootstrap builds no features
- Touched: — (registry seeded; every feature PLANNED)
- Commits/PRs: abc123
- Follow-ups filed: threat model in DECISIONS.md
