#!/usr/bin/env bash
# Build spatika-website and push multi-arch image to GHCR.
#
# Usage:
#   cp scripts/build-push-ghcr.env.example scripts/build-push-ghcr.env
#   ./scripts/build-push-ghcr.sh
#   ./scripts/build-push-ghcr.sh --tag <TAG>
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${BUILD_PUSH_GHCR_ENV:-$ROOT/scripts/build-push-ghcr.env}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "$ENV_FILE"
  set +a
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tag)
      [[ $# -ge 2 && "$2" =~ ^[a-zA-Z0-9_][a-zA-Z0-9_.-]{0,127}$ ]] || {
        echo "--tag requires a valid Docker image tag" >&2; exit 2;
      }
      IMAGE_TAG="$2"
      IMAGE_SHA_TAG=""
      shift 2
      ;;
    --all) shift ;; # compatibility flag
    *) echo "Usage: $0 [--tag TAG]" >&2; exit 2 ;;
  esac
done

GHCR_REGISTRY="${GHCR_REGISTRY:-ghcr.io}"
GHCR_OWNER="${GHCR_OWNER:-}"
IMAGE_REPO="${IMAGE_REPO:-spatika-website}"
IMAGE_TAG="${IMAGE_TAG:-main}"
IMAGE_SHA_TAG="${IMAGE_SHA_TAG:-}"
PLATFORMS="${PLATFORMS:-linux/amd64,linux/arm64}"
# BUILD_ARM=0 forces an amd64-only build, overriding PLATFORMS from the env file.
if [[ "${BUILD_ARM:-1}" == "0" ]]; then
  PLATFORMS="linux/amd64"
fi
BUILDER_NAME="${BUILDX_BUILDER:-developments-shared}"

detect_github_owner_from_git() {
  local url
  url="$(git -C "$ROOT" remote get-url origin 2>/dev/null || true)"
  [[ -n "$url" ]] || return 1
  if [[ "$url" =~ github\.com[:/]([^/]+)/([^/.]+)(\.git)?$ ]]; then
    GHCR_OWNER="${BASH_REMATCH[1]}"
  fi
}

if [[ -z "${GHCR_OWNER:-}" ]]; then
  detect_github_owner_from_git || true
fi

if [[ -z "${GHCR_OWNER:-}" ]]; then
  echo "Set GHCR_OWNER in ${ENV_FILE} (see scripts/build-push-ghcr.env.example)." >&2
  exit 1
fi

GHCR_OWNER="$(printf '%s' "${GHCR_OWNER}" | tr '[:upper:]' '[:lower:]')"

ensure_buildx() {
  if ! docker buildx inspect "$BUILDER_NAME" >/dev/null 2>&1; then
    docker buildx create --name "$BUILDER_NAME" --driver docker-container --use
  else
    docker buildx use "$BUILDER_NAME"
  fi
  docker buildx inspect --bootstrap >/dev/null
}

maybe_login() {
  if [[ -n "${GHCR_USERNAME:-}" && -n "${GHCR_PAT:-}" ]]; then
    echo "Logging in to ${GHCR_REGISTRY}..."
    echo "${GHCR_PAT}" | docker login "${GHCR_REGISTRY}" -u "${GHCR_USERNAME}" --password-stdin
  else
    echo "GHCR_USERNAME / GHCR_PAT not set; using existing Docker credentials for ${GHCR_REGISTRY}."
  fi
}

cache_flags=()
if [[ "${NO_CACHE:-0}" == "1" ]]; then
  cache_flags+=(--no-cache)
fi

ensure_buildx
maybe_login

IMAGE_TAG_ARGS=(-t "${GHCR_REGISTRY}/${GHCR_OWNER}/${IMAGE_REPO}:${IMAGE_TAG}")
if [[ -n "$IMAGE_SHA_TAG" ]]; then
  IMAGE_TAG_ARGS+=(-t "${GHCR_REGISTRY}/${GHCR_OWNER}/${IMAGE_REPO}:${IMAGE_SHA_TAG}")
fi

echo "Building and pushing ${IMAGE_REPO}: ${GHCR_REGISTRY}/${GHCR_OWNER}/${IMAGE_REPO}:${IMAGE_TAG} (${PLATFORMS})"

# Versioned docs carry forward from the image currently deployed (set by deploy-compose.sh).
build_args=()
if [[ -n "${PREVIOUS_SITE_IMAGE:-}" ]]; then
  build_args+=(--build-arg "PREVIOUS_SITE_IMAGE=${PREVIOUS_SITE_IMAGE}")
fi

docker buildx build \
  --platform "${PLATFORMS}" \
  --push \
  "${cache_flags[@]+"${cache_flags[@]}"}" \
  "${build_args[@]+"${build_args[@]}"}" \
  "${IMAGE_TAG_ARGS[@]}" \
  -f "${ROOT}/Dockerfile" \
  "${ROOT}"

echo "Done. Inspect image manifests with:"
echo "  docker buildx imagetools inspect ${GHCR_REGISTRY}/${GHCR_OWNER}/${IMAGE_REPO}:${IMAGE_TAG}"
