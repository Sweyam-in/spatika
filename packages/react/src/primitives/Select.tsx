
import * as React from "react";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { composeRefs } from "../lib/compose-refs";
import { Portal } from "../lib/portal";
import { useControllableState } from "../lib/use-controllable-state";
import { useDismissable } from "../lib/use-dismissable";
import { useFloatingPosition } from "../lib/use-floating-position";
import { cn } from "../lib/cn";
import { OVERLAY_Z_INDEX, useOverlayZIndex } from "../lib/overlay-stack";

type SelectContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  value?: string;
  setValue: (value: string) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  itemTextByValue: React.MutableRefObject<Map<string, string>>;
  registerItemText: (value: string, text: string) => void;
  labelsVersion: number;
  disabled?: boolean;
  contentId: string;
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext(component: string) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Select>`);
  }
  return ctx;
}

type SelectProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  children?: React.ReactNode;
};

function Select({
  value: valueProp,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen,
  onOpenChange,
  disabled,
  children,
}: SelectProps) {
  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const itemTextByValue = React.useRef(new Map<string, string>());
  const [labelsVersion, setLabelsVersion] = React.useState(0);
  const contentId = `${React.useId()}-listbox`;

  const registerItemText = React.useCallback((itemValue: string, text: string) => {
    const prev = itemTextByValue.current.get(itemValue);
    if (prev === text) return;
    itemTextByValue.current.set(itemValue, text);
    setLabelsVersion((v) => v + 1);
  }, []);

  // Provider-only root — no DOM wrapper (matches Radix Root behavior).
  return (
    <SelectContext.Provider
      value={{
        open,
        setOpen: (next) => setOpen(next),
        value,
        setValue: (next) => setValue(next),
        triggerRef,
        contentRef,
        itemTextByValue,
        registerItemText,
        labelsVersion,
        disabled,
        contentId,
      }}
    >
      {children}
    </SelectContext.Provider>
  );
}

function SelectGroup({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div data-slot="select-group" className={className} {...props} />;
}

function SelectValue({
  placeholder,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"span"> & { placeholder?: string }) {
  const { value, itemTextByValue, labelsVersion } = useSelectContext("SelectValue");
  void labelsVersion;
  const label = value ? itemTextByValue.current.get(value) : undefined;
  const showPlaceholder = !value;

  return (
    <span
      data-slot="select-value"
      data-placeholder={showPlaceholder ? "" : undefined}
      className={className}
      {...props}
    >
      {showPlaceholder ? placeholder : label ?? value}
    </span>
  );
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & {
    size?: "sm" | "default";
  }
>(({ className, size = "default", children, onClick, disabled: disabledProp, ...props }, ref) => {
  const { open, setOpen, triggerRef, disabled, contentId } = useSelectContext("SelectTrigger");

  return (
    <button
      ref={composeRefs(ref, triggerRef)}
      type="button"
      data-slot="select-trigger"
      data-size={size}
      data-state={open ? "open" : "closed"}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={open ? contentId : undefined}
      disabled={disabled || disabledProp}
      className={cn(
        "spk-field justify-between gap-2 overflow-hidden text-left whitespace-nowrap data-[size=sm]:h-[var(--spk-control-h-sm)] *:data-[placeholder]:text-fg-tertiary *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:flex-1 *:data-[slot=select-value]:overflow-hidden *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(!open);
      }}
      {...props}
      onKeyDown={(event) => {
        props.onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          setOpen(true);
        }
      }}
    >
      {children}
      <ChevronDownIcon className="size-4 text-fg-tertiary" aria-hidden />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    position?: "popper" | "item-aligned";
  }
>(({ className, children, position = "popper", style, ...props }, ref) => {
  const { open, setOpen, triggerRef, contentRef, registerItemText, contentId } =
    useSelectContext("SelectContent");
  const zIndex = useOverlayZIndex(OVERLAY_Z_INDEX.select);
  const typeahead = React.useRef({ query: "", timer: 0 });

  // Escape, Tab and outside presses unmount the list; hand focus back to the trigger.
  React.useEffect(() => {
    if (!open) return;
    const list = contentRef.current;
    return () => {
      const active = document.activeElement;
      if (!active || active === document.body || list?.contains(active)) {
        triggerRef.current?.focus({ preventScroll: true });
      }
    };
  }, [open, contentRef, triggerRef]);

  const floating = useFloatingPosition({
    open,
    triggerRef,
    contentRef,
    side: "bottom",
    align: "start",
    sideOffset: 4,
  });

  useDismissable({
    enabled: open,
    onDismiss: () => setOpen(false),
    refs: [triggerRef, contentRef],
  });

  // While closed, register option labels without mounting visible item text in the DOM.
  React.useEffect(() => {
    if (open) return;

    const walk = (nodes: React.ReactNode) => {
      React.Children.forEach(nodes, (child) => {
        if (!React.isValidElement(child)) return;
        const childType = child.type as { displayName?: string };
        const childProps = child.props as {
          value?: string;
          textValue?: string;
          children?: React.ReactNode;
        };

        if (childType?.displayName === "SelectItem" && childProps.value != null) {
          const text =
            childProps.textValue ??
            (typeof childProps.children === "string"
              ? childProps.children
              : React.Children.toArray(childProps.children)
                  .filter((c) => typeof c === "string" || typeof c === "number")
                  .join(""));
          registerItemText(childProps.value, text || childProps.value);
        }

        if (childProps.children) walk(childProps.children);
      });
    };

    walk(children);
  }, [children, open, registerItemText]);

  const positioned = floating != null;
  React.useEffect(() => {
    if (!open || !positioned) return;
    const list = contentRef.current;
    const target =
      list?.querySelector<HTMLElement>('[role="option"][aria-selected="true"]') ??
      list?.querySelector<HTMLElement>('[role="option"]:not([data-disabled])');
    target?.focus({ preventScroll: false });
  }, [open, positioned, contentRef]);

  const handleListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const options = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[role="option"]:not([data-disabled])'),
    );
    const index = options.indexOf(document.activeElement as HTMLElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      options[Math.min(options.length - 1, Math.max(0, index + step))]?.focus();
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      (event.key === "Home" ? options[0] : options[options.length - 1])?.focus();
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      (document.activeElement as HTMLElement | null)?.click();
    } else if (event.key === "Tab") {
      setOpen(false);
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      // Type-ahead: jump to the next option whose label starts with the typed text.
      const state = typeahead.current;
      window.clearTimeout(state.timer);
      state.query += event.key.toLowerCase();
      state.timer = window.setTimeout(() => {
        state.query = "";
      }, 500);
      const query = /^(.)\1+$/.test(state.query) ? state.query[0] : state.query;
      const ordered = [...options.slice(index + 1), ...options.slice(0, index + 1)];
      ordered.find((option) => (option.textContent ?? "").trim().toLowerCase().startsWith(query))?.focus();
    }
  };

  if (!open) return null;

  const triggerTop = triggerRef.current?.getBoundingClientRect().top ?? 0;
  const availableHeight = floating
    ? Math.max(
        140,
        floating.side === "top"
          ? triggerTop - 16
          : window.innerHeight - floating.top - 16,
      )
    : 384;

  return (
    <Portal>
      <div
        ref={composeRefs(ref, contentRef)}
        data-slot="select-content"
        data-state="open"
        data-side={floating?.side ?? "bottom"}
        id={contentId}
        role="listbox"
        onKeyDown={handleListKeyDown}
        className={cn(
          "spk-overlay spk-animate-pop relative max-h-[min(20rem,var(--select-available-height,20rem))] min-w-[8rem] overflow-x-hidden overflow-y-auto",
          className,
        )}
        {...props}
        style={{
          position: "fixed",
          zIndex,
          top: floating?.top ?? 0,
          left: floating?.left ?? 0,
          // Grow with labels; never narrower than the trigger.
          width: "max-content",
          minWidth: floating?.triggerWidth,
          maxWidth: "min(20rem, calc(100vw - 1rem))",
          ["--select-available-height" as string]: `${availableHeight}px`,
          opacity: floating ? 1 : 0,
          pointerEvents: floating ? "auto" : "none",
          ...style,
        }}
      >
        <div
          className={cn(
            "p-1",
            position === "popper" && "w-full min-w-full",
          )}
        >
          {children}
        </div>
      </div>
    </Portal>
  );
});
SelectContent.displayName = "SelectContent";

const SelectLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="select-label"
    className={cn(
      "spk-item-label",
      className,
    )}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

const SelectItem = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentPropsWithoutRef<"div">, "onSelect"> & {
    value: string;
    disabled?: boolean;
    textValue?: string;
  }
>(({ className, children, value, disabled, textValue, onClick, ...props }, ref) => {
  const { value: selected, setValue, setOpen, registerItemText, triggerRef } =
    useSelectContext("SelectItem");
  const isSelected = selected === value;

  const text =
    textValue ??
    (typeof children === "string"
      ? children
      : React.Children.toArray(children)
          .filter((c) => typeof c === "string" || typeof c === "number")
          .join(""));

  React.useEffect(() => {
    registerItemText(value, text || value);
  }, [registerItemText, text, value]);

  return (
    <div
      ref={ref}
      role="option"
      aria-selected={isSelected}
      tabIndex={disabled ? undefined : -1}
      data-slot="select-item"
      data-disabled={disabled ? "" : undefined}
      data-state={isSelected ? "checked" : "unchecked"}
      className={cn(
        "spk-item w-full pr-8 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        isSelected && "font-medium",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled) return;
        setValue(value);
        setOpen(false);
        triggerRef.current?.focus();
      }}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        {isSelected && <CheckIcon className="size-4 text-accent-text" />}
      </span>
      <span>{children}</span>
    </div>
  );
});
SelectItem.displayName = "SelectItem";

const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="select-separator"
    className={cn(
      "spk-item-separator pointer-events-none",
      className,
    )}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="select-scroll-up-button"
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </div>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="select-scroll-down-button"
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </div>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
