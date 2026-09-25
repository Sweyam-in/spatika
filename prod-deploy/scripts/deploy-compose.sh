#!/usr/bin/env bash
set -euo pipefail

# Top-level flag: 1 = build linux/arm64 too, 0 = amd64 only. Override with BUILD_ARM=1.
export BUILD_ARM="${BUILD_ARM:-0}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY_ENV="${ATLAS_DEPLOY_ENV:-$ROOT/atlas.deploy.env}"
ACTION="${1:-deploy}"
case "$ACTION" in
  deploy|upgrade|deploy-only|status|logs|restart) ;;
  *) echo "Usage: $0 {deploy|upgrade|deploy-only|status|logs|restart}" >&2; exit 2 ;;
esac
RELEASE_ENV=""
trap '[[ -z "$RELEASE_ENV" ]] || rm -f "$RELEASE_ENV"' EXIT

[[ -r "$DEPLOY_ENV" ]] || {
  echo "Missing $DEPLOY_ENV. Copy prod-deploy/atlas.deploy.env.example to prod-deploy/atlas.deploy.env and fill it in." >&2
  exit 1
}

set -a
# shellcheck disable=SC1090
source "$DEPLOY_ENV"
set +a

: "${ATLAS_HOST:?set ATLAS_HOST in $DEPLOY_ENV}"
: "${ATLAS_USER:?set ATLAS_USER in $DEPLOY_ENV}"
ATLAS_SSH_PORT="${ATLAS_SSH_PORT:-22}"
ATLAS_REMOTE_DIR="${ATLAS_REMOTE_DIR:-/opt/spatika/app}"
SPATIKA_PRODUCTION_ENV="${SPATIKA_PRODUCTION_ENV:-.env.production}"

if [[ "$SPATIKA_PRODUCTION_ENV" != /* ]]; then
  SPATIKA_PRODUCTION_ENV="$ROOT/$SPATIKA_PRODUCTION_ENV"
fi
[[ -r "$SPATIKA_PRODUCTION_ENV" ]] || {
  echo "Missing production environment file: $SPATIKA_PRODUCTION_ENV" >&2
  echo "Copy prod-deploy/.env.production.example to prod-deploy/.env.production and configure." >&2
  exit 1
}

case "$ATLAS_REMOTE_DIR" in
  ""|/|/opt|/opt/spatika) echo "Refusing unsafe ATLAS_REMOTE_DIR: $ATLAS_REMOTE_DIR" >&2; exit 1 ;;
esac

for command in ssh rsync; do
  command -v "$command" >/dev/null 2>&1 || { echo "$command is required" >&2; exit 1; }
done

ssh_args=(-p "$ATLAS_SSH_PORT")
rsync_ssh="ssh -p $ATLAS_SSH_PORT"
if [[ -n "${ATLAS_SSH_KEY:-}" ]]; then
  ssh_args+=(-i "$ATLAS_SSH_KEY")
  rsync_ssh+=" -i $ATLAS_SSH_KEY"
fi
remote="${ATLAS_USER}@${ATLAS_HOST}"

remote_compose() {
  ssh "${ssh_args[@]}" "$remote" \
    "cd '$ATLAS_REMOTE_DIR' && docker compose --env-file .env.production -f compose.yml $*"
}

build_release() (
  local repo_root="$ROOT/.."
  local build_env="${BUILD_PUSH_GHCR_ENV:-$repo_root/scripts/build-push-ghcr.env}"
  if [[ -f "$build_env" ]]; then
    set -a
    source "$build_env"
    set +a
  fi
  if [[ -z "${GHCR_OWNER:-}" ]]; then
    local url
    url="$(git -C "$repo_root" remote get-url origin 2>/dev/null || true)"
    if [[ "$url" =~ github\.com[:/]([^/]+)/([^/.]+)(\.git)?$ ]]; then
      GHCR_OWNER="${BASH_REMATCH[1]}"
    fi
  fi
  : "${GHCR_OWNER:?set GHCR_OWNER in scripts/build-push-ghcr.env or git remote}"
  local prefix="${GHCR_REGISTRY:-ghcr.io}/$(printf '%s' "$GHCR_OWNER" | tr '[:upper:]' '[:lower:]')"
  [[ "$prefix" == ghcr.io/* ]] || { echo "Production releases require ghcr.io" >&2; exit 1; }
  local tag
  tag="release-sha-$(git -C "$repo_root" rev-parse --short=12 HEAD)-$(date -u +%Y%m%dT%H%M%SZ)-${RELEASE_ENV##*.}"
  awk -v tag="$tag" \
    -v web="$prefix/${IMAGE_REPO:-spatika-website}" '
    !/^[[:space:]]*(export[[:space:]]+)?SPATIKA_(IMAGE|IMAGE_TAG)[[:space:]]*=/ { print }
    END {
      print "SPATIKA_IMAGE=" web
      print "SPATIKA_IMAGE_TAG=" tag
    }
  ' "$SPATIKA_PRODUCTION_ENV" > "$RELEASE_ENV"

  if grep -Eq 'replace-with|replace-me|<location>|your-org' "$RELEASE_ENV"; then
    echo "Production environment still contains placeholder values." >&2
    exit 1
  fi
  echo "Building and pushing release $tag (current checkout, including local changes)"
  BUILD_PUSH_GHCR_ENV="$build_env" "$repo_root/scripts/build-push-ghcr.sh" --tag "$tag" --all
)

case "$ACTION" in
  deploy|upgrade|deploy-only)
    ORIGINAL_PRODUCTION_ENV="$SPATIKA_PRODUCTION_ENV"
    if [[ "$ACTION" != deploy-only ]]; then
      for command in git docker; do
        command -v "$command" >/dev/null 2>&1 || { echo "$command is required" >&2; exit 1; }
      done
      RELEASE_ENV="$(mktemp "${TMPDIR:-/tmp}/spatika-release.XXXXXXXX")"
      build_release
      SPATIKA_PRODUCTION_ENV="$RELEASE_ENV"
    fi
    if grep -Eq 'replace-with|replace-me|<location>|your-org' "$SPATIKA_PRODUCTION_ENV"; then
      echo "Production environment still contains placeholder values." >&2
      exit 1
    fi
    ssh "${ssh_args[@]}" "$remote" "mkdir -p '$ATLAS_REMOTE_DIR'"
    rsync -az -e "$rsync_ssh" \
      "$ROOT/compose.yml" \
      "$remote:$ATLAS_REMOTE_DIR/compose.yml"
    rsync -az -e "$rsync_ssh" \
      "$SPATIKA_PRODUCTION_ENV" \
      "$remote:$ATLAS_REMOTE_DIR/.env.production"
    ssh "${ssh_args[@]}" "$remote" \
      "chmod 0644 '$ATLAS_REMOTE_DIR/compose.yml' && chmod 0600 '$ATLAS_REMOTE_DIR/.env.production'"
    remote_compose "config --quiet"
    remote_compose pull
    remote_compose "up -d --remove-orphans --wait --wait-timeout 180"
    remote_compose ps
    if [[ -n "$RELEASE_ENV" ]]; then
      cp "$RELEASE_ENV" "$ORIGINAL_PRODUCTION_ENV"
      chmod 0600 "$ORIGINAL_PRODUCTION_ENV"
      echo "Release deployed successfully; image references saved to $ORIGINAL_PRODUCTION_ENV"
    fi
    ;;
  status)
    remote_compose ps
    ;;
  logs)
    remote_compose "logs -f --tail=200"
    ;;
  restart)
    remote_compose restart
    ;;
esac
