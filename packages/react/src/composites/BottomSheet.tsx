import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "../lib/cn";
import { ModalDepthProvider, OVERLAY_Z_INDEX } from "../lib/overlay-stack";

/**
 * Vaul drawer root.
 * Disable background scaling + input repositioning by default — both break
 * touch hit-testing on iOS Safari / PWAs after the page has been scrolled.
 */
const Drawer = ({
  shouldScaleBackground = false,
  repositionInputs = false,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    data-slot="drawer"
    shouldScaleBackground={shouldScaleBackground}
    repositionInputs={repositionInputs}
    {...props}
  />
);
Drawer.displayName = "Drawer";

const DrawerTrigger = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Trigger>
>(({ ...props }, ref) => (
  <DrawerPrimitive.Trigger ref={ref} data-slot="drawer-trigger" {...props} />
));
DrawerTrigger.displayName = "DrawerTrigger";

const DrawerPortal = ({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) => (
  <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
);
DrawerPortal.displayName = "DrawerPortal";

const DrawerClose = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Close>
>(({ ...props }, ref) => (
  <DrawerPrimitive.Close ref={ref} data-slot="drawer-close" {...props} />
));
DrawerClose.displayName = "DrawerClose";

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, style, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    data-slot="drawer-overlay"
    {...props}
    className={cn(
      "fixed inset-0 bg-[var(--spk-overlay-scrim)]",
      className,
    )}
    style={{ zIndex: OVERLAY_Z_INDEX.modal, ...style }}
  />
));
DrawerOverlay.displayName = "DrawerOverlay";

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, style, ...props }, ref) => (
  <DrawerPortal data-slot="drawer-portal">
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      data-slot="drawer-content"
      {...props}
      className={cn(
        "group/drawer-content fixed flex h-auto flex-col bg-surface-overlay text-fg shadow-xl outline-none",
        "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-[var(--spk-radius-lg)] data-[vaul-drawer-direction=top]:border-b",
        "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-[var(--spk-radius-lg)] data-[vaul-drawer-direction=bottom]:border-t",
        "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
        "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
        className,
      )}
      style={{ zIndex: OVERLAY_Z_INDEX.modal, touchAction: "manipulation", ...style }}
    >
      <div className="mx-auto mt-2.5 mb-1 hidden h-1 w-9 shrink-0 rounded-full bg-line-strong group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
      {/* Selects and menus opened inside the sheet escalate above it. */}
      <ModalDepthProvider>{children}</ModalDepthProvider>
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  ),
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  ),
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    data-slot="drawer-title"
    className={cn("text-title-2 text-fg", className)}
    {...props}
  />
));
DrawerTitle.displayName = "DrawerTitle";

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    data-slot="drawer-description"
    className={cn("text-body text-fg-secondary", className)}
    {...props}
  />
));
DrawerDescription.displayName = "DrawerDescription";

export type BottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
};

/**
 * Glass bottom sheet (Vaul) — mobile filters, overflow menus, sheet panels.
 * Customize surface via className; defaults match app chrome glass-panel look.
 */
export function BottomSheet({ open, onOpenChange, children, className }: BottomSheetProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        data-slot="bottom-sheet"
        className={cn(
          "border-line bg-surface-overlay",
          className,
        )}
      >
        {children}
      </DrawerContent>
    </Drawer>
  );
}

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
