# @spatika/utilities

On-demand utility classes for apps built on Spatika — no Tailwind required.

It scans your source files and generates only the utility classes you use (`flex`, `p-4`,
`md:grid-cols-3`, `bg-surface/80`, `hover:text-fg`, `data-[state=open]:flex`, `[&>svg]:size-4` …).
Class names and output follow Tailwind CSS v4, so existing markup keeps rendering the same. Every
named value resolves through Spatika tokens, so utilities re-theme with Mukta, Neelam, Usha,
Sandhya and your own `createTheme` overlays.

## Install

```bash
npm install -D @spatika/utilities
```

## Stylesheet

```css
/* src/styles.css */
@import "@spatika/utilities/preflight.css"; /* optional: the Tailwind v4 reset, for apps migrating off Tailwind */
@import "@spatika/tokens/styles.css";

@spatika utilities;

/* App overrides and themes go after — they win over utilities without !important. */
```

`@spatika utilities;` is replaced with the generated CSS inside `@layer utilities`. Put it in the
stylesheet your JavaScript imports (Vite does not run plugins on files pulled in by `@import`), after
its `@import` rules.

## Vite

```ts
// vite.config.ts
import spatikaUtilities from "@spatika/utilities/vite";

export default defineConfig({
  plugins: [spatikaUtilities(), react()],
});
```

## Next.js / PostCSS

```js
// postcss.config.mjs
export default {
  plugins: { "@spatika/utilities/postcss": {} },
};
```

## Options

| Option | Default | |
|---|---|---|
| `content` | `index.html`, `src/`, `app/`, `pages/`, `components/` | Globs of files that contain class names. `!` excludes. |
| `extraContent` | `[]` | Globs added to the defaults. |
| `spatika` | `true` | Also scan the installed `@spatika/react`, `charts` and `editor` packages. |
| `theme` | Spatika theme | Overrides merged into the default theme. |
| `typography` | `false` | Generate `prose`, `prose-sm` … `prose-invert` (compatible with `@tailwindcss/typography`). |
| `safelist` | `[]` | Classes to always generate (e.g. built at runtime). |
| `config` | — | Path to a module exporting these options, to share them between tools. |

## App themes

Add app-specific colours, fonts or radii on top of Spatika:

```ts
spatikaUtilities({
  theme: {
    colors: { brand: "var(--brand)", "brand-muted": "var(--brand-muted)" },
    fontFamily: { display: "'Fraunces', serif" },
  },
});
```

`bg-brand/20`, `text-brand-muted` and `font-display` then work like any built-in value. Define
the variables in your stylesheet (or with `createTheme` `vars`) so they change per theme.

## Dark mode

`dark:` matches the Neelam and Sandhya themes. Point it elsewhere with
`theme: { darkSelector: ".my-dark *, .my-dark" }`.

## Programmatic use

```ts
import { createCompiler } from "@spatika/utilities";

const css = createCompiler().build(["flex", "gap-2", "md:grid-cols-3"]);
```

Parts of the default theme, palette and preflight derive from Tailwind CSS (MIT) — see
[NOTICE.md](./NOTICE.md).
