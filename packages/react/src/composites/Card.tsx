import * as React from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../lib/cn";
import { surfaceClass, type SurfaceVariant } from "../lib/surfaces";

export type CardProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  children?: ReactNode;
  /**
   * Surface material. `default` is solid; `glass` is translucent and meant for
   * cards that float over imagery or media.
   */
  surface?: SurfaceVariant;
  /** @deprecated 2.0 — use `surface`. `panel` → default, `elevated` → raised. */
  variant?: "default" | "panel" | "subtle" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
  /** Adds hover / focus affordances for clickable cards. */
  interactive?: boolean;
  /** Selected state (accent border). */
  selected?: boolean;
  /** Render as another element (`section`, `article`, `li`). */
  as?: "div" | "section" | "article" | "li" | "aside";
};

const legacySurface: Record<NonNullable<CardProps["variant"]>, SurfaceVariant> = {
  default: "default",
  panel: "default",
  subtle: "subtle",
  elevated: "raised",
};

const paddingClass = {
  none: "p-0",
  sm: "p-3",
  md: "p-[var(--spk-card-p)]",
  lg: "p-6",
} as const;

/** Container for a discrete object (an account, a chart, a record). Sections of a page do not need a card. */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { children, className, surface, variant, padding = "md", interactive, selected, as = "div", ...props },
  ref,
) {
  const Comp = as as "div";
  const resolved = surface ?? (variant ? legacySurface[variant] : "default");
  return (
    <Comp
      ref={ref}
      data-slot="card"
      data-surface={resolved}
      data-interactive={interactive ? "true" : undefined}
      data-selected={selected ? "true" : undefined}
      tabIndex={interactive && props.onClick && props.tabIndex == null ? 0 : props.tabIndex}
      className={cn(surfaceClass(resolved), "min-w-0 overflow-hidden", paddingClass[padding], className)}
      {...props}
    >
      {children}
    </Comp>
  );
});

export function CardHeader({
  className,
  children,
  action,
}: {
  className?: string;
  children: ReactNode;
  /** Trailing control(s) aligned to the title row. */
  action?: ReactNode;
}) {
  return (
    <div data-slot="card-header" className={cn("mb-3 flex items-start justify-between gap-3", className)}>
      <div className="min-w-0 flex-1">{children}</div>
      {action ? <div className="-my-1 flex shrink-0 items-center gap-1">{action}</div> : null}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  as: Comp = "h3",
}: {
  className?: string;
  children: ReactNode;
  as?: "h2" | "h3" | "h4" | "p";
}) {
  return (
    <Comp data-slot="card-title" className={cn("text-title-3 text-fg", className)}>
      {children}
    </Comp>
  );
}

export function CardDescription({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <p data-slot="card-description" className={cn("mt-0.5 text-body-sm text-fg-secondary", className)}>
      {children}
    </p>
  );
}

export function CardContent({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div data-slot="card-content" className={cn("min-w-0", className)}>
      {children}
    </div>
  );
}

export function CardActionArea({ className, children, ...props }: ComponentPropsWithoutRef<"button">) {
  return (
    <button
      type="button"
      data-slot="card-action-area"
      className={cn(
        "block w-full rounded-[inherit] text-left outline-none transition-colors duration-[var(--spk-duration-fast)]",
        "hover:bg-hover focus-visible:shadow-[var(--spk-focus-ring)]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function CardMedia({
  className,
  component = "img",
  image,
  src,
  alt,
  height = 160,
  ...props
}: ComponentPropsWithoutRef<"img"> & {
  component?: "img" | "div";
  image?: string;
  height?: number;
}) {
  const Comp = component;
  return (
    <Comp
      data-slot="card-media"
      src={component === "img" ? (src ?? image) : undefined}
      alt={alt}
      className={cn("w-full object-cover", component === "div" && "bg-surface-sunken", className)}
      style={{
        height,
        ...(component === "div" && image ? { backgroundImage: `url(${image})`, backgroundSize: "cover" } : undefined),
      }}
      {...(props as ComponentPropsWithoutRef<"img">)}
    />
  );
}

export function CardFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      data-slot="card-footer"
      className={cn("mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-line-subtle pt-3", className)}
    >
      {children}
    </div>
  );
}
