import * as React from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "../lib/cn";

export type FeatureCardProps = {
  title: ReactNode;
  /** One or two sentences. Longer than that belongs on its own page. */
  description?: ReactNode;
  /** Usually a lucide icon or an `IconTile`. */
  icon?: ReactNode;
  /** Trailing link — "Read the guide". */
  action?: ReactNode;
  /** Screenshot, chart or illustration above the copy. */
  media?: ReactNode;
  /**
   * `plain` — copy only · `card` — solid surface · `outline` — hairline only ·
   * `rail` — accent rail on the leading edge (the prism motif).
   */
  variant?: "plain" | "card" | "outline" | "rail";
  /** Wraps the card in a link and adds hover lift. */
  href?: string;
  as?: "div" | "li" | "article";
  className?: string;
  children?: ReactNode;
};

/** One feature: icon, title, a sentence of copy, and an optional link. */
export function FeatureCard({
  title,
  description,
  icon,
  action,
  media,
  variant = "plain",
  href,
  as: Comp = "div",
  className,
  children,
}: FeatureCardProps) {
  const body = (
    <>
      {media ? <div className="mb-3 min-w-0 overflow-hidden rounded-[var(--spk-radius-sm)]">{media}</div> : null}
      {icon ? (
        <span data-slot="feature-card-icon" className="mb-1 inline-flex text-accent-text [&_svg]:size-5">
          {icon}
        </span>
      ) : null}
      <h3 data-slot="feature-card-title" className="text-title-2 text-fg">
        {title}
      </h3>
      {description ? <p className="text-body text-fg-secondary">{description}</p> : null}
      {children}
      {action ? <div className="mt-auto pt-2">{action}</div> : null}
    </>
  );

  const classes = cn("spk-mk-feature", className);
  const shared = {
    "data-slot": "feature-card",
    "data-variant": variant,
    "data-interactive": href ? "true" : undefined,
  } as const;

  if (href) {
    return (
      <a href={href} className={cn(classes, "no-underline")} {...shared}>
        {body}
      </a>
    );
  }

  const Tag = Comp as "div";
  return (
    <Tag className={classes} {...shared}>
      {body}
    </Tag>
  );
}

export type FeatureGridProps = {
  children: ReactNode;
  /** Columns at the large breakpoint. Always one column on phones. */
  columns?: 2 | 3 | 4;
  /** Render as a list — use with `FeatureCard as="li"` when the features are an inventory. */
  as?: "div" | "ul";
  className?: string;
  style?: CSSProperties;
};

const columnClass: Record<NonNullable<FeatureGridProps["columns"]>, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

/** Responsive grid of `FeatureCard`s — the standard "what you get" block. */
export function FeatureGrid({ children, columns = 3, as: Comp = "div", className, style }: FeatureGridProps) {
  const Tag = Comp as "div";
  return (
    <Tag
      data-slot="feature-grid"
      data-columns={columns}
      className={cn("grid gap-x-6 gap-y-8", columnClass[columns], Comp === "ul" && "list-none p-0", className)}
      style={style}
    >
      {children}
    </Tag>
  );
}
