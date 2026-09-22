import * as React from "react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { surfaceClass, type SurfaceVariant } from "../lib/surfaces";

export type PageSectionProps = Omit<React.ComponentProps<"section">, "title"> & {
  title?: ReactNode;
  description?: ReactNode;
  /** Controls aligned with the section title (filters, "View all"). */
  actions?: ReactNode;
  /** Hairline above the section — separates without boxing. */
  divider?: boolean;
  /** Heading level for the title. */
  as?: "h2" | "h3";
};

/**
 * Typography-led page section. Groups content with a heading and spacing instead of
 * wrapping it in a card — use this for most page structure.
 */
export function PageSection({
  title,
  description,
  actions,
  divider = false,
  as: Heading = "h2",
  className,
  children,
  ...props
}: PageSectionProps) {
  const headingId = React.useId();
  return (
    <section
      data-slot="page-section"
      aria-labelledby={title ? headingId : undefined}
      className={cn("flex min-w-0 flex-col gap-4", divider && "border-t border-line pt-6", className)}
      {...props}
    >
      {title || actions ? (
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            {title ? (
              <Heading id={headingId} className="text-title-2 text-fg">
                {title}
              </Heading>
            ) : null}
            {description ? <p className="mt-0.5 text-body text-fg-secondary">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/** Alias — `Section` reads naturally inside dashboards. */
export const Section = PageSection;

export type PanelProps = Omit<React.ComponentProps<"section">, "title"> & {
  title?: ReactNode;
  description?: ReactNode;
  /** Header controls (segmented period, menu). */
  actions?: ReactNode;
  footer?: ReactNode;
  surface?: SurfaceVariant;
  /** Remove body padding — for tables and lists that run edge to edge. */
  flush?: boolean;
};

/**
 * Bordered container with a header bar. Use for objects that need their own frame:
 * a chart, a data table, a feed.
 */
export function Panel({
  title,
  description,
  actions,
  footer,
  surface = "default",
  flush = false,
  className,
  children,
  ...props
}: PanelProps) {
  const headingId = React.useId();
  return (
    <section
      data-slot="panel"
      aria-labelledby={title ? headingId : undefined}
      className={cn(surfaceClass(surface), "flex min-w-0 flex-col overflow-hidden", className)}
      {...props}
    >
      {title || actions ? (
        <header className="flex min-h-12 items-center justify-between gap-3 border-b border-line-subtle px-[var(--spk-card-p)] py-2.5">
          <div className="min-w-0">
            {title ? (
              <h3 id={headingId} className="truncate text-title-3 text-fg">
                {title}
              </h3>
            ) : null}
            {description ? <p className="truncate text-body-sm text-fg-secondary">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-1.5">{actions}</div> : null}
        </header>
      ) : null}
      <div className={cn("min-w-0 flex-1", !flush && "p-[var(--spk-card-p)]")}>{children}</div>
      {footer ? (
        <footer className="flex items-center justify-between gap-3 border-t border-line-subtle px-[var(--spk-card-p)] py-2.5 text-body-sm text-fg-secondary">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}
