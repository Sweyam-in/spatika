import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { spatikaAgentDocsPlugin } from "./vite-plugin-agent-docs";
import { spatikaSeoPlugin } from "./vite-plugin-seo";

const base = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [react(), spatikaSeoPlugin(), spatikaAgentDocsPlugin()],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      // Like the packages below, the stylesheet comes from source: a stale packages/tokens/dist
      // (not rebuilt after a pull) would otherwise style new components with old CSS.
      {
        find: "@spatika/tokens/styles.css",
        replacement: path.resolve(__dirname, "../../packages/tokens/src/build-entry.css"),
      },
      {
        find: "@spatika/editor/styles.css",
        replacement: path.resolve(__dirname, "../../packages/editor/src/styles/editor.css"),
      },
      { find: "@spatika/react", replacement: path.resolve(__dirname, "../../packages/react/src/index.ts") },
      { find: "@spatika/charts", replacement: path.resolve(__dirname, "../../packages/charts/src/index.ts") },
      { find: "@spatika/editor", replacement: path.resolve(__dirname, "../../packages/editor/src/index.ts") },
    ],
  },
  server: {
    port: Number(process.env.PORT ?? 5190),
  },
  build: {
    // scripts/release-docs.mjs builds versioned snapshots into their own directories.
    outDir: process.env.DOCS_OUT_DIR ?? "dist",
    emptyOutDir: true,
  },
});
