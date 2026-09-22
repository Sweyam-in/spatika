import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import { applySeoToHtml, getSeoPage, SEO_PAGES, sitemapXml } from "./src/data/seo";

function writeRouteHtml(dist: string, template: string, routePath: string) {
  const page = getSeoPage(routePath);
  const html = applySeoToHtml(template, page);
  if (routePath === "/") {
    fs.writeFileSync(path.join(dist, "index.html"), html);
    fs.writeFileSync(path.join(dist, "404.html"), html);
    return;
  }
  const dir = path.join(dist, routePath.replace(/^\//, ""));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

export function spatikaSeoPlugin(): Plugin {
  return {
    name: "spatika-seo",
    closeBundle() {
      const dist = path.resolve(__dirname, "dist");
      const index = path.join(dist, "index.html");
      if (!fs.existsSync(index)) return;

      const template = fs.readFileSync(index, "utf8");
      for (const page of SEO_PAGES) {
        writeRouteHtml(dist, template, page.path);
      }

      const lastmod = new Date().toISOString().slice(0, 10);
      fs.writeFileSync(path.join(dist, "sitemap.xml"), sitemapXml(lastmod));
    },
  };
}
