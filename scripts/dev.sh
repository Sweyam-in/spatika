#!/usr/bin/env bash
# Run spatika natively with the dev server (no Docker).
# Usage: scripts/dev.sh      Config: .env.local (created from .env.local.example on first run)
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
[[ -f .env.local ]] || { cp .env.local.example .env.local; echo "==> Created .env.local"; }
[[ -d node_modules ]] || npm ci
set -a; source .env.local; set +a
echo "==> npm run dev  (http://localhost:5173)"
exec npm run dev
