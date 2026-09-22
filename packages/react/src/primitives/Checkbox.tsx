import * as React from "react";
import { CheckIcon, MinusIcon } from "lucide-react";
import { useControllableState } from "../lib/use-controllable-state";
import { cn } from "../lib/cn";

type CheckedState = boolean | "indeterminate";

type CheckboxProps = Omit<React.ComponentPropsWithoutRef<"button">, "onChange" | "value"> & {
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  onCheckedChange?: (checked: CheckedState) => void;
};

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    { className, checked: checkedProp, defaultChecked, onCheckedChange, disabled, onClick, onKeyDown, ...props },
    ref,
  ) => {
    const [checked, setChecked] = useControllableState<CheckedState>({
      prop: checkedProp,
      defaultProp: defaultChecked ?? false,
      onChange: onCheckedChange,
    });

    const isChecked = checked === true;
    const isIndeterminate = checked === "indeterminate";

    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={isIndeterminate ? "mixed" : isChecked}
        data-state={isChecked ? "checked" : isIndeterminate ? "indeterminate" : "unchecked"}
        data-slot="checkbox"
        disabled={disabled}
        ref={ref}
        className={cn("spk-check peer", className)}
        {...props}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          // Checkboxes toggle on Space only; Enter should submit the surrounding form.
          if (event.key === "Enter") event.preventDefault();
        }}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || disabled) return;
          setChecked(isChecked || isIndeterminate ? false : true);
        }}
      >
        {isChecked ? (
          <CheckIcon data-slot="checkbox-indicator" aria-hidden />
        ) : isIndeterminate ? (
          <MinusIcon data-slot="checkbox-indicator" aria-hidden />
        ) : null}
      </button>
    );
  },
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
export type { CheckboxProps, CheckedState };
