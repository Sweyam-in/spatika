import * as React from "react";
import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "../lib/cn";
import { formatNumber, trendOf, type FormatNumberOptions, type TrendDirection } from "../lib/format";
import { Skeleton } from "../primitives/Skeleton";

/* ─── Delta ─────────────────────────────────────────────────────────────── */

export type DeltaProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** Change value. With `format="percent"`, `0.042` renders as `+4.2%`. */
  value: number;
  format?: FormatNumberOptions["format"];
  currency?: string;
  precision?: number;
  locale?: string;
  /**
   * `normal`: up is good (revenue). `inverse`: up is bad (costs, churn, latency).
   * Colour follows intent; the arrow always follows the number.
   */
  intent?: "normal" | "inverse" | "neutral";
  variant?: "soft" | "plain";
  /** Override the rendered text. */
  label?: ReactNode;
  showIcon?: boolean;
};

const trendWord: Record<TrendDirection, string> = { up: "Up", down: "Down", flat: "No change" };

/** Signed change indicator with arrow + colour + screen-reader wording. */
export function Delta({
  value,
  format = "percent",
  currency,
  precision,
  locale,
  intent = "normal",
  variant = "soft",
  label,
  showIcon = true,
  className,
  ...props
}: DeltaProps) {
  const trend = trendOf(value);
  const good = intent === "inverse" ? trend === "down" : trend === "up";
  const tone = intent === "neutral" || trend === "flat" ? "neutral" : good ? "positive" : "negative";
  const Icon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const text = label ?? formatNumber(value, { format, currency, precision, locale, signed: true });

  return (
    <span
      data-slot="delta"
      data-tone={tone}
      data-trend={trend}
      data-variant={variant}
      className={cn("spk-delta", className)}
      {...props}
    >
      {showIcon ? <Icon aria-hidden /> : null}
      <span className="sr-only">{trendWord[trend]} </span>
      {text}
    </span>
  );
}

/* ─── Metric ────────────────────────────────────────────────────────────── */

export type MetricProps = Omit<React.ComponentProps<"div">, "children"> & {
  label: ReactNode;
  /** Number (formatted with `format`) or pre-rendered value. */
  value: ReactNode | number;
  format?: FormatNumberOptions["format"];
  currency?: string;
  precision?: number;
  locale?: string;
  /** Unit suffix rendered quieter than the value (`ms`, `GB`, `/mo`). */
  unit?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  /** Change vs. comparison period. Number → `<Delta>`; node → rendered as-is. */
  delta?: number | ReactNode;
  deltaFormat?: FormatNumberOptions["format"];
  deltaIntent?: DeltaProps["intent"];
  /** Comparison caption, e.g. "vs last month". */
  caption?: ReactNode;
  /** Leading icon beside the label. */
  icon?: ReactNode;
  /** Trailing element in the label row (menu, info tooltip). */
  action?: ReactNode;
  /** Visual below the value — typically a `SparkLineChart` or `Progress`. */
  chart?: ReactNode;
  loading?: boolean;
  align?: "start" | "end";
};

/**
 * Typography-led KPI. No container — place inside a `Card`, `MetricGroup`, or directly in a page.
 */
export const Metric = React.forwardRef<HTMLDivElement, MetricProps>(function Metric(
  {
    label,
    value,
    format,
    currency,
    precision,
    locale,
    unit,
    size = "md",
    delta,
    deltaFormat = "percent",
    deltaIntent,
    caption,
    icon,
    action,
    chart,
    loading,
    align = "start",
    className,
    ...props
  },
  ref,
) {
  const rendered =
    typeof value === "number" ? formatNumber(value, { format, currency, precision, locale }) : value;

  return (
    <div
      ref={ref}
      data-slot="metric"
      data-size={size}
      className={cn("spk-metric", align === "end" && "items-end text-right", className)}
      {...props}
    >
      <div className="spk-metric-label">
        {icon ? <span className="inline-flex text-fg-tertiary [&_svg]:size-3.5">{icon}</span> : null}
        <span className="min-w-0 truncate">{label}</span>
        {action ? <span className="ml-auto flex items-center">{action}</span> : null}
      </div>
      {loading ? (
        <Skeleton className="h-7 w-28" />
      ) : (
        <div className="spk-metric-value">
          {rendered}
          {unit ? <span className="spk-metric-unit">{unit}</span> : null}
        </div>
      )}
      {delta != null || caption ? (
        <div className="spk-metric-footer">
          {typeof delta === "number" ? (
            <Delta value={delta} format={deltaFormat} currency={currency} intent={deltaIntent} locale={locale} />
          ) : (
            delta
          )}
          {caption ? <span>{caption}</span> : null}
        </div>
      ) : null}
      {chart ? <div className="mt-1 min-w-0">{chart}</div> : null}
    </div>
  );
});

/* ─── MetricGroup ───────────────────────────────────────────────────────── */

export type MetricGroupProps = React.ComponentProps<"div"> & {
  /** Columns at desktop width. Collapses to two on phones. */
  columns?: number;
  /** Hairline dividers between metrics instead of gaps — reads as one strip. */
  divided?: boolean;
};

/** Row of metrics that reads as one summary strip. Wrap in a `Card` for a boxed strip. */
export function MetricGroup({ columns = 4, divided = true, className, style, ...props }: MetricGroupProps) {
  return (
    <div
      data-slot="metric-group"
      data-divided={divided ? "true" : "false"}
      className={cn("spk-metric-group", !divided && "gap-6", className)}
      style={{ ["--spk-metric-cols" as string]: columns, ...style }}
      {...props}
    />
  );
}
