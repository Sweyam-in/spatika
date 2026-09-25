import * as React from "react";
import { XIcon } from "lucide-react";
import { composeRefs } from "../lib/compose-refs";
import { Portal } from "../lib/portal";
import { Slot } from "../lib/slot";
import { useControllableState } from "../lib/use-controllable-state";
import { useFocusTrap } from "../lib/use-focus-trap";
import { useDismissLayer } from "../lib/layer-stack";
import { useIsomorphicLayoutEffect } from "../lib/use-isomorphic-layout-effect";
import { cn } from "../lib/cn";
import { ModalDepthProvider, OVERLAY_Z_INDEX, fixedLayerStyle } from "../lib/overlay-stack";

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentRef: React.RefObject<HTMLDivElement | null>;
  titleId: string;
  descriptionId: string;
  /** Ids of the mounted title / description, so aria references never dangle. */
  labelledBy?: string;
  describedBy?: string;
  registerTitle: (id: string | undefined) => void;
  registerDescription: (id: string | undefined) => void;
};

/** Reports a mounted title / description id to the dialog so `aria-*` references stay valid. */
function useRegisterId(register: ((id: string | undefined) => void) | undefined, id: string | undefined) {
  useIsomorphicLayoutEffect(() => {
    if (!register) return;
    register(id);
    return () => register(undefined);
  }, [register, id]);
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext(component: string) {
  const ctx = React.useContext(DialogContext);
  if (!ctx) throw new Error(`${component} must be used within <Dialog>`);
  return ctx;
}

type DialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

const Dialog = ({ open: openProp, defaultOpen, onOpenChange, children }: DialogProps) => {
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const id = React.useId();
  const [labelledBy, registerTitle] = React.useState<string | undefined>();
  const [describedBy, registerDescription] = React.useState<string | undefined>();

  // Provider-only root — no DOM wrapper (matches Radix Root / Select / DropdownMenu).
  return (
    <DialogContext.Provider
      value={{
        open,
        setOpen: (next) => setOpen(next),
        contentRef,
        titleId: `${id}-title`,
        descriptionId: `${id}-description`,
        labelledBy,
        describedBy,
        registerTitle,
        registerDescription,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
};
Dialog.displayName = "Dialog";

const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }
>(({ asChild = false, onClick, ...props }, ref) => {
  const { open, setOpen } = useDialogContext("DialogTrigger");
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : "button"}
      data-slot="dialog-trigger"
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
DialogTrigger.displayName = "DialogTrigger";

const DialogPortal = ({ children }: { children?: React.ReactNode }) => <Portal>{children}</Portal>;
DialogPortal.displayName = "DialogPortal";

const DialogClose = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }
>(({ asChild = false, onClick, ...props }, ref) => {
  const { setOpen } = useDialogContext("DialogClose");
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : "button"}
      data-slot="dialog-close"
      {...props}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(false);
      }}
    />
  );
});
DialogClose.displayName = "DialogClose";

const DialogOverlay = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, onClick, style, ...props }, ref) => {
    const { open, setOpen } = useDialogContext("DialogOverlay");
    if (!open) return null;
    return (
      <div
        ref={ref}
        data-slot="dialog-overlay"
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
DialogOverlay.displayName = "DialogOverlay";

const sizeClass = {
  sm: "sm:max-w-[26rem]",
  md: "sm:max-w-[32rem]",
  lg: "sm:max-w-[42rem]",
  xl: "sm:max-w-[56rem]",
} as const;

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    /** Extra classes for the scrim. */
    overlayClassName?: string;
    size?: keyof typeof sizeClass;
    /** Hide the built-in close button (provide your own `DialogClose`). */
    hideClose?: boolean;
    /** Keep the centred dialog on phones instead of the bottom-sheet transformation. */
    mobileLayout?: "sheet" | "dialog";
    /** `top` anchors near the top of the viewport (command palettes, search). */
    position?: "center" | "top";
    /** Called when Escape would close the dialog. `event.preventDefault()` keeps it open. */
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    /** Called when the scrim is clicked. `event.preventDefault()` keeps the dialog open. */
    onInteractOutside?: (event: React.MouseEvent<HTMLDivElement>) => void;
  }
>(
  (
    {
      className,
      children,
      onKeyDown,
      overlayClassName,
      style,
      size = "md",
      hideClose,
      mobileLayout = "sheet",
      position = "center",
      onEscapeKeyDown,
      onInteractOutside,
      ...props
    },
    ref,
  ) => {
    const { open, setOpen, contentRef, labelledBy, describedBy } = useDialogContext("DialogContent");
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
      <DialogPortal>
        <DialogOverlay className={overlayClassName} onClick={onInteractOutside} />
        <div
          ref={composeRefs(ref, contentRef)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          data-slot="dialog-content"
          data-mobile={mobileLayout}
          data-position={position}
          tabIndex={-1}
          className={cn("spk-dialog grid gap-4 p-5 sm:p-6", sizeClass[size], className)}
          {...props}
          // Inline fixed + z-index beat consumer `position: relative` rules.
          style={fixedLayerStyle(OVERLAY_Z_INDEX.modal, style)}
          onKeyDown={onKeyDown}
          onClick={(event) => event.stopPropagation()}
        >
          <ModalDepthProvider>{children}</ModalDepthProvider>
          {hideClose ? null : (
            <button
              type="button"
              data-slot="dialog-close"
              aria-label="Close"
              className="spk-btn spk-btn--ghost spk-btn--icon-sm absolute top-3 right-3 text-fg-tertiary hover:text-fg"
              onClick={() => setOpen(false)}
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>
      </DialogPortal>
    );
  },
);
DialogContent.displayName = "DialogContent";

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn("flex flex-col gap-1 pr-8 text-left", className)} {...props} />;
}

function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-body" className={cn("min-w-0 text-body text-fg", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center sm:justify-end [&>*]:w-full sm:[&>*]:w-auto",
        className,
      )}
      {...props}
    />
  );
}

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<"h2">>(
  ({ className, id, ...props }, ref) => {
    const ctx = React.useContext(DialogContext);
    const resolvedId = id ?? ctx?.titleId;
    useRegisterId(ctx?.registerTitle, resolvedId);
    return (
      <h2
        ref={ref}
        id={resolvedId}
        data-slot="dialog-title"
        className={cn("text-title-2 text-fg", className)}
        {...props}
      />
    );
  },
);
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<"p">>(
  ({ className, id, ...props }, ref) => {
    const ctx = React.useContext(DialogContext);
    const resolvedId = id ?? ctx?.descriptionId;
    useRegisterId(ctx?.registerDescription, resolvedId);
    return (
      <p
        ref={ref}
        id={resolvedId}
        data-slot="dialog-description"
        className={cn("text-body text-fg-secondary", className)}
        {...props}
      />
    );
  },
);
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
