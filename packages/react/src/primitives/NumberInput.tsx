import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../lib/cn";
import { composeRefs } from "../lib/compose-refs";
import { useControllableState } from "../lib/use-controllable-state";

export type NumberInputProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "value" | "defaultValue" | "onChange" | "type" | "size" | "min" | "max" | "step"
> & {
  value?: number | null;
  defaultValue?: number | null;
  /** Called with the committed number, or `null` when the field is cleared. */
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Arrow keys and steppers. Default 1. */
  step?: number;
  /** PageUp / PageDown and Shift+Arrow. Default `step × 10`. */
  largeStep?: number;
  /** Decimal places kept on commit. Defaults to the precision of `step`. */
  precision?: number;
  /** Display format while the field is not being edited, e.g. `{ style: "currency", currency: "USD" }`. */
  formatOptions?: Intl.NumberFormatOptions;
  locale?: string;
  /** Hide the increment / decrement buttons. */
  hideSteppers?: boolean;
  size?: "sm" | "md" | "lg";
  /** Content inside the field before the number (unit, icon). */
  leading?: React.ReactNode;
  containerClassName?: string;
};

function decimalsOf(value: number) {
  const text = String(value);
  const exponent = text.match(/e-(\d+)$/);
  if (exponent) return Number(exponent[1]);
  return text.includes(".") ? text.split(".")[1].length : 0;
}

function separators(locale?: string) {
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
  return {
    group: parts.find((part) => part.type === "group")?.value ?? ",",
    decimal: parts.find((part) => part.type === "decimal")?.value ?? ".",
  };
}

