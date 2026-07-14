# Greenlight — Self-Improvement Loop

You are running ONE iteration of a loop whose job is to make THIS repository (the Greenlight
system itself — prompts and markdown, not a runnable app) correct, consistent, and clear.
You may have zero memory of prior iterations. The files are your memory. Work from the repo root.

Each iteration is three phases, in order, each done ONCE: **HUNT** (find every defect),
**FIX** (fix the batch, one defect at a time), **GATE** (one final full check). Do not
interleave them — no going back to hunting mid-fix, no re-reading the whole repo between fixes.

## Namespace (read first — you are editing Greenlight WITH Greenlight)
- This repo IS the Greenlight product. You are improving it as source text.
- Everything of YOURS lives in `.selfloop/` and nowhere else: `.selfloop/IMPROVEMENTS.md`
  (your log of completed fixes), `.selfloop/BACKLOG.md` (defects found but not yet fixed),
  and `.selfloop/PERFECT` (your stop sentinel). When the human is satisfied they delete the
  whole `.selfloop/` folder — so never reference `.selfloop/` from any product file, and
  never write state anywhere else.
- `templates/` and `examples/` are PRODUCT CONTENT. The CONTROL/LEDGER/DECISIONS/CHANGELOG
  files in there are inert samples — edit them for correctness, but NEVER run them,
  "progress" their statuses, or treat their sample data as real work.
- Never create a `CONTROL.md`, `LEDGER.md`, `DECISIONS.md`, or `CHANGELOG.md` at the repo
  root — those names belong to the product.
- The product's single-folder rule: everything Greenlight installs into a TARGET repo must
  live under one `greenlight/` folder (working docs directly in it, runtime state in
  `greenlight/state/`). Any product file that scatters paths outside that folder is a defect.

## 0. Stop check (before anything else)
If `.selfloop/PERFECT` exists, do NO work and run NO tools. Reply exactly:
"PERFECT — no nameable defects remain. Stop the loop and review." Then stop.

## 1. Load
Read: `.selfloop/IMPROVEMENTS.md` (completed fixes — never re-fix or undo these) and
`.selfloop/BACKLOG.md` (parked finds) — create either if missing. Your loop number N is
1 + the highest loop number in IMPROVEMENTS.md. Then read every file in `prompts/`,
`templates/`, `examples/`, plus `README.md`, `install.sh`, `run-loop.example.sh`.
Read `git log --oneline -20`. Trust the files over any assumption.

## 2. HUNT — build the complete defect list for this loop (read + check ONCE)
Collect every defect you can name into one list before fixing anything.

a) **Triage the backlog**: entries are CLAIMS by a past loop, not verified truths. Re-verify
   each against the current files — still real → onto this loop's list; already fixed or
   refutable → delete the entry and log why (that is progress, not a skipped chore).

b) **Mechanical checks** (objective; scope every grep to product files — never `.selfloop/`, never `.git/`):
- `bash -n install.sh && bash -n run-loop.example.sh` — shell must parse.
- `grep -rn '{{' examples/` — placeholder leaks (examples must be fully filled; `templates/`
  and `prompts/bootstrap.md` may legitimately keep `{{...}}`).
- `grep -rln '🟡\|🟢\|🔴\|🟣\|⚫\|🔵\|⚪' templates/ examples/ prompts/` — stale emoji-status
  vocab (only DESIGN.md palette lines may contain colored dots; statuses must be words:
  PLANNED/UNVERIFIED/PASSING/STABLE/BROKEN/BLOCKED/RETIRED). README.md's title 🟢 is branding — leave it.
- `grep -rn '\.greenlight' README.md install.sh run-loop.example.sh prompts/ templates/ examples/`
  — must return nothing; the old scattered `.greenlight/` layout is retired for `greenlight/state/`.
- Cross-file consistency: every file `install.sh` downloads exists in the repo; every filename
  referenced in `prompts/*.md` exists under `templates/` or is one bootstrap generates; status
  words and front-matter keys in `examples/streak/CONTROL.md` match `templates/CONTROL.md`;
  paths in README.md, install.sh, run-loop.example.sh, and prompts all agree on the
  single-folder layout (`greenlight/…`, `greenlight/state/…`).
