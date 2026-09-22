import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const typographyVariants = cva("text-fg", {
  variants: {
    variant: {
      h1: "text-display",
      h2: "text-[2rem] leading-tight font-semibold tracking-[-0.025em]",
      h3: "text-title-1",
      h4: "text-[1.25rem] leading-snug font-semibold tracking-[-0.015em]",
      h5: "text-title-2",
      h6: "text-title-3",
      subtitle1: "text-body-lg font-medium",
      subtitle2: "text-body font-medium",
      body1: "text-body-lg",
      body2: "text-body",
      caption: "text-caption text-fg-tertiary",
      overline: "text-overline uppercase text-fg-tertiary",
    },
    color: {
      default: "",
      muted: "text-fg-secondary",
      primary: "text-accent-text",
      inherit: "text-inherit",
    },
    align: {
      inherit: "",
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
    gutterBottom: {
      true: "mb-2",
      false: "",
    },
    noWrap: {
      true: "truncate",
      false: "",
    },
  },
  defaultVariants: {
    variant: "body1",
    color: "default",
    align: "inherit",
    gutterBottom: false,
    noWrap: false,
  },
});

const variantElement: Record<
  NonNullable<VariantProps<typeof typographyVariants>["variant"]>,
  React.ElementType
> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  subtitle1: "h6",
  subtitle2: "h6",
  body1: "p",
  body2: "p",
  caption: "span",
  overline: "span",
};

export type TypographyProps = Omit<React.ComponentPropsWithoutRef<"p">, "color"> &
  VariantProps<typeof typographyVariants> & {
    component?: React.ElementType;
  };

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant = "body1", color, align, gutterBottom, noWrap, component, ...props }, ref) => {
    const Comp = (component ?? variantElement[variant ?? "body1"]) as React.ElementType;
    return (
      <Comp
        ref={ref}
        data-slot="typography"
        data-variant={variant}
        className={cn(typographyVariants({ variant, color, align, gutterBottom, noWrap }), className)}
        {...props}
      />
    );
  },
);
Typography.displayName = "Typography";

export { Typography, typographyVariants };
