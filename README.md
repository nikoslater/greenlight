# 🟢 Greenlight

**Turn a rambling app idea into a finished, secure, professional app — on autopilot.**

You describe your idea in plain words (a voice-note braindump is perfect). Greenlight asks
you the important questions in plain English, sets the project up the way a senior
engineering team would, and then a loop builds, tests, and fixes it step by step — until
everything is proven stable and it tells you: **GREENLIGHT ACHIEVED.**

You watch it all happen in the **Greenlight dashboard** — a local one-window app where you
see Claude work in real time, watch every feature's status change, answer its questions with
buttons, and (if you want) approve every change before it happens. No terminal-watching, no
refreshing GitHub to see what changed.

## Why this exists

AI-built ("vibe-coded") apps tend to fail the same ways: security bolted on too late, a
key question nobody asked forcing a rebuild, features that silently break while new ones
are added, sessions that forget what's broken, and that generic "AI slop" look — gray
cards, glowing gradients, buttons that do nothing. Greenlight is a set of files and two
prompts that make the AI behave like a disciplined senior team instead.

Everything Greenlight generates lives in a single `greenlight/` folder — prompts, templates,
the working docs it produces, and runtime state (`greenlight/state/`, gitignored).
The only things it adds to your repo root are two small housekeeping touches: a couple of
lines in `.gitignore` and a `.env.example` if you don't already have one. Your actual
source tree stays yours.

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
browser. Once you're in, type `/exit`. Do this before ever starting a loop — the dashboard
drives Claude with your login, and can't handle the first-time login prompt itself.

