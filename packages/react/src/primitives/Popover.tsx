
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

type PopoverContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  anchorRef: React.RefObject<HTMLElement | null>;
};

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

  // Provider-only root — no DOM wrapper (matches Radix Root behavior).
  return (
    <PopoverContext.Provider
      value={{
        open,
        setOpen: (next) => setOpen(next),
        triggerRef,
        contentRef,
        anchorRef,
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
>(({ asChild = false, onClick, ...props }, ref) => {
  const { open, setOpen, triggerRef } = usePopoverContext("PopoverTrigger");
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={composeRefs(ref, triggerRef) as React.Ref<HTMLButtonElement>}
      type={asChild ? undefined : "button"}
      data-slot="popover-trigger"
      aria-expanded={open}
      {...props}
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
    /** Radix compat — ignored (focus stays with the trigger by default). */
    onOpenAutoFocus?: (event: Event) => void;
    /** Radix compat — ignored. */
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
      onOpenAutoFocus: _onOpenAutoFocus,
      onCloseAutoFocus: _onCloseAutoFocus,
      ...props
    },
    ref,
  ) => {
    const { open, setOpen, triggerRef, contentRef, anchorRef } =
      usePopoverContext("PopoverContent");
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
          data-slot="popover-content"
          data-state="open"
          data-side={position?.side ?? side}
          className={cn(
            "spk-overlay spk-animate-pop z-[90] w-72 p-3",
            className,
          )}
          {...props}
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
