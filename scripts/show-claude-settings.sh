#!/usr/bin/env bash
# Print every Claude Code settings file that applies to this project, highest priority first.
set -u

root="$(cd "$(dirname "$0")/.." && pwd)"

for f in \
  "${root}/.env" \
  "${root}/.claude/settings.local.json" \
  "${root}/.claude/settings.json" \
  "${HOME}/.claude/settings.json"; do
  echo "==> ${f}"
  if [ -f "${f}" ]; then
    cat "${f}"
  else
    echo "(not found)"
  fi
  echo
done
