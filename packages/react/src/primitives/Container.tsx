import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const containerVariants = cva("mx-auto w-full", {
  variants: {
    maxWidth: {
      sm: "max-w-screen-sm",
      md: "max-w-screen-md",
      lg: "max-w-screen-lg",
      xl: "max-w-screen-xl",
      full: "max-w-none",
    },
    disableGutters: {
      true: "px-0",
      false: "px-4 sm:px-6",
    },
  },
  defaultVariants: {
    maxWidth: "lg",
    disableGutters: false,
  },
});

export type ContainerProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof containerVariants>;

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, maxWidth, disableGutters, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="container"
      className={cn(containerVariants({ maxWidth, disableGutters }), className)}
      {...props}
    />
  ),
);
Container.displayName = "Container";

export { Container, containerVariants };
