import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "../lib/slot";
import { cn } from "../lib/cn";

const iconButtonVariants = cva("spk-btn", {
  variants: {
    variant: {
      ghost: "spk-btn--ghost text-fg-secondary hover:text-fg",
      secondary: "spk-btn--secondary",
      outline: "spk-btn--outline",
      soft: "spk-btn--soft",
      filled: "spk-btn--primary",
      primary: "spk-btn--primary",
      destructive: "spk-btn--destructive-soft",
      /** Translucent material for controls over imagery. */
      glass: "spk-btn--glass",
    },
    size: {
      xs: "spk-btn--icon-xs",
      sm: "spk-btn--icon-sm",
      md: "spk-btn--icon",
      lg: "spk-btn--icon-lg",
      touch: "spk-btn--icon-touch size-11",
    },
    shape: {
      rounded: "",
      circular: "spk-btn--circle",
    },
  },
  defaultVariants: {
    variant: "ghost",
    size: "md",
    shape: "rounded",
  },
});

export type IconButtonProps = React.ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof iconButtonVariants> & {
    asChild?: boolean;
  };

/**
 * Icon-only control. Always pass `aria-label` (or a visually hidden label child).
 */
const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, shape, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : "button"}
        data-slot="icon-button"
        className={cn(iconButtonVariants({ variant, size, shape }), className)}
        {...props}
      />
    );
  },
);
IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };
