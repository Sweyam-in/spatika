import * as React from "react";
import { cn } from "../lib/cn";

/* ── Segmented field engine ───────────────────────────────────────────────────────────────
 * A date or time is a row of spinbuttons (one per unit) separated by locale literals, the
 * pattern native date inputs and React Aria use. Each segment is tabbable, takes digits,
 * and steps with the arrow keys. Segments are contentEditable so phones raise a keyboard;
 * input is read from `keydown` on hardware keyboards and from `beforeinput` on virtual ones
 * (which report key "Unidentified").
 */

type SegmentType = "year" | "month" | "day" | "hour" | "minute" | "second" | "dayPeriod";

type SegmentSpec = {
  type: SegmentType;
  value: number | null;
  min: number;
  max: number;
  /** Shown while empty. */
  placeholder: string;
  /** Accessible name of the unit ("month"). */
  label: string;
  /** Text for a value (zero-padded digits, or "AM"/"PM"). */
  format: (value: number) => string;
  /** Arrow step and Page step. */
  step?: number;
  pageStep?: number;
  /** Value to start from when stepping an empty segment. */
  start: number;
};

type Part = { kind: "segment"; spec: SegmentSpec } | { kind: "literal"; text: string };

type SegmentGroupProps = {
  parts: Part[];
  onSegmentChange: (type: SegmentType, value: number | null) => void;
  /** Maps a typed letter to a dayPeriod value (0 AM, 1 PM), or null. */
  matchPeriod?: (key: string) => number | null;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  size?: "sm" | "md";
  bare?: boolean;
  className?: string;
  groupProps: React.HTMLAttributes<HTMLDivElement> & { id?: string; "aria-required"?: boolean | "true" | "false" };
  children?: React.ReactNode;
};

function digitsOf(max: number) {
  return String(max).length;
}

