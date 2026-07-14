#!/usr/bin/env bash
# Greenlight one-click install: run from your project root.
#   curl -fsSL https://raw.githubusercontent.com/YOU/greenlight/main/install.sh | bash
set -euo pipefail
REPO_RAW="${GREENLIGHT_RAW:-https://raw.githubusercontent.com/YOU/greenlight/main}"
mkdir -p greenlight/templates greenlight/prompts .greenlight/evidence
for f in CONTROL.md STANDARDS.md STACKS.md LEDGER.md DECISIONS.md CHANGELOG.md; do
  curl -fsSL "$REPO_RAW/templates/$f" -o "greenlight/templates/$f"
done
for f in bootstrap.md loop.md; do
  curl -fsSL "$REPO_RAW/prompts/$f" -o "greenlight/prompts/$f"
done
curl -fsSL "$REPO_RAW/run-loop.example.sh" -o run-loop.sh && chmod +x run-loop.sh
grep -qxF '.env' .gitignore 2>/dev/null || printf '.env\n.greenlight/evidence/\n.greenlight/STOP\n.greenlight/NEEDS_HUMAN\n' >> .gitignore
[ -f .env.example ] || printf '# Copy to .env and fill. Never commit real secrets.\n' > .env.example
echo "Greenlight installed."
echo "1) Run your agent with greenlight/prompts/bootstrap.md (paste your idea dump if the repo is new)"
echo "2) Then: ./run-loop.sh 300"
