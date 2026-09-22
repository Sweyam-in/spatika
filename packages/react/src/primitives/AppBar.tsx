import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const appBarVariants = cva("z-40 flex w-full items-center border-b border-border/50", {
  variants: {
    position: {
      static: "relative",
      sticky: "sticky top-0",
      fixed: "fixed inset-x-0 top-0",
      relative: "relative",
    },
    color: {
      default: "glass-header border-b border-line-subtle text-fg",
      primary: "bg-primary text-primary-foreground border-transparent",
      transparent: "border-transparent bg-transparent",
    },
  },
  defaultVariants: {
    position: "sticky",
    color: "default",
  },
});

export type AppBarProps = Omit<React.ComponentPropsWithoutRef<"header">, "color"> &
  VariantProps<typeof appBarVariants>;

function AppBar({ className, position, color, ...props }: AppBarProps) {
  return (
    <header
      data-slot="app-bar"
      className={cn(appBarVariants({ position, color }), className)}
      {...props}
    />
  );
}
AppBar.displayName = "AppBar";

export { AppBar, appBarVariants };
