import * as React from "react";
import { ChevronDown } from "lucide-react";
import { useControllableState } from "../lib/use-controllable-state";
import { cn } from "../lib/cn";
import { Collapse } from "./Collapse";

type AccordionType = "single" | "multiple";

type AccordionContextValue = {
  open: string[];
  toggle: (id: string) => void;
  type: AccordionType;
  disabled: boolean;
  disableGutters: boolean;
};

type AccordionItemContextValue = {
  value: string;
  disabled: boolean;
  expanded: boolean;
  triggerId: string;
  contentId: string;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(null);
const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null);

function useAccordion(component: string) {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error(`${component} must be used within <Accordion>`);
  return ctx;
}

function useAccordionItem(component: string) {
  const ctx = React.useContext(AccordionItemContext);
  if (!ctx) throw new Error(`${component} must be used within <AccordionItem>`);
  return ctx;
}

export type AccordionProps = Omit<React.ComponentPropsWithoutRef<"div">, "onChange"> & {
  type?: AccordionType;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  disabled?: boolean;
  /** Remove the gap between items and stack them as a single surface. */
  disableGutters?: boolean;
};

function toArray(value?: string | string[]) {
  if (value == null || value === "") return [];
  return Array.isArray(value) ? value : [value];
}

function Accordion({
  type = "single",
  value: valueProp,
  defaultValue,
  onValueChange,
  disabled = false,
  disableGutters = false,
  className,
  children,
  ...props
}: AccordionProps) {
  const [open = [], setOpen] = useControllableState<string[]>({
    prop: valueProp === undefined ? undefined : toArray(valueProp),
    defaultProp: toArray(defaultValue),
    onChange: (next) => {
      onValueChange?.(type === "single" ? (next[0] ?? "") : next);
    },
  });

  const toggle = (id: string) => {
    if (disabled) return;
    setOpen((prev) => {
      const current = prev ?? [];
      const isOpen = current.includes(id);
      if (type === "single") return isOpen ? [] : [id];
      return isOpen ? current.filter((x) => x !== id) : [...current, id];
    });
  };

  return (
    <AccordionContext.Provider
      value={{ open: open ?? [], toggle, type, disabled, disableGutters }}
    >
      <div
        data-slot="accordion"
        data-disabled={disabled ? "" : undefined}
        data-gutters={disableGutters ? "false" : "true"}
        className={cn(
          disableGutters
            ? "overflow-hidden rounded-[var(--spk-radius-md)] border border-line bg-surface"
            : "border-y border-line-subtle",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}
Accordion.displayName = "Accordion";

export type AccordionItemProps = React.ComponentPropsWithoutRef<"div"> & {
  value: string;
  disabled?: boolean;
};

function AccordionItem({
  value,
  disabled = false,
  className,
  children,
  ...props
}: AccordionItemProps) {
  const accordion = useAccordion("AccordionItem");
  const reactId = React.useId();
  const expanded = accordion.open.includes(value);
  const isDisabled = disabled || accordion.disabled;

  return (
    <AccordionItemContext.Provider
      value={{
        value,
        disabled: isDisabled,
        expanded,
        triggerId: `${reactId}-trigger`,
        contentId: `${reactId}-content`,
      }}
    >
      <div
        data-slot="accordion-item"
        data-value={value}
        data-state={expanded ? "open" : "closed"}
        data-disabled={isDisabled ? "" : undefined}
        className={cn(
          "overflow-hidden border-b border-line-subtle last:border-b-0",
          isDisabled && "pointer-events-none opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}
AccordionItem.displayName = "AccordionItem";

export type AccordionTriggerProps = React.ComponentPropsWithoutRef<"button"> & {
  /** @deprecated Prefer wrapping with AccordionItem — value is inherited. */
  value?: string;
};

function AccordionTrigger({
  value: valueProp,
  className,
  children,
  onClick,
  ...props
}: AccordionTriggerProps) {
  const accordion = useAccordion("AccordionTrigger");
  const item = React.useContext(AccordionItemContext);
  const value = valueProp ?? item?.value;
  if (!value) throw new Error("AccordionTrigger requires AccordionItem or a value prop");

  const expanded = item?.expanded ?? accordion.open.includes(value);
  const disabled = item?.disabled ?? accordion.disabled;

  return (
    <h3 className="m-0">
      <button
        type="button"
        id={item?.triggerId}
        data-slot="accordion-trigger"
        data-state={expanded ? "open" : "closed"}
        aria-expanded={expanded}
        aria-controls={item?.contentId}
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between gap-3 py-3 text-left text-body font-medium text-fg outline-none",
          "rounded-[var(--spk-radius-xs)] transition-colors duration-[var(--spk-duration-fast)] focus-visible:shadow-[var(--spk-focus-ring)]",
          "[[data-gutters=false]_&]:px-4 [[data-gutters=false]_&]:hover:bg-hover",
          "disabled:cursor-not-allowed",
          className,
        )}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || disabled) return;
          accordion.toggle(value);
        }}
        {...props}
      >
        {children}
        <ChevronDown
          aria-hidden
          className={cn(
            "size-4 shrink-0 text-fg-tertiary transition-transform duration-[var(--spk-duration-slow)] ease-[var(--spk-ease-standard)]",
            expanded && "rotate-180",
          )}
        />
      </button>
    </h3>
  );
}
AccordionTrigger.displayName = "AccordionTrigger";

export type AccordionContentProps = React.ComponentPropsWithoutRef<"div"> & {
  /** @deprecated Prefer wrapping with AccordionItem — value is inherited. */
  value?: string;
};

function AccordionContent({
  value: valueProp,
  className,
  children,
  ...props
}: AccordionContentProps) {
  const accordion = useAccordion("AccordionContent");
  const item = React.useContext(AccordionItemContext);
  const value = valueProp ?? item?.value;
  if (!value) throw new Error("AccordionContent requires AccordionItem or a value prop");

  const expanded = item?.expanded ?? accordion.open.includes(value);

  return (
    <Collapse in={expanded}>
      <div
        id={item?.contentId}
        role="region"
        aria-labelledby={item?.triggerId}
        data-slot="accordion-content"
        className={cn("pb-4 text-body text-fg-secondary [[data-gutters=false]_&]:px-4", className)}
        {...props}
      >
        {children}
      </div>
    </Collapse>
  );
}
AccordionContent.displayName = "AccordionContent";

function AccordionActions({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="accordion-actions"
      className={cn(
        "flex flex-wrap items-center justify-end gap-2 pb-3 [[data-gutters=false]_&]:px-4",
        className,
      )}
      {...props}
    />
  );
}
AccordionActions.displayName = "AccordionActions";

/** MUI-compatible aliases. */
const AccordionSummary = AccordionTrigger;
const AccordionDetails = AccordionContent;

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  AccordionActions,
  AccordionSummary,
  AccordionDetails,
};
