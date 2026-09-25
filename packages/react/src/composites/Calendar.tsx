import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/cn";
import {
  addDays,
  addMonths,
  formatMonthYear,
  getMonthGrid,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  weekdayLabels,
} from "../lib/scheduler";
import { useControllableState } from "../lib/use-controllable-state";
import { IconButton } from "../primitives/IconButton";

export type DateRange = { from: Date | null; to: Date | null };

type CalendarBaseProps = {
  /** First visible month (controlled). */
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  /** Months shown side by side (they wrap when the container is narrow). Default 1. */
  numberOfMonths?: number;
  /** Earliest selectable day. */
  min?: Date;
  /** Latest selectable day. */
  max?: Date;
  /** Return true to disable a day (weekends, holidays, booked dates). */
  isDateDisabled?: (date: Date) => boolean;
  /** 0 = Sunday (default), 1 = Monday. */
  weekStartsOn?: number;
  locale?: string;
  /** Mark the focusable day with `data-autofocus` so a popover opens onto it. */
  autoFocusDay?: boolean;
  className?: string;
};

export type CalendarProps = CalendarBaseProps &
  (
    | {
        mode?: "single";
        selected?: Date | null;
        defaultSelected?: Date | null;
        onSelect?: (date: Date | null) => void;
      }
    | {
        mode: "range";
        selected?: DateRange;
        defaultSelected?: DateRange;
        onSelect?: (range: DateRange) => void;
      }
  );

function clampToBounds(date: Date, min?: Date, max?: Date) {
  if (min && date < startOfDay(min)) return startOfDay(min);
  if (max && date > startOfDay(max)) return startOfDay(max);
  return date;
}

/**
 * Month grid following the WAI-ARIA date-picker grid pattern: one tab stop, arrows move by
 * day / week, Home / End to the start / end of the week, PageUp / PageDown by month
 * (Shift for a year), Enter / Space selects. Single dates or ranges; range mode previews the
 * span while you hover or arrow toward the end date.
 */
