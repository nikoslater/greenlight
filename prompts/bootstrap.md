# Greenlight — Bootstrap (run once; new OR existing project)

Run this in your project folder with your agent. New/empty repo → paste your idea dump at
the bottom. Repo with code → just run it.

---

You are bootstrapping this repository into the Greenlight system (templates in
`greenlight/templates/`). This phase determines everything downstream: the stack chosen
here is the stack forever, the questions skipped here become rewrites later. Be rigorous
here so the loop never has to re-architect.

Detect the situation first.

## A. Repo has meaningful code → ADOPT
1. Survey: entry points, run/test commands, real features (routes, screens, commands), existing tests, security pass (secrets in code? committed .env? auth? validation?).
2. Fill CONTROL.md honestly: Profile from reality; Registry from what exists; board truthfully (tests you ran and passed → PASSING, unproven → UNVERIFIED, broken → BROKEN); leave unmet Security Baseline boxes unchecked.
3. Seed ledgers: LEDGER one verified line per feature; DECISIONS with 5-line threat model + risky patterns found; CHANGELOG one "adopted" entry.
4. If the app has a UI, write DESIGN.md by reverse-engineering the existing design (its actual fonts, colors, spacing) plus the standard "never" list; file missing edge states as UX-### PLANNED items.
5. Fix nothing in this pass. Set Next Action to the top gap. Report: features, statuses, top 3 risks, first Next Action — in plain language.

## B. New project → IDEATE, then SCAFFOLD

### B1. Understand (talk like a helpful friend, not an engineer)
Reflect my dump back in 3–4 plain sentences. Then ask ONE batched round of questions in
everyday language — no jargon, and give a recommended default with every question so I can
just say "go with your suggestions." Only ask what the dump doesn't answer.

**Ask the one-way-door questions — the ones that force a rebuild if guessed wrong:**
- Who uses it, and do people need accounts? Just you, or strangers on the internet?
- One shared space or separate private spaces per person/team? (multi-tenancy)
- Phone, computer, or both? Must it work offline or with a bad connection?
- What data is saved forever vs disposable? Anything sensitive (health, money, kids)?
- Does anything happen "live" (two people seeing the same thing update) or on a schedule?
- Money involved — payments, subscriptions? (changes everything; confirm now)
- Files/photos/uploads? Emails or notifications sent? Other services it must talk to?
- Different user types with different powers (admin vs member)?
- Roughly how many users in year one — 5 friends or 5,000 strangers?
- What similar apps exist, and what should this one do differently? (shapes the core features)
- What is the ONE job the app must nail — the single flow that, if it feels great, the app succeeds?
- What does "done" look like, and what's explicitly NOT in v1?
Never silently assume an answer to these. If I don't know, use your recommended default and record it as a DECISIONS entry marked "assumed — cheap to change until v1.0".

### B2. Shape
Suggest features I didn't mention (including ones implied by the idea's own logic), flag
scope/security risks in plain language, and propose a lean v1 list vs later. **Wait for my "go".**

### B3. Scaffold (after "go")
1. **Stack & packages — pick from `STACKS.md`.** Use its default for the profile unless there is a specific, recorded reason to deviate (record it in DECISIONS). Verify every package exists on the public registry and is maintained. Fewest dependencies wins; prefer platform/stdlib capabilities (STANDARDS "Write less code"). List the exact initial dependency set with a one-line reason each.
2. **Design brief — write `DESIGN.md` (1 page).** Personality in 3 adjectives, a real typography choice (not the default sans everyone gets), a small palette with one clear hierarchy, spacing scale, and a short "never" list: no blue→purple gradients, no glow effects, no beige-default, no decorative emoji, no equal-volume neon. Specify the edge states (empty, loading, error, offline) as designed screens, not afterthoughts — these are what separate real apps from vibe-coded demos.
3. **Registry with Contracts:** write a one-to-two sentence behavioral Contract for every feature — exact expected behavior including the tricky part (timezones, duplicates, limits). These contracts are the permanent spec the loop builds and tests against, so a fresh session can never misinterpret a feature. Use stable IDs (F-### features, SEC-### security, UX-### edge-state/design items). Every UI feature's required tests include an interaction pass (click/open/submit) and a screenshot at mobile + desktop widths. Add UX-### items for empty/loading/error states of each major screen.
4. **Generate:** CONTROL.md (Profile filled, `greenlight: "no"`, Charter, Registry, board all PLANNED, exact runnable `test_commands`, first Next Action), the three seeded ledgers (threat model in DECISIONS; every assumption and stack justification recorded), README.md for the app (layperson install/run steps), `.env.example`, `.greenlight/evidence/`, folder tree with module boundaries + `tests/` mirroring the registry + Playwright configured for interaction tests and screenshots.
5. Don't build features — that's the loop's job. Finish with a plain-language summary: what will be built, in what order, and what I should double-check.

**Both paths:** copy `greenlight/templates/STANDARDS.md` and `greenlight/templates/STACKS.md` to the repo root unchanged. Keep everything you write short and specific — verbose context files make agents worse.

=== MY IDEA DUMP (new projects only) ===
{{paste here}}
