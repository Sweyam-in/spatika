import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { PresenceDot } from "./PresenceDot";

export type FloatChipProps = {
  icon?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Compact live row (green pip + uppercase label) instead of title/subtitle. */
  live?: boolean;
  children?: ReactNode;
  /** CSS float animation. */
  float?: boolean;
  className?: string;
};

/** Frosted floating fact chip used around a marketing hero portrait. */
export function FloatChip({
  icon,
  title,
  subtitle,
  live = false,
  children,
  float = false,
  className,
}: FloatChipProps) {
  return (
    <div
      data-slot="float-chip"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-2xl border border-border bg-[color-mix(in_srgb,var(--background)_90%,transparent)] px-3 py-2.5 shadow-md",
        float && "spk-float",
        className,
      )}
    >
      {icon ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-base">
          {icon}
        </div>
      ) : null}
      {live ? (
        <div className="flex items-center gap-2">
          <PresenceDot tone="success" />
          <p className="text-caption font-medium text-fg-tertiary text-[var(--accent-info)]">
            {children ?? title}
          </p>
        </div>
      ) : (
        <div>
          {title ? (
            <p className="text-caption font-medium text-fg-tertiary text-foreground">
              {title}
            </p>
          ) : null}
          {subtitle ? (
            <p className="mt-1 text-[10px] font-bold text-muted-foreground">{subtitle}</p>
          ) : null}
          {children}
        </div>
      )}
    </div>
  );
}
