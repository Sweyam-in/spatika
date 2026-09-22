import * as React from "react";
import { useControllableState } from "../lib/use-controllable-state";
import { cn } from "../lib/cn";

type SwitchProps = Omit<React.ComponentPropsWithoutRef<"button">, "onChange" | "value"> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: "sm" | "md" | "lg";
};

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    { className, checked: checkedProp, defaultChecked, onCheckedChange, disabled, onClick, size = "md", ...props },
    ref,
  ) => {
    const [checked, setChecked] = useControllableState<boolean>({
      prop: checkedProp,
      defaultProp: defaultChecked ?? false,
      onChange: onCheckedChange,
    });

    const isChecked = !!checked;

    return (
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        data-state={isChecked ? "checked" : "unchecked"}
        data-slot="switch"
        disabled={disabled}
        ref={ref}
        className={cn(
          "spk-switch peer",
          size === "sm" && "spk-switch--sm",
          size === "lg" && "spk-switch--lg",
          className,
        )}
        {...props}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || disabled) return;
          setChecked(!isChecked);
        }}
      >
        <span
          data-slot="switch-thumb"
          data-state={isChecked ? "checked" : "unchecked"}
          className="spk-switch-thumb"
        />
      </button>
    );
  },
);
Switch.displayName = "Switch";

export { Switch };
export type { SwitchProps };
