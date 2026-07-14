#!/usr/bin/env bash
# Self-improvement loop for the Greenlight repo ITSELF (not for apps Greenlight builds).
# Everything self-loop lives in .selfloop/ — delete that one folder when you're done.
# Usage, from the repo root:  ./.selfloop/run-self-loop.sh [interval_seconds] [max_iterations]
# max_iterations defaults to 0 = unlimited; pass a number for an optional safety cap.
set -uo pipefail   # deliberately NOT -e: one failed iteration must not kill the loop

cd "$(dirname "$0")/.."   # always operate from the repo root, wherever invoked from

INTERVAL="${1:-600}"
MAX_LOOPS="${2:-0}"
PROMPT=".selfloop/self-loop.md"
PERFECT=".selfloop/PERFECT"
COUNT=0

notify() {  # swap body for: curl -d "$1" ntfy.sh/your-topic  |  or a Slack webhook
  if command -v osascript >/dev/null 2>&1; then
    osascript -e "display notification \"$1\" with title \"Greenlight self-loop\"" || true
  fi
  echo "[notify] $1"
}

echo "Greenlight self-loop every ${INTERVAL}s (iteration cap: ${MAX_LOOPS}; 0 = unlimited). Ctrl-C to stop."
while true; do
  if [ -f "$PERFECT" ]; then
    notify "PERFECT — no nameable defects remain. Self-loop stopped; review and delete .selfloop/."
    break
  fi
  if [ "$MAX_LOOPS" -gt 0 ] && [ "$COUNT" -ge "$MAX_LOOPS" ]; then
    notify "Self-loop hit its ${MAX_LOOPS}-iteration cap for this run — stopped (not PERFECT yet). Review, then relaunch to continue."
    break
  fi
  COUNT=$((COUNT + 1))

  echo "[$(date '+%H:%M:%S')] iteration ${COUNT} started — MID-FLIGHT, don't touch the repo"
  claude -p "$(cat "$PROMPT")" --dangerously-skip-permissions || notify "Self-loop iteration errored — check output"
  echo "[$(date '+%H:%M:%S')] iteration finished — safe window (sleeping ${INTERVAL}s)"

  [ -f "$PERFECT" ] && continue
  sleep "$INTERVAL"
done
