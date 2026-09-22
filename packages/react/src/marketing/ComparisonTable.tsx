import * as React from "react";
import type { ReactNode } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "../lib/cn";

export type ComparisonColumn = {
  /** Key used in each row's `values`. */
  id: string;
  label: ReactNode;
  /** One line under the column name — "For small teams". */
  description?: ReactNode;
  /** Ribbon above the column name. */
  badge?: ReactNode;
  /** Tints the column and keeps it emphasised down the table. */
  featured?: boolean;
  /** Call to action under the column name. */
  action?: ReactNode;
};

/** `true` / `false` render as a check or a dash; anything else renders as given. */
export type ComparisonValue = boolean | string | number | ReactNode;

export type ComparisonRow = {
  label: ReactNode;
  /** Small clarifier under the feature name. */
  hint?: ReactNode;
  values: Record<string, ComparisonValue>;
};

export type ComparisonGroup = {
  label: ReactNode;
  rows: ComparisonRow[];
};

export type ComparisonTableProps = {
  columns: ComparisonColumn[];
  /** Flat list of features. Use `groups` instead when the list needs sections. */
  rows?: ComparisonRow[];
  /** Sectioned features — "Collaboration", "Security", "Support". */
  groups?: ComparisonGroup[];
  /** Describes the table for screen readers. Visually hidden. */
  caption?: ReactNode;
  /** Keep the column header row visible while the table scrolls. */
  stickyHeader?: boolean;
  /** Header for the first column. */
  featureLabel?: ReactNode;
  className?: string;
};

function renderValue(value: ComparisonValue) {
  if (value === true) {
    return (
      <>
        <Check className="size-4 text-accent-text" aria-hidden="true" />
        <span className="sr-only">Included</span>
      </>
    );
  }
  if (value === false || value == null) {
    return (
      <>
        <Minus className="size-4 text-fg-disabled" aria-hidden="true" />
        <span className="sr-only">Not included</span>
      </>
    );
  }
  return <span className="text-body-sm text-fg-secondary">{value}</span>;
}

/**
 * Feature matrix for a pricing page or an "us vs them" comparison — plans across the top,
 * features down the side.
 *
 * It renders a real `table` with row headers, and booleans get a visually hidden
 * "Included" / "Not included" so the grid is not just a field of icons to a screen reader.
 * The table scrolls inside its own container, so the page never scrolls sideways.
 */
export function ComparisonTable({
  columns,
  rows,
  groups,
  caption,
  stickyHeader = false,
  featureLabel = "Features",
  className,
}: ComparisonTableProps) {
  const sections: ComparisonGroup[] = groups ?? (rows ? [{ label: "", rows }] : []);

  return (
    <div
      data-slot="comparison-table"
      className={cn("spk-mk-compare-scroll", className)}
    >
      <table className="spk-mk-compare" data-sticky={stickyHeader ? "true" : undefined}>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr>
            <th scope="col" className="spk-mk-compare__corner">
              {featureLabel}
            </th>
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                data-featured={column.featured ? "true" : undefined}
                className="spk-mk-compare__head"
              >
                {column.badge ? <span className="spk-mk-pill__tag mb-2 inline-flex">{column.badge}</span> : null}
                <span className="block text-title-3 text-fg">{column.label}</span>
                {column.description ? (
                  <span className="mt-1 block text-caption font-normal text-fg-tertiary">{column.description}</span>
                ) : null}
                {column.action ? <span className="mt-3 block">{column.action}</span> : null}
              </th>
            ))}
          </tr>
        </thead>

        {sections.map((section, sectionIndex) => (
          <tbody key={sectionIndex}>
            {section.label ? (
              <tr>
                <th scope="colgroup" colSpan={columns.length + 1} className="spk-mk-compare__group">
                  {section.label}
                </th>
              </tr>
            ) : null}
            {section.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <th scope="row" className="spk-mk-compare__feature">
                  <span className="block text-body text-fg">{row.label}</span>
                  {row.hint ? <span className="mt-0.5 block text-caption font-normal text-fg-tertiary">{row.hint}</span> : null}
                </th>
                {columns.map((column) => (
                  <td
                    key={column.id}
                    data-featured={column.featured ? "true" : undefined}
                    className="spk-mk-compare__cell"
                  >
                    {renderValue(row.values[column.id])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}
