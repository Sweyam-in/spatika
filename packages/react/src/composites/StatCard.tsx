import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { Card } from "./Card";
import { Metric } from "./Metric";

export type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  chart?: ReactNode;
  className?: string;
  /** Change vs. comparison period (fraction for percent, e.g. `0.12`). */
  delta?: number;
  deltaIntent?: "normal" | "inverse" | "neutral";
  /**
   * `app` — bordered card, label then value.
   * `metric` — centred value-first tile for marketing stats.
   */
  variant?: "app" | "metric";
};

/** Metric in a card. For strips of several KPIs prefer `MetricGroup`. */
export function StatCard({ label, value, hint, icon, chart, className, delta, deltaIntent, variant = "app" }: StatCardProps) {
  if (variant === "metric") {
    return (
      <div
        data-slot="stat-card"
        data-variant="metric"
        className={cn("flex flex-col items-center justify-center gap-1 px-2 py-5 text-center", className)}
      >
        <p className="spk-numeric text-title-1 text-fg">{value}</p>
        <p className="text-body-sm text-fg-secondary">{label}</p>
        {hint ? <p className="text-caption text-fg-tertiary">{hint}</p> : null}
        {chart ? <div className="mt-3 w-full min-w-0">{chart}</div> : null}
      </div>
    );
  }

  return (
    <Card data-slot="stat-card" className={className}>
      <Metric label={label} value={value} icon={icon} delta={delta} deltaIntent={deltaIntent} caption={hint} chart={chart} />
    </Card>
  );
}
