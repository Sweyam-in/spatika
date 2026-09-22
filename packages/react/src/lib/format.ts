/**
 * Number formatting for data-dense UI. Uses `Intl.NumberFormat` with cached formatters.
 */

export type NumberFormatKind = "number" | "currency" | "percent" | "compact" | "compact-currency";

export type FormatNumberOptions = {
  format?: NumberFormatKind;
  currency?: string;
  locale?: string;
  /** Fixed fraction digits. Defaults depend on the format. */
  precision?: number;
  /** Prefix positive numbers with "+" (for deltas). */
  signed?: boolean;
};

const cache = new Map<string, Intl.NumberFormat>();

function formatter(locale: string | undefined, options: Intl.NumberFormatOptions) {
  const key = `${locale ?? ""}|${JSON.stringify(options)}`;
  let fmt = cache.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, options);
    cache.set(key, fmt);
  }
  return fmt;
}

/** Format a number for display in metrics, tables, and charts. */
export function formatNumber(value: number, options: FormatNumberOptions = {}): string {
  if (!Number.isFinite(value)) return "—";
  const { format = "number", currency = "USD", locale, precision, signed } = options;
  const base: Intl.NumberFormatOptions = { signDisplay: signed ? "exceptZero" : "auto" };

  switch (format) {
    case "currency":
      return formatter(locale, {
        ...base,
        style: "currency",
        currency,
        minimumFractionDigits: precision ?? 2,
        maximumFractionDigits: precision ?? 2,
      }).format(value);
    case "compact-currency":
      return formatter(locale, {
        ...base,
        style: "currency",
        currency,
        notation: "compact",
        maximumFractionDigits: precision ?? 1,
      }).format(value);
    case "percent":
      return formatter(locale, {
        ...base,
        style: "percent",
        minimumFractionDigits: precision ?? 1,
        maximumFractionDigits: precision ?? 1,
      }).format(value);
    case "compact":
      return formatter(locale, {
        ...base,
        notation: "compact",
        maximumFractionDigits: precision ?? 1,
      }).format(value);
    default:
      return formatter(locale, {
        ...base,
        minimumFractionDigits: precision ?? 0,
        maximumFractionDigits: precision ?? 2,
      }).format(value);
  }
}

export const formatCurrency = (value: number, currency = "USD", options: Omit<FormatNumberOptions, "format" | "currency"> = {}) =>
  formatNumber(value, { ...options, format: "currency", currency });

/** `0.042` → `4.2%`. */
export const formatPercent = (value: number, options: Omit<FormatNumberOptions, "format"> = {}) =>
  formatNumber(value, { ...options, format: "percent" });

export const formatCompact = (value: number, options: Omit<FormatNumberOptions, "format"> = {}) =>
  formatNumber(value, { ...options, format: "compact" });

export type TrendDirection = "up" | "down" | "flat";

export function trendOf(value: number, epsilon = 0): TrendDirection {
  if (value > epsilon) return "up";
  if (value < -epsilon) return "down";
  return "flat";
}
