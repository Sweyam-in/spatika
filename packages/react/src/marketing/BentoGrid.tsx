import * as React from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "../lib/cn";

export type BentoCardProps = {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  /** Visual that fills the rest of the tile — a chart, screenshot or schematic. */
  media?: ReactNode;
  /** Columns to span at the large breakpoint (1–3). */
  span?: 1 | 2 | 3;
  /** Rows to span at the large breakpoint. */
  rows?: 1 | 2;
  /** Tints the tile with the accent — use it on exactly one tile per grid. */
  emphasis?: boolean;
  /** Sweeps a facet highlight across the tile on hover. */
  shine?: boolean;
  href?: string;
  className?: string;
  children?: ReactNode;
};

/**
 * One tile in a `BentoGrid`. Tiles carry their own span, so the grid reads as a
 * deliberate composition rather than an even matrix.
 */
export function BentoCard({
  title,
  description,
  icon,
  media,
  span = 1,
  rows = 1,
  emphasis = false,
  shine = false,
  href,
  className,
  children,
}: BentoCardProps) {
  const body = (
    <>
      {icon ? <span className="mb-2 inline-flex text-accent-text [&_svg]:size-5">{icon}</span> : null}
      {title ? (
        <h3 data-slot="bento-card-title" className="text-title-2 text-fg">
          {title}
        </h3>
      ) : null}
      {description ? <p className="mt-1.5 text-body text-fg-secondary">{description}</p> : null}
      {children}
      {media ? <div className="mt-4 min-w-0 flex-1">{media}</div> : null}
    </>
  );

  const style = {
    "--spk-mk-bento-span": span,
    "--spk-mk-bento-rows": rows,
  } as CSSProperties;

  const classes = cn("spk-mk-bento__item", shine && "spk-mk-shine", className);
  const shared = {
    "data-slot": "bento-card",
    "data-emphasis": emphasis ? "true" : undefined,
    "data-interactive": href ? "true" : undefined,
  } as const;

  if (href) {
    return (
      <a href={href} className={cn(classes, "no-underline")} style={style} {...shared}>
        {body}
      </a>
    );
  }

  return (
    <div className={classes} style={style} {...shared}>
      {body}
    </div>
  );
}

export type BentoGridProps = {
  children: ReactNode;
  /** Track count at the large breakpoint. */
  columns?: 2 | 3 | 4;
  className?: string;
  style?: CSSProperties;
};

/**
 * Asymmetric tile layout for a product overview — a few big tiles, a few small ones.
 * Give tiles a `span` so the composition has a clear focal point.
 */
export function BentoGrid({ children, columns = 3, className, style }: BentoGridProps) {
  return (
    <div
      data-slot="bento-grid"
      data-columns={columns}
      className={cn("spk-mk-bento", className)}
      style={{ "--spk-mk-bento-cols": columns, ...style } as CSSProperties}
    >
      {children}
    </div>
  );
}