/** Parses user text in the given locale ("1,234.5", "1.234,5", "−12", "$ 40"). */
export function parseLocaleNumber(text: string, locale?: string): number | null {
  const { group, decimal } = separators(locale);
  const normalized = text
    .replace(/[−‒–]/g, "-")
    .split(group)
    .join("")
    .replace(/\s/g, "")
    .split(decimal)
    .join(".")
    .replace(/[^\d.+-]/g, "");
  if (normalized === "" || normalized === "-" || normalized === ".") return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

const sizeClass = { sm: "spk-field--sm", md: "", lg: "spk-field--lg" } as const;

/**
 * Numeric field with the WAI-ARIA spinbutton keyboard model: ArrowUp / ArrowDown step,
 * PageUp / PageDown (or Shift+Arrow) take a large step, Home / End jump to min / max.
 * Free typing is allowed; the value is parsed, clamped and rounded on blur or Enter, and
 * shown with `formatOptions` while the field is not being edited.
 */
const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value: valueProp,
      defaultValue = null,
      onValueChange,
      min,
      max,
      step = 1,
      largeStep,
      precision,
      formatOptions,
      locale,
      hideSteppers,
      size = "md",
      leading,
      className,
      containerClassName,
      disabled,
      readOnly,
      onBlur,
      onFocus,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = useControllableState<number | null>({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });
    const current = value ?? null;
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const [draft, setDraft] = React.useState<string | null>(null);
    const decimals = precision ?? decimalsOf(step);

    const displayFormat = React.useMemo(
      () =>
        new Intl.NumberFormat(locale, {
          maximumFractionDigits: Math.max(decimals, formatOptions?.maximumFractionDigits ?? 0),
          ...formatOptions,
        }),
      [locale, decimals, formatOptions],
    );
    const editFormat = React.useMemo(
      () => new Intl.NumberFormat(locale, { useGrouping: false, maximumFractionDigits: 20 }),
      [locale],
    );

    const normalize = React.useCallback(
      (next: number) => {
        let result = Number(next.toFixed(decimals));
        if (min != null) result = Math.max(min, result);
        if (max != null) result = Math.min(max, result);
        return result;
      },
      [decimals, min, max],
    );

    const commit = React.useCallback(
      (text: string) => {
        const parsed = parseLocaleNumber(text, locale);
        const next = parsed == null ? null : normalize(parsed);
        setValue(next);
        setDraft(null);
        return next;
      },
      [locale, normalize, setValue],
    );

    const stepBy = React.useCallback(
      (delta: number) => {
        if (disabled || readOnly) return;
        const base = draft != null ? parseLocaleNumber(draft, locale) : current;
        // Stepping an empty field lands on the minimum (or zero) instead of jumping past it.
        const next = base == null ? normalize(min ?? 0) : normalize(base + delta);
        setValue(next);
        if (draft != null) setDraft(editFormat.format(next));
      },
      [current, disabled, draft, editFormat, locale, max, min, normalize, readOnly, setValue],
    );

    // Press-and-hold on a stepper repeats after a short delay.
    const repeat = React.useRef<{ timeout?: number; interval?: number }>({});
    const stopRepeat = React.useCallback(() => {
      window.clearTimeout(repeat.current.timeout);
      window.clearInterval(repeat.current.interval);
      repeat.current = {};
    }, []);
    React.useEffect(() => stopRepeat, [stopRepeat]);
    const startRepeat = (delta: number) => {
      stepBy(delta);
      stopRepeat();
      repeat.current.timeout = window.setTimeout(() => {
        repeat.current.interval = window.setInterval(() => stepBy(delta), 60);
      }, 400);
    };

    const large = largeStep ?? step * 10;
    // While focused the field shows the editable draft; otherwise the formatted value.
    const text = draft ?? (current == null ? "" : displayFormat.format(current));
    const atMin = min != null && current != null && current <= min;
    const atMax = max != null && current != null && current >= max;

    return (
      <div
        data-slot="number-input"
        className={cn(
          "spk-field spk-field-group spk-number-input",
          sizeClass[size],
          hideSteppers && "spk-number-input--bare",
          containerClassName,
        )}
        aria-disabled={disabled || undefined}
      >
        {leading ? <span className="spk-field-adornment">{leading}</span> : null}
        <input
          ref={composeRefs(ref, inputRef)}
          type="text"
          inputMode={decimals > 0 || (min ?? -1) < 0 ? "decimal" : "numeric"}
          role="spinbutton"
          autoComplete="off"
          aria-valuenow={current ?? undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={current == null ? undefined : displayFormat.format(current)}
          data-slot="number-input-field"
          disabled={disabled}
          readOnly={readOnly}
          className={className}
          {...props}
          value={text}
          onFocus={(event) => {
            onFocus?.(event);
            setDraft(current == null ? "" : editFormat.format(current));
          }}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={(event) => {
            onBlur?.(event);
            commit(event.target.value);
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented) return;
            const handled: Record<string, () => void> = {
              ArrowUp: () => stepBy(event.shiftKey ? large : step),
              ArrowDown: () => stepBy(-(event.shiftKey ? large : step)),
              PageUp: () => stepBy(large),
              PageDown: () => stepBy(-large),
              Home: () => {
                if (min != null) {
                  setValue(min);
                  setDraft(editFormat.format(min));
                }
              },
              End: () => {
                if (max != null) {
                  setValue(max);
                  setDraft(editFormat.format(max));
                }
              },
              Enter: () => {
                const next = commit(event.currentTarget.value);
                setDraft(next == null ? "" : editFormat.format(next));
              },
            };
            const action = handled[event.key];
            if (!action) return;
            if (event.key !== "Enter" || draft != null) event.preventDefault();
            action();
          }}
        />
        {hideSteppers ? null : (
          <span className="spk-number-steppers">
            {/* Pointer conveniences — keyboard users step with the arrow keys. */}
            <button
              type="button"
              tabIndex={-1}
              aria-label="Decrease"
              className="spk-number-stepper"
              disabled={disabled || readOnly || atMin}
              onPointerDown={(event) => {
                event.preventDefault();
                startRepeat(-step);
              }}
              onPointerUp={stopRepeat}
              onPointerLeave={stopRepeat}
              onPointerCancel={stopRepeat}
            >
              <ChevronDown aria-hidden />
            </button>
            <button
              type="button"
              tabIndex={-1}
              aria-label="Increase"
              className="spk-number-stepper"
              disabled={disabled || readOnly || atMax}
              onPointerDown={(event) => {
                event.preventDefault();
                startRepeat(step);
              }}
              onPointerUp={stopRepeat}
              onPointerLeave={stopRepeat}
              onPointerCancel={stopRepeat}
            >
              <ChevronUp aria-hidden />
            </button>
          </span>
        )}
      </div>
    );
  },
);
NumberInput.displayName = "NumberInput";

export { NumberInput };
