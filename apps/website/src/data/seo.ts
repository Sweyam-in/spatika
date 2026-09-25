import { components } from "./navigation";
import { SITE, absoluteUrl } from "./site";
import { LEADS } from "../showcase/data";

export type SeoPage = {
  path: string;
  title: string;
  description: string;
  breadcrumbs: { name: string; path: string }[];
  noindex?: boolean;
};

export const FAQS = [
  {
    question: "What is Spatika UI?",
    answer:
      "Spatika UI is an open-source React design system. It ships semantic CSS tokens, four themes (Mukta, Neelam, Usha, Sandhya), and production React components for app shells, data tables, forms, surfaces, and marketing layouts. Install @spatika/react and @spatika/tokens from npm to get started.",
  },
  {
    question: "Is Spadik UI the same as Spatika UI?",
    answer:
      "Yes. Spatika (Sanskrit स्फटिक, meaning crystal) is often romanized as Spadik. If you searched for Spadik UI, Spadik React UI, or Spadik design system, you found the same project — Spatika UI at spatika.sweyam.com.",
  },
  {
    question: "Is Spatika still a glass UI library?",
    answer:
      "Not any more. Spatika 1.x was glass-first; 2.0 makes solid, calm surfaces the default and keeps translucency as an opt-in material (surface=\"glass\") for floating navigation, media controls and overlays. The 1.x .glass classes still work and now render as calm surfaces.",
  },
  {
    question: "How do I install Spatika UI?",
    answer:
      "Run npm install @spatika/tokens @spatika/react, import @spatika/tokens/styles.css, and wrap your app in SpatikaThemeProvider. Live component previews, docs, and a product showcase are at spatika.sweyam.com.",
  },
    {
      question: "How do I create a custom Spatika theme?",
      answer:
        "Call createTheme({ id, extends, palette }) from @spatika/react and pass the result as customThemes on SpatikaThemeProvider. Unspecified tokens inherit from Mukta, Neelam, Usha, or Sandhya. You can also override CSS variables such as --primary on :root. The full guide is at spatika.sweyam.com/customize.",
    },
    {
      question: "Does Spatika UI include charts, an editor, and scheduling?",
      answer:
        "Yes. @spatika/charts ships 30+ SVG chart types with zoom, tooltips, and export. @spatika/editor is a Tiptap rich text editor with slash commands, @mentions, tables, and AI hooks. EventCalendar and EventTimeline in @spatika/react cover month/week/day calendars and resource timelines.",
    },
  {
    question: "How do AI coding agents use Spatika UI?",
    answer:
      "Fetch https://spatika.sweyam.com/llms.txt for the machine-readable index, or copy the spatika-ui Cursor skill from the GitHub repo or from node_modules/@spatika/react/skills/spatika-ui. Always import @spatika/tokens/styles.css and wrap the app in SpatikaThemeProvider so generated code matches the kit.",
  },
] as const;

const TITLE_SUFFIX = "Spatika UI";

function titled(page: string): string {
  return `${page} — ${TITLE_SUFFIX}`;
}

