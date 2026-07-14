---
project: "{{PROJECT_NAME}}"
one_liner: "{{ONE_LINE_DESCRIPTION}}"
version: "0.1.0"
status: "BOOTSTRAP"            # BOOTSTRAP → BUILDING → HARDENING → COMPLETE
greenlight: "no"               # flipped to "yes" ONLY by the DONE rung; loop does no work when "yes"
loop_count: 0
last_loop: ""

# ---- Profile: gates which STANDARDS.md sections apply ----
surface: "{{web|api|cli|ios|desktop|extension}}"
auth: "{{none|magic-link|oauth|password|api-key}}"     # none = deliberate, recorded choice
data_sensitivity: "{{none|low|pii|regulated}}"          # low = accounts/emails; pii = personal data; regulated = health/finance
persistence: "{{none|sqlite|postgres|files|external}}"
external_services: []                                   # e.g. [stripe, resend, s3]
deploy_target: "{{local|vercel|fly|vps|app-store|none}}"

# ---- Loop behavior ----
test_commands:                                          # exact, copy-pasteable; loop runs these verbatim
  unit: "{{e.g. npm test}}"
  smoke: "{{e.g. npx playwright test smoke}}"
  interaction: "{{e.g. npx playwright test ui — required if the app has a UI}}"
autonomous_feature_add: false     # true = loop may build its own ideas; false = ideas wait for you
stable_threshold: 3               # consecutive passes → STABLE
notify: "{{none|file|ntfy-url|slack-webhook}}"          # how the harness pings you at COMPLETE/BLOCKED
---

# CONTROL.md — source of truth for {{PROJECT_NAME}}

> Read this file, `STANDARDS.md` (only sections matching the Profile above), and the
> tails of `LEDGER.md` / `DECISIONS.md` / `CHANGELOG.md`. The files are your memory;
> trust them over any assumption. Never delete ledger history — append only.

## 0. Loop rules (critical — read every loop)

**Do exactly ONE action per loop**, then log it. Pick the FIRST rung that applies:

1. **SECURITY** — unchecked §4 item or security regression
2. **REGRESSION** — a feature that was PASSING/STABLE is now BROKEN → find the break version in LEDGER, read that CHANGELOG entry, fix from that lead
3. **BROKEN** — any other failing feature (fix, or mark BLOCKED with the exact human ask in DECISIONS)
4. **VERIFY** — anything UNVERIFIED → run its `test_commands`, save evidence, promote or demote
5. **BUILD** — next PLANNED feature → branch → build → its tests pass → merge
6. **HARDEN** — re-run greens toward `stable_threshold` → STABLE
7. **ROLLOVER** — all STABLE and version still 0.x → bump to v1.0.0, demote all to UNVERIFIED, full retest (one-time v1.0 milestone; never fires again at ≥1.0)
8. **IDEATE** — nothing pending → file ≤3 ideas in DECISIONS (build one only if `autonomous_feature_add: true`)
9. **DONE** — all STABLE + §4 fully checked + fresh UI evidence + no pending ideas → set `greenlight: "yes"` and `status: COMPLETE`, write `greenlight/state/STOP`, and output only: "GREENLIGHT ACHIEVED — the app is finished. Stop the loop and review your app."

**Statuses:** `PLANNED → UNVERIFIED → PASSING → STABLE`, plus `BROKEN`, `BLOCKED` (needs human — never guess), `RETIRED`. Any change to a feature demotes it to UNVERIFIED until re-proven. PASSING requires passing evidence from THIS loop, saved to `greenlight/state/evidence/`. UI features additionally require a fresh screenshot reviewed for broken layout.

**Before finishing every loop:** append CHANGELOG entry → append LEDGER line per feature touched → update §3 board + front-matter counters → rewrite §5 Next Action → file any decisions/ideas in DECISIONS.

## 1. Charter
**Problem / user:** {{...}}
**Success:** {{concrete finish criteria}}
**Non-goals:** {{explicit out-of-scope}}

## 2. Feature Registry (the canonical spec — README is derived from this, never the reverse)
Each feature has a **Contract**: one or two sentences of exact expected behavior, written
at scaffold time and only changed via a DECISIONS entry. Before touching a feature, re-read
its contract; build and test against the contract, not your interpretation.

| ID | Name | Type | Contract | Tests required |
|------|------|------|----------|----------------|
| F-001 | {{...}} | flow | {{e.g. "A logged-in user taps once to check in; a second tap the same calendar day (user TZ) is a no-op that shows 'already checked in'."}} | unit + interaction + screenshot |
| UX-001 | {{screen}} edge states | ux | {{empty/loading/error states per DESIGN.md}} | interaction + screenshot |
| SEC-001 | {{...}} | security | {{...}} | unit |

## 3. Status Board (current state only — history lives in LEDGER.md)
| ID | Feature | Status | Passes | Last verified | Evidence |
|------|---------|--------|--------|---------------|----------|
| F-001 | {{...}} | PLANNED | 0/3 | — | — |

*Passes = consecutive passing loops toward `stable_threshold`. Resets to 0 on any change,
failure, or major rollover. When it hits the threshold, status becomes STABLE.*

## 4. Security Baseline (all boxes required before COMPLETE)
- [ ] No secrets in code or client bundles; env only; `.env.example` committed, `.env` ignored
- [ ] Auth + authorization decided and enforced on EVERY endpoint/route (or "none" recorded in DECISIONS with why)
- [ ] All external input validated server-side; parameterized queries only
- [ ] Output encoding (XSS) / no shell or eval on untrusted data
- [ ] Every dependency exists on the public registry and was vetted before install; lockfile committed; audit clean
- [ ] No stack traces, internal errors, or PII in user-facing responses or logs
- [ ] Rate limiting on public endpoints; least-privilege keys/DB user
- [ ] 5-line threat model in DECISIONS.md
*(skip N/A items per Profile — e.g. no DB rules when `persistence: none` — and note the skip)*

## 5. Next Action (exactly one; rewritten every loop)
**→ {{the single concrete next step}}**
