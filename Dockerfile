# Versioned docs: each image starts from the site the previous image served, so released
# snapshots (/docs/vX.Y.Z/) carry forward and are never rebuilt. `release-docs.mjs site` adds
# this checkout — a snapshot and the root for a release, /next/ for anything else.
#
#   PREVIOUS_SITE_IMAGE   the image currently deployed (deploy-compose.sh passes it). Omit it for
#                         the very first build; the site then starts empty.
ARG PREVIOUS_SITE_IMAGE=empty-site

FROM alpine:3.20 AS empty-site
RUN mkdir -p /usr/share/nginx/html

FROM ${PREVIOUS_SITE_IMAGE} AS previous-site

# Static files are platform-independent. Build on the CI host (amd64) so npm
# does not run under QEMU, then copy into a multi-arch nginx image.
FROM --platform=$BUILDPLATFORM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/tokens/package.json packages/tokens/
COPY packages/charts/package.json packages/charts/
COPY packages/editor/package.json packages/editor/
COPY packages/react/package.json packages/react/
COPY packages/mcp/package.json packages/mcp/
COPY apps/website/package.json apps/website/

RUN npm ci

COPY scripts scripts
COPY .changeset .changeset
COPY docs docs
COPY AGENTS.md ./
COPY packages/tokens packages/tokens
COPY packages/charts packages/charts
COPY packages/editor packages/editor
COPY packages/react packages/react
COPY apps/website apps/website

COPY --from=previous-site /usr/share/nginx/html /site
# Tests run in CI; the image build only assembles the site (and needs npm registry access to
# read which versions are published).
RUN node scripts/release-docs.mjs site --site-dir /site --skip-tests

FROM nginx:alpine
COPY apps/website/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /site /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
