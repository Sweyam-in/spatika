import * as React from "react";
import { cn } from "../lib/cn";

const gapClass: Record<number, string> = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
};

export type StackProps = React.ComponentPropsWithoutRef<"div"> & {
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  spacing?: number;
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  wrap?: boolean;
  divider?: React.ReactNode;
};

const directionClass = {
  row: "flex-row",
  column: "flex-col",
  "row-reverse": "flex-row-reverse",
  "column-reverse": "flex-col-reverse",
} as const;

const alignClass = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
} as const;

const justifyClass = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
} as const;

function Stack({
  direction = "column",
  spacing = 2,
  align,
  justify,
  wrap = false,
  divider,
  className,
  children,
  ...props
}: StackProps) {
  const items = React.Children.toArray(children).filter(Boolean);
  const gap = gapClass[spacing] ?? "gap-2";

  return (
    <div
      data-slot="stack"
      className={cn(
        "flex",
        directionClass[direction],
        align && alignClass[align],
        justify && justifyClass[justify],
        wrap && "flex-wrap",
        !divider && gap,
        className,
      )}
      {...props}
    >
      {divider
        ? items.flatMap((child, index) =>
            index === 0 ? [child] : [divider, child],
          )
        : items}
    </div>
  );
}
Stack.displayName = "Stack";

export { Stack };