const SegmentGroup = React.forwardRef<HTMLDivElement, SegmentGroupProps>(function SegmentGroup(
  { parts, onSegmentChange, matchPeriod, disabled, readOnly, invalid, size, bare, className, groupProps, children },
  ref,
) {
  const autoId = React.useId();
  const { "aria-required": required, ...group } = groupProps;
  const baseId = group.id ?? autoId;
  const segmentRefs = React.useRef(new Map<SegmentType, HTMLSpanElement>());
  // Digits typed into the focused segment so far ("1" while waiting to see if "12" follows).
  const buffer = React.useRef<{ type: SegmentType; text: string } | null>(null);
  const [typing, setTyping] = React.useState<{ type: SegmentType; text: string } | null>(null);
  const order = parts.filter((part): part is Extract<Part, { kind: "segment" }> => part.kind === "segment").map((part) => part.spec.type);

  const focusSegment = (type: SegmentType | undefined) => {
    if (type) segmentRefs.current.get(type)?.focus();
  };
  const neighbour = (type: SegmentType, delta: number) => order[order.indexOf(type) + delta];
  /** Next / previous segment; inside a range field focus runs on into the other date. */
  const moveFocus = (type: SegmentType, delta: number) => {
    const target = neighbour(type, delta);
    if (target) return focusSegment(target);
    const current = segmentRefs.current.get(type);
    const scope = current?.closest('[data-slot="date-range-input"]');
    if (!current || !scope) return;
    const all = Array.from(scope.querySelectorAll<HTMLElement>('[role="spinbutton"]'));
    all[all.indexOf(current) + delta]?.focus();
  };

  const focusFirstEmpty = () => {
    const empty = parts.find((part) => part.kind === "segment" && part.spec.value === null);
    focusSegment(empty?.kind === "segment" ? empty.spec.type : order[0]);
  };
  const focusFirstEmptyRef = React.useRef(focusFirstEmpty);
  focusFirstEmptyRef.current = focusFirstEmpty;

  // A <label for> cannot focus a group, so clicking the field's label (FormField) focuses the
  // first empty segment, as it would focus an input.
  React.useEffect(() => {
    if (!group.id || disabled) return;
    const labels = Array.from(document.getElementsByTagName("label")).filter((label) => label.htmlFor === group.id);
    const onClick = (event: MouseEvent) => {
      event.preventDefault();
      focusFirstEmptyRef.current();
    };
    for (const label of labels) label.addEventListener("click", onClick);
    return () => {
      for (const label of labels) label.removeEventListener("click", onClick);
    };
  }, [group.id, disabled]);

  const setBuffer = (next: { type: SegmentType; text: string } | null) => {
    buffer.current = next;
    setTyping(next);
  };

  const typeDigit = (spec: SegmentSpec, digit: string) => {
    const previous = buffer.current?.type === spec.type ? buffer.current.text : "";
    let text = previous + digit;
    let number = Number(text);
    // "13" for a month: the new digit starts over rather than overflowing.
    if (number > spec.max || text.length > digitsOf(spec.max)) {
      text = digit;
      number = Number(digit);
    }
    const complete = text.length >= digitsOf(spec.max) || number * 10 > spec.max;
    if (number >= spec.min && number <= spec.max) onSegmentChange(spec.type, number);
    else if (number === 0) onSegmentChange(spec.type, null); // a leading 0 of "05"
    if (complete) {
      setBuffer(null);
      moveFocus(spec.type, 1);
    } else {
      setBuffer({ type: spec.type, text });
    }
  };

  const handleText = (spec: SegmentSpec, text: string) => {
    if (disabled || readOnly) return;
    if (spec.type === "dayPeriod") {
      const period = matchPeriod?.(text) ?? null;
      if (period !== null) {
        onSegmentChange("dayPeriod", period);
        moveFocus(spec.type, 1);
      }
      return;
    }
    for (const char of text) if (/\d/.test(char)) typeDigit(spec, char);
  };

  const clear = (spec: SegmentSpec) => {
    if (disabled || readOnly) return;
    const typed = buffer.current?.type === spec.type ? buffer.current.text : "";
    if (typed.length > 1) {
      const text = typed.slice(0, -1);
      setBuffer({ type: spec.type, text });
      onSegmentChange(spec.type, Number(text) >= spec.min ? Number(text) : null);
      return;
    }
    setBuffer(null);
    if (spec.value === null) moveFocus(spec.type, -1);
    else onSegmentChange(spec.type, null);
  };

  const onKeyDown = (spec: SegmentSpec) => (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const step = (delta: number) => {
      event.preventDefault();
      if (disabled || readOnly) return;
      setBuffer(null);
      const range = spec.max - spec.min + 1;
      const from = spec.value ?? spec.start - delta; // empty: first press lands on `start`
      const next = ((((from + delta - spec.min) % range) + range) % range) + spec.min;
      onSegmentChange(spec.type, next);
    };
    switch (event.key) {
      case "ArrowUp":
        return step(spec.step ?? 1);
      case "ArrowDown":
        return step(-(spec.step ?? 1));
      case "PageUp":
        return step(spec.pageStep ?? spec.step ?? 1);
      case "PageDown":
        return step(-(spec.pageStep ?? spec.step ?? 1));
      case "Home":
        event.preventDefault();
        if (!disabled && !readOnly) onSegmentChange(spec.type, spec.min);
        return;
      case "End":
        event.preventDefault();
        if (!disabled && !readOnly) onSegmentChange(spec.type, spec.max);
        return;
      case "ArrowLeft":
      case "ArrowRight": {
        event.preventDefault();
        setBuffer(null);
        const forward = (event.key === "ArrowRight") !== rtl;
        moveFocus(spec.type, forward ? 1 : -1);
        return;
      }
      case "Backspace":
      case "Delete":
        event.preventDefault();
        clear(spec);
        return;
      case "Enter":
      case "Tab":
      case "Escape":
        setBuffer(null);
        return;
      default:
        if (event.key.length === 1) {
          event.preventDefault();
          // A separator key (/ . - :) jumps to the next unit, like native date fields.
          if (/[/.\-:, ]/.test(event.key)) {
            setBuffer(null);
            moveFocus(spec.type, 1);
            return;
          }
          handleText(spec, event.key);
        }
    }
  };

  // Virtual keyboards: text arrives through beforeinput only.
  const onBeforeInput = (spec: SegmentSpec) => (event: React.FormEvent<HTMLSpanElement>) => {
    event.preventDefault();
    const native = event.nativeEvent as InputEvent;
    if (native.inputType?.startsWith("delete")) clear(spec);
    else if (native.data) handleText(spec, native.data);
  };

  return (
    <div
      ref={ref}
      role="group"
      data-slot="date-input"
      aria-invalid={invalid || undefined}
      aria-disabled={disabled || undefined}
      className={cn(bare ? "spk-date-input spk-date-input--bare" : "spk-field spk-date-input", !bare && size === "sm" && "spk-field--sm", className)}
      onClick={(event) => {
        // Clicking the field's padding focuses the first empty (or first) segment.
        if (event.target !== event.currentTarget || disabled) return;
        focusFirstEmpty();
      }}
      {...group}
      id={baseId}
    >
      <div className="spk-date-segments">
        {parts.map((part, index) => {
          if (part.kind === "literal") {
            return (
              <span key={`literal-${index}`} className="spk-date-literal" aria-hidden>
                {part.text}
              </span>
            );
          }
          const { spec } = part;
          const typed = typing?.type === spec.type ? typing.text : null;
          const text = typed ?? (spec.value === null ? spec.placeholder : spec.format(spec.value));
          return (
            <span
              key={spec.type}
              ref={(node) => {
                if (node) segmentRefs.current.set(spec.type, node);
                else segmentRefs.current.delete(spec.type);
              }}
              role="spinbutton"
              tabIndex={disabled ? -1 : 0}
              aria-label={spec.label}
              id={`${baseId}-${spec.type}`}
              // "month, Due date": the unit, then the field's label.
              aria-labelledby={group["aria-labelledby"] ? `${baseId}-${spec.type} ${group["aria-labelledby"]}` : undefined}
              aria-describedby={group["aria-describedby"]}
              aria-required={required}
              aria-valuemin={spec.min}
              aria-valuemax={spec.max}
              aria-valuenow={spec.value ?? undefined}
              aria-valuetext={spec.value === null ? "Empty" : spec.format(spec.value)}
              aria-disabled={disabled || undefined}
              aria-readonly={readOnly || undefined}
              aria-invalid={invalid || undefined}
              contentEditable={!disabled && !readOnly}
              suppressContentEditableWarning
              spellCheck={false}
              autoCorrect="off"
              inputMode={spec.type === "dayPeriod" ? "text" : "numeric"}
              enterKeyHint="next"
              data-segment={spec.type}
              data-placeholder={spec.value === null && typed === null ? "" : undefined}
              className="spk-date-segment"
              onKeyDown={onKeyDown(spec)}
              onBeforeInput={onBeforeInput(spec)}
              onBlur={() => setBuffer(null)}
              // contentEditable would otherwise accept pasted or dropped markup.
              onPaste={(event) => {
                event.preventDefault();
                handleText(spec, event.clipboardData.getData("text"));
              }}
              onDrop={(event) => event.preventDefault()}
            >
              {text}
            </span>
          );
        })}
      </div>
      {children}
    </div>
  );
});