**4. Install Node.js** (powers the dashboard). Check with `node --version` — if that prints
v18 or higher you're done. Otherwise grab the LTS installer from
[nodejs.org](https://nodejs.org) and run it.

**5. Recommended — install the ponytail plugin.** [Ponytail](https://github.com/DietrichGebert/ponytail)
makes the agent code like the laziest senior dev in the room: the best code is the code never
written. Greenlight's standards are built around its ladder, and the plugin enforces it every
turn. Run `claude`, then type these two commands, then `/exit`:

```
/plugin marketplace add DietrichGebert/ponytail
/plugin install ponytail@ponytail
```

**Terminal tips for the road:** don't paste lines containing `#` comments into zsh (it
treats them as arguments, not comments — or run `setopt interactive_comments` once to allow
them). And paste one command at a time until you're comfortable.

---

## Part 1 — Install Greenlight into your project (once per project)

Greenlight commits its work with git on every iteration, so your project must be a git repo on
a working branch before you start. This is **required, not optional** — it's the step people
most often miss (an unzipped download or a fresh folder isn't a git repo yet). It works the
same whether your folder is a brand-new idea, an unzipped download, or an existing codebase.
Run these from your project folder, **top to bottom, all four**:

```bash
cd your-project

# 1. Make it a git repo (safe even if it already is one — then it does nothing):
git init

# 2. Install Greenlight:
curl -fsSL https://raw.githubusercontent.com/nikoslater/greenlight/main/install.sh | bash

# 3. Commit once (this creates `main`)...
git add -A && git commit -m "Set up Greenlight"

# 4. ...then branch — the loop does ALL its work here, never on main:
git checkout -b greenlight-build
```

**Don't skip step 4.** You're handing an autonomous agent the keys to the folder. On
`greenlight-build`, your `main` stays untouched no matter what — when you're happy you merge,
and if a run goes sideways you throw the branch away and lose nothing. (You do **not** need a
GitHub account or any connection for this — git runs entirely on your computer. Putting it on
GitHub is optional and comes later, under backup below.)

**If step 3 errors with "Please tell me who you are,"** git just needs your identity once (the
loop can't commit without it). Set it, then re-run steps 3 and 4:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

(This installs from `nikoslater/greenlight`. Forking Greenlight to publish your own copy?
Replace `nikoslater` in the URL — and in `install.sh`'s `REPO_RAW` — with your account.)

**Already a project on GitHub?** If your folder is an existing repo that's already connected
to GitHub (it has an `origin` remote and a `main` with history), skip the `git init` and the
"create main" commit above — `main` already exists. Just branch off it, and after the loop
runs, push that branch to your existing repo and open a Pull Request so you can review
everything before it touches `main`:

```bash
git checkout -b greenlight-build        # branch off your existing main
# ...install Greenlight, bootstrap, and run the loop on this branch...
git push -u origin greenlight-build     # pushes the branch to your existing GitHub repo
```

Then on GitHub, open a Pull Request from `greenlight-build` into `main`. All of Greenlight's
commits stay isolated on the branch — nothing reaches your `main` until you merge the PR. If
the loop is still running, pushing from a second terminal tab is safe; push again whenever
you want the branch on GitHub updated.

---

## Part 2 — Open the dashboard and bootstrap

```bash
./greenlight/ui/start.sh
```

Your browser opens one window (the first run installs the dashboard, about a minute). On the
left: a live feed of everything Claude does and says, with a box to talk back. On the right:
the project board — every feature and its status, the single next action, the security
checklist, recent commits, and anything waiting on you.

Click **Bootstrap** — the one-time setup conversation:

- **New idea?** Type your braindump into the box when it asks. It reflects the idea back,
  asks the one-way-door questions **as cards with buttons** (each option explained, and
  "go with your suggestions" always works), proposes a lean v1 feature list, and waits for
  your go before scaffolding anything.
- **Existing codebase?** It studies your code and fills in the Greenlight docs from reality,
  fixing nothing yet.

When it finishes, the right-hand board lights up with your feature list — that's your
project's brain (`greenlight/CONTROL.md`), and from now on you watch it change in real time.

---

## Part 3 — Run the loop

Click **Start loop**. That's it.

Each iteration walks the priority ladder, does ONE work step (build a feature, run its
tests, fix what broke, save evidence), commits it, and rolls into the next — while the feed
narrates and the board updates live. It stops itself when the app is done
(**GREENLIGHT ACHIEVED** — the header lamp turns green), or asks you with buttons when it
hits a decision only you can make.

- **Want to approve every change?** Turn on **review each change** (top right). Every file
  edit and command then waits for your Allow/Deny click. Leave it off to let the loop run
  free — questions still come to you either way.
- **Steer anytime**: type in the box — "focus on the dashboard feature next", "don't use
  that library" — it course-corrects.
- **Stop** button halts the session safely. The files are the loop's memory, so stopping is
  always safe: Start loop later and it picks up exactly where the ledgers say it left off.
- **Overnight (Mac):** system sleep pauses the loop, so start the dashboard with
  `caffeinate -is ./greenlight/ui/start.sh` to keep the machine awake while it runs. Lid
  open, plugged in.

**Prefer the terminal?** The dashboard is optional — the same two prompts run directly in
Claude Code: `claude "$(cat greenlight/prompts/bootstrap.md)"` once, then
`claude "$(cat greenlight/prompts/loop.md)"` for the loop. Pin a model with
`ANTHROPIC_MODEL=claude-opus-4-8` before either command (the dashboard honors it too).

---

## While it runs — the two states that matter

**WORKING** (the header lamp pulses, tools firing in the feed): the agent is editing your
files. Don't edit files, don't switch branches, don't pull. Watching is always fine.

**WAITING** (a question card is open, or the feed says the session finished): do anything —
answer, push, clean up, or start the next run.

The board panel is the live truth: every feature's state (PLANNED → UNVERIFIED → PASSING →
STABLE), the single next action, and the commit diary — every iteration that does work ends
in a commit. (The one exception: an iteration with nothing to do but wait for an answer from
you makes no commit.) The same truth is always in the files if you prefer a second terminal:
`git log --oneline -10` and `cat greenlight/CONTROL.md`.

---

## Scenarios — "what do I do when..."

**...I want to pause and resume later?**
Click **Stop** in the dashboard (in the terminal: Esc, then `/exit`). Resume anytime by
clicking **Start loop** again — the files are the loop's memory, so it picks up exactly
where it left off, even days later. Closing the dashboard window or Ctrl-C'ing `start.sh`
is also safe: every finished iteration is already committed.

**...I want my progress backed up on GitHub?**
The loop only commits locally — nothing leaves your computer on its own. If you started
from a local folder rather than a cloned repo, connect a GitHub repo once (create an empty
one on github.com first): `git remote add origin https://github.com/you/your-repo.git`.
Then push whenever you like, safe even mid-flight: `git push -u origin greenlight-build`

**...I made more commits on `greenlight-build` and want to update the branch on GitHub?**
Just push again. After that first `git push -u origin greenlight-build` linked the branch to
its remote, a plain `git push` from `greenlight-build` sends up every new commit since last
time:

```bash
git push
```

Pushing is safe even while the loop is running. If a Pull Request is already open from this
branch, the push updates that PR automatically — no need to reopen it.

**...the loop says it needs ME?**
When it hits a decision only a human can make (a secret key, a product call, a destructive
migration) it marks the item BLOCKED, records the exact question in `greenlight/DECISIONS.md`,
and asks you — as a question card in the dashboard, or by typing your answer in the box —
then keeps working on other things. Blocked items also sit in the board's "Waiting on you"
card until resolved. (If the ask is the ONLY thing left, the loop stops and waits — answer,
then click Start loop.)

**...it says GREENLIGHT ACHIEVED?**
The loop has stopped itself: every feature stable, security checklist green, UI verified by
real clicks. Try the app yourself, then fold the work into main:
`git checkout main` then `git merge greenlight-build` then `git push`

**...I merged my branch into `main` on GitHub (via a Pull Request) — how do I update my local `main`?**
The merge happened on GitHub's copy, so your local `main` is now behind it. Switch to `main`
and pull the merged history down:

```bash
git checkout main
git pull origin main
```

That fast-forwards your local `main` to match. The branch is finished now, so you can clean it
up locally and on GitHub if you like:

```bash
git branch -d greenlight-build              # delete it locally
git push origin --delete greenlight-build   # and on GitHub
```

**...an iteration did something I don't like?**
You're watching it live, so just tell it — type what's wrong in the dashboard box; it
course-corrects in place. For something already committed: Stop, find the commit in the
board's commit list, undo just it with `git revert <commit-id>`, note what you didn't like
in `greenlight/DECISIONS.md` so the loop doesn't redo it, and Start loop again. If you want
veto power *before* changes land, that's the **review each change** toggle.

**...the terminal says `claude: command not found`?**
PATH problem — redo Part 0 step 2, or open a fresh terminal window.

**...the session crashed, hung, or hit its usage limit?**
Nothing is lost — every finished iteration is already committed. Stop it (Ctrl-C the
dashboard's terminal if it's fully hung), fix whatever it complained about (usage limits
reset on their own), and Start loop again; it re-reads the files and continues. If it hangs
repeatedly at the same spot, look at the board's Next action — that's the step it's stuck
on — and tell it what to do about it in the box.

---

## What's under the hood

- **The dashboard** (`greenlight/ui/`) — a small local app (one dependency) that drives
  Claude Code through the official Agent SDK using your existing login. It streams the
  session live, turns Claude's questions into buttons, gates changes behind Allow/Deny when
  review mode is on, and renders the board straight from the files below — it displays
  state, it never owns it. Everything works identically from a plain terminal.
- **CONTROL.md** — the brain: what the app is, every feature's live status, a strict
  priority ladder (security first, regressions second), and the single next step.
- **STANDARDS.md** — how the code must be written: security rules, the
  [ponytail](https://github.com/DietrichGebert/ponytail) "write the least code that works"
  ladder, logging that never leaks personal data, and UI rules that kill the generic-AI look
  (design brief, real empty/loading/error states, no dead buttons).
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
