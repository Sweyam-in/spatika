import * as React from "react";
import { composeRefs } from "../lib/compose-refs";
import { Portal } from "../lib/portal";
import { Slot } from "../lib/slot";
import { useControllableState } from "../lib/use-controllable-state";
import { useFloatingPosition, type FloatingSide } from "../lib/use-floating-position";
import { cn } from "../lib/cn";
import { useDismissLayer } from "../lib/layer-stack";
import { OVERLAY_Z_INDEX } from "../lib/overlay-stack";

type TooltipProviderProps = {
  children?: React.ReactNode;
  /** Hover intent before a tooltip opens (ms). */
  delayDuration?: number;
  /** After a tooltip closes, others in the provider open instantly for this long (ms). */
  skipDelayDuration?: number;
};

type TooltipProviderValue = {
  delayDuration: number;
  skipDelayDuration: number;
  /** Timestamp of the last tooltip close — drives skip-delay across a toolbar. */
  lastClosedAt: React.MutableRefObject<number>;
};

const TooltipProviderContext = React.createContext<TooltipProviderValue>({
  delayDuration: 300,
  skipDelayDuration: 300,
  lastClosedAt: { current: 0 },
});

const TooltipProvider = ({ children, delayDuration = 300, skipDelayDuration = 300 }: TooltipProviderProps) => {
  const lastClosedAt = React.useRef(0);
  const value = React.useMemo(
    () => ({ delayDuration, skipDelayDuration, lastClosedAt }),
    [delayDuration, skipDelayDuration],
  );
  return <TooltipProviderContext.Provider value={value}>{children}</TooltipProviderContext.Provider>;
};
TooltipProvider.displayName = "TooltipProvider";

/** Grace period so the pointer can travel from the trigger onto the tooltip (WCAG 1.4.13). */
const CLOSE_GRACE_MS = 120;

type TooltipContextValue = {
  open: boolean;
  /** Open after the hover delay (or instantly inside the skip-delay window). */
  requestOpen: (immediate?: boolean) => void;
  /** Close after the grace period — cancelled if the pointer reaches the trigger or tooltip. */
  requestClose: () => void;
  closeNow: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  contentId: string;
};

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

function useTooltipContext(component: string) {
  const ctx = React.useContext(TooltipContext);
  if (!ctx) throw new Error(`${component} must be used within <Tooltip>`);
  return ctx;
}

type TooltipProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
  children?: React.ReactNode;
};

const Tooltip = ({ open: openProp, defaultOpen, onOpenChange, delayDuration, children }: TooltipProps) => {
  const provider = React.useContext(TooltipProviderContext);
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const contentId = React.useId();
  const timer = React.useRef<number | null>(null);
  const openRef = React.useRef(open);
  openRef.current = open;

  const clear = React.useCallback(() => {
    if (timer.current != null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const closeNow = React.useCallback(() => {
    clear();
    if (openRef.current) provider.lastClosedAt.current = Date.now();
    setOpen(false);
  }, [clear, provider.lastClosedAt, setOpen]);

  const requestOpen = React.useCallback(
    (immediate = false) => {
      clear();
      const withinSkip = Date.now() - provider.lastClosedAt.current < provider.skipDelayDuration;
      const delay = immediate || withinSkip ? 0 : (delayDuration ?? provider.delayDuration);
      if (delay === 0) setOpen(true);
      else timer.current = window.setTimeout(() => setOpen(true), delay);
    },
    [clear, delayDuration, provider, setOpen],
  );

  const requestClose = React.useCallback(() => {
    clear();
    timer.current = window.setTimeout(closeNow, CLOSE_GRACE_MS);
  }, [clear, closeNow]);

  React.useEffect(() => clear, [clear]);

  useDismissLayer({ enabled: open, refs: [contentRef], onEscapeKeyDown: closeNow });

  return (
    <TooltipContext.Provider
      value={{ open, requestOpen, requestClose, closeNow, triggerRef, contentRef, contentId }}
    >
      {children}
    </TooltipContext.Provider>
  );
};
Tooltip.displayName = "Tooltip";

const TooltipTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }
>(({ asChild = false, onPointerEnter, onPointerLeave, onPointerDown, onFocus, onBlur, ...props }, ref) => {
  const { open, requestOpen, requestClose, closeNow, triggerRef, contentId } =
    useTooltipContext("TooltipTrigger");
  const Comp = asChild ? Slot : "button";
  // A tap focuses the trigger; don't let that focus flash the tooltip on touch screens.
  const pointerDownRef = React.useRef(false);

  return (
    <Comp
      ref={composeRefs(ref, triggerRef) as React.Ref<HTMLButtonElement>}
      type={asChild ? undefined : "button"}
      data-slot="tooltip-trigger"
      data-state={open ? "open" : "closed"}
      aria-describedby={open ? contentId : undefined}
      onPointerEnter={(event: React.PointerEvent<HTMLButtonElement>) => {
        onPointerEnter?.(event);
        if (event.pointerType !== "touch") requestOpen();
      }}
      onPointerLeave={(event: React.PointerEvent<HTMLButtonElement>) => {
        onPointerLeave?.(event);
        requestClose();
      }}
      onPointerDown={(event: React.PointerEvent<HTMLButtonElement>) => {
        onPointerDown?.(event);
        pointerDownRef.current = true;
        closeNow();
      }}
      onFocus={(event: React.FocusEvent<HTMLButtonElement>) => {
        onFocus?.(event);
        // Keyboard focus shows immediately — no hover intent to wait for.
        if (!pointerDownRef.current) requestOpen(true);
        pointerDownRef.current = false;
      }}
      onBlur={(event: React.FocusEvent<HTMLButtonElement>) => {
        onBlur?.(event);
        pointerDownRef.current = false;
        closeNow();
      }}
      {...props}
    />
  );
});
TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { side?: FloatingSide; sideOffset?: number }
>(({ className, side = "top", sideOffset = 6, children, style, ...props }, ref) => {
  const { open, requestOpen, requestClose, triggerRef, contentRef, contentId } =
    useTooltipContext("TooltipContent");
  const position = useFloatingPosition({ open, triggerRef, contentRef, side, align: "center", sideOffset });

  if (!open) return null;

  return (
    <Portal>
      <div
        ref={composeRefs(ref, contentRef)}
        id={contentId}
        data-slot="tooltip-content"
        data-state="open"
        data-side={position?.side ?? side}
        role="tooltip"
        className={cn("spk-tooltip", className)}
        // Hovering the tooltip itself keeps it open so it can be read or selected.
        onPointerEnter={() => requestOpen(true)}
        onPointerLeave={requestClose}
        style={{
          position: "fixed",
          zIndex: OVERLAY_Z_INDEX.tooltip,
          top: position?.top ?? -9999,
          left: position?.left ?? -9999,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    </Portal>
  );
});
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
