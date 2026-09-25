
import * as React from "react";

import { composeRefs } from "../lib/compose-refs";
import { Portal } from "../lib/portal";
import { Slot } from "../lib/slot";
import { useControllableState } from "../lib/use-controllable-state";
import { useDismissable } from "../lib/use-dismissable";
import {
  useFloatingPosition,
  type FloatingAlign,
  type FloatingSide,
} from "../lib/use-floating-position";
import { cn } from "../lib/cn";
import { OVERLAY_Z_INDEX, useOverlayZIndex } from "../lib/overlay-stack";
import { getTabbable } from "../lib/use-focus-trap";

type PopoverContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  anchorRef: React.RefObject<HTMLElement | null>;
  contentId: string;
};

/** First tabbable element after `from` in document order, outside `exclude`. */
function nextTabbableAfter(from: HTMLElement, exclude: HTMLElement | null) {
  const all = getTabbable(document.body).filter((el) => !exclude?.contains(el));
  return all.find(
    (el) => from.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING && !from.contains(el),
  );
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopoverContext(component: string) {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Popover>`);
  }
  return ctx;
}

type PopoverProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

const Popover = ({
  open: openProp,
  defaultOpen,
  onOpenChange,
  children,
}: PopoverProps) => {
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const anchorRef = React.useRef<HTMLElement | null>(null);
  const contentId = `${React.useId()}-popover`;

  // Provider-only root — no DOM wrapper (matches Radix Root behavior).
  return (
    <PopoverContext.Provider
      value={{
        open,
        setOpen: (next) => setOpen(next),
        triggerRef,
        contentRef,
        anchorRef,
        contentId,
      }}
    >
      {children}
    </PopoverContext.Provider>
  );
};
Popover.displayName = "Popover";

const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }
>(({ asChild = false, onClick, onKeyDown, ...props }, ref) => {
  const { open, setOpen, triggerRef, contentRef, contentId } = usePopoverContext("PopoverTrigger");
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={composeRefs(ref, triggerRef) as React.Ref<HTMLButtonElement>}
      type={asChild ? undefined : "button"}
      data-slot="popover-trigger"
      data-state={open ? "open" : "closed"}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={open ? contentId : undefined}
      {...props}
      onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || event.key !== "Tab" || event.shiftKey || !open) return;
        // The content is portaled to the end of <body>; bridge Tab into it.
        const first = contentRef.current ? getTabbable(contentRef.current)[0] : undefined;
        if (first) {
          event.preventDefault();
          first.focus();
        }
      }}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(!open);
      }}
    />
  );
});
PopoverTrigger.displayName = "PopoverTrigger";

const PopoverAnchor = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { asChild?: boolean }
>(({ asChild = false, ...props }, ref) => {
  const { anchorRef } = usePopoverContext("PopoverAnchor");
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      ref={composeRefs(ref, anchorRef) as React.Ref<HTMLDivElement>}
      data-slot="popover-anchor"
      {...props}
    />
  );
});
PopoverAnchor.displayName = "PopoverAnchor";

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    align?: FloatingAlign;
    side?: FloatingSide;
    sideOffset?: number;
    /**
     * Called before focus moves into the content on open. `event.preventDefault()` keeps focus
     * on the trigger (Tab from the trigger still enters the popover).
     */
    onOpenAutoFocus?: (event: Event) => void;
    /** Called before focus returns to the trigger on close. `event.preventDefault()` skips it. */
    onCloseAutoFocus?: (event: Event) => void;
  }
>(
  (
    {
      className,
      align = "center",
      side = "bottom",
      sideOffset = 4,
      style,
      onOpenAutoFocus,
      onCloseAutoFocus,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const { open, setOpen, triggerRef, contentRef, anchorRef, contentId } =
      usePopoverContext("PopoverContent");
    const autoFocus = React.useRef({ onOpenAutoFocus, onCloseAutoFocus });
    autoFocus.current = { onOpenAutoFocus, onCloseAutoFocus };

    React.useEffect(() => {
      if (!open) return;
      const content = contentRef.current;
      const id = window.requestAnimationFrame(() => {
        const event = new Event("spatika.popover.openAutoFocus", { cancelable: true });
        autoFocus.current.onOpenAutoFocus?.(event);
        if (event.defaultPrevented || !content || content.contains(document.activeElement)) return;
        (getTabbable(content)[0] ?? content).focus({ preventScroll: true });
      });
      return () => {
        window.cancelAnimationFrame(id);
        const active = document.activeElement;
        if (active && active !== document.body && !content?.contains(active)) return;
        const event = new Event("spatika.popover.closeAutoFocus", { cancelable: true });
        autoFocus.current.onCloseAutoFocus?.(event);
        if (!event.defaultPrevented) triggerRef.current?.focus({ preventScroll: true });
      };
    }, [open, contentRef, triggerRef]);
    const zIndex = useOverlayZIndex(OVERLAY_Z_INDEX.popover);

    const positionAnchor =
      anchorRef.current != null ? anchorRef : triggerRef;

    const position = useFloatingPosition({
      open,
      triggerRef: positionAnchor,
      contentRef,
      side,
      align,
      sideOffset,
    });

    useDismissable({
      enabled: open,
      onDismiss: () => setOpen(false),
      refs: [triggerRef, contentRef, anchorRef],
    });

    if (!open) return null;

    // Measure trigger on first paint so consumers using
    // `w-[var(--radix-popover-trigger-width)]` get a real width before
    // floating position resolves (avoids a 0-width / visibility:hidden loop).
    const anchorEl = positionAnchor.current;
    const triggerWidth =
      position?.triggerWidth ??
      (anchorEl ? anchorEl.getBoundingClientRect().width : undefined);
    const triggerHeight =
      position?.triggerHeight ??
      (anchorEl ? anchorEl.getBoundingClientRect().height : undefined);

    return (
      <Portal>
        <div
          ref={composeRefs(ref, contentRef)}
          id={contentId}
          role="dialog"
          tabIndex={-1}
          data-slot="popover-content"
          data-state="open"
          data-side={position?.side ?? side}
          className={cn(
            "spk-overlay spk-animate-pop w-72 p-3 outline-none",
            className,
          )}
          {...props}
          onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || event.key !== "Tab") return;
            const content = contentRef.current;
            const trigger = triggerRef.current;
            if (!content || !trigger) return;
            const tabbable = getTabbable(content);
            const atStart = document.activeElement === (tabbable[0] ?? content);
            const atEnd = document.activeElement === (tabbable[tabbable.length - 1] ?? content);
            if (event.shiftKey && atStart) {
              event.preventDefault();
              trigger.focus();
            } else if (!event.shiftKey && atEnd) {
              // Leave the popover to wherever Tab would go after the trigger.
              event.preventDefault();
              setOpen(false);
              (nextTabbableAfter(trigger, content) ?? trigger).focus();
            }
          }}
          style={
            {
              position: "fixed",
              zIndex,
              top: position?.top ?? 0,
              left: position?.left ?? 0,
              opacity: position ? 1 : 0,
              pointerEvents: position ? "auto" : "none",
              ["--radix-popover-trigger-width" as string]:
                triggerWidth != null && triggerWidth > 0
                  ? `${triggerWidth}px`
                  : undefined,
              ["--radix-popover-trigger-height" as string]:
                triggerHeight != null && triggerHeight > 0
                  ? `${triggerHeight}px`
                  : undefined,
              ...style,
            } as React.CSSProperties
          }
        />
      </Portal>
    );
  },
);
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
