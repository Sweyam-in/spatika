#!/usr/bin/env node
/**
 * Extracts a component API reference from a TypeScript entry point.
 *
 *   node scripts/extract-api.mjs --entry packages/react/src/index.ts \
 *     --tsconfig packages/react/tsconfig.json --out apps/website/src/generated/api.json
 *
 * Works on source (`src/index.ts`, where default values are read from destructuring) and on
 * published declarations (`dist/index.d.ts`, used to rebuild the API of historical releases).
 *
 * A component is any PascalCase value export whose call signature takes one object parameter.
 * Props declared outside node_modules are "own" props; props that come from React DOM
 * attributes or third-party packages are summarised in `extends` instead of listed one by one.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, "..");
const ts = require(require.resolve("typescript", { paths: [root] }));

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    const next = argv[i + 1];
    // A flag followed by nothing or by another flag is a boolean (`--check`).
    args[key.slice(2)] = next === undefined || next.startsWith("--") ? "true" : argv[++i];
  }
  return args;
}

function loadCompilerOptions(tsconfigPath) {
  const base = {
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    allowImportingTsExtensions: true,
  };
  if (!tsconfigPath) return base;
  const config = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(tsconfigPath));
  return { ...parsed.options, noEmit: true };
}

const TYPE_FLAGS =
  ts.TypeFormatFlags.NoTruncation |
  ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
  ts.TypeFormatFlags.WriteArrowStyleSignature;

function externalSource(fileName) {
  const normalized = fileName.split(path.sep).join("/");
  const match = normalized.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
  // Spatika's own packages count as own props even when resolved from node_modules
  // (archive builds read the published tarballs).
  if (!match || match[1].startsWith("@spatika/")) return null;
  return match[1] === "@types/react" || match[1] === "typescript" ? "HTML attributes" : match[1];
}

/** Destructuring defaults from `function X({ a = 1 })` or `forwardRef(({ a = 1 }, ref) => …)`. */
function readDefaults(declaration) {
  const defaults = {};
  let fn = null;
  if (!declaration) return defaults;
  if (ts.isFunctionDeclaration(declaration)) fn = declaration;
  else if (ts.isVariableDeclaration(declaration) && declaration.initializer) {
    let init = declaration.initializer;
    while (init && (ts.isAsExpression(init) || ts.isParenthesizedExpression(init) || ts.isSatisfiesExpression?.(init))) {
      init = init.expression;
    }
    if (init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init))) fn = init;
    else if (init && ts.isCallExpression(init)) {
      const arg = init.arguments[0];
      if (arg && (ts.isArrowFunction(arg) || ts.isFunctionExpression(arg))) fn = arg;
      else if (arg && ts.isIdentifier(arg)) {
        // forwardRef(Inner) — find the inner function in the same file.
        const inner = declaration.getSourceFile().statements.find(
          (statement) => ts.isFunctionDeclaration(statement) && statement.name?.text === arg.text,
        );
        if (inner) fn = inner;
      }
    }
  }
  const param = fn?.parameters?.[0];
  if (param && ts.isObjectBindingPattern(param.name)) {
    for (const element of param.name.elements) {
      if (!element.initializer) continue;
      const name = (element.propertyName ?? element.name).getText();
      defaults[name.replace(/^["']|["']$/g, "")] = element.initializer.getText();
    }
  }
  return defaults;
}

function cleanType(text, optional) {
  let result = text.replace(/\s+/g, " ").trim();
  if (optional) result = result.replace(/ \| undefined$/, "").replace(/^undefined \| /, "");
  return result;
}

function extract({ entry, tsconfig }) {
  const entryPath = path.resolve(entry);
  const program = ts.createProgram([entryPath], loadCompilerOptions(tsconfig && path.resolve(tsconfig)));
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(entryPath);
  if (!source) throw new Error(`Cannot read ${entryPath}`);
  const moduleSymbol = checker.getSymbolAtLocation(source);
  const output = {};

  for (const exported of checker.getExportsOfModule(moduleSymbol)) {
    const name = exported.getName();
    if (!/^[A-Z][a-z0-9]/.test(name)) continue;
    const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    if (!(symbol.flags & ts.SymbolFlags.Value)) continue;
    const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
    if (!declaration) continue;

    const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
    const signature = type.getCallSignatures()[0];
    if (!signature) continue;
    const [propsParam] = signature.getParameters();
    if (!propsParam || signature.getParameters().length > 2) continue;
    const returnText = checker.typeToString(signature.getReturnType());
    if (!/Element|ReactNode|ReactElement|null/.test(returnText)) continue;

    const propsType = checker.getTypeOfSymbolAtLocation(propsParam, declaration);
    const defaults = readDefaults(declaration);
    const props = [];
    const inherited = new Set();

    for (const prop of checker.getPropertiesOfType(propsType)) {
      const propName = prop.getName();
      if (propName === "key" || propName === "ref") continue;
      const decls = prop.getDeclarations() ?? [];
      const origin = decls.map((d) => externalSource(d.getSourceFile().fileName)).find(Boolean);
      const ownDecl = decls.find((d) => !externalSource(d.getSourceFile().fileName));
      if (!ownDecl) {
        if (origin) inherited.add(origin);
        continue;
      }
      const optional = Boolean(prop.flags & ts.SymbolFlags.Optional);
      const propType = checker.getTypeOfSymbolAtLocation(prop, ownDecl);
      const tags = prop.getJsDocTags(checker);
      const tag = (tagName) => {
        const found = tags.find((t) => t.name === tagName);
        return found ? ts.displayPartsToString(found.text ?? []).trim() || true : undefined;
      };
      const entryProp = {
        name: propName,
        type: cleanType(checker.typeToString(propType, ownDecl, TYPE_FLAGS), optional),
        optional,
        description: ts.displayPartsToString(prop.getDocumentationComment(checker)).trim(),
      };
      const def = defaults[propName] ?? tag("default");
      if (def !== undefined && def !== true) entryProp.default = String(def);
      const deprecated = tag("deprecated");
      if (deprecated) entryProp.deprecated = deprecated === true ? "" : deprecated;
      props.push(entryProp);
    }

    const docs = ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim();
    output[name] = {
      ...(docs ? { description: docs } : {}),
      ...(inherited.size ? { extends: [...inherited].sort() } : {}),
      props: props.sort((a, b) => Number(a.optional) - Number(b.optional) || a.name.localeCompare(b.name)),
    };
  }

  return Object.fromEntries(Object.entries(output).sort(([a], [b]) => a.localeCompare(b)));
}

const args = parseArgs(process.argv.slice(2));
if (!args.entry) {
  console.error("usage: extract-api.mjs --entry <file> [--tsconfig <file>] [--out <file>] [--check]");
  process.exit(2);
}
const api = extract(args);
const json = `${JSON.stringify(api, null, 1)}\n`;
if (args.out) {
  const out = path.resolve(args.out);
  if (args.check === "true") {
    const current = fs.existsSync(out) ? fs.readFileSync(out, "utf8") : "";
    if (current !== json) {
      console.error(`${path.relative(root, out)} is out of date — run: npm run docs:api`);
      process.exit(1);
    }
    console.log(`${path.relative(root, out)} is up to date (${Object.keys(api).length} components)`);
  } else {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, json);
    console.log(`Wrote ${Object.keys(api).length} components to ${path.relative(root, out)}`);
  }
} else {
  process.stdout.write(json);
}
