# Greenlight — Self-Improvement Loop

You are running ONE iteration of a loop whose job is to make THIS repository (the Greenlight
system itself — prompts and markdown, not a runnable app) correct, consistent, and clear.
You may have zero memory of prior iterations. The files are your memory. Work from the repo root.

## Namespace (read first — you are editing Greenlight WITH Greenlight)
- This repo IS the Greenlight product. You are improving it as source text.
- Everything of YOURS lives in `.selfloop/` and nowhere else: `.selfloop/IMPROVEMENTS.md`
  (your log) and `.selfloop/PERFECT` (your stop sentinel). When the human is satisfied they
  delete the whole `.selfloop/` folder — so never reference `.selfloop/` from any product
  file, and never write state anywhere else.
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
Read: `.selfloop/IMPROVEMENTS.md` (create it if missing — it's your running log), then every
file in `prompts/`, `templates/`, `examples/`, plus `README.md`, `install.sh`,
`run-loop.example.sh`. Read `git log --oneline -20`. Trust the files over any assumption.

## 2. Run the mechanical checks (these are your objective "tests")
Run each; collect every failure. Scope every grep to product files only — never `.selfloop/`, never `.git/`.
- `bash -n install.sh && bash -n run-loop.example.sh` — shell must parse.
- `grep -rn '{{' examples/` — placeholder leaks in the EXAMPLE (examples must be fully filled; `templates/` and `prompts/bootstrap.md` may legitimately keep `{{...}}`).
- `grep -rln '🟡\|🟢\|🔴\|🟣\|⚫\|🔵\|⚪' templates/ examples/ prompts/` — stale emoji-status vocab (only DESIGN.md palette lines may contain colored dots; statuses must be words: PLANNED/UNVERIFIED/PASSING/STABLE/BROKEN/BLOCKED/RETIRED). The 🟢 in README.md's title is branding, not status — leave it.
- `grep -rn '\.greenlight' README.md install.sh run-loop.example.sh prompts/ templates/ examples/` — must return nothing; the old scattered `.greenlight/` layout is retired in favor of `greenlight/state/`.
- Cross-file consistency: every file `install.sh` downloads must exist in the repo; every filename referenced in `prompts/*.md` (STANDARDS.md, STACKS.md, DESIGN.md, CONTROL.md, LEDGER.md, DECISIONS.md, CHANGELOG.md) must exist under `templates/` or be one bootstrap generates; the status words and front-matter keys used in `examples/streak/CONTROL.md` must match those defined in `templates/CONTROL.md`; paths in README.md, install.sh, run-loop.example.sh, and prompts must all agree on the single-folder layout (`greenlight/…`, `greenlight/state/…`).
- Internal links: any relative path referenced in a doc must resolve to a real file in this repo (paths that only exist in a TARGET repo after install — like `greenlight/CONTROL.md` — are fine when the text clearly describes the installed layout).

## 3. Pick exactly ONE thing to fix — or STOP
Priority ladder (do the FIRST that applies, then stop and log):
1. Any mechanical-check failure from §2.
2. A genuine correctness bug: an instruction that contradicts another file, is impossible to follow, or would make a fresh agent do the wrong thing.
3. A genuine clarity defect you can NAME in one sentence: an instruction a careful reader would misinterpret. (Not "could be nicer" — a real ambiguity.)
4. CONSOLIDATE (only when rungs 1–3 yield nothing): one rule or section that has grown so
   dense a fresh agent is likely to misread it. The product's own standard — "verbose context
   files make agents worse" — makes density a defect, but only under ALL of these conditions:
   the rewrite is strictly shorter; you log a behavior trace showing every case the old text
   covered is handled identically by the new text; you never re-consolidate text a previous
   loop already consolidated (check IMPROVEMENTS.md). If you cannot prove equivalence, the
   text is not eligible — fall through to STOP rather than risk changing semantics.

**If you cannot name a concrete defect at rungs 1–4: you are done.** Create `.selfloop/PERFECT`,
append a final `.selfloop/IMPROVEMENTS.md` line, and reply with the PERFECT message from §0.
Do not invent work.

## Anti-drift rules (these override the urge to change things)
- One defect per loop, smallest change that resolves it — with one exception: if VERIFYING
  your fix exposes a second defect in the SAME rule or file, fix and log both now rather than
  leaving a known-broken intermediate state for a future loop. Never batch unrelated defects.
- NEVER rewrite, reword, or "polish" a file that has no named defect. Working prose is done prose.
- A change is only allowed if you can state the concrete defect it fixes in `.selfloop/IMPROVEMENTS.md`. No defect, no edit.
- Do not add features, files, or sections unless a §2/§3 defect requires it.
- If your only complaint is taste, that is NOT a defect. Prefer STOP over churn. (Density
  that risks misreading is rung 4's business, and only under its proof conditions.)
- Never undo a fix a previous loop logged as done unless it demonstrably broke something (say what).

## 4. Verify
Re-run the relevant §2 check(s) and confirm your fix resolves the failure without creating a new one.

## 5. Log (mandatory, append-only)
Append one line to `.selfloop/IMPROVEMENTS.md` (one line PER defect, if this loop fixed two):
`[ISO-timestamp] loop=N | defect: <one sentence> | fix: <what changed, which file> | verified: <how>`
Then commit: `git add -A && git commit -m "loop N: <short defect>"`.

Begin at step 0.
