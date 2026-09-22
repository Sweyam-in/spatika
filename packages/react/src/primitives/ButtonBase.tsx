import * as React from "react";
import { Slot } from "../lib/slot";
import { cn } from "../lib/cn";

export type ButtonBaseProps = React.ComponentPropsWithoutRef<"button"> & {
  asChild?: boolean;
  focusRipple?: boolean;
};

/**
 * Unstyled pressable — MUI ButtonBase analogue. Use Button / IconButton for styled actions.
 */
const ButtonBase = React.forwardRef<HTMLButtonElement, ButtonBaseProps>(
  ({ className, asChild = false, focusRipple: _focusRipple, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : "button"}
        data-slot="button-base"
        className={cn(
          "inline-flex cursor-pointer items-center justify-center outline-none select-none",
          "focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
          "active:scale-[0.98]",
          className,
        )}
        {...props}
      />
    );
  },
);
ButtonBase.displayName = "ButtonBase";

export { ButtonBase };
