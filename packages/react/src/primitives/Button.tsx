import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "../lib/slot";
import { cn } from "../lib/cn";

/**
 * Button recipe. Visual states live in `@spatika/tokens` (`.spk-btn*`), so the same
 * classes work outside React and every button shares hover / focus / pressed behaviour.
 */
const buttonVariants = cva("spk-btn", {
  variants: {
    variant: {
      default: "spk-btn--primary",
      primary: "spk-btn--primary",
      secondary: "spk-btn--secondary",
      outline: "spk-btn--outline",
      ghost: "spk-btn--ghost",
      soft: "spk-btn--soft",
      destructive: "spk-btn--destructive",
      "destructive-soft": "spk-btn--destructive-soft",
      link: "spk-btn--link",
      /** Translucent material — for controls floating over imagery or media. */
      glass: "spk-btn--glass",
      /** @deprecated 2.0 — renders as `primary`. Gradients are no longer part of the system. */
      gradient: "spk-btn--primary",
    },
    size: {
      xs: "spk-btn--xs",
      sm: "spk-btn--sm",
      default: "",
      md: "",
      lg: "spk-btn--lg",
      xl: "spk-btn--xl",
      /** Mobile-first ≥44px touch target */
      touch: "spk-btn--touch h-11 min-h-11",
      icon: "spk-btn--icon",
      "icon-xs": "spk-btn--icon-xs",
      "icon-sm": "spk-btn--icon-sm",
      "icon-lg": "spk-btn--icon-lg",
      "icon-touch": "spk-btn--icon-touch",
    },
    block: {
      true: "spk-btn--block",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    block: false,
  },
});

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Shows a spinner, sets `aria-busy`, and blocks interaction. */
    loading?: boolean;
    /** Icon rendered before the label (replaced by the spinner while loading). */
    leadingIcon?: React.ReactNode;
    /** Icon rendered after the label. */
    trailingIcon?: React.ReactNode;
  };

function ButtonSpinner() {
  return (
    <svg className="spk-btn-spinner" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
      <path d="M14.25 8A6.25 6.25 0 0 0 8 1.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      block,
      asChild = false,
      loading = false,
      leadingIcon,
      trailingIcon,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = cn(buttonVariants({ variant, size, block }), className);

    if (asChild) {
      return (
        <Slot
          ref={ref}
          data-slot="button"
          data-variant={variant ?? "default"}
          className={classes}
          aria-disabled={disabled || loading || undefined}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        data-slot="button"
        data-variant={variant ?? "default"}
        data-loading={loading || undefined}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        className={classes}
        {...props}
      >
        {loading ? <ButtonSpinner /> : leadingIcon}
        {children}
        {trailingIcon}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps };
