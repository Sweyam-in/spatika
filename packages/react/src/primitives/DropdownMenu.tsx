import * as React from "react";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { composeRefs } from "../lib/compose-refs";
import { Portal } from "../lib/portal";
import { Slot } from "../lib/slot";
import { useControllableState } from "../lib/use-controllable-state";
import { useDismissable } from "../lib/use-dismissable";
import {
  useFloatingPosition,
  type FloatingSide,
} from "../lib/use-floating-position";
import { cn } from "../lib/cn";
import { OVERLAY_Z_INDEX, createSelectEvent, useOverlayZIndex } from "../lib/overlay-stack";

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
};

const DropdownMenuContext =
  React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext(component: string) {
  const ctx = React.useContext(DropdownMenuContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <DropdownMenu>`);
  }
  return ctx;
}

type DropdownMenuRadioContextValue = {
  value?: string;
  setValue: (value: string) => void;
};

const DropdownMenuRadioContext =
  React.createContext<DropdownMenuRadioContextValue | null>(null);

type DropdownMenuSubContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
};

const DropdownMenuSubContext =
  React.createContext<DropdownMenuSubContextValue | null>(null);

type DropdownMenuProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

function DropdownMenu({
  open: openProp,
  defaultOpen,
  onOpenChange,
  children,
}: DropdownMenuProps) {
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <DropdownMenuContext.Provider
      value={{ open, setOpen: (next) => setOpen(next), triggerRef, contentRef }}
    >
      {children}
    </DropdownMenuContext.Provider>
  );
}

function DropdownMenuPortal({ children }: { children?: React.ReactNode }) {
  return <Portal>{children}</Portal>;
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }
>(({ asChild = false, onClick, ...props }, ref) => {
  const { open, setOpen, triggerRef } = useDropdownMenuContext("DropdownMenuTrigger");
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={composeRefs(ref, triggerRef) as React.Ref<HTMLButtonElement>}
      type={asChild ? undefined : "button"}
      data-slot="dropdown-menu-trigger"
      aria-expanded={open}
      {...props}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(!open);
      }}
    />
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    side?: FloatingSide;
    sideOffset?: number;
    align?: "start" | "center" | "end";
  }
>(
  (
    {
      className,
      side = "bottom",
      sideOffset = 4,
      align = "start",
      style,
      ...props
    },
    ref,
  ) => {
    const { open, setOpen, triggerRef, contentRef } =
      useDropdownMenuContext("DropdownMenuContent");
    const zIndex = useOverlayZIndex(OVERLAY_Z_INDEX.menu);

    const position = useFloatingPosition({
      open,
      triggerRef,
      contentRef,
      side,
      align,
      sideOffset,
    });

    useDismissable({
      enabled: open,
      onDismiss: () => setOpen(false),
      refs: [triggerRef, contentRef],
    });

    if (!open) return null;

    return (
      <Portal>
        <div
          ref={composeRefs(ref, contentRef)}
          role="menu"
          data-slot="dropdown-menu-content"
          data-state="open"
          data-side={position?.side ?? side}
          className={cn(
            "spk-overlay spk-animate-pop z-[10000] max-h-[min(24rem,var(--dropdown-available-height,24rem))] min-w-[10rem] overflow-x-hidden overflow-y-auto p-1",
            className,
          )}
          {...props}
          style={{
            position: "fixed",
            zIndex,
            top: position?.top ?? 0,
            left: position?.left ?? 0,
            opacity: position ? 1 : 0,
            pointerEvents: position ? "auto" : "none",
            ...style,
          }}
        />
      </Portal>
    );
  },
);
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
  <div ref={ref} role="group" data-slot="dropdown-menu-group" {...props} />
));
DropdownMenuGroup.displayName = "DropdownMenuGroup";

type MenuSelectHandler = (event: Event) => void;

function handleMenuItemActivate(options: {
  event: React.MouseEvent;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onSelect?: MenuSelectHandler;
  close: () => void;
}) {
  const { event, disabled, onClick, onSelect, close } = options;
  onClick?.(event as React.MouseEvent<HTMLDivElement>);
  if (event.defaultPrevented || disabled) return;

  if (onSelect) {
    const selectEvent = createSelectEvent();
    onSelect(selectEvent);
    if (selectEvent.defaultPrevented) return;
  }

  close();
}

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    inset?: boolean;
    variant?: "default" | "destructive";
    disabled?: boolean;
    asChild?: boolean;
    /**
     * Radix-compatible selection handler. Call `event.preventDefault()` to keep
     * the menu open (e.g. editor formatting actions that must retain focus).
     */
    onSelect?: MenuSelectHandler;
  }
>(
  (
    {
      className,
      inset,
      variant = "default",
      disabled,
      asChild = false,
      onClick,
      onSelect,
      ...props
    },
    ref,
  ) => {
    const { setOpen } = useDropdownMenuContext("DropdownMenuItem");
    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        ref={ref}
        role="menuitem"
        data-slot="dropdown-menu-item"
        data-inset={inset}
        data-variant={variant}
        data-disabled={disabled ? "" : undefined}
        className={cn(
          "spk-item data-[inset]:pl-8",
          className,
        )}
        {...props}
        onClick={(event: React.MouseEvent<HTMLDivElement>) => {
          handleMenuItemActivate({
            event,
            disabled,
            onClick,
            onSelect,
            close: () => setOpen(false),
          });
        }}
      />
    );
  },
);
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    onSelect?: MenuSelectHandler;
  }
>(({ className, children, checked, onCheckedChange, disabled, onClick, onSelect, ...props }, ref) => {
  const { setOpen } = useDropdownMenuContext("DropdownMenuCheckboxItem");

  return (
    <div
      ref={ref}
      role="menuitemcheckbox"
      aria-checked={checked}
      data-slot="dropdown-menu-checkbox-item"
      data-state={checked ? "checked" : "unchecked"}
      data-disabled={disabled ? "" : undefined}
      className={cn(
        "spk-item pl-8",
        className,
      )}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled) return;

        if (onSelect) {
          const selectEvent = createSelectEvent();
          onSelect(selectEvent);
          if (selectEvent.defaultPrevented) return;
        }

        onCheckedChange?.(!checked);
        setOpen(false);
      }}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {checked && <CheckIcon className="size-4" />}
      </span>
      {children}
    </div>
  );
});
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

const DropdownMenuRadioGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    value?: string;
    onValueChange?: (value: string) => void;
  }
>(({ value, onValueChange, ...props }, ref) => (
  <DropdownMenuRadioContext.Provider
    value={{
      value,
      setValue: (next) => onValueChange?.(next),
    }}
  >
    <div
      ref={ref}
      role="group"
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  </DropdownMenuRadioContext.Provider>
));
DropdownMenuRadioGroup.displayName = "DropdownMenuRadioGroup";

const DropdownMenuRadioItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    value: string;
    disabled?: boolean;
    onSelect?: MenuSelectHandler;
  }
>(({ className, children, value, disabled, onClick, onSelect, ...props }, ref) => {
  const { setOpen } = useDropdownMenuContext("DropdownMenuRadioItem");
  const radio = React.useContext(DropdownMenuRadioContext);
  const isChecked = radio?.value === value;

  return (
    <div
      ref={ref}
      role="menuitemradio"
      aria-checked={isChecked}
      data-slot="dropdown-menu-radio-item"
      data-state={isChecked ? "checked" : "unchecked"}
      data-disabled={disabled ? "" : undefined}
      className={cn(
        "spk-item pl-8",
        className,
      )}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled) return;

        if (onSelect) {
          const selectEvent = createSelectEvent();
          onSelect(selectEvent);
          if (selectEvent.defaultPrevented) return;
        }

        radio?.setValue(value);
        setOpen(false);
      }}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {isChecked && <CircleIcon className="size-2 fill-current" />}
      </span>
      {children}
    </div>
  );
});
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="dropdown-menu-label"
    data-inset={inset}
    className={cn(
      "spk-item-label data-[inset]:pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="dropdown-menu-separator"
    className={cn("spk-item-separator", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

const DropdownMenuShortcut = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    data-slot="dropdown-menu-shortcut"
    className={cn(
      "ml-auto pl-4 font-mono text-caption text-fg-tertiary",
      className,
    )}
    {...props}
  />
));
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

function DropdownMenuSub({
  open: openProp,
  defaultOpen,
  onOpenChange,
  children,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}) {
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <DropdownMenuSubContext.Provider
      value={{ open, setOpen: (next) => setOpen(next), triggerRef, contentRef }}
    >
      <div data-slot="dropdown-menu-sub" className="relative">
        {children}
      </div>
    </DropdownMenuSubContext.Provider>
  );
}

const DropdownMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { inset?: boolean }
>(({ className, inset, children, onMouseEnter, ...props }, ref) => {
  const sub = React.useContext(DropdownMenuSubContext);
  if (!sub) {
    throw new Error("DropdownMenuSubTrigger must be used within DropdownMenuSub");
  }

  return (
    <div
      ref={composeRefs(ref, sub.triggerRef) as React.Ref<HTMLDivElement>}
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      data-state={sub.open ? "open" : "closed"}
      className={cn(
        "spk-item data-[state=open]:bg-hover data-[inset]:pl-8",
        className,
      )}
      {...props}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        sub.setOpen(true);
      }}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </div>
  );
});
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

const DropdownMenuSubContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, style, ...props }, ref) => {
  const sub = React.useContext(DropdownMenuSubContext);
  if (!sub) {
    throw new Error("DropdownMenuSubContent must be used within DropdownMenuSub");
  }
  const zIndex = useOverlayZIndex(OVERLAY_Z_INDEX.menu);

  const position = useFloatingPosition({
    open: sub.open,
    triggerRef: sub.triggerRef,
    contentRef: sub.contentRef,
    side: "right",
    align: "start",
    sideOffset: 2,
  });

  if (!sub.open) return null;

  return (
    <div
      ref={composeRefs(ref, sub.contentRef)}
      data-slot="dropdown-menu-sub-content"
      data-state="open"
      data-side={position?.side ?? "right"}
      className={cn(
        "spk-overlay spk-animate-pop z-[10000] min-w-[10rem] overflow-hidden p-1",
        className,
      )}
      {...props}
      style={{
        position: "fixed",
        zIndex,
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        opacity: position ? 1 : 0,
        pointerEvents: position ? "auto" : "none",
        ...style,
      }}
    />
  );
});
DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
