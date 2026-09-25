#!/usr/bin/env node
/**
 * Copies the text of every demo in src/demos/app/*.tsx into src/generated/demo-sources.json.
 *
 * The docs render the demo component and show this text as its code, so the example on the
 * page is always exactly the code that ran. `--check` fails when the JSON is stale.
 */
import fs from "node:fs";
import path from "node:path";

const appRoot = path.resolve(import.meta.dirname, "..");
const demoDir = path.join(appRoot, "src/demos/app");
const outFile = path.join(appRoot, "src/generated/demo-sources.json");

const sources = Object.fromEntries(
  fs
    .readdirSync(demoDir)
    .filter((file) => file.endsWith(".tsx"))
    .sort()
    .map((file) => [path.basename(file, ".tsx"), fs.readFileSync(path.join(demoDir, file), "utf8").trimEnd()]),
);
const json = `${JSON.stringify(sources, null, 2)}\n`;

if (process.argv.includes("--check")) {
  const current = fs.existsSync(outFile) ? fs.readFileSync(outFile, "utf8") : "";
  if (current !== json) {
    console.error("src/generated/demo-sources.json is out of date — run: npm run docs:demos");
    process.exit(1);
  }
  console.log(`demo-sources.json is up to date (${Object.keys(sources).length} demos)`);
} else {
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, json);
  console.log(`Wrote ${Object.keys(sources).length} demo sources`);
}
