import * as React from "react";
import { cn } from "../lib/cn";

export type DescriptionItem = {
  term: React.ReactNode;
  details: React.ReactNode;
  /** Tabular numerals for this value (amounts, ids, dates). */
  numeric?: boolean;
  key?: React.Key;
};

export type DescriptionListProps = Omit<React.ComponentPropsWithoutRef<"div">, "children"> & {
  items?: DescriptionItem[];
  /**
   * `auto` (default) stacks term over value and switches to side-by-side once the list itself
   * is ≥ 28rem wide; `stacked` always stacks; `grid` flows items into columns at ≥ 40rem.
   * Breakpoints are container queries, so the same list adapts inside a sheet, card or page.
   */
  layout?: "auto" | "stacked" | "inline" | "grid";
  /** Columns for `layout="grid"`. Default 2. */
  columns?: number;
  /** Tabular numerals for every value. */
  numeric?: boolean;
  children?: React.ReactNode;
};

/**
 * Label–value pairs for record details (a customer's plan, a transaction's metadata). Uses
 * `<dl>` semantics so screen readers announce each term with its value.
 */
export function DescriptionList({
  items,
  layout = "auto",
  columns,
  numeric,
  className,
  style,
  children,
  ...props
}: DescriptionListProps) {
  return (
    <div
      data-slot="description-list"
      data-layout={layout}
      data-numeric={numeric || undefined}
      className={cn("spk-dl", className)}
      style={columns ? { ...style, ["--spk-dl-columns" as string]: columns } : style}
      {...props}
    >
      <dl className="spk-dl-items">
        {items?.map((item, index) => (
          <DescriptionItemRow key={item.key ?? index} term={item.term} numeric={item.numeric}>
            {item.details}
          </DescriptionItemRow>
        ))}
        {children}
      </dl>
    </div>
  );
}

export type DescriptionItemRowProps = {
  term: React.ReactNode;
  numeric?: boolean;
  children?: React.ReactNode;
  className?: string;
};

/** One term / value pair — compose these as children for custom content. */
export function DescriptionItemRow({ term, numeric, children, className }: DescriptionItemRowProps) {
  return (
    <div data-slot="description-item" className={cn("spk-dl-item", className)}>
      <dt className="spk-dl-term">{term}</dt>
      <dd className="spk-dl-details" data-numeric={numeric || undefined}>
        {children ?? <span className="text-fg-tertiary">—</span>}
      </dd>
    </div>
  );
}
