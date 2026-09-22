import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type PageHeaderProps = {
  /** Small context line above the title (section name, record type). */
  kicker?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Breadcrumb rendered above the title. */
  breadcrumb?: ReactNode;
  /** Inline metadata after the title (badge, status, count). */
  meta?: ReactNode;
  /** Content under the header row — tabs, filters. */
  children?: ReactNode;
  className?: string;
  size?: "md" | "lg";
  /** Hairline under the header (use when tabs sit beneath). */
  bordered?: boolean;
};

/** Page title block. Actions collapse beneath the title on narrow screens. */
export function PageHeader({
  kicker,
  title,
  description,
  actions,
  breadcrumb,
  meta,
  children,
  className,
  size = "md",
  bordered = false,
}: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn("flex flex-col gap-4", bordered && "border-b border-line pb-4", className)}
    >
      {breadcrumb ? <div className="-mb-1">{breadcrumb}</div> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {kicker ? <p className="mb-1 text-body-sm font-medium text-fg-tertiary">{kicker}</p> : null}
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className={cn("min-w-0 text-fg", size === "lg" ? "text-display" : "text-title-1")}>{title}</h1>
            {meta ? <div className="flex items-center gap-2">{meta}</div> : null}
          </div>
          {description ? <p className="mt-1 max-w-2xl text-body text-fg-secondary">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </header>
  );
}