type FieldAriaProps = {
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean | "true" | "false";
};

function groupAria(props: FieldAriaProps): SegmentGroupProps["groupProps"] {
  return {
    id: props.id,
    "aria-label": props["aria-label"],
    "aria-labelledby": props["aria-labelledby"],
    "aria-describedby": props["aria-describedby"],
    "aria-required": props["aria-required"],
  };
}

function isInvalid(flag: FieldAriaProps["aria-invalid"]) {
  return flag === true || flag === "true";
}

/* ── Date ─────────────────────────────────────────────────────────────────────────────── */

type DateParts = { year: number | null; month: number | null; day: number | null };

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function partsOf(date: Date | null | undefined): DateParts {
  return date
    ? { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }
    : { year: null, month: null, day: null };
}

function dateOf(parts: DateParts): Date | null {
  const { year, month, day } = parts;
  if (year === null || month === null || day === null) return null;
  const date = new Date(year, month - 1, Math.min(day, daysInMonth(year, month)));
  date.setFullYear(year); // years below 100 would otherwise map to 19xx
  return date;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Locale order and separators, e.g. en-US → month / day / year, de → day . month . year. */
function dateLayout(locale?: string) {
  const sample = new Date(2000, 10, 22);
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(sample)
    .filter((part) => part.type === "literal" || part.type === "year" || part.type === "month" || part.type === "day")
    .map((part) => (part.type === "literal" ? { kind: "literal" as const, text: part.value.trim() || part.value } : { kind: "segment" as const, type: part.type as "year" | "month" | "day" }));
}

const DATE_PLACEHOLDERS = { year: "yyyy", month: "mm", day: "dd" } as const;
const DATE_LABELS = { year: "year", month: "month", day: "day" } as const;

/**
 * Keeps partially typed parts while reporting only complete dates. A controlled value that
 * changes from outside (a calendar pick, a reset) replaces the parts.
 */
function useDateParts(value: Date | null | undefined, defaultValue: Date | null | undefined, onValueChange?: (date: Date | null) => void) {
  const controlled = value !== undefined;
  const [parts, setParts] = React.useState<DateParts>(() => partsOf(controlled ? value : defaultValue));
  const emitted = React.useRef<number | null>(controlled ? (value?.getTime() ?? null) : (defaultValue?.getTime() ?? null));

  React.useEffect(() => {
    if (!controlled) return;
    const time = value?.getTime() ?? null;
    if (time !== emitted.current) {
      emitted.current = time;
      setParts(partsOf(value));
    }
  }, [controlled, value]);

  const update = (next: DateParts) => {
    setParts(next);
    const date = dateOf(next);
    const time = date?.getTime() ?? null;
    if (time !== emitted.current) {
      emitted.current = time;
      onValueChange?.(date);
    }
  };
  return [parts, update] as const;
}

export type DateInputProps = FieldAriaProps & {
  value?: Date | null;
  defaultValue?: Date | null;
  /** Called with a date once every segment is filled, and with `null` when one is cleared. */
  onValueChange?: (date: Date | null) => void;
  /** Segment order and separators follow the locale. */
  locale?: string;
  /** Dates outside the range mark the field invalid (typing is not blocked). */
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
  disabled?: boolean;
  readOnly?: boolean;
  size?: "sm" | "md";
  /** Drops the field border and padding, for composing inside another field (DateRangePicker). */
  bare?: boolean;
  /** Form field name — submits an ISO date (`yyyy-mm-dd`), empty while incomplete. */
  name?: string;
  className?: string;
  /** Rendered at the end of the field, inside its border (DatePicker puts its calendar button here). */
  children?: React.ReactNode;
};

function isoDate(date: Date) {
  const pad = (n: number, width = 2) => String(n).padStart(width, "0");
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Typed date entry: month, day and year segments in the locale's order. Type digits (focus
 * advances when a unit is complete), step with ↑ ↓ (Page ↑ ↓ for larger steps), move with ← →,
 * clear with Backspace. Reports a `Date` only when complete.
 */
export const DateInput = React.forwardRef<HTMLDivElement, DateInputProps>(function DateInput(
  { value, defaultValue, onValueChange, locale, min, max, isDateDisabled, disabled, readOnly, size, bare, name, className, children, ...aria },
  ref,
) {
  const [parts, setParts] = useDateParts(value, defaultValue, onValueChange);
  const layout = React.useMemo(() => dateLayout(locale), [locale]);
  const today = new Date();
  const date = dateOf(parts);
  const outOfRange =
    date !== null &&
    ((min && date < startOfDay(min)) || (max && date > startOfDay(max)) || Boolean(isDateDisabled?.(date)));
  const pad = (width: number) => (n: number) => String(n).padStart(width, "0");

  const specFor = (type: "year" | "month" | "day"): SegmentSpec => {
    if (type === "year") {
      return { type, value: parts.year, min: 1, max: 9999, placeholder: DATE_PLACEHOLDERS.year, label: DATE_LABELS.year, format: pad(4), pageStep: 10, start: today.getFullYear() };
    }
    if (type === "month") {
      return { type, value: parts.month, min: 1, max: 12, placeholder: DATE_PLACEHOLDERS.month, label: DATE_LABELS.month, format: pad(2), pageStep: 3, start: today.getMonth() + 1 };
    }
    const maxDay = daysInMonth(parts.year ?? 2000, parts.month ?? 1); // leap year while unknown
    return { type, value: parts.day, min: 1, max: parts.month === null ? 31 : maxDay, placeholder: DATE_PLACEHOLDERS.day, label: DATE_LABELS.day, format: pad(2), pageStep: 7, start: today.getDate() };
  };

  const segments: Part[] = layout.map((item) => (item.kind === "literal" ? item : { kind: "segment", spec: specFor(item.type) }));

  return (
    <SegmentGroup
      ref={ref}
      parts={segments}
      disabled={disabled}
      readOnly={readOnly}
      invalid={isInvalid(aria["aria-invalid"]) || outOfRange}
      size={size}
      bare={bare}
      className={className}
      groupProps={groupAria(aria)}
      onSegmentChange={(type, next) => {
        const updated = { ...parts, [type]: next };
        // Keep the day valid when the month or year changes under it (31 Mar → Feb).
        if (updated.day !== null && updated.month !== null && type !== "day") {
          updated.day = Math.min(updated.day, daysInMonth(updated.year ?? 2000, updated.month));
        }
        setParts(updated);
      }}
    >
      {children}
      {name ? <input type="hidden" name={name} value={date ? isoDate(date) : ""} /> : null}
    </SegmentGroup>
  );
});

/* ── Time ─────────────────────────────────────────────────────────────────────────────── */

type TimeParts = { hour: number | null; minute: number | null; second: number | null; dayPeriod: number | null };

/** "14:05" / "14:05:30" → seconds since midnight, or null. */
function parseTime(value: string | null | undefined) {
  const match = value ? /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value) : null;
  if (!match) return null;
  const [hours, minutes, seconds] = [Number(match[1]), Number(match[2]), Number(match[3] ?? 0)];
  if (hours > 23 || minutes > 59 || seconds > 59) return null;
  return { hours, minutes, seconds };
}

