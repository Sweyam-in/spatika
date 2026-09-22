/**
 * FilterSheet — shared filter chrome for floating page toolbars.
 *
 * Popover on desktop / tablet, bottom drawer on small screens.
 * Feature pages supply trigger + body content; this shell owns layout,
 * clear/close, and the mobile Done footer.
 */
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../lib/cn";
import { useIsMobile } from "../lib/use-media-query";
import { Button } from "../primitives/Button";
import { Popover, PopoverContent, PopoverTrigger } from "../primitives/Popover";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "./BottomSheet";
import {
  ChromeAttachedCaret,
  FLOATING_PAGE_CHROME_POPOVER_OFFSET,
  floatingPageChromeAttachedPopoverClass,
} from "./FloatingPageChrome";

export type FilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Desktop / `md+` control — typically a `Button` using `floatingPageChromePillClass`. */
  trigger: React.ReactElement<{ onClick?: React.MouseEventHandler }>;
  /** Optional compact control for small screens; defaults to `trigger` if omitted. */
  mobileTrigger?: React.ReactElement<{ onClick?: React.MouseEventHandler }>;
  title: string;
  description?: string;
  hasActiveFilters?: boolean;
  onClear?: () => void;
  clearLabel?: string;
  doneLabel?: string;
  children: React.ReactNode;
  contentClassName?: string;
  popoverClassName?: string;
};

function mergeMobileTriggerClick(
  trigger: React.ReactElement<{ onClick?: React.MouseEventHandler }>,
  openDrawer: () => void,
): React.ReactElement {
  return React.cloneElement(trigger, {
    onClick: (e: React.MouseEvent) => {
      trigger.props.onClick?.(e);
      openDrawer();
    },
  });
}

/**
 * Responsive filter panel used by directory, history, and similar list pages.
 */
export function FilterSheet({
  open,
  onOpenChange,
  trigger,
  mobileTrigger,
  title,
  description,
  hasActiveFilters = false,
  onClear,
  clearLabel = "Clear",
  doneLabel = "Done",
  children,
  contentClassName,
  popoverClassName,
}: FilterSheetProps) {
  const isMobile = useIsMobile();
  const mobileControl = mobileTrigger ?? trigger;

  const clearControl =
    hasActiveFilters && onClear ? (
      <button
        type="button"
        onClick={onClear}
        className="flex items-center gap-1 rounded-lg px-2 py-1 text-muted-foreground/80 transition-colors hover:bg-muted/50 hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
        <span className="text-caption font-medium text-fg-tertiary">
          {clearLabel}
        </span>
      </button>
    ) : null;

  if (isMobile) {
    return (
      <>
        {mergeMobileTriggerClick(mobileControl, () => onOpenChange(true))}
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent
            className={cn(
              "max-h-[92vh] rounded-t-[var(--spk-radius-lg)] border-line bg-surface-overlay pb-0 sm:hidden",
              contentClassName,
            )}
          >
            <DrawerHeader className="flex flex-row items-start justify-between gap-3 space-y-0 border-b border-border/40 px-4 pb-3 pt-2 text-left">
              <div className="min-w-0 space-y-1 pr-8">
                <DrawerTitle className="text-base font-bold tracking-tight text-foreground">
                  {title}
                </DrawerTitle>
                {description ? (
                  <DrawerDescription className="text-xs text-muted-foreground">
                    {description}
                  </DrawerDescription>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-1">{clearControl}</div>
            </DrawerHeader>
            <div className="max-h-[min(65vh,32rem)] overflow-y-auto px-0">
              <div className="flex flex-col gap-3 p-3 pt-1">{children}</div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border/40 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="px-4"
              >
                {doneLabel}
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={FLOATING_PAGE_CHROME_POPOVER_OFFSET}
        className={cn(
          floatingPageChromeAttachedPopoverClass,
          "w-[min(calc(100vw-1rem),24rem)]",
          popoverClassName,
          contentClassName,
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <ChromeAttachedCaret align="end" />
        <div className="border-b border-border/40 px-3 py-2.5 text-left">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 pr-2">
              <p className="text-sm font-bold tracking-tight text-foreground">{title}</p>
              {description ? (
                <p className="text-xs text-muted-foreground">{description}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {clearControl}
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-muted/50 hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex max-h-[min(70vh,28rem)] flex-col gap-3 overflow-y-auto p-3">
          {children}
        </div>
      </PopoverContent>
    </Popover>
  );
}
