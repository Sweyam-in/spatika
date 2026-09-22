import * as React from "react";
import { cn } from "../lib/cn";

export type MasonryProps = React.ComponentPropsWithoutRef<"div"> & {
  columns?: number;
  spacing?: number;
};

/**
 * CSS multi-column masonry. Children should be block-level items.
 */
function Masonry({ columns = 3, spacing = 16, className, style, children, ...props }: MasonryProps) {
  return (
    <div
      data-slot="masonry"
      className={cn(className)}
      style={{
        columnCount: columns,
        columnGap: spacing,
        ...style,
      }}
      {...props}
    >
      {React.Children.map(children, (child) => (
        <div className="mb-4 break-inside-avoid">{child}</div>
      ))}
    </div>
  );
}
Masonry.displayName = "Masonry";

export { Masonry };
