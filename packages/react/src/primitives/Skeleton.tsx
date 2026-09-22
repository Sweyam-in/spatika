import * as React from "react";
import { cn } from "../lib/cn";

type SkeletonProps = React.ComponentProps<"div"> & {
  /** `text` renders a line at body height; `circle` for avatars. */
  shape?: "block" | "text" | "circle";
};

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, shape = "block", ...props }, ref) => (
    <div
      ref={ref}
      data-slot="skeleton"
      aria-hidden
      className={cn(
        "animate-shimmer",
        shape === "block" && "rounded-[var(--spk-radius-sm)]",
        shape === "text" && "h-3 rounded-[var(--spk-radius-xs)]",
        shape === "circle" && "rounded-full",
        className,
      )}
      {...props}
    />
  ),
);
Skeleton.displayName = "Skeleton";

export { Skeleton };
export type { SkeletonProps };
