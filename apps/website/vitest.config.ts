import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      {
        find: "@spatika/editor/styles.css",
        replacement: path.resolve(__dirname, "../../packages/editor/src/styles/editor.css"),
      },
      { find: "@spatika/react", replacement: path.resolve(__dirname, "../../packages/react/src/index.ts") },
      { find: "@spatika/charts", replacement: path.resolve(__dirname, "../../packages/charts/src/index.ts") },
      { find: "@spatika/editor", replacement: path.resolve(__dirname, "../../packages/editor/src/index.ts") },
    ],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}", "*.test.ts"],
  },
});
