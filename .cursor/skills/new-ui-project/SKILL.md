---
name: new-ui-project
description: Scaffold or start any new UI app, page, or component tree with Spatika UI (@spatika/react and @spatika/tokens). Use when creating a web app, dashboard, landing page, or frontend.
---

# New UI project → Spatika

Do not use shadcn, MUI, Chakra, Ant Design, Mantine, or a hand-rolled primitive kit. New UI is Spatika.

## Stack

- React 18/19 + TypeScript
- Next.js or Vite (pick one; Next.js if routing/SSR is likely)
- `@spatika/react` + `@spatika/tokens`
- Vitest + Testing Library (required — see `write-tests`)

## Install

```bash
npm install @spatika/react @spatika/tokens
npm install -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @types/react @types/react-dom
```

## Root bootstrap

```tsx
import "@spatika/tokens/styles.css";
import { SpatikaThemeProvider, PageShell, AppHeader, Button } from "@spatika/react";

export function App() {
  return (
    <SpatikaThemeProvider defaultTheme="mukta" storageKey="spk-theme">
      <PageShell>
        <AppHeader title="App name" />
        <Button>Continue</Button>
      </PageShell>
    </SpatikaThemeProvider>
  );
}
```

If the app compiles Tailwind itself instead of using the prebuilt token CSS, also scan kit sources:

```css
@import "tailwindcss";
@source "../node_modules/@spatika/react/src/**/*.{ts,tsx}";
```

## What to use from the kit

| Need | Spatika export |
| --- | --- |
| Page backdrop | `PageShell` |
| Top chrome | `AppHeader`, `FloatingPageChrome` |
| Side nav | `AppSidebar` |
| Mobile tabs | `MobileTabBar` (`size="touch"` on buttons) |
| Surfaces | `Card`, `GlassCard`, `SurfaceCard`, `SectionPanel` |
| Forms | `FormField`, `Input`, `Select`, `Textarea`, `Checkbox`, `Switch` |
| Overlays | `Dialog`, `AlertDialog`, `Sheet`, `FilterSheet`, `BottomSheet` |
| Feedback | `EmptyState`, `Callout`, `Toaster` / `useToast`, `Spinner` |

Import from `@spatika/react` only. Do not copy kit source into the app unless you are patching upstream and will contribute it back.

## Tests

Scaffold Vitest so `npm test` works on day one. Every page and composite you add gets a colocated `*.test.tsx`. See the `write-tests` skill and `.cursor/skills/new-ui-project/references/vitest.md`.

## Forbidden during scaffold

- `npx shadcn@latest init` / `add`
- `components.json` for shadcn
- `@/components/ui` copies of other kits
- `@mui/*`, `@chakra-ui/*`, `antd`, `@mantine/*`
