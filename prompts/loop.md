# Greenlight — The Loop

You are running the Greenlight loop in this repo. Work in ITERATIONS: each iteration is
steps 0–5 below, ends in its own commit, and then you immediately begin the next iteration
back at step 0 — re-reading the files fresh, because the files are the memory, not your
recollection of them (this session may also be resumed by someone with zero context; the
files must always be enough). Keep iterating until step 0 stops you, or a waiting state
(CONTROL.md §0) leaves nothing actionable — then tell the human exactly what you need and stop.
If the human sends a message at any point during the session, it is intake, not chat: triage
it per CONTROL.md §0's Intake rule (book it, adjust the board) before continuing the ladder.

Every Greenlight file lives under `greenlight/`: the working docs (CONTROL.md, STANDARDS.md,
STACKS.md, DESIGN.md, LEDGER.md, DECISIONS.md, CHANGELOG.md) sit directly in `greenlight/`,
runtime state in `greenlight/state/`. Bare filenames below mean those `greenlight/` copies.
The app itself is everything outside that folder.

0. **Greenlight check (do this before every iteration):** read `greenlight/CONTROL.md` front-matter. If `greenlight: "yes"`: check the §3 board for live BROKEN/UNVERIFIED/PLANNED features and the DECISIONS tail for `Type: issue` entries still `Status: open`. If there are none, do NO further work; reply with exactly: "GREENLIGHT ACHIEVED — the app is finished. Stop the loop and review your app." Then stop. If there ARE open issues or demoted features, the milestone is stale: set `greenlight: "no"` per CONTROL §0's Maintenance rule and continue at step 1 — the ladder fixes them, versions keep advancing, and DONE fires again once everything is re-proven.
1. **Load:** read CONTROL.md fully; read STANDARDS.md "Always" + the sections its Profile activates (DESIGN.md too for any UI work); tail LEDGER/DECISIONS/CHANGELOG (~20 entries + full history of anything you'll touch); check `git log` recent.
2. **Act:** re-read the Contract of any feature you are about to touch — build and test against the contract, not memory or interpretation. Walk CONTROL.md §0 rungs top-down, do the FIRST that applies, and ONLY that. Regressions: locate the break version in LEDGER → read that CHANGELOG entry → fix from the lead. Builds: branch → build per STANDARDS → tests pass → merge. Needs a human (secret, product call, destructive migration)? Mark BLOCKED with the exact ask in DECISIONS — and repeat the ask to the human in your narration, since they answer by appending to DECISIONS — then take the next actionable rung instead of guessing. Consult STACKS.md before adding any new dependency.
3. **Prove:** run the exact `test_commands`. PASSING requires evidence from THIS loop saved to `greenlight/state/evidence/`. UI features need an interaction pass — actually click buttons, open menus/modals, submit forms via Playwright — plus screenshots at mobile (390px) and desktop widths, inspected for clipping, overflow, broken layout, and dead interactive elements. Follow DESIGN.md; a screen's empty/loading/error states are its UX-### item's contract — prove every feature against its OWN contract, and never greenlight with a UX-### item unbuilt. Anything you changed drops to UNVERIFIED until re-proven.
4. **Close (mandatory):** if user-visible behavior merged or changed, update the app's README.md — the one at the repo ROOT, not a `greenlight/` file — now (features mirror the registry, setup steps current, env vars match .env.example — never describe unbuilt features). Then append CHANGELOG (loop #, version, what/why, IDs touched, commits) → append LEDGER lines → update §3 board + front-matter → rewrite §5 Next Action as one concrete step → file decisions/ideas. Append-only; never rewrite history. Finally `git commit` everything this loop touched (code, docs, README) with a message naming the loop number and rung — every iteration that changes anything ends in a commit and leaves nothing uncommitted, since `git log` is the memory step 1 reads and the CHANGELOG entry names those commits. (The sole exception is CONTROL.md §0's waiting state — an iteration blocked entirely on an unanswered human ask restates the ask and stops, changing and committing nothing.)
5. **Finish or continue:** if the DONE rung fired: set `greenlight: "yes"` + `status: COMPLETE` and end with the exact greenlight message above. Otherwise, summarize the iteration in one line (loop #, rung, what changed) and begin the next iteration at step 0.

Begin at step 0.
