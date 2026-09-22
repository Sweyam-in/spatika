import { useState } from "react";
import { cn } from "../lib/cn";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  onClick?: () => void;
};

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
  /** Collapse middle items behind an ellipsis when there are more than this many. */
  maxItems?: number;
};

const linkClass =
  "rounded-[var(--spk-radius-xs)] text-fg-secondary outline-none transition-colors hover:text-fg focus-visible:shadow-[var(--spk-focus-ring)]";

export function Breadcrumb({ items, className, maxItems = 4 }: BreadcrumbProps) {
  const [expanded, setExpanded] = useState(false);
  const collapse = !expanded && items.length > maxItems;
  const visible: (BreadcrumbItem | "ellipsis")[] = collapse
    ? [items[0]!, "ellipsis", ...items.slice(items.length - (maxItems - 2))]
    : items;

  return (
    <nav data-slot="breadcrumb" aria-label="Breadcrumb" className={className}>
      <ol className="flex min-w-0 flex-wrap items-center gap-1.5 text-body-sm">
        {visible.map((item, index) => {
          const last = index === visible.length - 1;
          const separator =
            index > 0 ? (
              <span aria-hidden className="text-fg-disabled select-none">
                /
              </span>
            ) : null;
          if (item === "ellipsis") {
            return (
              <li key="ellipsis" className="inline-flex items-center gap-1.5">
                {separator}
                <button type="button" className={cn(linkClass, "px-0.5")} aria-label="Show all breadcrumbs" onClick={() => setExpanded(true)}>
                  …
                </button>
              </li>
            );
          }
          const content = last ? (
            <span aria-current="page" className="truncate font-medium text-fg">
              {item.label}
            </span>
          ) : item.onClick && !item.href ? (
            <button type="button" className={linkClass} onClick={item.onClick}>
              {item.label}
            </button>
          ) : (
            <a href={item.href} className={linkClass} onClick={item.onClick}>
              {item.label}
            </a>
          );
          return (
            <li key={`${item.label}-${index}`} className="inline-flex min-w-0 items-center gap-1.5">
              {separator}
              {content}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
