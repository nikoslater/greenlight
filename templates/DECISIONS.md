# DECISIONS.md — append-only rationale, feature ideas, security calls

> Why things are the way they are. Append-only — never edit or delete a past entry — with
> ONE exception: an idea entry's `Status:` line is a live pointer to that idea's fate and may
> be updated in place as it moves (pending review → approved → promoted/rejected). Everything
> else, once written, stays. This is where the loop "thinks out loud" so a future session
> inherits the reasoning, not just the result.

Use one block per entry:

```
## [timestamp] loop=N — <short title>
Type: decision | idea | security | blocker
Context: ...
Call: ...
Status: (for ideas) pending review | approved | promoted to F-0XX | rejected
```

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