function timeString(hours: number, minutes: number, seconds: number | null) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return seconds === null ? `${pad(hours)}:${pad(minutes)}` : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function resolveHourCycle(locale: string | undefined, hourCycle: 12 | 24 | undefined): 12 | 24 {
  if (hourCycle) return hourCycle;
  const cycle = new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hourCycle;
  return cycle === "h11" || cycle === "h12" ? 12 : 24;
}

function timeLayout(locale: string | undefined, cycle: 12 | 24, withSeconds: boolean) {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: withSeconds ? "2-digit" : undefined,
    hourCycle: cycle === 12 ? "h12" : "h23",
  })
    .formatToParts(new Date(2000, 0, 1, 13, 5, 9))
    .filter((part) => ["literal", "hour", "minute", "second", "dayPeriod"].includes(part.type))
    .map((part) =>
      part.type === "literal"
        ? { kind: "literal" as const, text: part.value.trim() || part.value }
        : { kind: "segment" as const, type: part.type as "hour" | "minute" | "second" | "dayPeriod" },
    );
}

function periodNames(locale?: string) {
  const format = new Intl.DateTimeFormat(locale, { hour: "numeric", hourCycle: "h12" });
  const name = (hour: number) => format.formatToParts(new Date(2000, 0, 1, hour)).find((part) => part.type === "dayPeriod")?.value ?? (hour < 12 ? "AM" : "PM");
  return [name(1), name(13)] as const;
}

