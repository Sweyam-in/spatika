import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "../lib/slot";
import { cn } from "../lib/cn";

const fabVariants = cva(
  "inline-flex items-center justify-center gap-2 font-bold shadow-md outline-none transition-[color,background-color,box-shadow,transform] duration-150 focus-visible:ring-ring/50 focus-visible:ring-[3px] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        circular: "rounded-full",
        extended: "rounded-full px-5",
      },
      color: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        glass: "spk-glass text-fg",
        default: "bg-card text-foreground border border-border/50 hover:bg-muted/60",
      },
      size: {
        sm: "size-10 text-sm",
        md: "size-14 text-base",
        lg: "size-16 text-lg",
      },
    },
    compoundVariants: [
      { variant: "extended", size: "sm", className: "h-10 w-auto min-w-10" },
      { variant: "extended", size: "md", className: "h-12 w-auto min-w-12 size-auto" },
      { variant: "extended", size: "lg", className: "h-14 w-auto min-w-14 size-auto" },
    ],
    defaultVariants: {
      variant: "circular",
      color: "primary",
      size: "md",
    },
  },
);

export type FabProps = Omit<React.ComponentPropsWithoutRef<"button">, "color"> &
  VariantProps<typeof fabVariants> & {
    asChild?: boolean;
  };

/**
 * Floating action button. Use `variant="extended"` for a labeled FAB.
 */
const Fab = React.forwardRef<HTMLButtonElement, FabProps>(
  ({ className, variant, color, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : "button"}
        data-slot="fab"
        className={cn(fabVariants({ variant, color, size }), className)}
        {...props}
      />
    );
  },
);
Fab.displayName = "Fab";

export { Fab, fabVariants };
