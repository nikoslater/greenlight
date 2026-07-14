# STANDARDS.md — how to write code in this repo

> Read the **Always** section every loop. Read a conditional section only when the
> CONTROL.md Profile activates it. These rules exist because AI-generated code
> passes functional tests far more often than it passes security tests — the loop
> compensates with discipline, not volume.

## Always

**Write less code (the ladder — run it before writing anything)**
Climb in order; stop at the first rung that holds:
1. Does this need to exist at all? → no: skip it
2. Does the standard library do it? → use it
3. Is there a native platform feature? → use it (e.g. `<input type="date">` over a picker library)
4. Does an already-installed dependency do it? → use it
5. Can it be one line? → one line
6. Only then: write the minimum that works
Never cut on the way down: input validation at trust boundaries, error handling that prevents data loss, security measures, accessibility basics. Lazy, not negligent. Every line not written is a line never reviewed, tested, or broken.
*(This is the ponytail ladder — if the harness is Claude Code, install the ponytail plugin so it's enforced every turn.)*

**Code**
- Small modules, one responsibility each; business logic separate from I/O and UI so it's unit-testable without a running server.
- Boring, explicit code beats clever code. No dead code, no speculative abstractions, no features nobody asked for.
- Every function that can fail returns/throws predictably; handle errors at boundaries, not with scattered try/catch around every call.
- Match the existing style of the file you're editing. Consistency > preference.

**Change discipline**
- One feature or fix per branch/PR. Never refactor and add features in the same change.
- Never silently alter or remove auth checks, validation, or security middleware while doing something else — this is the #1 way AI code regresses. If a change touches an auth path, say so in the CHANGELOG entry and re-run the affected feature's tests before merge.
- Migrations and destructive operations (drop, delete, overwrite user data) require a DECISIONS entry BEFORE running.

**Testing**
- Write the test with the feature, not after. Every F-### needs at least: one happy path, one failure path, one edge case.
- Tests must be runnable via the exact `test_commands` in CONTROL.md — no manual steps.
- Prefer testing behavior (inputs → outputs) over implementation details, so refactors don't shred the suite.

**Logging**
- Log at boundaries and failures: requests in/out, external calls, errors with context. Do NOT log every function entry — noise hides signal.
- Never log secrets, tokens, passwords, or personal data (emails, names, message content). Log IDs instead.
- Errors shown to users are generic; full detail goes to server logs only.


**Documentation & the README**
- The Feature Registry contracts in CONTROL.md are the single source of truth for WHAT the app does; README.md is the human-friendly derivative. Never let them disagree.
- Any loop that merges or changes user-visible behavior updates README.md in the SAME loop: the feature list (mirroring registry names), setup/run steps if they changed, and env vars (matching .env.example).
- README describes only what exists and passes tests today — never planned or half-built features. Write it for a layperson: what it does, how to run it, nothing else. Deep detail belongs in the ledgers, not the README.
- If code and contract conflict, the contract wins; if the contract is wrong, change it via a DECISIONS entry first, then the code.

**Dependencies**
- Before adding a package: confirm it exists on the public registry, is maintained, and is genuinely needed (AI-hallucinated package names are a real attack vector). Prefer the standard library.
- Pin versions, commit the lockfile, run the audit tool after any dependency change.

**Secrets**
- Env vars only. `.env` gitignored, `.env.example` documents every variable. Nothing sensitive in client-side code, URLs, or repo history — ever.

## If `surface` = web or the app has any UI
- Follow `DESIGN.md` exactly — its typography, palette, spacing, and "never" list. The generic-AI signature (default sans + one accent on gray/beige, blue→purple gradients, glow effects, drop-shadow rounded cards everywhere, decorative emoji) is a build failure, not a style choice.
- Every major screen ships its edge states as first-class work: empty (with a helpful next step), loading (skeleton, not spinner-forever), error (plain-language message + recovery action), and offline where the profile requires it. They are the screen's own UX-### registry feature, built and proven like any other — the screen passes against its own contract, and no app reaches DONE with a UX-### item unbuilt.
- No dead affordances: anything styled as clickable must do something; anything non-interactive must not look interactive.
- Interaction test every UI feature: click it, open it, submit it, tab through it (keyboard reachable). Screenshot at 390px and desktop; check for clipping, overflow, and layout breaks.
- Real content lengths in tests: long names, empty lists, 1 item, 1000 items.

## If `auth` ≠ none
- Every route/endpoint is DENIED unless explicitly allowed — authorization is checked server-side per request, never trusted from the client.
- Test authorization directly: user A must not be able to read or mutate user B's data (attempt it in a test).
- Sessions: httpOnly + SameSite cookies or equivalent; tokens short-lived and single-use where possible. Never build your own crypto or password hashing — use the platform's vetted library.

## If `data_sensitivity` = pii or regulated
- Collect the minimum. Every stored personal field must be justifiable in one sentence (record it in DECISIONS).
- Personal data never appears in logs, error messages, analytics events, or test fixtures — generate fake data for tests.
- Provide a way to delete a user's data completely. If `regulated`, mark BLOCKED and ask the human before storing anything — compliance is a human call.

## If `persistence` ≠ none
- Parameterized queries / ORM bindings only — string-built SQL is forbidden.
- Schema changes only via versioned migrations (up + down), never hand-edited on a live DB.
- The app's DB user gets least privilege (no DDL in production). Back up before destructive migrations.
- Index what you query; check for N+1 patterns when adding list endpoints.

## If `surface` = web
- Escape/encode all user content at render (framework defaults on — don't disable them).
- CORS: explicit allowlist, never `*` with credentials. Set basic security headers (CSP, X-Content-Type-Options, frame-ancestors).
- Validate on the server even if the client also validates. Client checks are UX, not security.

## If `surface` = api
- Version the API from day one (`/v1/`). Validate request bodies against a schema; reject unknown fields.
- Rate limit per key/user, not just per IP. Return consistent error shapes without internal detail.

## If `external_services` is non-empty
- Wrap each service in one thin adapter module so it can be mocked in tests and swapped later.
- Scope every API key to least privilege; handle the service being down (timeout + graceful failure path, test it).
- Webhook endpoints verify signatures before processing.