function timePartsOf(value: string | null | undefined, cycle: 12 | 24, withSeconds: boolean): TimeParts {
  const time = parseTime(value);
  if (!time) return { hour: null, minute: null, second: null, dayPeriod: null };
  return {
    hour: cycle === 12 ? time.hours % 12 || 12 : time.hours,
    minute: time.minutes,
    second: withSeconds ? time.seconds : null,
    dayPeriod: cycle === 12 ? (time.hours >= 12 ? 1 : 0) : null,
  };
}

function timeOf(parts: TimeParts, cycle: 12 | 24, withSeconds: boolean) {
  const { hour, minute, second, dayPeriod } = parts;
  if (hour === null || minute === null || (withSeconds && second === null) || (cycle === 12 && dayPeriod === null)) return null;
  const hours = cycle === 12 ? (hour % 12) + (dayPeriod === 1 ? 12 : 0) : hour;
  return timeString(hours, minute, withSeconds ? second : null);
}

export type TimeInputProps = FieldAriaProps & {
  /** 24-hour `HH:mm` (or `HH:mm:ss` with `granularity="second"`), the format of `<input type="time">`. */
  value?: string | null;
  defaultValue?: string | null;
  /** Called with a time string once every segment is filled, and with `null` when one is cleared. */
  onValueChange?: (time: string | null) => void;
  /** Shows seconds. Default "minute". */
  granularity?: "minute" | "second";
  /** 12- or 24-hour display. Defaults to the locale's convention. The value is always 24-hour. */
  hourCycle?: 12 | 24;
  /** Minutes stepped by ↑ ↓. Default 1. Typed minutes are not rounded. */
  minuteStep?: number;
  /** Times outside the range mark the field invalid (typing is not blocked). */
  min?: string;
  max?: string;
  locale?: string;
  disabled?: boolean;
  readOnly?: boolean;
  size?: "sm" | "md";
  /** Form field name — submits the 24-hour value, empty while incomplete. */
  name?: string;
  className?: string;
};

