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
import {
  menuTriggerKey,
  useMenuNavigation,
  type MenuInitialFocus,
} from "../lib/use-menu-navigation";

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  triggerId: string;
  contentId: string;
  /** Where focus lands when the menu opens — first item from the keyboard, the menu from a click. */
  initialFocus: React.MutableRefObject<MenuInitialFocus>;
  /** Element that gets focus back on close when it differs from the positioning anchor. */
  focusReturnRef?: React.RefObject<HTMLElement | null>;
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
  scheduleClose: () => void;
  cancelClose: () => void;
  initialFocus: React.MutableRefObject<MenuInitialFocus>;
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
  const initialFocus = React.useRef<MenuInitialFocus>("content");
  const id = React.useId();

  return (
    <DropdownMenuContext.Provider
      value={{
        open,
        setOpen: (next) => setOpen(next),
        triggerRef,
        contentRef,
        triggerId: `${id}-trigger`,
        contentId: `${id}-content`,
        initialFocus,
      }}
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
>(({ asChild = false, onClick, onKeyDown, id, ...props }, ref) => {
  const { open, setOpen, triggerRef, triggerId, contentId, initialFocus } =
    useDropdownMenuContext("DropdownMenuTrigger");
  const Comp = asChild ? Slot : "button";
  const keyboardIntent = React.useRef<MenuInitialFocus | null>(null);

  return (
    <Comp
      ref={composeRefs(ref, triggerRef) as React.Ref<HTMLButtonElement>}
      id={id ?? triggerId}
      type={asChild ? undefined : "button"}
      data-slot="dropdown-menu-trigger"
      data-state={open ? "open" : "closed"}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={open ? contentId : undefined}
      {...props}
      onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        const focus = menuTriggerKey(event.key);
        if (!focus) return;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          initialFocus.current = focus;
          setOpen(true);
        } else {
          // Enter / Space fire a click next; remember the keyboard origin for it.
          keyboardIntent.current = focus;
        }
      }}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        initialFocus.current = keyboardIntent.current ?? "content";
        keyboardIntent.current = null;
        setOpen(!open);
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
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const { open, setOpen, triggerRef, contentRef, triggerId, contentId, initialFocus, focusReturnRef } =
      useDropdownMenuContext("DropdownMenuContent");
    const zIndex = useOverlayZIndex(OVERLAY_Z_INDEX.menu);
    const handleKeyDown = useMenuNavigation({
      open,
      contentRef,
      initialFocus: initialFocus.current,
      onClose: () => setOpen(false),
      returnFocusRef: focusReturnRef ?? triggerRef,
    });

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
          id={contentId}
          role="menu"
          aria-labelledby={triggerId}
          tabIndex={-1}
          data-slot="dropdown-menu-content"
          data-state="open"
          data-side={position?.side ?? side}
          className={cn(
            "spk-overlay spk-animate-pop max-h-[min(24rem,var(--dropdown-available-height,24rem))] min-w-[10rem] overflow-x-hidden overflow-y-auto p-1 outline-none",
            className,
          )}
          {...props}
          onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
            onKeyDown?.(event);
            handleKeyDown(event);
          }}
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

