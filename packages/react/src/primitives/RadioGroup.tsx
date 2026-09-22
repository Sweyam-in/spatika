import * as React from "react";
import { useControllableState } from "../lib/use-controllable-state";
import { cn } from "../lib/cn";

type RadioGroupContextValue = {
  value?: string;
  setValue: (value: string) => void;
  name?: string;
  disabled?: boolean;
};

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

type RadioGroupProps = Omit<React.ComponentPropsWithoutRef<"div">, "onChange" | "defaultValue"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
};

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    { className, value: valueProp, defaultValue, onValueChange, name, disabled, orientation = "vertical", onKeyDown, ...props },
    ref,
  ) => {
    const [value, setValue] = useControllableState<string>({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });

    return (
      <RadioGroupContext.Provider value={{ value, setValue: (next) => setValue(next), name, disabled }}>
        <div
          ref={ref}
          role="radiogroup"
          aria-orientation={orientation}
          data-slot="radio-group"
          className={cn(orientation === "horizontal" ? "flex flex-wrap gap-4" : "grid gap-2.5", className)}
          {...props}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented) return;
            const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"];
            if (!keys.includes(event.key)) return;
            const radios = Array.from(
              event.currentTarget.querySelectorAll<HTMLButtonElement>("[role=radio]:not(:disabled)"),
            );
            const index = radios.findIndex((radio) => radio === document.activeElement);
            if (index < 0) return;
            event.preventDefault();
            const step = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
            const next = radios[(index + step + radios.length) % radios.length];
            next?.focus();
            next?.click();
          }}
        />
      </RadioGroupContext.Provider>
    );
  },
);
RadioGroup.displayName = "RadioGroup";

type RadioGroupItemProps = Omit<React.ComponentPropsWithoutRef<"button">, "onChange" | "value"> & {
  value: string;
};

const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ className, value, disabled, onClick, ...props }, ref) => {
    const ctx = React.useContext(RadioGroupContext);
    const isChecked = ctx?.value === value;
    const isDisabled = disabled || ctx?.disabled;
    // Roving tabindex: the checked radio (or the first one) is the tab stop.
    const hasValue = ctx?.value != null && ctx.value !== "";

    return (
      <button
        type="button"
        role="radio"
        aria-checked={isChecked}
        data-state={isChecked ? "checked" : "unchecked"}
        data-slot="radio-group-item"
        disabled={isDisabled}
        tabIndex={isChecked || !hasValue ? 0 : -1}
        ref={ref}
        className={cn("spk-radio peer", className)}
        {...props}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || isDisabled) return;
          ctx?.setValue(value);
        }}
      >
        {isChecked ? <span data-slot="radio-group-indicator" className="spk-radio-dot" /> : null}
      </button>
    );
  },
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
