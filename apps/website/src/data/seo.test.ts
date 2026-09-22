import { describe, expect, it } from "vitest";
import { components } from "./navigation";
import { FAQS, SEO_PAGES, sitemapXml } from "./seo";

describe("seo", () => {
  it("documents how coding agents install Spatika", () => {
    expect(FAQS.some((faq) => /AI coding agents/i.test(faq.question))).toBe(true);
    expect(FAQS.some((faq) => faq.answer.includes("llms.txt"))).toBe(true);
    expect(FAQS.some((faq) => faq.answer.includes("spatika.sweyam.com"))).toBe(true);
    expect(FAQS.some((faq) => faq.answer.includes("generated code matches the kit"))).toBe(true);
  });

  it("includes a page for every component", () => {
    const paths = new Set(SEO_PAGES.map((page) => page.path));
    expect(paths.has("/guides")).toBe(true);
    expect(paths.has("/customize")).toBe(true);
    for (const entry of components) {
      expect(paths.has(`/components/${entry.slug}`)).toBe(true);
    }
  });

  it("emits sitemap urls", () => {
    const xml = sitemapXml("2026-08-29");
    expect(xml).toContain("https://spatika.sweyam.com/components/button");
    expect(xml).toContain("https://spatika.sweyam.com/demos/editor");
    expect(xml).toContain("<lastmod>2026-08-29</lastmod>");
  });
});
