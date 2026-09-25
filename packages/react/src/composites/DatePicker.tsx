import * as React from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "../lib/cn";
import { useControllableState } from "../lib/use-controllable-state";
import { Button } from "../primitives/Button";
import { Popover, PopoverContent, PopoverTrigger } from "../primitives/Popover";
import { Calendar, type DateRange } from "./Calendar";

type PickerBaseProps = {
  placeholder?: string;
  /** `Intl.DateTimeFormat` options for the trigger text. Default `{ dateStyle: "medium" }`. */
  formatOptions?: Intl.DateTimeFormatOptions;
  locale?: string;
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
  weekStartsOn?: number;
  disabled?: boolean;
  /** Shows a Clear action in the popover. */
  clearable?: boolean;
  size?: "sm" | "md";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Form field name — submits ISO dates (`yyyy-mm-dd`). */
  name?: string;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean | "true" | "false";
};

export type DatePickerProps = PickerBaseProps & {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (date: Date | null) => void;
};

export type DateRangePreset = { label: string; range: () => DateRange };

export type DateRangePickerProps = PickerBaseProps & {
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (range: DateRange) => void;
  /** Months side by side. Default 2 (they stack when the popover is narrow). */
  numberOfMonths?: number;
  /** Quick ranges shown beside the calendar: "Last 7 days", "This month" … */
  presets?: DateRangePreset[];
};

/** `yyyy-mm-dd` in local time — what `<input type="date">` and most APIs expect. */
export function toISODate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function useFormatter(locale?: string, options?: Intl.DateTimeFormatOptions) {
  return React.useMemo(
    () => new Intl.DateTimeFormat(locale, options ?? { dateStyle: "medium" }),
    [locale, options],
  );
}

type TriggerProps = PickerBaseProps & { text: string | null; open: boolean };

const PickerTrigger = React.forwardRef<HTMLButtonElement, TriggerProps & React.ComponentPropsWithoutRef<"button">>(
  (
    {
      text,
      placeholder,
      size,
      className,
      open,
      disabled,
      id,
      "aria-label": ariaLabel,
      "aria-labelledby": labelledBy,
      "aria-describedby": describedBy,
      "aria-invalid": invalid,
      "aria-required": required,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      id={id}
      type="button"
      disabled={disabled}
      data-state={open ? "open" : "closed"}
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-invalid={invalid}
      aria-required={required}
      className={cn("spk-field spk-date-trigger", size === "sm" && "spk-field--sm", className)}
      {...props}
    >
      <CalendarDays className="size-4 shrink-0 text-fg-tertiary" aria-hidden />
      <span className="truncate" data-placeholder={text ? undefined : ""}>
        {text ?? placeholder}
      </span>
    </button>
  ),
);
PickerTrigger.displayName = "PickerTrigger";

/**
 * Single-date field: a button that opens a Calendar in a popover. Selecting a day closes it
 * and returns focus to the field; the calendar opens on the selected (or current) day.
 */
export function DatePicker({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  placeholder = "Pick a date",
  formatOptions,
  locale,
  min,
  max,
  isDateDisabled,
  weekStartsOn,
  clearable,
  open: openProp,
  onOpenChange,
  name,
  ...trigger
}: DatePickerProps) {
  const [value, setValue] = useControllableState<Date | null>({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });
  const [open = false, setOpen] = useControllableState({ prop: openProp, defaultProp: false, onChange: onOpenChange });
  const format = useFormatter(locale, formatOptions);
  const date = value ?? null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <PickerTrigger
          {...trigger}
          placeholder={placeholder}
          open={open}
          text={date ? format.format(date) : null}
        />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-3" aria-label="Choose date">
        <Calendar
          selected={date}
          onSelect={(next) => {
            setValue(next);
            if (next) setOpen(false);
          }}
          min={min}
          max={max}
          isDateDisabled={isDateDisabled}
          weekStartsOn={weekStartsOn}
          locale={locale}
          autoFocusDay
        />
        {clearable ? (
          <div className="mt-2 flex justify-end border-t border-line-subtle pt-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={!date}
              onClick={() => {
                setValue(null);
                setOpen(false);
              }}
            >
              Clear
            </Button>
          </div>
        ) : null}
      </PopoverContent>
      {name ? <input type="hidden" name={name} value={date ? toISODate(date) : ""} /> : null}
    </Popover>
  );
}

/**
 * Date-range field: pick a start then an end day (the span previews as you hover or arrow).
 * Optional presets sit beside the calendar and apply in one click.
 */
export function DateRangePicker({
  value: valueProp,
  defaultValue = { from: null, to: null },
  onValueChange,
  placeholder = "Pick a date range",
  formatOptions,
  locale,
  min,
  max,
  isDateDisabled,
  weekStartsOn,
  clearable,
  numberOfMonths = 2,
  presets,
  open: openProp,
  onOpenChange,
  name,
  ...trigger
}: DateRangePickerProps) {
  const [value, setValue] = useControllableState<DateRange>({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });
  const [open = false, setOpen] = useControllableState({ prop: openProp, defaultProp: false, onChange: onOpenChange });
  const format = useFormatter(locale, formatOptions);
  const range = value ?? { from: null, to: null };
  const [month, setMonth] = React.useState<Date | undefined>(range.from ?? undefined);

  const text = range.from
    ? range.to
      ? typeof format.formatRange === "function"
        ? format.formatRange(range.from, range.to)
        : `${format.format(range.from)} – ${format.format(range.to)}`
      : `${format.format(range.from)} – …`
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <PickerTrigger {...trigger} placeholder={placeholder} open={open} text={text} />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-3" aria-label="Choose date range">
        <div className="spk-date-popover">
          {presets?.length ? (
            <div className="spk-date-presets" role="group" aria-label="Presets">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  size="sm"
                  variant="ghost"
                  className="justify-start"
                  onClick={() => {
                    const next = preset.range();
                    setValue(next);
                    if (next.from) setMonth(next.from);
                    if (next.from && next.to) setOpen(false);
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <Calendar
              mode="range"
              selected={range}
              onSelect={(next) => {
                setValue(next);
                if (next.from && next.to) setOpen(false);
              }}
              month={month}
              onMonthChange={setMonth}
              numberOfMonths={numberOfMonths}
              min={min}
              max={max}
              isDateDisabled={isDateDisabled}
              weekStartsOn={weekStartsOn}
              locale={locale}
              autoFocusDay
            />
            {clearable ? (
              <div className="flex justify-end border-t border-line-subtle pt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={!range.from}
                  onClick={() => setValue({ from: null, to: null })}
                >
                  Clear
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </PopoverContent>
      {name ? (
        <>
          <input type="hidden" name={`${name}.from`} value={range.from ? toISODate(range.from) : ""} />
          <input type="hidden" name={`${name}.to`} value={range.to ? toISODate(range.to) : ""} />
        </>
      ) : null}
    </Popover>
  );
}
