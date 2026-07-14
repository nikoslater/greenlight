#!/usr/bin/env bash
# Greenlight loop harness. Usage: ./run-loop.sh [interval_seconds]
set -uo pipefail   # deliberately NOT -e: one failed iteration must not kill the loop

INTERVAL="${1:-300}"
PROMPT="greenlight/prompts/loop.md"
STOP=".greenlight/STOP"
NEEDS_HUMAN=".greenlight/NEEDS_HUMAN"
mkdir -p .greenlight

notify() {  # swap body for: curl -d "$1" ntfy.sh/your-topic  |  or a Slack webhook
  if command -v osascript >/dev/null 2>&1; then
    osascript -e "display notification \"$1\" with title \"Greenlight\"" || true
  fi
  echo "[notify] $1"
}

echo "Greenlight loop every ${INTERVAL}s. Ctrl-C to stop."
while true; do
  if [ -f "$STOP" ]; then
    notify "GREENLIGHT ACHIEVED — app finished. Loop stopped."
    break
  fi

  # --- your agent runner (uncomment / adapt): ---
  # claude -p "$(cat "$PROMPT")" --dangerously-skip-permissions || notify "Loop iteration errored — check logs"
  echo "[$(date -u +%FT%TZ)] would run agent with $PROMPT"
  # ----------------------------------------------

  if [ -f "$NEEDS_HUMAN" ]; then
    notify "Loop needs a decision from you: $(head -c 200 "$NEEDS_HUMAN")"
    rm -f "$NEEDS_HUMAN"   # ping once; the ask stays recorded in DECISIONS.md
  fi
  [ -f "$STOP" ] && continue
  sleep "$INTERVAL"
done
