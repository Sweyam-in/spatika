/**
 * PostCSS plugin (Next.js and any PostCSS pipeline). Put `@spatika utilities;` in a
 * stylesheet and configure:
 *
 * ```js
 * // postcss.config.mjs
 * export default { plugins: { "@spatika/utilities/postcss": {} } };
 * ```
 */
import type { AtRule, PluginCreator } from "postcss";
import { Engine, loadOptions, type SpatikaUtilitiesOptions } from "./engine";

export type { SpatikaUtilitiesOptions };

const engines = new Map<string, Promise<Engine>>();

function engineFor(options: SpatikaUtilitiesOptions): Promise<Engine> {
  const key = JSON.stringify({ ...options, cwd: options.cwd ?? process.cwd() });
  let engine = engines.get(key);
  if (!engine) {
    engine = loadOptions(options).then((loaded) => new Engine(loaded));
    engines.set(key, engine);
  }
  return engine;
}

const spatikaUtilities: PluginCreator<SpatikaUtilitiesOptions> = (options = {}) => ({
  postcssPlugin: "@spatika/utilities",
  async Once(root, { result, postcss }) {
    let directive: AtRule | null = null;
    root.walkAtRules("spatika", (atRule) => {
      if (atRule.params.trim() === "utilities") directive = atRule;
    });
    if (!directive) return;
    const engine = await engineFor(options);
    const css = engine.css(root.toString());
    (directive as AtRule).replaceWith(postcss.parse(css, { from: result.opts.from }).nodes);
    const parent = result.opts.from;
    for (const file of engine.files) {
      result.messages.push({ type: "dependency", plugin: "@spatika/utilities", file, parent });
    }
    for (const dir of engine.dirs) {
      result.messages.push({ type: "dir-dependency", plugin: "@spatika/utilities", dir, glob: "**/*", parent });
    }
  },
});
spatikaUtilities.postcss = true;

export default spatikaUtilities;
