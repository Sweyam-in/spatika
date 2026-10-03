#!/usr/bin/env bash
# Build and run the production-style container locally on http://localhost:8089.
# Usage: scripts/dev-docker.sh [up|down|logs]   (default: up)
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
[[ -f .env.local ]] || { cp .env.local.example .env.local; echo "==> Created .env.local"; }
compose() { docker compose --env-file .env.local "$@"; }
case "${1:-up}" in
  up)   compose up --build ;;
  down) compose down ;;
  logs) compose logs -f --tail=200 ;;
  *) echo "Usage: $0 [up|down|logs]" >&2; exit 2 ;;
esac
