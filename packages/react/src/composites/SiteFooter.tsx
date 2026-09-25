import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import type { SiteNavLink } from "./SiteNav";

export type SiteFooterColumn = {
  /** Column heading — "Product", "Company", "Legal". */
  title: ReactNode;
  links: SiteNavLink[];
};

export type SiteFooterProps = {
  brand?: ReactNode;
  copyright?: ReactNode;
  links?: SiteNavLink[];
  /** Render each link (e.g. Next.js `<Link>`). Defaults to `<a>`. */
  renderLink?: (link: SiteNavLink, className: string) => ReactNode;
  /** Trailing meta row (badges, “powered by”, etc.). */
  meta?: ReactNode;
  /**
   * Sitemap columns. Passing these switches the footer from the slim single row to the
   * tall marketing layout, with `brand`, `description` and `action` in a leading column.
   */
  columns?: SiteFooterColumn[];
  /** A line about the product, under the brand in the tall layout. */
  description?: ReactNode;
  /** Slot beside the brand — a `LeadForm`, usually. */
  action?: ReactNode;
  /** Social icon links, under the description. */
  social?: ReactNode;
  /** Bottom row beside the copyright — privacy, terms, a locale switcher. */
  legal?: ReactNode;
  className?: string;
};

const linkClass =
  "font-semibold text-muted-foreground transition-colors hover:text-primary";

/**
 * Marketing-site footer. Two shapes from one component:
 *
 * - **Slim** (default) — brand, copyright, a link row and optional meta chips.
 * - **Tall** — pass `columns` for a sitemap footer with a brand column, an optional
 *   `description`, an `action` slot for a signup form, `social` links and a `legal` row.
 */
export function SiteFooter({
  brand,
  copyright,
  links = [],
  renderLink,
  meta,
  columns,
  description,
  action,
  social,
  legal,
  className,
}: SiteFooterProps) {
  const renderItem = (link: SiteNavLink) => {
    if (renderLink) return renderLink(link, linkClass);
    return (
      <a href={link.href} className={linkClass}>
        {link.label}
      </a>
    );
  };

  const shellClass = cn(
    "relative border-t border-border/80 bg-[color-mix(in_srgb,var(--background)_85%,transparent)]",
    className,
  );

  const hairline = (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
      aria-hidden
    />
  );

  if (columns?.length) {
    return (
      <footer data-slot="site-footer" data-layout="columns" className={shellClass}>
        {hairline}
        <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,2fr)] lg:gap-16">
            <div className="flex min-w-0 flex-col gap-4">
              {brand}
              {description ? (
                <p className="max-w-sm text-body-sm text-muted-foreground">{description}</p>
              ) : null}
              {action}
              {social ? <div className="flex flex-wrap items-center gap-2">{social}</div> : null}
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(7.5rem,1fr))] gap-8">
              {columns.map((column, index) => (
                <nav key={index} aria-label={typeof column.title === "string" ? column.title : undefined}>
                  <p className="mb-3 text-caption font-medium text-foreground">{column.title}</p>
                  <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                    {column.links.map((link) => (
                      <li key={`${link.href}-${link.label}`} className="text-[13px]">
                        {renderItem(link)}
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col-reverse items-center justify-between gap-4 border-t border-border/70 pt-6 md:flex-row">
            {copyright ? <span className="text-[12px] text-muted-foreground">{copyright}</span> : null}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] text-muted-foreground">
              {links.map((link) => (
                <span key={`${link.href}-${link.label}`}>{renderItem(link)}</span>
              ))}
              {legal}
              {meta}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      data-slot="site-footer"
      data-layout="row"
      className={shellClass}
    >
      {hairline}
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            {brand}
            {brand && copyright ? (
              <span className="text-border" aria-hidden>
                |
              </span>
            ) : null}
            {copyright ? (
              <span className="text-[13px] text-muted-foreground">{copyright}</span>
            ) : null}
          </div>

          {links.length > 0 ? (
            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] text-muted-foreground">
              {links.map((link) => (
                <span key={`${link.href}-${link.label}`}>{renderItem(link)}</span>
              ))}
            </nav>
          ) : null}

          {meta}
        </div>
      </div>
    </footer>
  );
}
