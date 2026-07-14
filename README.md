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

## Get started (3 steps)

```bash
# 1. In your project folder (new or existing):
curl -fsSL https://raw.githubusercontent.com/YOU/greenlight/main/install.sh | bash

# 2. Run your AI agent (e.g. Claude Code) once with:  greenlight/prompts/bootstrap.md
#    New idea → paste your braindump at the bottom. It will ask you simple questions
#    (each with a suggested answer, so "go with your suggestions" always works).
#    Existing project → it studies your code and sets everything up automatically.

# 3. Start the loop — one work step every 5 minutes until done:
./greenlight/run-loop.sh 300
```

Everything Greenlight adds to your repo lives in a single `greenlight/` folder — prompts,
templates, the working docs it generates, its runner, and runtime state (`greenlight/state/`,
gitignored). Your repo root stays yours.

When the app is truly finished — every feature stable, security checklist green, UI
verified by actually clicking through it — the loop flips `greenlight: "yes"`, stops doing
work, and replies: **"GREENLIGHT ACHIEVED — the app is finished. Stop the loop and review
your app."** If it ever needs a decision only you can make, it pauses that item and pings
you instead of guessing.

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