const staticPages: SeoPage[] = [
  {
    path: "/",
    title: "Spatika UI — React Design System",
    description: SITE.description,
    breadcrumbs: [{ name: "Spatika UI", path: "/" }],
  },
  {
    path: "/design",
    title: titled("Design language"),
    description:
      "Spatika UI design language: calm surfaces, four themes, typography, density, and motion. Semantic tokens for the apps you ship.",
    breadcrumbs: [
      { name: "Spatika UI", path: "/" },
      { name: "Design", path: "/design" },
    ],
  },
    {
      path: "/customize",
      title: titled("Customize"),
      description:
        "Customize Spatika UI like Material UI: createTheme, color palette, CSS variables, breakpoints, and responsive Grid — with CSS variables as the source of truth.",
      breadcrumbs: [
        { name: "Spatika UI", path: "/" },
        { name: "Customize", path: "/customize" },
      ],
    },
    {
      path: "/guides",
    title: titled("Guides"),
    description:
      "Install Spatika UI (also spelled Spadik UI) from npm, wire themes, and compose the application shell, data tables, charts, and page chrome.",
    breadcrumbs: [
      { name: "Spatika UI", path: "/" },
      { name: "Guides", path: "/guides" },
    ],
  },
  {
    path: "/components",
    title: titled("React components"),
    description:
      "Browse Spatika UI React components — cards, app shell, data tables, forms, scheduling (EventCalendar), SVG charts (@spatika/charts), rich text (@spatika/editor), and feedback primitives. Each card is a live preview.",
    breadcrumbs: [
      { name: "Spatika UI", path: "/" },
      { name: "Components", path: "/components" },
    ],
  },
  {
    path: "/changelog",
    title: titled("Release notes"),
    description:
      "Release notes for every version of @spatika/tokens, @spatika/react, @spatika/charts and @spatika/editor, classified by semantic versioning.",
    breadcrumbs: [
      { name: "Spatika UI", path: "/" },
      { name: "Release notes", path: "/changelog" },
    ],
  },
  {
    path: "/versions",
    title: titled("Versions & support"),
    description:
      "Documentation for every published Spatika UI release at a stable /docs/vX.Y.Z/ URL, and the support policy for current, supported and archived versions.",
    breadcrumbs: [
      { name: "Spatika UI", path: "/" },
      { name: "Versions & support", path: "/versions" },
    ],
  },
  {
    path: "/migration",
    title: titled("Migration guides"),
    description:
      "What changes when you upgrade Spatika UI — 2.3 to 2.4 and 1.x to 2.0 — with the one-line changes that restore previous behaviour.",
    breadcrumbs: [
      { name: "Spatika UI", path: "/" },
      { name: "Migration guides", path: "/migration" },
    ],
  },
  {
    path: "/accessibility",
    title: titled("Accessibility"),
    description:
      "How Spatika UI targets WCAG 2.2 AA: keyboard models, focus management, theme contrast, how it is tested, and known limitations.",
    breadcrumbs: [
      { name: "Spatika UI", path: "/" },
      { name: "Accessibility", path: "/accessibility" },
    ],
  },
  {
    path: "/showcase",
    title: titled("Showcase"),
    description:
      "Product demo screens built with Spatika UI — a finance dashboard, an admin console, a workspace app, a marketing landing page, and a CRM.",
    breadcrumbs: [
      { name: "Spatika UI", path: "/" },
      { name: "Showcase", path: "/showcase" },
    ],
  },
  {
    path: "/showcase/admin",
    title: titled("Showcase · Admin console"),
    description: "Spatika UI showcase: an admin console with tables, filters, and app chrome.",
    breadcrumbs: [
      { name: "Spatika UI", path: "/" },
      { name: "Showcase", path: "/showcase" },
      { name: "Admin console", path: "/showcase/admin" },
    ],
  },
  {
    path: "/showcase/workspace",
    title: titled("Showcase · Workspace app"),
    description: "Spatika UI showcase: a workspace app shell built with Spatika UI components.",
    breadcrumbs: [
      { name: "Spatika UI", path: "/" },
      { name: "Showcase", path: "/showcase" },
      { name: "Workspace app", path: "/showcase/workspace" },
    ],
  },
  {
    path: "/showcase/landing",
    title: titled("Showcase · Landing page"),
    description: "Spatika UI showcase: a marketing landing page built with Spatika UI components.",
    breadcrumbs: [
      { name: "Spatika UI", path: "/" },
      { name: "Showcase", path: "/showcase" },
      { name: "Landing page", path: "/showcase/landing" },
    ],
  },
  {
    path: "/showcase/relay",
    title: titled("Showcase · Relay CRM"),
    description:
      "A live lead-generation CRM workspace built with Spatika UI — an application shell, data tables, and four themes you can switch on the fly.",
    breadcrumbs: [
      { name: "Spatika UI", path: "/" },
      { name: "Showcase", path: "/showcase" },
      { name: "Relay", path: "/showcase/relay" },
    ],
  },
  {
    path: "/showcase/relay/leads",
    title: titled("Showcase · Relay · Leads"),
    description: "Spatika UI showcase: directory, search chrome, and entity rows in a lead workspace.",
    breadcrumbs: [
      { name: "Spatika UI", path: "/" },
      { name: "Showcase", path: "/showcase" },
      { name: "Relay", path: "/showcase/relay" },
      { name: "Leads", path: "/showcase/relay/leads" },
    ],
  },
  {
    path: "/showcase/relay/campaigns",
    title: titled("Showcase · Relay · Campaigns"),
    description: "Spatika UI showcase: campaign cards and layout patterns for marketing ops.",
    breadcrumbs: [
      { name: "Spatika UI", path: "/" },
      { name: "Showcase", path: "/showcase" },
      { name: "Relay", path: "/showcase/relay" },
      { name: "Campaigns", path: "/showcase/relay/campaigns" },
    ],
  },
  {
    path: "/showcase/relay/insights",
    title: titled("Showcase · Relay · Insights"),
    description: "Spatika UI showcase: stats, charts, and calm surfaces in a product insights view.",
    breadcrumbs: [
      { name: "Spatika UI", path: "/" },
      { name: "Showcase", path: "/showcase" },
      { name: "Relay", path: "/showcase/relay" },
      { name: "Insights", path: "/showcase/relay/insights" },
    ],
  },
  {
    path: "/demos/editor",
    title: titled("Editor playground"),
    description:
      "Sit down with the full Spatika Editor — write, format, mention teammates, add tables and images, and try the AI dock with your own backend.",
    breadcrumbs: [
      { name: "Spatika UI", path: "/" },
      { name: "Editor playground", path: "/demos/editor" },
    ],
  },
];

const componentPages: SeoPage[] = components.map((entry) => ({
  path: `/components/${entry.slug}`,
  title: titled(entry.name),
  description: `${entry.description} Part of Spatika UI, an open-source React design system.`,
  breadcrumbs: [
    { name: "Spatika UI", path: "/" },
    { name: "Components", path: "/components" },
    { name: entry.name, path: `/components/${entry.slug}` },
  ],
}));

