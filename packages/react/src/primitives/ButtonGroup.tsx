import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { buttonVariants } from "./Button";

const buttonGroupVariants = cva("inline-flex isolate", {
  variants: {
    orientation: {
      horizontal: "flex-row",
      vertical: "flex-col",
    },
    fullWidth: {
      true: "flex w-full",
      false: "",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    fullWidth: false,
  },
});

export type ButtonGroupProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof buttonGroupVariants> & {
    variant?: VariantProps<typeof buttonVariants>["variant"];
    size?: VariantProps<typeof buttonVariants>["size"];
    disabled?: boolean;
  };

/**
 * Connected cluster of buttons — first/last corners stay rounded.
 */
const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    {
      className,
      orientation = "horizontal",
      fullWidth = false,
      variant,
      size,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const items = React.Children.toArray(children);
    const vertical = orientation === "vertical";

    return (
      <div
        ref={ref}
        role="group"
        data-slot="button-group"
        data-orientation={orientation}
        className={cn(buttonGroupVariants({ orientation, fullWidth }), className)}
        {...props}
      >
        {items.map((child, index) => {
          if (!React.isValidElement<{
            className?: string;
            disabled?: boolean;
            variant?: ButtonGroupProps["variant"];
            size?: ButtonGroupProps["size"];
          }>(child)) {
            return child;
          }
          const first = index === 0;
          const last = index === items.length - 1;
          return React.cloneElement(child, {
            disabled: disabled || child.props.disabled,
            variant: child.props.variant ?? variant ?? undefined,
            size: child.props.size ?? size ?? undefined,
            className: cn(
              child.props.className,
              "focus-visible:z-10",
              vertical
                ? cn(!first && "-mt-px rounded-t-none", !last && "rounded-b-none")
                : cn(!first && "-ml-px rounded-l-none", !last && "rounded-r-none"),
              fullWidth && "flex-1",
            ),
          });
        })}
      </div>
    );
  },
);
ButtonGroup.displayName = "ButtonGroup";

export { ButtonGroup, buttonGroupVariants };
