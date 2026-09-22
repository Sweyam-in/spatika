import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "../lib/slot";
import { cn } from "../lib/cn";

/**
 * Compact status / count label. Squared corners (4px) distinguish badges from pill-shaped
 * {@link Tag}s. Pair colour with text or a `dot` so status is never colour-only.
 */
const badgeVariants = cva("spk-badge", {
  variants: {
    variant: {
      default: "spk-badge--solid",
      neutral: "spk-badge--neutral",
      secondary: "spk-badge--neutral",
      outline: "spk-badge--outline",
      accent: "spk-badge--accent",
      success: "spk-badge--success",
      warning: "spk-badge--warning",
      danger: "spk-badge--danger",
      destructive: "spk-badge--danger-solid",
      info: "spk-badge--info",
      /** 1.x alias of `warning`. */
      warm: "spk-badge--warning",
      /** 1.x alias of `accent`. */
      highlight: "spk-badge--accent",
    },
    size: {
      sm: "",
      md: "spk-badge--lg",
    },
    shape: {
      square: "",
      pill: "spk-badge--pill",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "sm",
    shape: "square",
  },
});

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
    /** Leading status dot in the badge colour. */
    dot?: boolean;
  };

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, shape, asChild = false, dot = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "span";
    return (
      <Comp
        ref={ref}
        data-slot="badge"
        data-variant={variant ?? "default"}
        className={cn(badgeVariants({ variant, size, shape }), className)}
        {...props}
      >
        {dot && !asChild ? <span className="spk-badge-dot" aria-hidden /> : null}
        {children}
      </Comp>
    );
  },
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
export type { BadgeProps };