const leadPages: SeoPage[] = LEADS.map((lead) => ({
  path: `/showcase/relay/leads/${lead.id}`,
  title: titled(`Showcase · Relay · ${lead.name}`),
  description: `Spatika UI showcase: a lead detail view in the Relay CRM demo, rendered with Spatika UI components.`,
  breadcrumbs: [
    { name: "Spatika UI", path: "/" },
    { name: "Showcase", path: "/showcase" },
    { name: "Relay", path: "/showcase/relay" },
    { name: "Leads", path: "/showcase/relay/leads" },
    { name: lead.name, path: `/showcase/relay/leads/${lead.id}` },
  ],
  noindex: true,
}));

export const SEO_PAGES: SeoPage[] = [...staticPages, ...componentPages, ...leadPages];

export const NOT_FOUND_PAGE: SeoPage = {
  path: "/404",
  title: `Page not found — ${TITLE_SUFFIX}`,
  description: "The page you requested could not be found on spatika.sweyam.com.",
  breadcrumbs: [{ name: "Spatika UI", path: "/" }],
  noindex: true,
};

const pagesByPath = new Map(SEO_PAGES.map((page) => [page.path, page]));

export function canonicalPath(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed || "/";
}

export function getSeoPage(pathname: string): SeoPage {
  const path = canonicalPath(pathname);
  return (
    pagesByPath.get(path) ?? {
      path,
      title: TITLE_SUFFIX,
      description: SITE.description,
      breadcrumbs: [
        { name: "Spatika UI", path: "/" },
        { name: path.replace(/^\//, "") || "Page", path },
      ],
    }
  );
}

export function pageUrl(page: SeoPage): string {
  return absoluteUrl(page.path);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function buildJsonLd(page: SeoPage): unknown {
  const url = pageUrl(page);
  const graph: unknown[] = [
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      name: SITE.brand,
      alternateName: [...SITE.alternateNames],
      url: SITE.url,
      description: SITE.description,
      inLanguage: "en",
      publisher: { "@id": `${SITE.url}/#person` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE.url}/#app`,
      name: SITE.brand,
      alternateName: [...SITE.alternateNames],
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: SITE.description,
      url: SITE.url,
      image: SITE.ogImage,
      author: { "@id": `${SITE.url}/#person` },
      downloadUrl: SITE.npmReact,
      softwareHelp: absoluteUrl("/guides"),
      license: "https://opensource.org/licenses/MIT",
    },
    {
      "@type": "Person",
      "@id": `${SITE.url}/#person`,
      name: SITE.author,
      url: SITE.authorUrl,
    },
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: page.title,
      description: page.description,
      isPartOf: { "@id": `${SITE.url}/#website` },
      about: { "@id": `${SITE.url}/#app` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: page.breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: absoluteUrl(crumb.path),
      })),
    },
  ];

  if (page.path === "/") {
    graph.push({
      "@type": "FAQPage",
      "@id": `${SITE.url}/#faq`,
      mainEntity: FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

function replaceAttr(html: string, key: string, attr: "content" | "href", value: string): string {
  const pattern = new RegExp(`(data-spk-seo="${key}"[^>]*\\s${attr}=")([^"]*)(")`, "i");
  return html.replace(pattern, `$1${escapeHtml(value)}$3`);
}

export function applySeoToHtml(html: string, page: SeoPage): string {
  const url = pageUrl(page);
  const jsonLd = JSON.stringify(buildJsonLd(page));
  let next = html.replace(
    /<title data-spk-seo="title">[\s\S]*?<\/title>/,
    `<title data-spk-seo="title">${escapeHtml(page.title)}</title>`,
  );
  next = replaceAttr(next, "description", "content", page.description);
  next = replaceAttr(
    next,
    "robots",
    "content",
    page.noindex
      ? "noindex, nofollow"
      : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  );
  next = replaceAttr(next, "canonical", "href", url);
  next = replaceAttr(next, "og-title", "content", page.title);
  next = replaceAttr(next, "og-description", "content", page.description);
  next = replaceAttr(next, "og-url", "content", url);
  next = replaceAttr(next, "twitter-title", "content", page.title);
  next = replaceAttr(next, "twitter-description", "content", page.description);
  next = next.replace(
    /<script type="application\/ld\+json" data-spk-seo="jsonld">[\s\S]*?<\/script>/,
    `<script type="application/ld+json" data-spk-seo="jsonld">${jsonLd}</script>`,
  );
  next = next.replace(
    /<noscript data-spk-seo="noscript">[\s\S]*?<\/noscript>/,
    `<noscript data-spk-seo="noscript"><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p></noscript>`,
  );
  return next;
}

export function sitemapXml(lastmod: string): string {
  const urls = SEO_PAGES.filter((page) => !page.noindex).map((page) => {
    const loc = pageUrl(page);
    const priority = page.path === "/" ? "1.0" : page.path.split("/").length <= 2 ? "0.8" : "0.6";
    const changefreq = page.path === "/" ? "weekly" : "monthly";
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
