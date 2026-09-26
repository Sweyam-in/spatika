/**
 * Vite plugin. Put `@spatika utilities;` in a stylesheet and the plugin replaces it with the
 * utility CSS your source files use:
 *
 * ```ts
 * // vite.config.ts
 * import spatikaUtilities from "@spatika/utilities/vite";
 * export default defineConfig({ plugins: [spatikaUtilities(), react()] });
 * ```
 */
import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";
import { DIRECTIVE, Engine, loadOptions, type SpatikaUtilitiesOptions } from "./engine";

export type { SpatikaUtilitiesOptions };

const CSS_ID = /\.(?:css|pcss|postcss)(?:$|\?)/;

export default function spatikaUtilities(options: SpatikaUtilitiesOptions = {}): Plugin {
  let engine: Engine;
  let config: ResolvedConfig;
  let server: ViteDevServer | undefined;
  const cssIds = new Set<string>();

  const cssModules = (dev: ViteDevServer) =>
    [...cssIds].map((id) => dev.moduleGraph.getModuleById(id)).filter((mod): mod is NonNullable<typeof mod> => Boolean(mod));

  const refresh = (dev: ViteDevServer) => {
    for (const mod of cssModules(dev)) void dev.reloadModule(mod);
  };

  return {
    name: "@spatika/utilities",
    enforce: "pre",
    async configResolved(resolved) {
      config = resolved;
      const loaded = await loadOptions({ cwd: resolved.root, ...options });
      engine = new Engine({ ...loaded, cwd: loaded.cwd ?? resolved.root });
    },
    configureServer(dev) {
      server = dev;
      const onFileSetChange = (file: string) => {
        // A new or deleted source file changes the content set; rescan on next transform.
        if (/node_modules|\.git/.test(file)) return;
        if (cssIds.size) refresh(dev);
      };
      dev.watcher.on("add", onFileSetChange);
      dev.watcher.on("unlink", onFileSetChange);
    },
    transform(code, id) {
      if (!CSS_ID.test(id) || !DIRECTIVE.test(code)) return null;
      cssIds.add(id);
      const css = engine.transform(code);
      if (css === null) return null;
      if (config.command === "build") for (const file of engine.files) this.addWatchFile(file);
      return { code: css, map: null };
    },
    handleHotUpdate({ file, modules }) {
      if (!server || !cssIds.size || !engine.isContent(file)) return;
      if (!engine.update(file)) return;
      const extra = cssModules(server);
      for (const mod of extra) server.moduleGraph.invalidateModule(mod);
      return [...modules, ...extra];
    },
  };
}
