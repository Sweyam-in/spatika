# @spatika/tokens

Design tokens for **Spatika UI** — semantic colour, type, spacing, radius, elevation, density and motion tokens, four themes, and the component recipes used by the React package.

**Docs:** [spatika.sweyam.com](https://spatika.sweyam.com)

## Install

```bash
npm install @spatika/tokens
```

## Quick start

Import the prebuilt bundle (recommended — includes utilities used by kit components):

```ts
import "@spatika/tokens/styles.css";
```

Apply a theme on `<html>`:

| Class | Theme | Meaning |
|---|---|---|
| _(none / default)_ | Mukta | Pearl — frosted white, blue |
| `neelam` | Neelam | Sapphire — layered dark, blue |
| `usha` | Usha | Dawn — warm neutrals, orange |
| `sandhya` | Sandhya | Dusk — flat dark, orange |

```html
<html class="neelam">
```

Brand palettes overlay these variables (`--primary`, `--background`, …) via `createTheme` in `@spatika/react`, or by setting the same CSS variables after this import. Customize guide: [spatika.sweyam.com/customize](https://spatika.sweyam.com/customize)

## Other entry points

| Import | Use when |
|---|---|
| `@spatika/tokens/styles.css` | Full prebuilt bundle (default) |
| `@spatika/tokens/tokens.css` | CSS variables + Tailwind `@theme` only |
| `@spatika/tokens/components.css` | Component recipes (`.spk-btn`, `.spk-field`, `.spk-item`, `.spk-table` …) |
| `@spatika/tokens/glass.css` | Materials: calm surfaces plus the opt-in `.spk-glass` treatment |
| `@spatika/tokens/surfaces.css` | App surface helpers |
| `@spatika/tokens/fonts.css` | Font faces |
| `@spatika/tokens/chrome.css` | App chrome helpers |
| `@spatika/tokens/marketing.css` | Marketing gradient type, accent rules, nav enter |
| `@spatika/tokens/base.css` | Base element styles |

If you only import partial CSS and run Tailwind yourself, scan the kit sources so composite utilities are generated:

```css
@import "tailwindcss";
@source "../node_modules/@spatika/react/src/**/*.{ts,tsx}";
```

## Docs

Human docs and live previews: [spatika.sweyam.com](https://spatika.sweyam.com)

## License

MIT
