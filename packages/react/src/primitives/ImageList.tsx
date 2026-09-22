import * as React from "react";
import { cn } from "../lib/cn";

export type ImageListProps = React.ComponentPropsWithoutRef<"ul"> & {
  cols?: number;
  gap?: number;
  variant?: "standard" | "quilted" | "masonry";
  rowHeight?: number;
};

function ImageList({
  cols = 2,
  gap = 8,
  variant = "standard",
  rowHeight = 180,
  className,
  style,
  children,
  ...props
}: ImageListProps) {
  return (
    <ul
      data-slot="image-list"
      data-variant={variant}
      className={cn(
        "m-0 w-full list-none p-0",
        variant === "masonry"
          ? "block [&>[data-slot=image-list-item]]:mb-2 [&>[data-slot=image-list-item]]:h-auto"
          : "grid",
        className,
      )}
      style={{
        gap,
        ...(variant === "masonry"
          ? { columnCount: cols, columnGap: gap }
          : {
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gridAutoRows: rowHeight,
            }),
        ...style,
      }}
      {...props}
    >
      {children}
    </ul>
  );
}
ImageList.displayName = "ImageList";

export type ImageListItemProps = React.ComponentPropsWithoutRef<"li"> & {
  cols?: number;
  rows?: number;
};

function ImageListItem({ cols = 1, rows = 1, className, style, ...props }: ImageListItemProps) {
  return (
    <li
      data-slot="image-list-item"
      className={cn(
        "relative h-full min-h-0 overflow-hidden rounded-xl [&_img]:absolute [&_img]:inset-0 [&_img]:size-full [&_img]:object-cover",
        className,
      )}
      style={{
        gridColumn: `span ${cols}`,
        gridRow: `span ${rows}`,
        breakInside: "avoid",
        ...style,
      }}
      {...props}
    />
  );
}
ImageListItem.displayName = "ImageListItem";

export type ImageListItemBarProps = React.ComponentPropsWithoutRef<"div"> & {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actionIcon?: React.ReactNode;
  position?: "bottom" | "top";
};

function ImageListItemBar({
  title,
  subtitle,
  actionIcon,
  position = "bottom",
  className,
  ...props
}: ImageListItemBarProps) {
  return (
    <div
      data-slot="image-list-item-bar"
      className={cn(
        "absolute inset-x-0 z-10 flex items-end justify-between gap-2 p-3 text-white",
        position === "top"
          ? "top-0 bg-gradient-to-b from-black/70 to-transparent"
          : "bottom-0 bg-gradient-to-t from-black/70 to-transparent",
        className,
      )}
      {...props}
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-bold">{title}</div>
        {subtitle ? <div className="truncate text-xs opacity-80">{subtitle}</div> : null}
      </div>
      {actionIcon}
    </div>
  );
}
ImageListItemBar.displayName = "ImageListItemBar";

export { ImageList, ImageListItem, ImageListItemBar };
