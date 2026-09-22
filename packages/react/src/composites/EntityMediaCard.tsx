import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { coverTitleClass } from "../lib/cover-chrome";
import { getCoverPattern } from "../lib/cover-pattern";
import { CoverPattern } from "./CoverPattern";

export type EntityMediaCardProps = {
  title: string;
  subtitle?: string;
  statusLine?: string;
  imageUrl?: string;
  hideImage?: boolean;
  /** Initials when no image */
  fallbackLabel?: string;
  tags?: ReactNode;
  overlays?: ReactNode;
  menu?: ReactNode;
  meta?: ReactNode;
  href?: string;
  onClick?: () => void;
  size?: "large" | "small" | "compact";
  orientation?: "stack" | "row";
  className?: string;
  imageClassName?: string;
};

/**
 * Entity card with photo (or generated cover + initials) — contact / album tile.
 */
export function EntityMediaCard({
  title,
  subtitle,
  statusLine,
  imageUrl,
  hideImage,
  fallbackLabel,
  tags,
  overlays,
  menu,
  meta,
  href,
  onClick,
  size = "large",
  orientation = "stack",
  className,
  imageClassName,
}: EntityMediaCardProps) {
  const Comp: "a" | "button" | "div" = href ? "a" : onClick ? "button" : "div";
  const initials =
    fallbackLabel ||
    title
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") ||
    "?";
  const scene = getCoverPattern({ seed: title, hue: 210 });

  const photoAspect =
    orientation === "row"
      ? "h-full min-h-[6.5rem]"
      : size === "compact"
        ? "aspect-square"
        : "aspect-[4/3]";

  return (
    <Comp
      href={href}
      type={onClick && !href ? "button" : undefined}
      onClick={onClick}
      data-slot="entity-media-card"
      data-size={size}
      data-orientation={orientation}
      className={cn(
        "group flex h-full min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card text-left shadow-md transition-[transform,border-color] duration-200",
        " hover:border-primary/25",
        orientation === "row" ? "flex-row items-stretch" : "flex-col",
        className,
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-muted",
          orientation === "row" ? "w-[38%] min-w-[6.5rem] max-w-[9.5rem]" : "w-full",
          photoAspect,
          imageClassName,
        )}
      >
        {!hideImage && imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <>
            <CoverPattern seed={title} hue={210} />
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center text-2xl font-semibold",
                coverTitleClass(scene.headerInk),
              )}
            >
              {initials}
            </div>
          </>
        )}
        {overlays ? <div className="absolute inset-0 p-2">{overlays}</div> : null}
      </div>

      <div
        className={cn(
          "relative flex min-w-0 flex-1 flex-col justify-center bg-card",
          size === "compact" ? "gap-1 p-2.5" : "gap-1 p-3 sm:p-3.5",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-bold tracking-tight group-hover:text-primary">{title}</h3>
            {subtitle ? (
              <p className="truncate text-xs font-medium text-muted-foreground">{subtitle}</p>
            ) : null}
            {statusLine ? (
              <p className="mt-0.5 text-caption font-medium text-fg-tertiary">
                {statusLine}
              </p>
            ) : null}
          </div>
          {menu}
        </div>
        {meta}
        {tags ? <div className="mt-auto flex flex-wrap gap-1 pt-1">{tags}</div> : null}
      </div>
    </Comp>
  );
}
