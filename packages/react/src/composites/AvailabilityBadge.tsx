import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { PresenceDot } from "./PresenceDot";

export type AvailabilityBadgeProps = {
  children: ReactNode;
  tone?: "primary" | "success";
  className?: string;
};

/** Pill badge with a live pip — “available for work” treatment. */
export function AvailabilityBadge({
  children,
  tone = "primary",
  className,
}: AvailabilityBadgeProps) {
  return (
    <span
      data-slot="availability-badge"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-caption font-medium text-fg-tertiary shadow-sm",
        tone === "success"
          ? "border-[color-mix(in_srgb,var(--accent-info)_22%,transparent)] bg-[var(--accent-info-bg)] text-[var(--accent-info)]"
          : "border-primary/20 bg-primary/10 text-primary",
        className,
      )}
    >
      <PresenceDot tone={tone} />
      {children}
    </span>
  );
}
