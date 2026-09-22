import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

/**
 * @deprecated 2.0 — use `<Card surface="…">`.
 *
 * Kept for compatibility. Variants now map onto the calm surface model; only
 * `variant="glass"` renders translucent material.
 */
const glassCardVariants = cva("spk-surface relative overflow-hidden", {
  variants: {
    variant: {
      default: "spk-surface--default",
      panel: "spk-surface--raised",
      subtle: "spk-surface--subtle",
      header: "glass-header rounded-none",
      menu: "spk-overlay",
      app: "spk-surface--default",
      glass: "spk-surface--glass",
    },
    padding: {
      none: "p-0",
      sm: "p-3",
      md: "p-[var(--spk-card-p)]",
      lg: "p-6",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
  },
});

export type GlassCardProps = React.ComponentProps<"div"> & VariantProps<typeof glassCardVariants>;

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="glass-card"
      data-variant={variant ?? "default"}
      className={cn(glassCardVariants({ variant, padding }), className)}
      {...props}
    />
  ),
);
GlassCard.displayName = "GlassCard";

export { GlassCard, glassCardVariants };
