import * as React from "react";
import { cn } from "../lib/cn";

export type ScrollAreaProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Restrict scrolling to one axis. Default `vertical`. */
  orientation?: "vertical" | "horizontal" | "both";
  /** Max height (vertical) — a number is pixels. */
  maxHeight?: number | string;
  /** Fade the top and bottom edges to hint at more content. */
  fade?: boolean;
};

/**
 * Native scroll container with thin, theme-coloured scrollbars and contained overscroll.
 * It stays a real scroller (wheel, touch, keyboard and find-in-page work) and becomes a
 * focusable region so keyboard users can scroll content that has no focusable children.
 */
const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ orientation = "vertical", maxHeight, fade, className, style, tabIndex, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="scroll-area"
      data-orientation={orientation}
      data-fade={fade || undefined}
      role={props["aria-label"] || props["aria-labelledby"] ? "region" : undefined}
      tabIndex={tabIndex ?? 0}
      className={cn("spk-scroll-area", className)}
      style={maxHeight != null ? { maxHeight, ...style } : style}
      {...props}
    />
  ),
);
ScrollArea.displayName = "ScrollArea";

export type AspectRatioProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Width / height, e.g. `16 / 9`. Default 16/9. */
  ratio?: number;
};

/** Reserves space for media before it loads, so images and embeds never shift the layout. */
const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = 16 / 9, className, style, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="aspect-ratio"
      className={cn("spk-aspect", className)}
      style={{ aspectRatio: String(ratio), ...style }}
      {...props}
    />
  ),
);
AspectRatio.displayName = "AspectRatio";

export { ScrollArea, AspectRatio };
