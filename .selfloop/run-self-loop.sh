#!/usr/bin/env bash
# Self-improvement loop for the Greenlight repo ITSELF (not for apps Greenlight builds).
# Everything self-loop lives in .selfloop/ — delete that one folder when you're done.
# Usage, from the repo root:  ./.selfloop/run-self-loop.sh [interval_seconds]
set -uo pipefail   # deliberately NOT -e: one failed iteration must not kill the loop

cd "$(dirname "$0")/.."   # always operate from the repo root, wherever invoked from

INTERVAL="${1:-600}"
PROMPT=".selfloop/self-loop.md"
PERFECT=".selfloop/PERFECT"

notify() {  # swap body for: curl -d "$1" ntfy.sh/your-topic  |  or a Slack webhook
  if command -v osascript >/dev/null 2>&1; then
    osascript -e "display notification \"$1\" with title \"Greenlight self-loop\"" || true
  fi
  echo "[notify] $1"
}

echo "Greenlight self-loop every ${INTERVAL}s. Ctrl-C to stop."
while true; do
  if [ -f "$PERFECT" ]; then
    notify "PERFECT — no nameable defects remain. Self-loop stopped; review and delete .selfloop/."
    break
  fi

  echo "[$(date '+%H:%M:%S')] iteration started — MID-FLIGHT, don't touch the repo"
  claude -p "$(cat "$PROMPT")" --dangerously-skip-permissions || notify "Self-loop iteration errored — check output"
  echo "[$(date '+%H:%M:%S')] iteration finished — safe window (sleeping ${INTERVAL}s)"

  [ -f "$PERFECT" ] && continue
  sleep "$INTERVAL"
done
