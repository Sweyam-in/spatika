import * as React from "react";
import { Slot } from "../lib/slot";
import { cn } from "../lib/cn";

export type BoxProps = React.ComponentPropsWithoutRef<"div"> & {
  component?: React.ElementType;
  asChild?: boolean;
};

/**
 * Generic layout primitive. Prefer Stack / Grid / Paper for structured layouts.
 */
const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ className, component = "div", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : component;
    return <Comp ref={ref} data-slot="box" className={cn(className)} {...props} />;
  },
);
Box.displayName = "Box";

const gapClass: Record<number, string> = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
};

const spanClass: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
};

export type GridProps = React.ComponentPropsWithoutRef<"div"> & {
  container?: boolean;
  item?: boolean;
  spacing?: number;
  columns?: 12;
  xs?: number | "auto";
  sm?: number | "auto";
  md?: number | "auto";
  lg?: number | "auto";
  xl?: number | "auto";
  size?: number | "grow";
};

function spanFor(value?: number | "auto" | "grow") {
  if (value == null || value === "auto" || value === "grow") return undefined;
  return spanClass[value] ?? "col-span-12";
}

function prefixedSpan(prefix: string, value?: number | "auto") {
  if (typeof value !== "number") return undefined;
  const base = spanClass[value];
  if (!base) return undefined;
  return base.replace("col-span", `${prefix}:col-span`);
}

/**
 * 12-column CSS grid. Use `container` on the parent and breakpoint spans on items.
 */
function Grid({
  container,
  item: _item,
  spacing = 2,
  columns: _columns = 12,
  xs,
  sm,
  md,
  lg,
  xl,
  size,
  className,
  ...props
}: GridProps) {
  const span = spanFor(typeof size === "number" ? size : xs);
  return (
    <div
      data-slot="grid"
      data-container={container ? "" : undefined}
      data-item={_item || !container ? "" : undefined}
      className={cn(
        container && "grid grid-cols-12",
        container && (gapClass[spacing] ?? "gap-2"),
        !container && (span ?? (size === "grow" ? "col-span-12" : "col-span-12")),
        prefixedSpan("sm", sm),
        prefixedSpan("md", md),
        prefixedSpan("lg", lg),
        prefixedSpan("xl", xl),
        className,
      )}
      {...props}
    />
  );
}
Grid.displayName = "Grid";

export { Box, Grid };
