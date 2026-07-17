# DECISIONS.md — append-only rationale, feature ideas, security calls

> Why things are the way they are. Append-only — never edit or delete a past entry — with
> ONE exception: an idea's or issue's `Status:` line is a live pointer to its fate and may be
> updated in place (ideas: pending review → approved → promoted/rejected; issues: open →
> fixed in vX.Y.Z). Everything else, once written, stays. This is where the loop "thinks out
> loud" so a future session inherits the reasoning, not just the result.

Use one block per entry:

```
## [timestamp] loop=N — <short title>
Type: decision | idea | security | blocker | issue
Context: ...
Call: ...
Feature: (for issues) F-0XX or 'new'
Status: (for ideas) pending review | approved | promoted to F-0XX | rejected
        (for issues) open | fixed in vX.Y.Z
```

Issue entries are the project's known-issues list: anything the human reports (before or
after GREENLIGHT) gets one, titled `Issue: <summary>`, and stays `open` until its fix is proven.

---

## 2026-01-01T00:00:00Z loop=0 — Threat model (5 lines)
Type: security
1. Who are the users / attackers? ...
2. What's the sensitive data? ...
3. What's the trust boundary? ...
4. Biggest realistic abuse case? ...
5. Mitigation stance? ...

## 2026-01-01T00:10:00Z loop=3 — Idea: streak notifications
Type: idea
Context: while building check-in (F-001), noticed users have no reason to return.
Call: propose push/email nudge on streak break.
Status: pending review  (autonomous_feature_add is false, so waiting on human)
