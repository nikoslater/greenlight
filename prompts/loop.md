# Greenlight — The Loop

You are running ONE iteration of the Greenlight loop in this repo, possibly with zero
memory of prior iterations. The files are your memory. Every Greenlight file lives under
`greenlight/`: the working docs (CONTROL.md, STANDARDS.md, STACKS.md, DESIGN.md, LEDGER.md,
DECISIONS.md, CHANGELOG.md) sit directly in `greenlight/`, runtime state in `greenlight/state/`.
Bare filenames below mean those `greenlight/` copies. The app itself is everything outside
that folder.

0. **Greenlight check (do this before anything else):** read only `greenlight/CONTROL.md` front-matter. If `greenlight: "yes"` or `greenlight/state/STOP` exists, do NO work and run NO further tools; reply with exactly: "GREENLIGHT ACHIEVED — the app is finished. Stop the loop and review your app." Then stop.
1. **Load:** read CONTROL.md fully; read STANDARDS.md "Always" + the sections its Profile activates (DESIGN.md too for any UI work); tail LEDGER/DECISIONS/CHANGELOG (~20 entries + full history of anything you'll touch); check `git log` recent.
2. **Act:** re-read the Contract of any feature you are about to touch — build and test against the contract, not memory or interpretation. Walk CONTROL.md §0 rungs top-down, do the FIRST that applies, and ONLY that. Regressions: locate the break version in LEDGER → read that CHANGELOG entry → fix from the lead. Builds: branch → build per STANDARDS → tests pass → merge. Needs a human (secret, product call, destructive migration)? Mark BLOCKED with the exact ask in DECISIONS, write the ask to `greenlight/state/NEEDS_HUMAN` (the harness pings the human and clears it), and take the next actionable rung instead of guessing. Consult STACKS.md before adding any new dependency.
3. **Prove:** run the exact `test_commands`. PASSING requires evidence from THIS loop saved to `greenlight/state/evidence/`. UI features need an interaction pass — actually click buttons, open menus/modals, submit forms via Playwright — plus screenshots at mobile (390px) and desktop widths, inspected for clipping, overflow, broken layout, and dead interactive elements. Follow DESIGN.md; a screen's empty/loading/error states are its UX-### item's contract — prove every feature against its OWN contract, and never greenlight with a UX-### item unbuilt. Anything you changed drops to UNVERIFIED until re-proven.
4. **Close (mandatory):** if user-visible behavior merged or changed, update the app's README.md — the one at the repo ROOT, not a `greenlight/` file — now (features mirror the registry, setup steps current, env vars match .env.example — never describe unbuilt features). Then append CHANGELOG (loop #, version, what/why, IDs touched, commits) → append LEDGER lines → update §3 board + front-matter → rewrite §5 Next Action as one concrete step → file decisions/ideas. Append-only; never rewrite history. Finally `git commit` everything this loop touched (code, docs, README) with a message naming the loop number and rung — every iteration ends in a commit and leaves nothing uncommitted, since `git log` is the memory step 1 reads and the CHANGELOG entry names those commits.
5. **Finish:** if the DONE rung fired: set `greenlight: "yes"` + `status: COMPLETE`, write `greenlight/state/STOP`, and end with the exact greenlight message above.

Begin.
