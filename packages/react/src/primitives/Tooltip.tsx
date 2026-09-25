import * as React from "react";
import { composeRefs } from "../lib/compose-refs";
import { Portal } from "../lib/portal";
import { Slot } from "../lib/slot";
import { useControllableState } from "../lib/use-controllable-state";
import { useFloatingPosition, type FloatingSide } from "../lib/use-floating-position";
import { cn } from "../lib/cn";
import { OVERLAY_Z_INDEX } from "../lib/overlay-stack";

type TooltipProviderProps = {
  children?: React.ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
};

const TooltipProviderContext = React.createContext<{ delayDuration: number }>({ delayDuration: 300 });

const TooltipProvider = ({ children, delayDuration = 300 }: TooltipProviderProps) => (
  <TooltipProviderContext.Provider value={{ delayDuration }}>{children}</TooltipProviderContext.Provider>
);
TooltipProvider.displayName = "TooltipProvider";

type TooltipContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  delayDuration: number;
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

  return (
    <TooltipContext.Provider
      value={{
        open,
        setOpen: (next) => setOpen(next),
        triggerRef,
        contentRef,
        delayDuration: delayDuration ?? provider.delayDuration,
        contentId,
      }}
    >
      <span data-slot="tooltip" className="contents">
        {children}
      </span>
    </TooltipContext.Provider>
  );
};
Tooltip.displayName = "Tooltip";

const TooltipTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }
>(({ asChild = false, onMouseEnter, onMouseLeave, onFocus, onBlur, onKeyDown, ...props }, ref) => {
  const { open, setOpen, triggerRef, delayDuration, contentId } = useTooltipContext("TooltipTrigger");
  const Comp = asChild ? Slot : "button";
  const timeoutRef = React.useRef<number | null>(null);

  const clear = () => {
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };
  const show = (delay: number) => {
    clear();
    timeoutRef.current = window.setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    clear();
    setOpen(false);
  };

  React.useEffect(() => clear, []);

  return (
    <Comp
      ref={composeRefs(ref, triggerRef) as React.Ref<HTMLButtonElement>}
      type={asChild ? undefined : "button"}
      data-slot="tooltip-trigger"
      aria-describedby={open ? contentId : undefined}
      onMouseEnter={(event: React.MouseEvent<HTMLButtonElement>) => {
        onMouseEnter?.(event);
        show(delayDuration);
      }}
      onMouseLeave={(event: React.MouseEvent<HTMLButtonElement>) => {
        onMouseLeave?.(event);
        hide();
      }}
      onFocus={(event: React.FocusEvent<HTMLButtonElement>) => {
        onFocus?.(event);
        // Keyboard focus shows immediately — no hover intent to wait for.
        show(0);
      }}
      onBlur={(event: React.FocusEvent<HTMLButtonElement>) => {
        onBlur?.(event);
        hide();
      }}
      onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(event);
        if (event.key === "Escape") hide();
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
  const { open, triggerRef, contentRef, contentId } = useTooltipContext("TooltipContent");
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
