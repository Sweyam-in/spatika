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

Machine-readable docs for coding agents: [llms.txt](https://spatika.sweyam.com/llms.txt) · [AGENTS.md](./AGENTS.md) · Cursor skill at `.cursor/skills/spatika-ui`.

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

GitHub Pages remains a secondary publish path (`.github/workflows/pages.yml`).

## Monorepo layout

```text
packages/tokens   Shared CSS design tokens
packages/react    React components
packages/charts   Optional SVG chart package
apps/website      Static documentation site
```

## Design language

See [DESIGN.md](./DESIGN.md) for principles, tokens, themes, surfaces, density and motion.
Upgrading from 1.x: [docs/redesign/MIGRATION.md](./docs/redesign/MIGRATION.md).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the docs site |
| `npm run build` | Build tokens, React, and docs site |
| `npm run test` | Run charts, React, and website tests |
| `npm run typecheck` | Typecheck React + website |
| `npm run release` | Build and publish to npm (maintainers) |

## License

MIT
