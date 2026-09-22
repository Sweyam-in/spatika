import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { buildJsonLd, getSeoPage, pageUrl } from "@/data/seo";

function setNamed(selector: string, attr: string, value: string) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

export function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = getSeoPage(pathname);
    const url = pageUrl(page);

    document.title = page.title;
    setNamed('meta[data-spk-seo="description"]', "content", page.description);
    setNamed('link[data-spk-seo="canonical"]', "href", url);
    setNamed('meta[data-spk-seo="og-title"]', "content", page.title);
    setNamed('meta[data-spk-seo="og-description"]', "content", page.description);
    setNamed('meta[data-spk-seo="og-url"]', "content", url);
    setNamed('meta[data-spk-seo="twitter-title"]', "content", page.title);
    setNamed('meta[data-spk-seo="twitter-description"]', "content", page.description);

    const ld = document.head.querySelector("script[data-spk-seo='jsonld']");
    if (ld) ld.textContent = JSON.stringify(buildJsonLd(page));
  }, [pathname]);

  return null;
}
