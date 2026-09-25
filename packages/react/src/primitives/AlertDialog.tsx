import * as React from "react";
import { composeRefs } from "../lib/compose-refs";
import { Portal } from "../lib/portal";
import { Slot } from "../lib/slot";
import { useControllableState } from "../lib/use-controllable-state";
import { useFocusTrap } from "../lib/use-focus-trap";
import { useDismissLayer } from "../lib/layer-stack";
import { cn } from "../lib/cn";
import { ModalDepthProvider, OVERLAY_Z_INDEX, fixedLayerStyle } from "../lib/overlay-stack";
import { buttonVariants } from "./Button";

type AlertDialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentRef: React.RefObject<HTMLDivElement | null>;
  titleId: string;
  descriptionId: string;
};

const AlertDialogContext = React.createContext<AlertDialogContextValue | null>(null);

function useAlertDialogContext(component: string) {
  const ctx = React.useContext(AlertDialogContext);
  if (!ctx) throw new Error(`${component} must be used within <AlertDialog>`);
  return ctx;
}

type AlertDialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

function AlertDialog({ open: openProp, defaultOpen, onOpenChange, children }: AlertDialogProps) {
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const id = React.useId();
  return (
    <AlertDialogContext.Provider
      value={{
        open,
        setOpen: (next) => setOpen(next),
        contentRef,
        titleId: `${id}-title`,
        descriptionId: `${id}-description`,
      }}
    >
      {children}
    </AlertDialogContext.Provider>
  );
}

const AlertDialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }
>(({ asChild = false, onClick, ...props }, ref) => {
  const { setOpen } = useAlertDialogContext("AlertDialogTrigger");
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : "button"}
      data-slot="alert-dialog-trigger"
      aria-haspopup="dialog"
      {...props}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(true);
      }}
    />
  );
});
AlertDialogTrigger.displayName = "AlertDialogTrigger";

function AlertDialogPortal({ children }: { children?: React.ReactNode }) {
  return <Portal>{children}</Portal>;
}

const AlertDialogOverlay = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, style, ...props }, ref) => {
    const { open } = useAlertDialogContext("AlertDialogOverlay");
    if (!open) return null;
    return (
      <div
        ref={ref}
        data-slot="alert-dialog-overlay"
        data-state="open"
        className={cn("spk-scrim", className)}
        {...props}
        style={fixedLayerStyle(OVERLAY_Z_INDEX.modal, style)}
      />
    );
  },
);
AlertDialogOverlay.displayName = "AlertDialogOverlay";

const AlertDialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    overlayClassName?: string;
    /** Called when Escape would dismiss the alert. `event.preventDefault()` keeps it open. */
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
  }
>(({ className, overlayClassName, style, children, onEscapeKeyDown, ...props }, ref) => {
  const { open, setOpen, contentRef, titleId, descriptionId } = useAlertDialogContext("AlertDialogContent");
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
    <AlertDialogPortal>
      <AlertDialogOverlay className={overlayClassName} />
      <div
        ref={composeRefs(ref, contentRef)}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        data-slot="alert-dialog-content"
        data-state="open"
        tabIndex={-1}
        className={cn("spk-dialog grid gap-4 p-5 sm:max-w-[28rem] sm:p-6", className)}
        {...props}
        style={fixedLayerStyle(OVERLAY_Z_INDEX.modal, style)}
      >
        <ModalDepthProvider>{children}</ModalDepthProvider>
      </div>
    </AlertDialogPortal>
  );
});
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div data-slot="alert-dialog-header" className={cn("flex flex-col gap-1.5 text-left", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    data-slot="alert-dialog-footer"
    className={cn(
      "flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center sm:justify-end [&>*]:w-full sm:[&>*]:w-auto",
      className,
    )}
    {...props}
  />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<"h2">>(
  ({ className, id, ...props }, ref) => {
    const ctx = React.useContext(AlertDialogContext);
    return (
      <h2
        ref={ref}
        id={id ?? ctx?.titleId}
        data-slot="alert-dialog-title"
        className={cn("text-title-2 text-fg", className)}
        {...props}
      />
    );
  },
);
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<"p">>(
  ({ className, id, ...props }, ref) => {
    const ctx = React.useContext(AlertDialogContext);
    return (
      <p
        ref={ref}
        id={id ?? ctx?.descriptionId}
        data-slot="alert-dialog-description"
        className={cn("text-body text-fg-secondary", className)}
        {...props}
      />
    );
  },
);
AlertDialogDescription.displayName = "AlertDialogDescription";

const AlertDialogAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & { variant?: "default" | "destructive" }
>(({ className, onClick, variant = "default", ...props }, ref) => {
  const { setOpen } = useAlertDialogContext("AlertDialogAction");
  return (
    <button
      ref={ref}
      type="button"
      className={cn(buttonVariants({ variant }), className)}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(false);
      }}
    />
  );
});
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button">>(
  ({ className, onClick, ...props }, ref) => {
    const { setOpen } = useAlertDialogContext("AlertDialogCancel");
    return (
      <button
        ref={ref}
        type="button"
        // Cancel receives initial focus via the focus trap order — destructive actions are never the default.
        className={cn(buttonVariants({ variant: "secondary" }), className)}
        {...props}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) setOpen(false);
        }}
      />
    );
  },
);
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