export function Calendar(props: CalendarProps) {
  const {
    month: monthProp,
    defaultMonth,
    onMonthChange,
    numberOfMonths = 1,
    min,
    max,
    isDateDisabled,
    weekStartsOn = 0,
    locale,
    autoFocusDay,
    className,
  } = props;
  const range = props.mode === "range";

  const [selectedState, setSelected] = useControllableState<Date | null | DateRange>({
    prop: props.selected,
    defaultProp: props.defaultSelected ?? (range ? { from: null, to: null } : null),
    onChange: props.onSelect as ((value: Date | null | DateRange) => void) | undefined,
  });
  const single = !range ? ((selectedState as Date | null | undefined) ?? null) : null;
  const span = range ? ((selectedState as DateRange | undefined) ?? { from: null, to: null }) : null;
  const anchor = single ?? span?.from ?? null;

  const [monthState, setMonth] = useControllableState<Date>({
    prop: monthProp,
    defaultProp: startOfMonth(defaultMonth ?? anchor ?? clampToBounds(new Date(), min, max)),
    onChange: onMonthChange,
  });
  const month = startOfMonth(monthState ?? new Date());
  const [focusedState, setFocused] = React.useState<Date | null>(anchor ? startOfDay(anchor) : null);
  const [hovered, setHovered] = React.useState<Date | null>(null);
  const gridRef = React.useRef<HTMLDivElement | null>(null);
  const shouldFocus = React.useRef(false);
  const titleId = React.useId();
  const today = startOfDay(new Date());

  const dayLabel = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    [locale],
  );
  const weekdays = weekdayLabels(weekStartsOn, locale);
  const weekdayNames = React.useMemo(() => {
    const format = new Intl.DateTimeFormat(locale, { weekday: "long" });
    const sunday = new Date(2024, 0, 7);
    return Array.from({ length: 7 }, (_, i) => format.format(addDays(sunday, (i + weekStartsOn) % 7)));
  }, [locale, weekStartsOn]);

  const disabled = React.useCallback(
    (date: Date) =>
      (min != null && date < startOfDay(min)) ||
      (max != null && date > startOfDay(max)) ||
      Boolean(isDateDisabled?.(date)),
    [min, max, isDateDisabled],
  );

  const lastVisible = addMonths(month, numberOfMonths - 1);
  const isVisible = (date: Date | null | undefined): date is Date =>
    date != null && date >= month && date < addMonths(lastVisible, 1);
  // The single tab stop must always be a visible day: the focused day, else the selection,
  // else today, else the first of the month (e.g. after paging with the month buttons).
  const focused = [focusedState, anchor ? startOfDay(anchor) : null, today].find(isVisible) ?? month;

  React.useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    gridRef.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
  });

  const moveFocus = (next: Date) => {
    const target = clampToBounds(startOfDay(next), min, max);
    shouldFocus.current = true;
    setFocused(target);
    // Keep the roving day visible: moving focus past the shown months pages the calendar.
    if (target < month) setMonth(startOfMonth(target));
    else if (target >= addMonths(lastVisible, 1)) {
      setMonth(startOfMonth(addMonths(target, -(numberOfMonths - 1))));
    }
  };

  const select = (date: Date) => {
    if (disabled(date)) return;
    if (!range) {
      setSelected(isSameDay(date, single ?? new Date(NaN)) ? single : date);
      return;
    }
    const current = span ?? { from: null, to: null };
    if (!current.from || current.to) setSelected({ from: date, to: null });
    else if (date < current.from) setSelected({ from: date, to: current.from });
    else setSelected({ from: current.from, to: date });
    setHovered(null);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const weekday = (focused.getDay() - weekStartsOn + 7) % 7;
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => addDays(focused, -weekday),
      End: () => addDays(focused, 6 - weekday),
      PageUp: () => addMonths(focused, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, event.shiftKey ? 12 : 1),
    };
    if (moves[event.key]) {
      event.preventDefault();
      const next = moves[event.key]();
      moveFocus(next);
      if (range && span?.from && !span.to) setHovered(startOfDay(next));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select(focused);
    }
  };

  const rangeEnd = span?.to ?? (span?.from && hovered && hovered >= span.from ? hovered : null);

  return (
    <div data-slot="calendar" className={cn("spk-calendar", className)} ref={gridRef}>
      <div className="spk-calendar-months">
        {Array.from({ length: numberOfMonths }, (_, offset) => {
          const shown = addMonths(month, offset);
          const days = getMonthGrid(shown, weekStartsOn);
          const weeks = Array.from({ length: Math.ceil(days.length / 7) }, (_, w) => days.slice(w * 7, w * 7 + 7));
          const first = offset === 0;
          const last = offset === numberOfMonths - 1;
          const monthTitleId = `${titleId}-${offset}`;
          return (
            <div key={offset} className="flex flex-col gap-2">
              <div className="spk-calendar-header">
                {first ? (
                  <IconButton
                    size="sm"
                    aria-label="Previous month"
                    disabled={min != null && startOfMonth(min) >= month}
                    onClick={() => setMonth(addMonths(month, -1))}
                  >
                    <ChevronLeft className="size-4" />
                  </IconButton>
                ) : (
                  <span className="size-8" aria-hidden />
                )}
                <div id={monthTitleId} className="spk-calendar-title" aria-live="polite">
                  {formatMonthYear(shown, locale)}
                </div>
                {last ? (
                  <IconButton
                    size="sm"
                    aria-label="Next month"
                    disabled={max != null && startOfMonth(max) <= lastVisible}
                    onClick={() => setMonth(addMonths(month, 1))}
                  >
                    <ChevronRight className="size-4" />
                  </IconButton>
                ) : (
                  <span className="size-8" aria-hidden />
                )}
              </div>
              <table role="grid" aria-labelledby={monthTitleId} className="spk-calendar-grid" onKeyDown={onKeyDown}>
                <thead>
                  <tr>
                    {weekdays.map((label, i) => (
                      <th key={label + i} scope="col" abbr={weekdayNames[i]} className="spk-calendar-weekday">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((week, w) => (
                    <tr key={w}>
                      {week.map((day) => {
                        const outside = !isSameMonth(day, shown);
                        // Days from neighbouring months are shown for shape but are not interactive
                        // when several months are visible (they would duplicate the next month).
                        if (outside && numberOfMonths > 1) return <td key={day.toISOString()} role="gridcell" />;
                        const isDisabled = disabled(day);
                        const isSelected = single != null && isSameDay(day, single);
                        const isStart = span?.from != null && isSameDay(day, span.from);
                        const isEnd = rangeEnd != null && isSameDay(day, rangeEnd);
                        const inRange =
                          span?.from != null && rangeEnd != null && day > span.from && day < rangeEnd;
                        const isFocusTarget = isSameDay(day, focused) && isSameMonth(day, shown);
                        return (
                          <td
                            key={day.toISOString()}
                            role="gridcell"
                            className="spk-calendar-cell"
                            aria-selected={isSelected || isStart || isEnd || inRange || undefined}
                          >
                            <button
                              type="button"
                              className="spk-calendar-day"
                              tabIndex={isFocusTarget ? 0 : -1}
                              data-autofocus={autoFocusDay && isFocusTarget ? "" : undefined}
                              aria-label={dayLabel.format(day)}
                              aria-disabled={isDisabled || undefined}
                              aria-current={isSameDay(day, today) ? "date" : undefined}
                              data-today={isSameDay(day, today) || undefined}
                              data-outside={outside || undefined}
                              data-selected={isSelected || undefined}
                              data-range-start={isStart || undefined}
                              data-range-end={isEnd || undefined}
                              data-in-range={inRange || undefined}
                              onClick={() => {
                                setFocused(day);
                                select(day);
                              }}
                              onPointerEnter={() => {
                                if (range && span?.from && !span.to) setHovered(day);
                              }}
                              onFocus={() => {
                                if (!isSameDay(day, focused)) setFocused(day);
                              }}
                            >
                              {day.getDate()}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
