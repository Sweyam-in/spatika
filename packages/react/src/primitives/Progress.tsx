import * as React from "react";
import { cn } from "../lib/cn";

type ProgressTone = "accent" | "success" | "warning" | "danger" | "neutral";

type ProgressProps = React.ComponentPropsWithoutRef<"div"> & {
  value?: number | null;
  max?: number;
  variant?: "determinate" | "indeterminate";
  size?: "xs" | "sm" | "md";
  tone?: ProgressTone;
};

const toneClass: Record<ProgressTone, string> = {
  accent: "bg-accent-solid",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  neutral: "bg-fg-tertiary",
};

const sizeClass = { xs: "h-1", sm: "h-1.5", md: "h-2" } as const;

function Progress({
  className,
  value,
  max = 100,
  variant = "determinate",
  size = "sm",
  tone = "accent",
  ...props
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, ((value || 0) / max) * 100));
  const indeterminate = variant === "indeterminate";

  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : max}
      aria-valuenow={indeterminate ? undefined : (value ?? undefined)}
      aria-label={indeterminate ? "Loading" : undefined}
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-surface-sunken",
        sizeClass[size],
        className,
      )}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className={cn(
          "h-full rounded-full",
          toneClass[tone],
          indeterminate
            ? "absolute inset-y-0 left-0 w-1/3 animate-progress-indeterminate"
            : "w-full transition-transform duration-[var(--spk-duration-slow)] ease-[var(--spk-ease-standard)]",
        )}
        style={indeterminate ? undefined : { transform: `translateX(-${100 - pct}%)` }}
      />
    </div>
  );
}

/** MUI-compatible alias. */
const LinearProgress = Progress;

export { Progress, LinearProgress };
export type { ProgressProps, ProgressTone };
