# 🟢 Greenlight

**Turn a rambling app idea into a finished, secure, professional app — on autopilot.**

You describe your idea in plain words (a voice-note braindump is perfect). Greenlight asks
you the important questions in plain English, sets the project up the way a senior
engineering team would, and then a loop builds, tests, and fixes it step by step — until
everything is proven stable and it tells you: **GREENLIGHT ACHIEVED.**

## Why this exists

AI-built ("vibe-coded") apps tend to fail the same ways: security bolted on too late, a
key question nobody asked forcing a rebuild, features that silently break while new ones
are added, sessions that forget what's broken, and that generic "AI slop" look — gray
cards, glowing gradients, buttons that do nothing. Greenlight is a set of files and two
prompts that make the AI behave like a disciplined senior team instead.

Everything Greenlight adds to your repo lives in a single `greenlight/` folder — prompts,
templates, the working docs it generates, its runner, and runtime state (`greenlight/state/`,
gitignored). Your repo root stays yours.

---

## Part 0 — Set up your computer (once, ever)

Greenlight drives **Claude Code**, Anthropic's AI agent that runs in your terminal.
Skip this part if `claude --version` already prints a version number.

**1. Install Claude Code:**

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**2. Fix your PATH if needed.** If the installer's "Setup notes" say `~/.local/bin is not
in your PATH`, your terminal can't find `claude` yet. Run the command the installer prints,
which on a Mac is:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

**3. Verify, then log in once:**

```bash
claude --version
claude
```

The first bare `claude` run walks you through logging in with your Anthropic account in a
browser. Once you're in, type `/exit`. Do this before ever starting a loop — the loop runs
Claude non-interactively and cannot handle a login prompt.

**Terminal tips for the road:** don't paste lines containing `#` comments into zsh (it
treats them as arguments, not comments — or run `setopt interactive_comments` once to allow
them). And paste one command at a time until you're comfortable.

---

## Part 1 — Install Greenlight into your project (once per project)

```bash
cd your-project          # new empty folder or existing codebase — both work
git init                 # only if it isn't a git repo yet
curl -fsSL https://raw.githubusercontent.com/YOU/greenlight/main/install.sh | bash
```

**Strongly recommended: run Greenlight on a branch, not on `main`:**

```bash
git checkout -b greenlight-build
```

You're handing an autonomous agent the keys to the folder. On a branch, `main` stays
untouched no matter what; when you're happy with the result you merge, and if a run ever
goes sideways you throw the branch away and lose nothing.

---

## Part 2 — Bootstrap (one interactive conversation)

```bash
claude "$(cat greenlight/prompts/bootstrap.md)"
```

This opens a live chat session, not the loop:

- **New idea?** Paste your braindump when asked. It will reflect the idea back, ask the
  one-way-door questions (each with a suggested default, so "go with your suggestions"
  always works), propose a lean v1 feature list, and **wait for your "go"** before
  scaffolding anything.
- **Existing codebase?** It studies your code and fills in the Greenlight docs from reality,
  fixing nothing yet.

When it finishes its summary, type `/exit`. Your project now has its brain:
`greenlight/CONTROL.md` (features, statuses, next action) and its rulebooks
(`STANDARDS.md`, `STACKS.md`, `DESIGN.md`) alongside it.

---

## Part 3 — Run the loop

```bash
./greenlight/run-loop.sh 300
```

Each cycle runs ONE work step (build a feature, run its tests, fix what broke, save
evidence, commit) and then waits. The terminal narrates:

```
[14:02:11] iteration started — MID-FLIGHT, don't edit the repo until it finishes
[14:07:48] iteration finished — safe window (next one in 300s)
```

- The number is seconds between iterations. `300` = one step every 5 minutes, good for
  keeping an eye on it. A small number like `15` runs back-to-back — faster progress, but
  it burns through your usage quota quickly and you'll review the work in one pile at the
  end instead of as it happens.
