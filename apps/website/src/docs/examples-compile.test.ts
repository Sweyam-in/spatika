/**
 * Every code example on the site must compile against the package it documents.
 *
 * Examples are fragments (they reference state like `rows` or `setOpen` that the reader
 * supplies), so undefined names are tolerated. Anything that means the example is wrong
 * about Spatika fails: importing something that is not exported, passing a prop that does
 * not exist, giving a prop the wrong type, or omitting a required one.
 */
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { components } from "@/data/navigation";
import { usageSnippet } from "@/data/agent-docs";
import { getComponentDoc } from "./catalog";
import { basicSource } from "./source";

const repoRoot = path.resolve(__dirname, "../../../..");

/** Diagnostics that mean the example misuses the library. */
const API_ERRORS = new Set([
  2305, // module has no exported member
  2724, // has no exported member named X — did you mean
  2322, // type not assignable (includes unknown JSX props)
  2741, // required property missing
  2769, // no overload matches
  2559, // type has no properties in common
  2353, // object literal may only specify known properties
]);

function collectExamples() {
  const files = new Map<string, string>();
  for (const entry of components) {
    const doc = getComponentDoc(entry);
    doc.examples.forEach((example, index) => files.set(`/examples/${entry.slug}.example-${index}.tsx`, example.code));
    files.set(`/examples/${entry.slug}.usage.tsx`, usageSnippet(entry.slug));
    files.set(`/examples/${entry.slug}.source.tsx`, basicSource(entry));
  }
  return files;
}

function compile(files: Map<string, string>) {
  const options: ts.CompilerOptions = {
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    allowImportingTsExtensions: true,
    isolatedModules: false,
    baseUrl: repoRoot,
    paths: {
      "@spatika/react": ["packages/react/src/index.ts"],
      "@spatika/charts": ["packages/charts/src/index.ts"],
      "@spatika/editor": ["packages/editor/src/index.ts"],
      "@spatika/tokens/*": ["packages/tokens/src/index.css"],
      "@spatika/editor/styles.css": ["packages/editor/src/styles/editor.css"],
    },
    types: [],
    typeRoots: [path.join(repoRoot, "node_modules/@types")],
  };
  const host = ts.createCompilerHost(options);
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (fileName, languageVersion, ...rest) => {
    const virtual = files.get(fileName);
    return virtual !== undefined
      ? ts.createSourceFile(fileName, virtual, languageVersion, true, ts.ScriptKind.TSX)
      : getSourceFile(fileName, languageVersion, ...rest);
  };
  const fileExists = host.fileExists.bind(host);
  host.fileExists = (fileName) => files.has(fileName) || fileExists(fileName);
  const readFile = host.readFile.bind(host);
  host.readFile = (fileName) => files.get(fileName) ?? readFile(fileName);
  // Side-effect CSS imports in examples resolve to nothing.
  host.resolveModuleNames = (names, containingFile) =>
    names.map((name) => {
      if (name.endsWith(".css")) return { resolvedFileName: path.join(repoRoot, "packages/react/src/index.ts") };
      return ts.resolveModuleName(name, containingFile, options, host).resolvedModule;
    });

  const program = ts.createProgram([...files.keys()], options, host);
  return [...files.keys()].flatMap((fileName) =>
    ts
      .getPreEmitDiagnostics(program, program.getSourceFile(fileName))
      .filter((diagnostic) => API_ERRORS.has(diagnostic.code))
      .map((diagnostic) => {
        const { line } = diagnostic.file!.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, " ").slice(0, 220);
        return `${fileName.replace("/examples/", "")}:${line + 1} TS${diagnostic.code} ${message}`;
      }),
  );
}

describe("documentation examples", () => {
  it("use only real exports, props and prop types", () => {
    expect(compile(collectExamples())).toEqual([]);
  }, 120_000);
});
