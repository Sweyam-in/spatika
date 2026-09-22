import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../lib/cn";
import { Button } from "../primitives/Button";

export type QuickSettingsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  /** side sheet from right (default) or bottom drawer-like panel */
  side?: "right" | "left";
  className?: string;
};

/**
 * Sliding quick-settings panel — appearance, density, toggles, etc.
 */
export function QuickSettings({
  open,
  onOpenChange,
  title = "Quick settings",
  description,
  children,
  side = "right",
  className,
}: QuickSettingsProps) {
  if (!open) return null;

  return (
    <div data-slot="quick-settings" className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close settings"
        className="spk-scrim absolute"
        onClick={() => onOpenChange(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-side={side}
        className={cn(
          "spk-sheet absolute top-0 flex h-full w-full max-w-sm flex-col",
          side === "right" ? "right-0 border-l" : "left-0 border-r",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line-subtle px-5 py-4">
          <div>
            <h2 className="text-title-2 text-fg">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-body-sm text-fg-secondary">{description}</p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="-mr-1 text-fg-tertiary hover:text-fg"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">{children}</div>
      </aside>
    </div>
  );
}

export function QuickSettingsGroup({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-slot="quick-settings-group" className={cn("space-y-3", className)}>
      <p className="text-caption font-medium text-fg-tertiary">
        {title}
      </p>
      <div className="flex flex-col divide-y divide-line-subtle">{children}</div>
    </div>
  );
}

export function QuickSettingsRow({
  label,
  description,
  control,
  className,
}: {
  label: string;
  description?: string;
  control: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="quick-settings-row"
      className={cn(
        "flex min-h-11 items-center justify-between gap-3 py-2",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-body font-medium text-fg">{label}</p>
        {description ? (
          <p className="text-body-sm text-fg-secondary">{description}</p>
        ) : null}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}