- To pin a specific model: `ANTHROPIC_MODEL=claude-opus-4-8 ./greenlight/run-loop.sh 300`
- The loop stops itself when the app is done ("GREENLIGHT ACHIEVED") — or stop it anytime
  with **Ctrl-C**, ideally during a safe window.

---

## While it runs — the two states that matter

**MID-FLIGHT** (between "started" and "finished" lines): the agent is editing your files.
Don't edit files, don't switch branches, don't pull. Looking is always fine.

**Safe window** (after a "finished" line): do anything — stop the loop, push, clean up.

Watch progress from a second terminal tab:

```bash
git log --oneline -10
```
Every iteration ends in a commit — this is the loop's diary.

```bash
cat greenlight/CONTROL.md
```
The live status board: every feature's state (PLANNED → UNVERIFIED → PASSING → STABLE)
and the single next action.

---

## Scenarios — "what do I do when..."

**...I want to pause and resume later?**
Ctrl-C during a safe window. Resume anytime with `./greenlight/run-loop.sh 300` — the
files are the loop's memory, so it picks up exactly where it left off, even days later.

**...I want my progress backed up on GitHub?**
The loop only commits locally — nothing leaves your computer on its own. Push whenever
you like (safe even mid-flight): `git push -u origin greenlight-build`

**...the loop says it needs ME?**
When it hits a decision only a human can make (a secret key, a product call, a destructive
migration) it marks the item BLOCKED, writes the exact question to `greenlight/DECISIONS.md`,
and pings you — then keeps working on other things. Read the question, append your answer
under it in `greenlight/DECISIONS.md`, and the next iteration unblocks.

**...it says GREENLIGHT ACHIEVED?**
The loop has stopped itself: every feature stable, security checklist green, UI verified by
real clicks. Try the app yourself, then fold the work into main:
`git checkout main` then `git merge greenlight-build` then `git push`

**...an iteration did something I don't like?**
Wait for the safe window, Ctrl-C, find the commit in `git log --oneline`, and undo just it:
`git revert <commit-id>`. Then note what you didn't like in `greenlight/DECISIONS.md` so
the loop doesn't redo it, and restart the loop.

**...the terminal says `claude: command not found`?**
PATH problem — redo Part 0 step 2, or open a fresh terminal window.

**...I'm not sure whether it's mid-flight?**
The last line in the loop's terminal tells you. Backup check from any terminal:
`pgrep -f 'claude -p' >/dev/null && echo MID-FLIGHT || echo safe`

**...an iteration errors?**
The loop shrugs and tries again next interval — one failed iteration never kills it. If it
fails repeatedly, Ctrl-C and run one iteration by hand to see the actual error:
`claude -p "$(cat greenlight/prompts/loop.md)" --dangerously-skip-permissions`

---

## What's under the hood

- **CONTROL.md** — the brain: what the app is, every feature's live status, a strict
  priority ladder (security first, regressions second), and the single next step.
- **STANDARDS.md** — how the code must be written: security rules, a "write the least
  code that works" ladder (inspired by the ponytail skill), logging that never leaks
  personal data, and UI rules that kill the generic-AI look (design brief, real empty/
  loading/error states, no dead buttons).
- **DESIGN.md** — a one-page design brief created at setup so the app has an intentional
  look instead of the statistical average.
- **STACKS.md** — preset, research-backed technology choices per app type, so the setup
  never gambles on exotic tools; deviations must be justified in writing.
- **LEDGER / DECISIONS / CHANGELOG** — append-only history: every test result dated and
  versioned, every decision explained. When a feature that worked suddenly breaks, the
  loop sees exactly which version broke it and fixes from that lead.

Features move `PLANNED → UNVERIFIED → PASSING → STABLE`; anything changed must be
re-proven with evidence (including screenshots and real clicks for UI). Hitting v1.0
deliberately re-tests *everything*.

`examples/streak/` is a complete worked example. MIT. PRs welcome.
