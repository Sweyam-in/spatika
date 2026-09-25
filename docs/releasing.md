# Releasing Spatika

This covers the four packages and the versioned documentation that goes with them. None of the
commands below publish to npm or deploy the site on their own. Publishing is `npm run release`,
and deploying means copying the site directory to the server. Both are separate steps that a
maintainer runs deliberately.

## Versioning

`@spatika/tokens`, `@spatika/charts`, `@spatika/editor` and `@spatika/react` are a Changesets
**fixed group**, so they always share one version number. Pick the bump from what changed in
the public API (exports, props, CSS custom properties, class names consumers target, and
documented behaviour):

| Bump | When |
|---|---|
| patch | Bug fixes, a11y fixes that don't change the API, docs |
| minor | New components, props, tokens or variants. Deprecations (the old API keeps working). Visual refinements that stay within the documented design language |
| major | Removing or renaming an export, prop, token or class. Changing a default in a way that breaks existing usage. Raising the React peer range |

A deprecated API stays for at least one minor and is only removed in the next major. Mark it
with TSDoc `@deprecated` (the generated API table and the playground both read that tag) and
note it in the changeset.

## Release steps

1. Every PR that changes a package adds a changeset (`npx changeset`), and CI-equivalent checks
   pass: `npm test`, `npm run typecheck`, `npm run test:e2e`.
2. On the release commit, run `npm run version-packages`. This bumps all four packages and
   writes the `CHANGELOG.md` sections. Review the result, and add a guide under
   `docs/migrations/` for any minor with behaviour or visual changes users should check.
3. Publish (maintainers, with npm credentials): `npm run release`.
4. Build the docs against the persistent copy of the deployed site:

   ```bash
   npm run release:docs -- /srv/spatika-site
   ```

   The script checks that all four packages carry the same version and that the changelog has
   its section. It also confirms `src/generated/api.json` and the demo sources match the code,
   builds the packages and runs the website tests. Then it builds:

   - `/docs/vX.Y.Z/`: an immutable snapshot. The script refuses to run if that snapshot exists.
   - `/`: the latest stable release. This is skipped for pre-releases and for patches to an
     older line.
   - `/versions.json`: regenerated from npm plus the snapshots on disk.

   It finishes with `verify`, which fails if any version listed in `versions.json` no longer
   resolves.
5. Deploy the site directory.

For an older line (for example 2.4.3 after 2.5.0 has shipped), run the same steps from that
line's branch. The build only adds `/docs/v2.4.3/` and leaves the root alone.

## Documentation channels

| URL | Content | Built by |
|---|---|---|
| `/` | Latest stable release | `release:docs` |
| `/docs/vX.Y.Z/` | Full site for that release, never rebuilt | `release:docs` |
| `/docs/vX.Y.Z/` (1.0.0–2.3.0) | API archive reconstructed from the published npm tarballs (props, exports, changelog), plus a note that no full site exists | `npm run docs:archive` (already committed) |
| `/next/` | Unreleased `main` | `npm run release:docs:next -- <site-dir>` |

Snapshots set `noindex` and link to the latest page as canonical, so search engines index only
the current docs. Each page shows a version selector. A page that didn't exist in the selected
version says so instead of returning a 404.

Nothing earlier than 2.4.0 has a full-site snapshot. The repository has no release tags, so
earlier docs sites can't be rebuilt faithfully. Their archives are generated only from what npm
actually published.

## Support policy

Encoded in `scripts/lib/versions.mjs` and tested in `apps/website/src/data/versions-policy.test.ts`:

- **Current**: the newest stable release.
- **Supported**: the newest patch of each earlier minor in the current major, for six months
  after the next minor ships, plus the newest release of the previous major.
- **Archived**: everything else. The docs stay online but are never updated.
- **Pre-release** and **development**: labelled and banner-marked. They are never the default.

## Serving and deploying

`apps/website/nginx.conf` serves `/docs/v*/` and `/next/` with their own SPA fallbacks, caches
hashed assets immutably and revalidates `versions.json`.

The Docker image (`Dockerfile`) carries the versioned site forward from one deploy to the next:

1. `PREVIOUS_SITE_IMAGE` names the image currently deployed. `prod-deploy/scripts/deploy-compose.sh`
   reads it from `.env.production` and passes it through `scripts/build-push-ghcr.sh`. The build
   copies that image's site as its starting point.
2. `node scripts/release-docs.mjs site --site-dir /site --skip-tests` then brings it up to date
   with the checkout:
   - **Released checkout** (its version is on npm and no changesets are pending): adds the
     `/docs/vX.Y.Z/` snapshot if it's missing, and becomes the root when it's the latest stable.
     An existing snapshot is never rebuilt.
   - **Anything else** (pending changesets, or a version not yet published): rebuilds `/next/`.
     The root shows the checkout too, labelled as development, only until a release has been
     installed there. `docs-root.json` records which build owns the root.
3. `verify` fails the build if any version in `versions.json` no longer resolves.

So deploying `main` between releases updates `/next/`, and deploying a release commit adds its
snapshot and makes it the root. Neither step removes or rewrites an earlier snapshot.

The first image built this way starts from the currently deployed image, whose root is an
unversioned development build. That root is replaced by development docs until the first
release (2.4.0) is deployed.

`release-docs.mjs site` was exercised locally against an empty directory, a rehearsed 2.4.0
release, an idempotent re-run and a development build after the release. The image build
itself (the `FROM ${PREVIOUS_SITE_IMAGE}` stage and the multi-platform push) hasn't been run
here, because Docker isn't available in the environment where this was written. Build it once
by hand before the next production deploy.
