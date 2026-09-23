import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const entry = path.join(root, "packages/tokens/src/build-entry.css");
const outFile = path.join(root, "packages/tokens/dist/styles.css");
const seen = new Set();

async function inlineCss(file) {
  const abs = path.resolve(file);
  if (seen.has(abs)) return "";
  seen.add(abs);

  const source = await readFile(abs, "utf8");
  const dir = path.dirname(abs);
  const chunks = [];
  let cursor = 0;
  const importRe = /@import\s+["'](.+?)["'];/g;
  let match;

  while ((match = importRe.exec(source))) {
    chunks.push(source.slice(cursor, match.index));
    const target = match[1];
    if (!target.startsWith(".")) {
      throw new Error(`External CSS imports are not supported in ${path.relative(root, abs)}: ${target}`);
    }
    chunks.push(await inlineCss(path.join(dir, target)));
    cursor = importRe.lastIndex;
  }

  chunks.push(source.slice(cursor));
  return chunks.join("\n");
}

const banner = `/* Spatika UI tokens and component recipes. Generated from packages/tokens/src. */\n`;
const css = await inlineCss(entry);

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, banner + css.replace(/\n{3,}/g, "\n\n"));
