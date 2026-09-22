import * as React from "react";
import { cn } from "../lib/cn";

type TabsVariant = "line" | "segmented";

type TabsContextValue = {
  value: string;
  setValue: (v: string) => void;
  baseId: string;
  variant: TabsVariant;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

const safeId = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, "_");

function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  variant = "line",
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  className?: string;
  children: React.ReactNode;
  /** `line` — underline with prism rail (default). `segmented` — contained toggle. */
  variant?: TabsVariant;
}) {
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const current = value ?? internal;
  const baseId = React.useId();
  const setValue = React.useCallback(
    (v: string) => {
      setInternal(v);
      onValueChange?.(v);
    },
    [onValueChange],
  );
  return (
    <TabsContext.Provider value={{ value: current, setValue, baseId, variant }}>
      <div data-slot="tabs" className={cn("w-full", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({
  className,
  variant,
  onKeyDown,
  ...props
}: React.ComponentProps<"div"> & { variant?: TabsVariant }) {
  const ctx = React.useContext(TabsContext);
  return (
    <div
      data-slot="tabs-list"
      role="tablist"
      data-variant={variant ?? ctx?.variant ?? "line"}
      className={cn("spk-tabs-list", className)}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
        if (!keys.includes(event.key)) return;
        const tabs = Array.from(
          event.currentTarget.querySelectorAll<HTMLButtonElement>("[role=tab]:not(:disabled)"),
        );
        const index = tabs.findIndex((tab) => tab === document.activeElement);
        if (index < 0) return;
        event.preventDefault();
        let next = index;
        if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else next = (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
        tabs[next]?.focus();
        tabs[next]?.click();
      }}
      {...props}
    />
  );
}

function TabsTrigger({ value, className, onClick, ...props }: React.ComponentProps<"button"> & { value: string }) {
  const ctx = React.useContext(TabsContext);
  const active = ctx?.value === value;
  const id = ctx ? `${ctx.baseId}-tab-${safeId(value)}` : undefined;
  const panelId = ctx ? `${ctx.baseId}-panel-${safeId(value)}` : undefined;
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={active}
      aria-controls={panelId}
      tabIndex={active ? 0 : -1}
      data-slot="tabs-trigger"
      data-state={active ? "active" : "inactive"}
      className={cn("spk-tabs-trigger", className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) ctx?.setValue(value);
      }}
      {...props}
    />
  );
}

function TabsContent({ value, className, ...props }: React.ComponentProps<"div"> & { value: string }) {
  const ctx = React.useContext(TabsContext);
  if (ctx?.value !== value) return null;
  return (
    <div
      data-slot="tabs-content"
      role="tabpanel"
      id={`${ctx.baseId}-panel-${safeId(value)}`}
      aria-labelledby={`${ctx.baseId}-tab-${safeId(value)}`}
      tabIndex={0}
      className={cn("mt-4 rounded-[var(--spk-radius-xs)] outline-none focus-visible:shadow-[var(--spk-focus-ring)]", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
