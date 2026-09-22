/**
 * EntityCard — quiet glass list-row / tile baseline.
 *
 * Use for directory rows, trash items, and other entity summaries that need
 * consistent glass surface, radius, and padding without feature-specific chrome.
 */
import type { ElementType, HTMLAttributes } from "react";
import { cn } from "../lib/cn";

type EntityCardElement = "div" | "li" | "article" | "section" | "button" | "a";

export type EntityCardProps = HTMLAttributes<HTMLElement> & {
  /** Rendered HTML element. Defaults to `div`. */
  as?: EntityCardElement;
  /** Slightly denser padding for compact lists. */
  density?: "default" | "compact";
  /** Soft hover lift for interactive rows (navigation / selection). */
  interactive?: boolean;
  href?: string;
};

/**
 * Glass surface wrapper for entity list items.
 */
export function EntityCard({
  as,
  density = "default",
  interactive = false,
  className,
  children,
  href,
  ...rest
}: EntityCardProps) {
  const Component = (as ?? (href ? "a" : "div")) as ElementType;

  return (
    <Component
      {...(href ? { href } : {})}
      data-slot="entity-card"
      className={cn(
        "entity-card",
        density === "compact" && "entity-card-compact",
        interactive && "entity-card-interactive",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

export type EntityCardTitleProps = HTMLAttributes<HTMLParagraphElement>;

/** Primary title inside an EntityCard. */
export function EntityCardTitle({ className, ...props }: EntityCardTitleProps) {
  return (
    <p
      data-slot="entity-card-title"
      className={cn(
        "truncate text-sm font-semibold text-foreground sm:text-[15px]",
        className,
      )}
      {...props}
    />
  );
}

export type EntityCardMetaProps = HTMLAttributes<HTMLParagraphElement>;

/** Secondary / muted line under the title. */
export function EntityCardMeta({ className, ...props }: EntityCardMetaProps) {
  return (
    <p
      data-slot="entity-card-meta"
      className={cn(
        "mt-0.5 line-clamp-2 text-xs text-muted-foreground sm:text-[13px]",
        className,
      )}
      {...props}
    />
  );
}

/** Compact type / status chip for entity cards. */
export function EntityCardChip({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="entity-card-chip"
      className={cn(
        "inline-flex shrink-0 rounded-full border border-border/50 bg-muted/40 px-1.5 py-0.5 text-caption font-medium text-fg-tertiary",
        className,
      )}
      {...props}
    />
  );
}
