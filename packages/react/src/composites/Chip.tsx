import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";
import { cn } from "../lib/cn";

const chipVariants = cva(
  [
    "inline-flex max-w-full items-center justify-center gap-1.5 border font-medium select-none touch-manipulation outline-none",
    "transition-[color,background-color,border-color] duration-[var(--spk-duration-fast)] ease-[var(--spk-ease-standard)]",
    "focus-visible:shadow-[var(--spk-focus-ring)] disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-3.5 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        /** Pill filter toggle. */
        filter: "h-7 rounded-full px-2.5 text-body-sm",
        /** Settings preference toggle. */
        preference: "h-8 rounded-[var(--spk-radius-sm)] px-3 text-body-sm",
        /** Layout mode (grid / list). */
        layout: "h-[var(--spk-control-h)] rounded-[var(--spk-radius-sm)] px-3 text-body",
      },
      active: {
        true: "border-accent-border bg-accent-muted text-accent-text",
        false: "border-line bg-surface text-fg-secondary hover:border-line-strong hover:text-fg",
      },
    },
    defaultVariants: {
      variant: "filter",
      active: false,
    },
  },
);

export type ChipProps = React.ComponentProps<"button"> &
  VariantProps<typeof chipVariants> & {
    /** Show a check mark when active (filter chips). */
    showCheck?: boolean;
  };

/** Toggleable chip for filters, preferences, and layout switches. */
const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, variant, active, type = "button", showCheck = false, children, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      data-slot="chip"
      data-variant={variant ?? "filter"}
      data-active={active ? "true" : "false"}
      aria-pressed={Boolean(active)}
      className={cn(chipVariants({ variant, active }), className)}
      {...props}
    >
      {showCheck && active ? <Check aria-hidden /> : null}
      {children}
    </button>
  ),
);
Chip.displayName = "Chip";

export { Chip, chipVariants };
