import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const paperVariants = cva("text-fg", {
  variants: {
    variant: {
      elevation: "bg-surface-raised",
      outlined: "border border-line bg-surface",
      glass: "spk-glass",
    },
    square: {
      true: "rounded-none",
      false: "rounded-[var(--spk-radius-md)]",
    },
  },
  defaultVariants: {
    variant: "elevation",
    square: false,
  },
});

export type PaperProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof paperVariants> & {
    /** 0–3. Ignored when variant is outlined. */
    elevation?: 0 | 1 | 2 | 3;
  };

const elevationClass: Record<NonNullable<PaperProps["elevation"]>, string> = {
  0: "shadow-none",
  1: "shadow-sm",
  2: "shadow-md",
  3: "shadow-lg",
};

/** Low-level surface primitive. Prefer `Card` for structured content. */
const Paper = React.forwardRef<HTMLDivElement, PaperProps>(
  ({ className, variant, square, elevation = 1, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="paper"
      className={cn(
        paperVariants({ variant, square }),
        variant !== "outlined" && variant !== "glass" && elevationClass[elevation],
        className,
      )}
      {...props}
    />
  ),
);
Paper.displayName = "Paper";

export { Paper, paperVariants };
