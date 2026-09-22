import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import {
  surfaceDetailClass,
  surfacePrimaryClass,
  surfaceSecondaryClass,
  surfaceTertiaryClass,
} from "../lib/surfaces";

const surfaceCardVariants = cva("", {
  variants: {
    tone: {
      primary: surfacePrimaryClass,
      secondary: surfaceSecondaryClass,
      detail: surfaceDetailClass,
      tertiary: surfaceTertiaryClass,
    },
  },
  defaultVariants: {
    tone: "primary",
  },
});

export type SurfaceCardProps = React.ComponentProps<"div"> & VariantProps<typeof surfaceCardVariants>;

/**
 * Hierarchy surface: primary (raised) → secondary (subtle) → detail (default) → tertiary (dashed).
 * Prefer `<Card surface>` in new code.
 */
const SurfaceCard = React.forwardRef<HTMLDivElement, SurfaceCardProps>(({ className, tone, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="surface-card"
    data-tone={tone ?? "primary"}
    className={cn(surfaceCardVariants({ tone }), className)}
    {...props}
  />
));
SurfaceCard.displayName = "SurfaceCard";

export { SurfaceCard, surfaceCardVariants };
