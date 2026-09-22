import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "../lib/slot";
import { cn } from "../lib/cn";

const linkVariants = cva(
  "inline font-medium underline-offset-4 outline-none transition-colors focus-visible:ring-ring/50 focus-visible:ring-[3px] rounded-sm",
  {
    variants: {
      color: {
        primary: "text-primary hover:text-primary/80",
        inherit: "text-inherit hover:text-primary",
        muted: "text-muted-foreground hover:text-foreground",
      },
      underline: {
        always: "underline",
        hover: "hover:underline",
        none: "no-underline",
      },
    },
    defaultVariants: {
      color: "primary",
      underline: "hover",
    },
  },
);

export type LinkProps = Omit<React.ComponentPropsWithoutRef<"a">, "color"> &
  VariantProps<typeof linkVariants> & {
    asChild?: boolean;
  };

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, color, underline, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "a";
    return (
      <Comp
        ref={ref}
        data-slot="link"
        className={cn(linkVariants({ color, underline }), className)}
        {...props}
      />
    );
  },
);
Link.displayName = "Link";

export { Link, linkVariants };
