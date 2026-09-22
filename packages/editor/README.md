# @spatika/editor

Tiptap-powered rich text editor that matches the Spatika design language — quiet toolbar, slash commands, @mentions, tables, resizable images, AI hooks, and an extensible toolbar.

## Install

```bash
npm install @spatika/editor @spatika/tokens
```

Peer dependencies: `react` and `react-dom` (^18 or ^19).

## Bootstrap

```tsx
import "@spatika/tokens/styles.css";
import "@spatika/editor/styles.css";
import { SpatikaThemeProvider } from "@spatika/react";
import { SpatikaEditor } from "@spatika/editor";
```

`SpatikaEditor` is also re-exported from `@spatika/react`.

## Usage

```tsx
<SpatikaEditor
  value={html}
  onChange={setHtml}
  placeholder="Start writing…"
  mentions={[{ id: "1", label: "Asha Verma" }]}
  onAiCommand={async (context) => rewrite(context.actionId, context.selectedText)}
  toolbar={{ layout: "ribbon" }}
/>
```

## Headless

Use `useSpatikaEditor` when you need full control over chrome while keeping Spatika's default extensions.

## License

MIT — uses MIT-licensed Tiptap packages only.