/** Focusable, pointer-synced props every menu item shares. */
function menuItemProps(disabled: boolean | undefined) {
  return {
    tabIndex: disabled ? undefined : -1,
    "aria-disabled": disabled || undefined,
    onPointerMove: disabled
      ? undefined
      : (event: React.PointerEvent<HTMLElement>) => {
          // Pointer and keyboard share one highlight: hovering an item focuses it.
          if (event.pointerType !== "touch" && document.activeElement !== event.currentTarget) {
            event.currentTarget.focus({ preventScroll: true });
          }
        },
  } as const;
}

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
        {...menuItemProps(disabled)}
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
      {...menuItemProps(disabled)}
      aria-checked={!!checked}
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

        // Radix semantics: the item always toggles; preventDefault() only keeps the menu open.
        let keepOpen = false;
        if (onSelect) {
          const selectEvent = createSelectEvent();
          onSelect(selectEvent);
          keepOpen = selectEvent.defaultPrevented;
        }

        onCheckedChange?.(!checked);
        if (!keepOpen) setOpen(false);
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
      {...menuItemProps(disabled)}
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

        let keepOpen = false;
        if (onSelect) {
          const selectEvent = createSelectEvent();
          onSelect(selectEvent);
          keepOpen = selectEvent.defaultPrevented;
        }

        radio?.setValue(value);
        if (!keepOpen) setOpen(false);
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
  const closeTimer = React.useRef<number | null>(null);
  const cancelClose = React.useCallback(() => {
    if (closeTimer.current != null) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);
  const scheduleClose = React.useCallback(() => {
    cancelClose();
    // Hover intent: give the pointer time to travel diagonally into the submenu.
    closeTimer.current = window.setTimeout(() => setOpen(false), 180);
  }, [cancelClose, setOpen]);
  React.useEffect(() => cancelClose, [cancelClose]);
  const initialFocus = React.useRef<MenuInitialFocus>("content");

  return (
    <DropdownMenuSubContext.Provider
      value={{
        open,
        setOpen: (next) => setOpen(next),
        triggerRef,
        contentRef,
        scheduleClose,
        cancelClose,
        initialFocus,
      }}
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
>(({ className, inset, children, onMouseEnter, onPointerLeave, onKeyDown, onClick, ...props }, ref) => {
  const sub = React.useContext(DropdownMenuSubContext);
  if (!sub) {
    throw new Error("DropdownMenuSubTrigger must be used within DropdownMenuSub");
  }

  return (
    <div
      ref={composeRefs(ref, sub.triggerRef) as React.Ref<HTMLDivElement>}
      role="menuitem"
      tabIndex={-1}
      aria-haspopup="menu"
      aria-expanded={sub.open}
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
        sub.cancelClose();
        sub.initialFocus.current = "content";
        sub.setOpen(true);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        sub.scheduleClose();
      }}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        sub.initialFocus.current = "first";
        sub.setOpen(true);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "ArrowRight") {
          event.preventDefault();
          sub.initialFocus.current = "first";
          sub.setOpen(true);
        }
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
>(({ className, style, onKeyDown, onPointerEnter, onPointerLeave, ...props }, ref) => {
  const sub = React.useContext(DropdownMenuSubContext);
  if (!sub) {
    throw new Error("DropdownMenuSubContent must be used within DropdownMenuSub");
  }
  const zIndex = useOverlayZIndex(OVERLAY_Z_INDEX.menu);
  const handleKeyDown = useMenuNavigation({
    open: sub.open,
    contentRef: sub.contentRef,
    initialFocus: sub.initialFocus.current,
    onClose: () => sub.setOpen(false),
    returnFocusRef: sub.triggerRef,
    onCloseSubmenu: () => sub.setOpen(false),
  });

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
      role="menu"
      tabIndex={-1}
      data-submenu=""
      data-slot="dropdown-menu-sub-content"
      data-state="open"
      data-side={position?.side ?? "right"}
      className={cn(
        "spk-overlay spk-animate-pop min-w-[10rem] overflow-hidden p-1 outline-none",
        className,
      )}
      {...props}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        handleKeyDown(event);
        // Keys handled here must not also move focus in the parent menu.
        if (event.key.startsWith("Arrow") || event.key === "Home" || event.key === "End") {
          event.stopPropagation();
        }
      }}
      onPointerEnter={(event: React.PointerEvent<HTMLDivElement>) => {
        onPointerEnter?.(event);
        sub.cancelClose();
      }}
      onPointerLeave={(event: React.PointerEvent<HTMLDivElement>) => {
        onPointerLeave?.(event);
        sub.scheduleClose();
      }}
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

type ContextMenuProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

type ContextMenuAnchor = {
  point: { x: number; y: number };
  setPoint: (point: { x: number; y: number }) => void;
  regionRef: React.RefObject<HTMLDivElement | null>;
};

const ContextMenuAnchorContext = React.createContext<ContextMenuAnchor | null>(null);

/**
 * Right-click menu for a region. Shares DropdownMenu's content and items
 * (`ContextMenuContent` = `DropdownMenuContent`, use `DropdownMenuItem` etc. inside) and its
 * keyboard model. Keyboard users open it with Shift+F10 or the ContextMenu key; touch users
 * with a long press.
 */
function ContextMenu({ open: openProp, defaultOpen, onOpenChange, children }: ContextMenuProps) {
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const anchorRef = React.useRef<HTMLElement | null>(null);
  const regionRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const initialFocus = React.useRef<MenuInitialFocus>("content");
  const [point, setPoint] = React.useState({ x: 0, y: 0 });
  const id = React.useId();

  return (
    <DropdownMenuContext.Provider
      value={{
        open,
        setOpen: (next) => setOpen(next),
        triggerRef: anchorRef,
        contentRef,
        triggerId: `${id}-region`,
        contentId: `${id}-content`,
        initialFocus,
        focusReturnRef: regionRef,
      }}
    >
      <ContextMenuAnchorContext.Provider value={{ point, setPoint, regionRef }}>
        {children}
        {/* Zero-size anchor at the pointer — the menu positions against it. */}
        <span
          ref={anchorRef}
          aria-hidden
          style={{ position: "fixed", left: point.x, top: point.y, width: 0, height: 0, pointerEvents: "none" }}
        />
      </ContextMenuAnchorContext.Provider>
    </DropdownMenuContext.Provider>
  );
}

const ContextMenuTrigger = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { disabled?: boolean }
>(({ disabled, onContextMenu, onKeyDown, onPointerDown, onPointerUp, onPointerMove, onPointerCancel, ...props }, ref) => {
  const { setOpen, initialFocus, triggerId } = useDropdownMenuContext("ContextMenuTrigger");
  const anchor = React.useContext(ContextMenuAnchorContext);
  if (!anchor) throw new Error("ContextMenuTrigger must be used within <ContextMenu>");
  const longPress = React.useRef<{ timer?: number; x: number; y: number }>({ x: 0, y: 0 });
  const cancelLongPress = () => window.clearTimeout(longPress.current.timer);

  const openAt = (x: number, y: number, focus: MenuInitialFocus) => {
    anchor.setPoint({ x, y });
    initialFocus.current = focus;
    setOpen(true);
  };

  return (
    <div
      ref={composeRefs(ref, anchor.regionRef)}
      id={triggerId}
      data-slot="context-menu-trigger"
      {...props}
      onContextMenu={(event) => {
        onContextMenu?.(event);
        if (event.defaultPrevented || disabled) return;
        event.preventDefault();
        openAt(event.clientX, event.clientY, "content");
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || disabled) return;
        if ((event.shiftKey && event.key === "F10") || event.key === "ContextMenu") {
          event.preventDefault();
          const rect = (event.target as HTMLElement).getBoundingClientRect();
          openAt(rect.left, rect.bottom, "first");
        }
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (disabled || event.pointerType !== "touch") return;
        const { clientX, clientY } = event;
        longPress.current = {
          x: clientX,
          y: clientY,
          timer: window.setTimeout(() => openAt(clientX, clientY, "first"), 500),
        };
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        const { x, y } = longPress.current;
        if (Math.hypot(event.clientX - x, event.clientY - y) > 10) cancelLongPress();
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        cancelLongPress();
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        cancelLongPress();
      }}
    />
  );
});
ContextMenuTrigger.displayName = "ContextMenuTrigger";

/** Content for `ContextMenu` — identical to `DropdownMenuContent`, opened at the pointer. */
const ContextMenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DropdownMenuContent>
>(({ align = "start", side = "bottom", sideOffset = 2, "aria-label": ariaLabel = "Context menu", ...props }, ref) => (
  <DropdownMenuContent
    ref={ref}
    align={align}
    side={side}
    sideOffset={sideOffset}
    // The trigger is a whole region; its text is not a name for the menu.
    aria-labelledby={undefined}
    aria-label={ariaLabel}
    {...props}
  />
));
ContextMenuContent.displayName = "ContextMenuContent";

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
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
