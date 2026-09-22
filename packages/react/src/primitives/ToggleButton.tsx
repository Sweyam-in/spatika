import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { useControllableState } from "../lib/use-controllable-state";
import { cn } from "../lib/cn";

const toggleButtonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 border font-medium outline-none transition-colors duration-[var(--spk-duration-fast)] focus-visible:z-10 focus-visible:shadow-[var(--spk-focus-ring)] disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-4",
  {
    variants: {
      size: {
        sm: "h-[var(--spk-control-h-sm)] px-2.5 text-body-sm",
        md: "h-[var(--spk-control-h)] px-3 text-body",
        lg: "h-[var(--spk-control-h-lg)] px-4 text-body",
      },
    },
    defaultVariants: { size: "md" },
  },
);

type ToggleGroupContextValue = {
  exclusive: boolean;
  value: string | string[] | null;
  setValue: (value: string) => void;
  size: NonNullable<VariantProps<typeof toggleButtonVariants>["size"]>;
  disabled: boolean;
};

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(null);

export type ToggleButtonGroupProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "onChange" | "value" | "defaultValue"
> & {
  exclusive?: boolean;
  value?: string | string[] | null;
  defaultValue?: string | string[] | null;
  onValueChange?: (value: string | string[] | null) => void;
  size?: VariantProps<typeof toggleButtonVariants>["size"];
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
};

function ToggleButtonGroup({
  exclusive = false,
  value: valueProp,
  defaultValue,
  onValueChange,
  size = "md",
  disabled = false,
  orientation = "horizontal",
  className,
  children,
  ...props
}: ToggleButtonGroupProps) {
  const [value, setValue] = useControllableState<string | string[] | null>({
    prop: valueProp,
    defaultProp: defaultValue ?? (exclusive ? null : []),
    onChange: onValueChange,
  });

  const setFromChild = (next: string) => {
    if (disabled) return;
    setValue((prev) => {
      if (exclusive) return prev === next ? null : next;
      const list = Array.isArray(prev) ? prev : prev ? [prev] : [];
      return list.includes(next) ? list.filter((v) => v !== next) : [...list, next];
    });
  };

  return (
    <ToggleGroupContext.Provider
      value={{ exclusive, value: value ?? null, setValue: setFromChild, size: size ?? "md", disabled }}
    >
      <div
        role="group"
        data-slot="toggle-button-group"
        data-orientation={orientation}
        className={cn(
          "inline-flex isolate",
          orientation === "vertical" ? "flex-col" : "flex-row",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}
ToggleButtonGroup.displayName = "ToggleButtonGroup";

export type ToggleButtonProps = Omit<React.ComponentPropsWithoutRef<"button">, "value"> &
  VariantProps<typeof toggleButtonVariants> & {
    value: string;
    selected?: boolean;
  };

function ToggleButton({
  value,
  selected,
  size: sizeProp,
  className,
  disabled,
  onClick,
  children,
  ...props
}: ToggleButtonProps) {
  const ctx = React.useContext(ToggleGroupContext);
  const size = sizeProp ?? ctx?.size ?? "md";
  const isSelected =
    selected ??
    (ctx
      ? Array.isArray(ctx.value)
        ? ctx.value.includes(value)
        : ctx.value === value
      : false);
  const isDisabled = disabled || ctx?.disabled;

  return (
    <button
      type="button"
      data-slot="toggle-button"
      data-state={isSelected ? "on" : "off"}
      aria-pressed={isSelected}
      disabled={isDisabled}
      className={cn(
        toggleButtonVariants({ size }),
        isSelected
          ? "z-[1] border-line bg-pressed text-fg"
          : "border-line bg-surface text-fg-secondary hover:bg-hover hover:text-fg",
        ctx && "first:rounded-l-[var(--spk-radius-sm)] last:rounded-r-[var(--spk-radius-sm)] [&:not(:first-child)]:rounded-l-none [&:not(:last-child)]:rounded-r-none [&:not(:first-child)]:-ml-px",
        !ctx && "rounded-[var(--spk-radius-sm)]",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || isDisabled) return;
        ctx?.setValue(value);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
ToggleButton.displayName = "ToggleButton";

export { ToggleButton, ToggleButtonGroup, toggleButtonVariants };
