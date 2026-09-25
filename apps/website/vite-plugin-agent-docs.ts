import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import { agentDocFiles } from "./src/data/agent-docs";

function repoRoot(): string {
  return path.resolve(__dirname, "../..");
}

function copyIfExists(from: string, to: string) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

function writeGenerated(destDir: string) {
  for (const file of agentDocFiles()) {
    const full = path.join(destDir, file.path);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, file.body);
  }

  const root = repoRoot();
  copyIfExists(path.join(root, "AGENTS.md"), path.join(destDir, "AGENTS.md"));
  copyIfExists(
    path.join(root, ".cursor/skills/spatika-ui/SKILL.md"),
    path.join(destDir, "skills/spatika-ui/SKILL.md"),
  );
}

function lookupFile(urlPath: string) {
  const clean = urlPath.split("?")[0] ?? "/";
  const relative = clean.replace(/^\//, "");
  const generated = agentDocFiles().find((file) => file.path === relative);
  if (generated) return generated;

  const root = repoRoot();
  if (relative === "AGENTS.md") {
    const body = fs.readFileSync(path.join(root, "AGENTS.md"), "utf8");
    return { path: relative, body, contentType: "text/markdown; charset=utf-8" };
  }
  if (relative === "skills/spatika-ui/SKILL.md") {
    const body = fs.readFileSync(path.join(root, ".cursor/skills/spatika-ui/SKILL.md"), "utf8");
    return { path: relative, body, contentType: "text/markdown; charset=utf-8" };
  }
  return null;
}

export function spatikaAgentDocsPlugin(): Plugin {
  let outDir = path.resolve(__dirname, "dist");
  return {
    name: "spatika-agent-docs",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? "";
        const base = (server.config.base ?? "/").replace(/\/$/, "");
        const pathname = (base && url.startsWith(base) ? url.slice(base.length) : url) || "/";
        const file = lookupFile(pathname);
        if (!file) {
          next();
          return;
        }
        res.setHeader("Content-Type", file.contentType);
        res.setHeader("Cache-Control", "no-store");
        res.end(file.body);
      });
    },
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const dist = outDir;
      if (!fs.existsSync(dist)) return;
      writeGenerated(dist);
    },
  };
}
