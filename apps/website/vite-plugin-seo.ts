import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import { applySeoToHtml, getSeoPage, NOT_FOUND_PAGE, SEO_PAGES, sitemapXml } from "./src/data/seo";

function writeRouteHtml(dist: string, template: string, routePath: string, noindex: boolean) {
  const page = getSeoPage(routePath);
  const html = applySeoToHtml(template, noindex ? { ...page, noindex: true } : page);
  if (routePath === "/") {
    fs.writeFileSync(path.join(dist, "index.html"), html);
    return;
  }
  const dir = path.join(dist, routePath.replace(/^\//, ""));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

export function spatikaSeoPlugin(): Plugin {
  let dist = path.resolve(__dirname, "dist");
  // Versioned snapshots (/docs/vX.Y.Z/, /next/) are not indexed — search engines should send
  // people to the current docs at the root.
  let noindex = false;
  return {
    name: "spatika-seo",
    configResolved(config) {
      dist = path.resolve(config.root, config.build.outDir);
      noindex = config.base !== "/";
    },
    closeBundle() {
      const index = path.join(dist, "index.html");
      if (!fs.existsSync(index)) return;

      const template = fs.readFileSync(index, "utf8");
      for (const page of SEO_PAGES) {
        writeRouteHtml(dist, template, page.path, noindex);
      }
      fs.writeFileSync(path.join(dist, "404.html"), applySeoToHtml(template, NOT_FOUND_PAGE));

      const lastmod = new Date().toISOString().slice(0, 10);
      if (!noindex) fs.writeFileSync(path.join(dist, "sitemap.xml"), sitemapXml(lastmod));
    },
  };
}
