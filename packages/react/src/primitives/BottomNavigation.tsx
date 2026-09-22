import * as React from "react";
import { useControllableState } from "../lib/use-controllable-state";
import { cn } from "../lib/cn";

type BottomNavContextValue = {
  value?: string;
  setValue: (value: string) => void;
  showLabels: boolean;
};

const BottomNavContext = React.createContext<BottomNavContextValue | null>(null);

export type BottomNavigationProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "onChange" | "defaultValue"
> & {
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.SyntheticEvent, value: string) => void;
  showLabels?: boolean;
};

function BottomNavigation({
  value: valueProp,
  defaultValue,
  onChange,
  showLabels = true,
  className,
  ...props
}: BottomNavigationProps) {
  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: (next) => {
      if (next == null) return;
      onChange?.({} as React.SyntheticEvent, next);
    },
  });

  return (
    <BottomNavContext.Provider
      value={{ value, setValue: (next) => setValue(next), showLabels }}
    >
      <div
        role="navigation"
        data-slot="bottom-navigation"
        className={cn(
          "glass-tabbar flex w-full items-stretch justify-around px-1.5 py-1",
          className,
        )}
        {...props}
      />
    </BottomNavContext.Provider>
  );
}
BottomNavigation.displayName = "BottomNavigation";

export type BottomNavigationActionProps = React.ComponentPropsWithoutRef<"button"> & {
  value: string;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  showLabel?: boolean;
};

function BottomNavigationAction({
  value,
  label,
  icon,
  showLabel,
  className,
  onClick,
  ...props
}: BottomNavigationActionProps) {
  const ctx = React.useContext(BottomNavContext);
  const selected = ctx?.value === value;
  const labels = showLabel ?? ctx?.showLabels ?? true;

  return (
    <button
      type="button"
      data-slot="bottom-navigation-action"
      data-selected={selected ? "" : undefined}
      aria-current={selected ? "page" : undefined}
      className={cn(
        "flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-[var(--spk-radius-sm)] px-2 py-1.5 text-caption font-medium outline-none transition-colors focus-visible:shadow-[var(--spk-focus-ring)]",
        selected ? "text-primary" : "text-muted-foreground hover:text-foreground",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) ctx?.setValue(value);
      }}
      {...props}
    >
      <span className="[&_svg]:size-5">{icon}</span>
      {labels ? <span>{label}</span> : null}
    </button>
  );
}
BottomNavigationAction.displayName = "BottomNavigationAction";

export { BottomNavigation, BottomNavigationAction };
