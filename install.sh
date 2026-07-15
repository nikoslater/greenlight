#!/usr/bin/env bash
# Greenlight one-click install: run from your project root.
#   curl -fsSL https://raw.githubusercontent.com/nikoslater/greenlight/main/install.sh | bash
# (Forking this to publish your own copy? Replace nikoslater/greenlight below with your repo.)
set -euo pipefail
REPO_RAW="${GREENLIGHT_RAW:-https://raw.githubusercontent.com/nikoslater/greenlight/main}"
# Everything Greenlight adds to your repo lives in ONE folder: greenlight/
mkdir -p greenlight/templates greenlight/prompts greenlight/state/evidence
for f in CONTROL.md STANDARDS.md STACKS.md LEDGER.md DECISIONS.md CHANGELOG.md; do
  curl -fsSL "$REPO_RAW/templates/$f" -o "greenlight/templates/$f"
done
for f in bootstrap.md loop.md; do
  curl -fsSL "$REPO_RAW/prompts/$f" -o "greenlight/prompts/$f"
done
mkdir -p greenlight/ui
for f in server.mjs index.html style.css app.js package.json start.sh; do
  curl -fsSL "$REPO_RAW/ui/$f" -o "greenlight/ui/$f"
done
chmod +x greenlight/ui/start.sh
# if .gitignore's last line has no trailing newline, our append would fuse onto it
if [ -s .gitignore ] && [ -n "$(tail -c 1 .gitignore)" ]; then printf '\n' >> .gitignore; fi
grep -qxF '.env' .gitignore 2>/dev/null || printf '.env\n' >> .gitignore
grep -qxF 'greenlight/state/' .gitignore 2>/dev/null || printf 'greenlight/state/\n' >> .gitignore
grep -qxF 'greenlight/ui/node_modules/' .gitignore 2>/dev/null || printf 'greenlight/ui/node_modules/\n' >> .gitignore
[ -f .env.example ] || printf '# Copy to .env and fill. Never commit real secrets.\n' > .env.example
echo "Greenlight installed (everything under greenlight/)."
echo "Open the dashboard:  ./greenlight/ui/start.sh"
echo "(or run it in the terminal instead: claude \"\$(cat greenlight/prompts/bootstrap.md)\" once, then claude \"\$(cat greenlight/prompts/loop.md)\")"
