---
project: "{{PROJECT_NAME}}"
one_liner: "{{ONE_LINE_DESCRIPTION}}"
version: "0.1.0"               # bump on every loop that changes the app, so a LEDGER line names the version that broke a feature. Bump by what the change DID, not which rung fired: MINOR when a new registry feature merges — including one built at the SECURITY rung, e.g. adding rate limiting (0.2.0 → 0.3.0) · PATCH when the change only fixes existing behavior (regression, bug, security fix) · MAJOR only at the one-time v1.0.0 ROLLOVER · VERIFY/HARDEN change no code, so the version stays put
status: "BOOTSTRAP"            # re-evaluate every loop from the §3 board: BOOTSTRAP = every feature still PLANNED · BUILDING = some built, some still PLANNED · HARDENING = none left PLANNED, still verifying/hardening · COMPLETE = set by the DONE rung
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
notify: "{{none|file|ntfy-url|slack-webhook}}"          # records the ping channel you want at COMPLETE/BLOCKED; the runner does not read this key — edit notify() in greenlight/run-loop.sh to match it (it ships with desktop notifications)
---

# CONTROL.md — source of truth for {{PROJECT_NAME}}

> Read this file, `STANDARDS.md` (only sections matching the Profile above), and the
> tails of `LEDGER.md` / `DECISIONS.md` / `CHANGELOG.md`. The files are your memory;
> trust them over any assumption. Never delete ledger history — append only.

## 0. Loop rules (critical — read every loop)

**Do exactly ONE action per loop**, then log it. Pick the FIRST rung that applies:

1. **SECURITY** — a security regression, or an unchecked §4 item that is actionable *now* (the code it governs already exists). An item whose subject isn't built yet (e.g. rate limiting before any endpoint exists) is not actionable — leave it unchecked and fall through to the next rung; §4 must be fully checked before the DONE rung, not before every BUILD
2. **REGRESSION** — a feature that was PASSING/STABLE is now BROKEN → find the break version in LEDGER, read that CHANGELOG entry, fix from that lead
3. **BROKEN / UNBLOCK** — any other failing feature (fix, or mark BLOCKED with the exact human ask in DECISIONS). Also: a BLOCKED feature whose DECISIONS ask the human has now answered → apply the answer this loop (write its Contract and set it PLANNED for rung 5 to build, or mark it RETIRED), clearing BLOCKED. Only an unanswered ask keeps a feature BLOCKED
4. **VERIFY** — anything UNVERIFIED → run its `test_commands`, save evidence, promote or demote
5. **BUILD** — next PLANNED feature → branch → build → its tests pass → merge
6. **HARDEN** — re-run greens toward `stable_threshold` → STABLE
7. **ROLLOVER** — all STABLE and version still 0.x → bump to v1.0.0, demote all to UNVERIFIED, full retest (one-time v1.0 milestone; never fires again at ≥1.0)
8. **IDEATE** — nothing pending AND no idea round has been filed yet in this project → file ≤3 ideas in DECISIONS, once ever: never re-arm, not even after the ideas themselves change the app (build one only if `autonomous_feature_add: true`; otherwise they sit at "pending review" for the human and do NOT block DONE)
9. **DONE** — all STABLE + §4 fully checked + fresh UI evidence + the IDEATE round already filed → set `greenlight: "yes"` and `status: COMPLETE`, write `greenlight/state/STOP`, and output only: "GREENLIGHT ACHIEVED — the app is finished. Stop the loop and review your app."

**Statuses:** `PLANNED → UNVERIFIED → PASSING → STABLE`, plus `BROKEN`, `BLOCKED` (needs human — never guess), `RETIRED`. **"All STABLE" means every live feature is STABLE — RETIRED features are dead and excluded from every count.** BLOCKED counts differently per rung: for rung 7 (ROLLOVER) a BLOCKED feature is also excluded, because it has no contract yet and so has nothing for a retest milestone to re-prove — one unanswered ask must not pin the project below v1.0 forever. For rung 9 (DONE) it is *not* excluded: a BLOCKED feature is not STABLE and holds DONE until the human answers its DECISIONS ask and rung 3 takes it to STABLE or RETIRED. Any change to a feature demotes it to UNVERIFIED until re-proven. PASSING requires passing evidence from THIS loop, saved to `greenlight/state/evidence/`. UI features additionally require a fresh screenshot reviewed for broken layout.

**Before finishing every loop:** bump `version` per the rule above if the app changed (do this first — the CHANGELOG and LEDGER both record it) → append CHANGELOG entry under that version → append LEDGER line per feature touched, same version → update §3 board + front-matter (counters, and `status` re-evaluated from the board) → rewrite §5 Next Action → file any decisions/ideas in DECISIONS.

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
*(An item the Profile makes N/A — e.g. no DB rules when `persistence: none` — counts as satisfied:
check its box and append "N/A: <why>", so the DONE rung's "§4 fully checked" gate stays reachable.
Never check a box that DOES apply and isn't done — leave those unchecked for the SECURITY rung.)*

## 5. Next Action (exactly one; rewritten every loop)
**→ {{the single concrete next step}}**
