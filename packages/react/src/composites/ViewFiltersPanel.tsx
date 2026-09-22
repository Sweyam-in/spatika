import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../lib/cn";
import { Button } from "../primitives/Button";
import { BottomSheet } from "./BottomSheet";

export type ViewFiltersPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  hasActive?: boolean;
  onClear?: () => void;
  trigger?: ReactNode;
  children: ReactNode;
  topSection?: ReactNode;
  className?: string;
  doneLabel?: string;
  clearLabel?: string;
};

/**
 * View & filters panel — glass bottom sheet with clear / done chrome.
 * Pass arbitrary filter fields as children for full customization.
 */
export function ViewFiltersPanel({
  open,
  onOpenChange,
  title = "View & filters",
  description,
  hasActive,
  onClear,
  trigger,
  children,
  topSection,
  className,
  doneLabel = "Done",
  clearLabel = "Clear",
}: ViewFiltersPanelProps) {
  return (
    <>
      {trigger}
      <BottomSheet open={open} onOpenChange={onOpenChange} className={className}>
        <div className="flex items-start justify-between gap-3 border-b border-border/40 px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {hasActive && onClear ? (
              <Button type="button" variant="ghost" size="sm" onClick={onClear}>
                {clearLabel}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
        {topSection}
        <div className="max-h-[60vh] space-y-5 overflow-y-auto px-4 py-4">{children}</div>
        <div className="border-t border-border/40 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <Button
            type="button"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            {doneLabel}
          </Button>
        </div>
      </BottomSheet>
    </>
  );
}