/**
 * Typed time entry: hour, minute (optionally second) and AM/PM segments in the locale's order.
 * Keys work as in DateInput; type A or P (or the locale's first letter) for the day period.
 */
export const TimeInput = React.forwardRef<HTMLDivElement, TimeInputProps>(function TimeInput(
  {
    value,
    defaultValue,
    onValueChange,
    granularity = "minute",
    hourCycle,
    minuteStep = 1,
    min,
    max,
    locale,
    disabled,
    readOnly,
    size,
    name,
    className,
    ...aria
  },
  ref,
) {
  const cycle = resolveHourCycle(locale, hourCycle);
  const withSeconds = granularity === "second";
  const controlled = value !== undefined;
  const [parts, setParts] = React.useState<TimeParts>(() => timePartsOf(controlled ? value : defaultValue, cycle, withSeconds));
  const emitted = React.useRef<string | null>((controlled ? value : defaultValue) ?? null);

  React.useEffect(() => {
    if (!controlled) return;
    if ((value ?? null) !== emitted.current) {
      emitted.current = value ?? null;
      setParts(timePartsOf(value, cycle, withSeconds));
    }
  }, [controlled, value, cycle, withSeconds]);

  const layout = React.useMemo(() => timeLayout(locale, cycle, withSeconds), [locale, cycle, withSeconds]);
  const periods = React.useMemo(() => periodNames(locale), [locale]);
  const current = timeOf(parts, cycle, withSeconds);
  const seconds = (text: string | undefined) => {
    const time = parseTime(text);
    return time ? time.hours * 3600 + time.minutes * 60 + time.seconds : null;
  };
  const now = seconds(current ?? undefined);
  const outOfRange =
    now !== null && ((min !== undefined && now < (seconds(min) ?? -1)) || (max !== undefined && now > (seconds(max) ?? Infinity)));
  const pad = (n: number) => String(n).padStart(2, "0");
  const clock = new Date();

  const specFor = (type: "hour" | "minute" | "second" | "dayPeriod"): SegmentSpec => {
    switch (type) {
      case "hour":
        return cycle === 12
          ? { type, value: parts.hour, min: 1, max: 12, placeholder: "––", label: "hour", format: pad, start: clock.getHours() % 12 || 12 }
          : { type, value: parts.hour, min: 0, max: 23, placeholder: "––", label: "hour", format: pad, start: clock.getHours() };
      case "minute":
        return { type, value: parts.minute, min: 0, max: 59, placeholder: "––", label: "minute", format: pad, step: minuteStep, pageStep: 15, start: 0 };
      case "second":
        return { type, value: parts.second, min: 0, max: 59, placeholder: "––", label: "second", format: pad, pageStep: 15, start: 0 };
      default:
        return { type, value: parts.dayPeriod, min: 0, max: 1, placeholder: periods[0], label: "AM/PM", format: (n) => periods[n] ?? "", start: clock.getHours() >= 12 ? 1 : 0 };
    }
  };

  const segments: Part[] = layout.map((item) => (item.kind === "literal" ? item : { kind: "segment", spec: specFor(item.type) }));

  return (
    <SegmentGroup
      ref={ref}
      parts={segments}
      disabled={disabled}
      readOnly={readOnly}
      invalid={isInvalid(aria["aria-invalid"]) || outOfRange}
      size={size}
      className={cn("spk-time-input", className)}
      groupProps={groupAria(aria)}
      matchPeriod={(key) => {
        const letter = key.toLocaleLowerCase(locale);
        if (letter === "a" || periods[0].toLocaleLowerCase(locale).startsWith(letter)) return 0;
        if (letter === "p" || periods[1].toLocaleLowerCase(locale).startsWith(letter)) return 1;
        return null;
      }}
      onSegmentChange={(type, next) => {
        const updated = { ...parts, [type]: next };
        setParts(updated);
        const time = timeOf(updated, cycle, withSeconds);
        if (time !== emitted.current) {
          emitted.current = time;
          onValueChange?.(time);
        }
      }}
    >
      {name ? <input type="hidden" name={name} value={current ?? ""} /> : null}
    </SegmentGroup>
  );
});
