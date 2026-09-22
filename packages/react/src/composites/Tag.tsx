import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

/**
 * Static metadata label. Pill-shaped by design — tags, like avatars, are where Spatika
 * allows full rounding. Hues derive from status / visualization tokens so they work in every theme.
 */
const tagVariants = cva("inline-flex items-center gap-1 whitespace-nowrap rounded-full border font-medium", {
  variants: {
    variant: {
      default: "border-line bg-surface-subtle text-fg-secondary",
      primary: "border-transparent bg-accent-muted text-accent-text",
      outline: "border-line bg-transparent text-fg",
      muted: "border-transparent bg-surface-sunken text-fg-secondary",
      red: "spk-tag--red border-transparent bg-danger-muted text-danger-text",
      green: "spk-tag--green border-transparent bg-success-muted text-success-text",
      orange: "spk-tag--orange border-transparent bg-warning-muted text-warning-text",
      blue: "spk-tag--blue border-transparent bg-info-muted text-info-text",
      purple:
        "spk-tag--purple border-transparent bg-[color-mix(in_oklab,var(--spk-viz-4)_13%,transparent)] text-[color-mix(in_oklab,var(--spk-viz-4)_72%,var(--spk-text-primary))]",
      cyan: "spk-tag--cyan border-transparent bg-[color-mix(in_oklab,var(--spk-viz-2)_13%,transparent)] text-[color-mix(in_oklab,var(--spk-viz-2)_68%,var(--spk-text-primary))]",
    },
    size: {
      sm: "h-5 px-2 text-caption",
      md: "h-6 px-2.5 text-body-sm",
      lg: "h-7 px-3 text-body",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "sm",
  },
});

export type TagProps = React.ComponentProps<"span"> & VariantProps<typeof tagVariants>;

const Tag = React.forwardRef<HTMLSpanElement, TagProps>(({ className, variant, size, ...props }, ref) => (
  <span ref={ref} data-slot="tag" className={cn(tagVariants({ variant, size }), className)} {...props} />
));
Tag.displayName = "Tag";

export { Tag, tagVariants };
