import * as React from "react";
import { XIcon } from "lucide-react";
import { composeRefs } from "../lib/compose-refs";
import { Portal } from "../lib/portal";
import { Slot } from "../lib/slot";
import { useControllableState } from "../lib/use-controllable-state";
import { useFocusTrap } from "../lib/use-focus-trap";
import { useDismissLayer } from "../lib/layer-stack";
import { cn } from "../lib/cn";
import { ModalDepthProvider, OVERLAY_Z_INDEX, fixedLayerStyle } from "../lib/overlay-stack";

type SheetContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentRef: React.RefObject<HTMLDivElement | null>;
  titleId: string;
};

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheetContext(component: string) {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error(`${component} must be used within <Sheet>`);
  return ctx;
}

type SheetProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

const Sheet = ({ open: openProp, defaultOpen, onOpenChange, children }: SheetProps) => {
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const id = React.useId();
  return (
    <SheetContext.Provider value={{ open, setOpen: (next) => setOpen(next), contentRef, titleId: `${id}-title` }}>
      {children}
    </SheetContext.Provider>
  );
};
Sheet.displayName = "Sheet";

const SheetTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }
>(({ asChild = false, onClick, ...props }, ref) => {
  const { open, setOpen } = useSheetContext("SheetTrigger");
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : "button"}
      data-slot="sheet-trigger"
      aria-haspopup="dialog"
      aria-expanded={open}
      {...props}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(true);
      }}
    />
  );
});
SheetTrigger.displayName = "SheetTrigger";

const SheetClose = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }
>(({ asChild = false, onClick, ...props }, ref) => {
  const { setOpen } = useSheetContext("SheetClose");
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : "button"}
      data-slot="sheet-close"
      {...props}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(false);
      }}
    />
  );
});
SheetClose.displayName = "SheetClose";

const SheetOverlay = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, onClick, style, ...props }, ref) => {
    const { open, setOpen } = useSheetContext("SheetOverlay");
    if (!open) return null;
    return (
      <div
        ref={ref}
        data-slot="sheet-overlay"
        data-state="open"
        className={cn("spk-scrim", className)}
        {...props}
        style={fixedLayerStyle(OVERLAY_Z_INDEX.modal, style)}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) setOpen(false);
        }}
      />
    );
  },
);
SheetOverlay.displayName = "SheetOverlay";

const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    side?: "top" | "right" | "bottom" | "left";
    /** Extra classes for the scrim. */
    overlayClassName?: string;
    hideClose?: boolean;
    /** Called when Escape would close the sheet. `event.preventDefault()` keeps it open. */
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    /** Called when the scrim is clicked. `event.preventDefault()` keeps the sheet open. */
    onInteractOutside?: (event: React.MouseEvent<HTMLDivElement>) => void;
  }
>(
  (
    {
      className,
      children,
      side = "right",
      overlayClassName,
      style,
      hideClose,
      onEscapeKeyDown,
      onInteractOutside,
      ...props
    },
    ref,
  ) => {
    const { open, setOpen, contentRef, titleId } = useSheetContext("SheetContent");
    useFocusTrap(contentRef, open);

    useDismissLayer({
      enabled: open,
      refs: [contentRef],
      onEscapeKeyDown: (event) => {
        onEscapeKeyDown?.(event);
        if (!event.defaultPrevented) setOpen(false);
      },
    });

    if (!open) return null;

    return (
      <Portal>
        <SheetOverlay className={overlayClassName} onClick={onInteractOutside} />
        <div
          ref={composeRefs(ref, contentRef)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          data-slot="sheet-content"
          data-state="open"
          data-side={side}
          tabIndex={-1}
          className={cn("spk-sheet gap-4", className)}
          {...props}
          style={fixedLayerStyle(OVERLAY_Z_INDEX.modal, style)}
        >
          <ModalDepthProvider>{children}</ModalDepthProvider>
          {hideClose ? null : (
            <button
              type="button"
              aria-label="Close"
              className="spk-btn spk-btn--ghost spk-btn--icon-sm absolute top-3 right-3 text-fg-tertiary hover:text-fg"
              onClick={() => setOpen(false)}
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>
      </Portal>
    );
  },
);
SheetContent.displayName = "SheetContent";

const SheetHeader = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1 border-b border-line-subtle px-5 pt-5 pb-4 pr-12", className)}
      {...props}
    />
  ),
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="sheet-footer"
      className={cn(
        "mt-auto flex flex-col-reverse gap-2 border-t border-line-subtle px-5 py-4 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  ),
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<"h2">>(
  ({ className, id, ...props }, ref) => {
    const ctx = React.useContext(SheetContext);
    return (
      <h2 ref={ref} id={id ?? ctx?.titleId} data-slot="sheet-title" className={cn("text-title-2 text-fg", className)} {...props} />
    );
  },
);
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<"p">>(
  ({ className, ...props }, ref) => (
    <p ref={ref} data-slot="sheet-description" className={cn("text-body text-fg-secondary", className)} {...props} />
  ),
);
SheetDescription.displayName = "SheetDescription";

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription };
