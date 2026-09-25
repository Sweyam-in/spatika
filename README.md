# Spatika UI

**Spatika** (स्फटिक, often spelled **Spadik**) is Sanskrit for crystal.

Open-source **React design system** for product UI — SaaS, finance, productivity, admin. Semantic CSS tokens, four themes, density control, an application shell, data tables, charts, a calendar and an editor.

Since 2.1 it also covers the pages **around** the product: heroes, feature and bento grids, pricing tables, testimonials, logo clouds, FAQ blocks and CTA bands, all on the same tokens as your app screens.

**Docs:** [spatika.sweyam.com](https://spatika.sweyam.com) · **Author:** [Sreelal Chalil](https://github.com/SreelalChalil)

[![npm](https://img.shields.io/npm/v/@spatika/react)](https://www.npmjs.com/package/@spatika/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Packages

| Package | Description |
|---|---|
| [`@spatika/tokens`](https://www.npmjs.com/package/@spatika/tokens) | Semantic CSS tokens, themes, density, and component recipes |
| [`@spatika/react`](https://www.npmjs.com/package/@spatika/react) | React primitives, composites and application patterns |
| [`@spatika/charts`](https://www.npmjs.com/package/@spatika/charts) | Optional SVG charts (bar, line, pie, maps, …) |

## Quick start

```bash
npm install @spatika/tokens @spatika/react
```

```tsx
import "@spatika/tokens/styles.css";
import { SpatikaThemeProvider, Button } from "@spatika/react";

export function App() {
  return (
    <SpatikaThemeProvider defaultTheme="mukta">
      <Button>Hello Spatika</Button>
    </SpatikaThemeProvider>
  );
}
```

## Documentation site

Run the static docs site locally (design language, components, guides, and a four-page lead-gen showcase):

```bash
npm install
npm run dev
```

Machine-readable docs for coding agents: [llms.txt](https://spatika.sweyam.com/llms.txt) · [AGENTS.md](./AGENTS.md) · skill at `.cursor/skills/spatika-ui` · MCP server via `npm --silent run mcp`.

Build for production:

```bash
npm run build
npm run preview -w @spatika/website
```

The docs site is served at [spatika.sweyam.com](https://spatika.sweyam.com) via Docker Compose on the **Atlas VM** behind Cloudflare Zero Trust Tunnel. See [docs/deployment/docker-compose.md](./docs/deployment/docker-compose.md) for complete details. Deploy:

```bash
# Deploy to Atlas VM
./prod-deploy/scripts/deploy-compose.sh deploy
```

Each deploy carries released documentation forward: the image starts from the site the deployed
image serves and adds this checkout (a `/docs/vX.Y.Z/` snapshot for a release, `/next/` otherwise)
— see [docs/releasing.md](./docs/releasing.md).

CI (`.github/workflows/ci.yml`) runs unit tests, typechecks, docs checks, the browser suites in
Chromium, Firefox and WebKit, visual regression and an image build on every push.

## Monorepo layout

```text
packages/tokens   Shared CSS design tokens
packages/react    React components
packages/charts   Optional SVG chart package
packages/editor   Rich-text editor (Tiptap)
apps/website      Static documentation site
```

## Design language

See [DESIGN.md](./DESIGN.md) for principles, tokens, themes, surfaces, density and motion.
Upgrading from 1.x: [docs/redesign/MIGRATION.md](./docs/redesign/MIGRATION.md) · 2.3 → 2.4: [docs/migrations/2.4.md](./docs/migrations/2.4.md) · 2.4 audit and gap matrix: [docs/redesign/AUDIT-2.4.md](./docs/redesign/AUDIT-2.4.md).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the docs site |
| `npm run mcp:build` | Build the Spatika MCP server |
| `npm --silent run mcp` | Serve Spatika agent docs over MCP stdio |
| `npm run build` | Build tokens, React, and docs site |
| `npm run test` | Run charts, editor, React, and website tests |
| `npm run typecheck` | Typecheck React + website |
| `npm run test:e2e` | Playwright: responsive, axe (WCAG 2.2 AA), flows, visual baselines |
| `npm run docs:api` / `docs:demos` | Regenerate API tables and demo sources for the docs |
| `npm run release` | Build and publish to npm (maintainers) |
| `npm run release:docs -- <site-dir>` | Build versioned docs for a release (does not deploy) — see [docs/releasing.md](./docs/releasing.md) |

## License

MIT
