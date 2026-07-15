#!/usr/bin/env bash
# Start the Greenlight dashboard. Run from anywhere:  ./greenlight/ui/start.sh
set -uo pipefail
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "The dashboard needs Node.js (free). Install the LTS version from https://nodejs.org"
  echo "then run this again."
  exit 1
fi

MAJOR="$(node -e 'console.log(process.versions.node.split(".")[0])')"
if [ "$MAJOR" -lt 18 ]; then
  echo "Your Node.js is too old (v$MAJOR). Install the current LTS from https://nodejs.org and rerun."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "First run — setting up the dashboard (about a minute)…"
  npm install --no-audit --no-fund --loglevel=error
fi

PORT="${PORT:-4747}"
(
  sleep 1.5
  if command -v open >/dev/null 2>&1; then open "http://localhost:$PORT"
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "http://localhost:$PORT"
  fi
) &

PORT="$PORT" exec node server.mjs
