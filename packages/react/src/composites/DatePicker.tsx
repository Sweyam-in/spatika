import * as React from "react";
import { CalendarDays } from "lucide-react";
import { useControllableState } from "../lib/use-controllable-state";
import { Button } from "../primitives/Button";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "../primitives/Popover";
import { Calendar, type DateRange } from "./Calendar";
import { DateInput } from "./DateInput";

type PickerBaseProps = {
  /** Segment order and separators follow the locale, as do month and weekday names in the calendar. */
  locale?: string;
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
  weekStartsOn?: number;
  disabled?: boolean;
  readOnly?: boolean;
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

/** "Open calendar, Due date" — the button's own name, then the field label. */
function CalendarButton({
  open,
  disabled,
  readOnly,
  labelledBy,
  label,
}: {
  open: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  labelledBy?: string;
  label?: string;
}) {
  const id = React.useId();
  return (
    <PopoverTrigger asChild>
      <button
        id={id}
        type="button"
        className="spk-date-picker-button"
        disabled={disabled || readOnly}
        data-state={open ? "open" : "closed"}
        aria-label={label ? `Open calendar, ${label}` : "Open calendar"}
        aria-labelledby={labelledBy ? `${id} ${labelledBy}` : undefined}
      >
        <CalendarDays className="size-4" aria-hidden />
      </button>
    </PopoverTrigger>
  );
}

/**
 * Single-date field. Type the date into month / day / year segments (in the locale's order), or
 * open the calendar with the button at the end. Picking a day closes the calendar and returns
 * focus to the button; the calendar opens on the typed (or current) day.
 */
export function DatePicker({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  locale,
  min,
  max,
  isDateDisabled,
  weekStartsOn,
  clearable,
  disabled,
  readOnly,
  open: openProp,
  onOpenChange,
  ...field
}: DatePickerProps) {
  const [value, setValue] = useControllableState<Date | null>({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });
  const [open = false, setOpen] = useControllableState({ prop: openProp, defaultProp: false, onChange: onOpenChange });
  const date = value ?? null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <DateInput
          {...field}
          value={date}
          onValueChange={setValue}
          locale={locale}
          min={min}
          max={max}
          isDateDisabled={isDateDisabled}
          disabled={disabled}
          readOnly={readOnly}
          className={field.className ? `spk-date-picker ${field.className}` : "spk-date-picker"}
        >
          <CalendarButton
            open={open}
            disabled={disabled}
            readOnly={readOnly}
            labelledBy={field["aria-labelledby"]}
            label={field["aria-label"]}
          />
        </DateInput>
      </PopoverAnchor>
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
    </Popover>
  );
}

/**
 * Date-range field: type the start and end dates, or open the calendar and pick a start then an
 * end day (the span previews as you hover or arrow). Optional presets sit beside the calendar
 * and apply in one click.
 */
export function DateRangePicker({
  value: valueProp,
  defaultValue = { from: null, to: null },
  onValueChange,
  locale,
  min,
  max,
  isDateDisabled,
  weekStartsOn,
  clearable,
  numberOfMonths = 2,
  presets,
  disabled,
  readOnly,
  size,
  open: openProp,
  onOpenChange,
  name,
  id,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": labelledBy,
  "aria-describedby": describedBy,
  "aria-invalid": ariaInvalid,
  "aria-required": required,
}: DateRangePickerProps) {
  const [value, setValue] = useControllableState<DateRange>({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });
  const [open = false, setOpen] = useControllableState({ prop: openProp, defaultProp: false, onChange: onOpenChange });
  const range = value ?? { from: null, to: null };
  const [month, setMonth] = React.useState<Date | undefined>(range.from ?? undefined);
  const autoId = React.useId();
  const baseId = id ?? autoId;
  const fieldLabelId = `${baseId}-label`;
  const reversed = Boolean(range.from && range.to && range.from > range.to);
  const invalid = ariaInvalid === true || ariaInvalid === "true" || reversed;
  // Each half is named "Start date" / "End date" followed by the field's own label.
  const half = (which: "start" | "end") => {
    const ownId = `${baseId}-${which}-name`;
    return {
      id: `${baseId}-${which}`,
      "aria-labelledby": [ownId, labelledBy ?? (ariaLabel ? fieldLabelId : undefined)].filter(Boolean).join(" "),
      "aria-describedby": describedBy,
      "aria-required": required,
      "aria-invalid": invalid || undefined,
      ownId,
    };
  };
  const start = half("start");
  const end = half("end");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          role="group"
          id={baseId}
          aria-label={ariaLabel}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          aria-disabled={disabled || undefined}
          data-slot="date-range-input"
          className={["spk-field spk-date-input spk-date-picker spk-date-range", size === "sm" ? "spk-field--sm" : "", className ?? ""].filter(Boolean).join(" ")}
        >
          {ariaLabel ? (
            <span id={fieldLabelId} hidden>
              {ariaLabel}
            </span>
          ) : null}
          <span id={start.ownId} hidden>
            Start date
          </span>
          <span id={end.ownId} hidden>
            End date
          </span>
          <DateInput
            bare
            id={start.id}
            aria-labelledby={start["aria-labelledby"]}
            aria-describedby={start["aria-describedby"]}
            aria-required={start["aria-required"]}
            aria-invalid={start["aria-invalid"]}
            value={range.from}
            onValueChange={(from) => {
              setValue({ from, to: range.to });
              if (from) setMonth(from);
            }}
            locale={locale}
            min={min}
            max={max}
            isDateDisabled={isDateDisabled}
            disabled={disabled}
            readOnly={readOnly}
            name={name ? `${name}.from` : undefined}
          />
          <span className="spk-date-literal" aria-hidden>
            –
          </span>
          <DateInput
            bare
            id={end.id}
            aria-labelledby={end["aria-labelledby"]}
            aria-describedby={end["aria-describedby"]}
            aria-required={end["aria-required"]}
            aria-invalid={end["aria-invalid"]}
            value={range.to}
            onValueChange={(to) => setValue({ from: range.from, to })}
            locale={locale}
            min={min}
            max={max}
            isDateDisabled={isDateDisabled}
            disabled={disabled}
            readOnly={readOnly}
            name={name ? `${name}.to` : undefined}
          />
          <CalendarButton
            open={open}
            disabled={disabled}
            readOnly={readOnly}
            labelledBy={labelledBy ?? (ariaLabel ? fieldLabelId : undefined)}
          />
        </div>
      </PopoverAnchor>
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
    </Popover>
  );
}