- Internal links: relative paths referenced in docs resolve to real files here (paths that
  only exist in a TARGET repo after install are fine when the text clearly describes that).

c) **Semantic hunt**: with everything fresh in mind, name the correctness and clarity defects
   (rungs 2–3 below).

Rank the full list by rung:
1. Mechanical-check failure from (b).
2. A genuine correctness bug: an instruction that contradicts another file, is impossible to
   follow, or would make a fresh agent do the wrong thing.
3. A genuine clarity defect you can NAME in one sentence: an instruction a careful reader
   would misinterpret. (Not "could be nicer" — a real ambiguity.)
4. CONSOLIDATE (only when the list has nothing at 1–3): one rule or section so dense a fresh
   agent is likely to misread it. The product's own standard — "verbose context files make
   agents worse" — makes density a defect, but only if ALL of: the rewrite is strictly
   shorter; you log a behavior trace showing every case the old text covered is handled
   identically; the text was not already consolidated by a previous loop (check
   IMPROVEMENTS.md). If you cannot prove equivalence, it is not eligible.

**If the backlog is empty AND the list is empty: you are done.** Create `.selfloop/PERFECT`,
append a final `.selfloop/IMPROVEMENTS.md` line, and reply with the PERFECT message from §0.
Do not invent work.

## 3. Plan the batch
- **Fix every small, independent defect on the list this loop** — independent = confined to
  its own rule/file, sharing no text with another fix in the batch. No count limit.
- **A BIG defect** — its fix touches interacting rules (e.g. multiple ladder rungs that read
  each other's preconditions) or cascades into example/LEDGER rewrites — **gets the whole
  loop to itself.** Fix only it; park everything else.
- Two defects touching the same rule/section are NOT independent: fix the first, park the second.
- **Park every find you don't fix**: append one line per defect to `.selfloop/BACKLOG.md`
  (`- [ ] rung=<1-4> | <one-sentence defect> | files: <paths>`) so nothing found is ever lost.

## 4. FIX — one defect at a time, no interleaving
For each defect in the batch, in rung order: make the smallest change that resolves it →
verify JUST THAT FIX (re-run only the specific check it fails, or re-trace only the rule it
changes — the full suite comes at the GATE, not here) → log and commit it (see §5) → next.
Same-rule exception: if verifying a fix exposes a second defect in the SAME rule or file,
fix and log it now rather than leaving a known-broken intermediate state.

## 5. Log and commit (per fix — this preserves the single-fix audit trail)
Immediately after verifying each fix, and BEFORE starting the next one:
- Append one line to `.selfloop/IMPROVEMENTS.md`:
  `[ISO-timestamp] loop=N fix=k | defect: <one sentence> | fix: <what changed, which file> | verified: <how>`
- Commit JUST that fix (plus its log line): `git add -A && git commit -m "loop N.k: <short defect>"`.
  One commit per fix, always — any single fix stays readable, judgeable, and revertible alone.
Backlog bookkeeping (parking finds, deleting fixed/refuted entries) rides in the fix-commit it
belongs to; if none fits, give it its own final commit `"loop N: backlog"`.

## 6. GATE — once, at the end of the loop
Re-run the full §2(b) mechanical suite and spot-re-trace any ladder rule the batch touched —
fixes that were independent when chosen can still interact once landed. If the gate finds
breakage, fix it now as `loop N fix=k+1` before finishing. Leave nothing uncommitted.

## Anti-drift rules (these override the urge to change things)
- Per defect, the smallest change that resolves it. Fixes are strictly serialized — never
  interleave two fixes' edits.
- NEVER rewrite, reword, or "polish" a file that has no named defect. Working prose is done prose.
- A change is only allowed if you can state the concrete defect it fixes in `.selfloop/IMPROVEMENTS.md`.
  No defect, no edit.
- Do not add features, files, or sections unless a defect requires it.
- If your only complaint is taste, that is NOT a defect. Prefer STOP over churn. (Density that
  risks misreading is rung 4's business, and only under its proof conditions.)
- Never undo a fix a previous loop logged as done unless it demonstrably broke something (say what).

Begin at step 0.
