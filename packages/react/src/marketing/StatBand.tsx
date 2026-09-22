import * as React from "react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type MarketingStat = {
  /** The number. Pre-format it — "99.98%", "2.4M", "<40ms". */
  value: ReactNode;
  /** What it counts. */
  label: ReactNode;
  /** Optional second line of context. */
  hint?: ReactNode;
};

export type StatBandProps = {
  stats: MarketingStat[];
  /** `plain` — numbers on the page · `divided` — hairlines between · `cards` — boxed. */
  variant?: "plain" | "divided" | "cards";
  align?: "start" | "center";
  className?: string;
};

/**
 * Proof numbers in a row — uptime, customers, latency. Values use tabular figures so
 * they stay aligned, and the row collapses to two columns on phones.
 */
export function StatBand({ stats, variant = "divided", align = "center", className }: StatBandProps) {
  const centered = align === "center";

  return (
    <dl
      data-slot="stat-band"
      data-variant={variant}
      className={cn(
        "grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4",
        variant === "cards" && "gap-4",
        className,
      )}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          data-slot="stat-band-item"
          className={cn(
            "flex min-w-0 flex-col gap-1.5",
            centered && "items-center text-center",
            variant === "divided" &&
              index > 0 &&
              "md:border-l md:border-line-subtle md:pl-6",
            variant === "cards" &&
              "rounded-[var(--spk-radius-md)] border border-line-subtle bg-surface p-5",
          )}
        >
          <dd className="spk-mk-stat__value order-1">{stat.value}</dd>
          <dt className="order-2 text-body-sm text-fg-secondary">{stat.label}</dt>
          {stat.hint ? <dd className="order-3 text-caption text-fg-tertiary">{stat.hint}</dd> : null}
        </div>
      ))}
    </dl>
  );
}
