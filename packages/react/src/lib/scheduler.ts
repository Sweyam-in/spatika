/**
 * Date math and layout helpers for EventCalendar / EventTimeline.
 * Local timezone throughout — date-only ISO strings parse as local midnight.
 */

import type { CSSProperties } from "react";

export const SCHEDULER_COLOR_TONES = [
  "blue",
  "violet",
  "teal",
  "orange",
  "rose",
  "slate",
] as const;

export type SchedulerColorTone = (typeof SCHEDULER_COLOR_TONES)[number];

export type SchedulerEvent = {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  resourceId?: string;
  allDay?: boolean;
  color?: SchedulerColorTone;
  description?: string;
  /** RFC 5545 RRULE, e.g. `FREQ=WEEKLY;BYDAY=MO,WE`. */
  rrule?: string;
  /** Dates to skip from a recurring series. */
  exceptionDates?: Array<Date | string>;
  timezone?: string;
  readOnly?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  /** Opaque host payload. The kit never inspects it. */
  data?: unknown;
};

export type SchedulerResource = {
  id: string;
  title: string;
  color?: SchedulerColorTone;
};

export type CalendarView = "month" | "week" | "day" | "agenda";
export type TimelineScale = "hours" | "days" | "weeks" | "months" | "years";

export type SchedulerPreferences = {
  showWeekends?: boolean;
  showWeekNumber?: boolean;
  ampm?: boolean;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

export const DEFAULT_SCHEDULER_PREFERENCES: Required<SchedulerPreferences> = {
  showWeekends: true,
  showWeekNumber: false,
  ampm: true,
  weekStartsOn: 0,
};

export type NormalizedEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId?: string;
  allDay: boolean;
  color: SchedulerColorTone;
  description?: string;
  rrule?: string;
  exceptionDates?: Array<Date | string>;
  timezone?: string;
  readOnly?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  occurrenceStart?: Date;
  /** Opaque host payload. The kit never inspects it. */
  data?: unknown;
};

export const SCHEDULER_COLOR_VARS: Record<SchedulerColorTone, string> = {
  blue: "var(--spk-viz-1, var(--chart-1))",
  violet: "var(--spk-viz-4, var(--chart-2))",
  teal: "var(--spk-viz-2, var(--chart-3))",
  orange: "var(--spk-viz-3, var(--chart-4))",
  rose: "var(--spk-viz-6, var(--destructive))",
  slate: "var(--spk-viz-5, var(--chart-5))",
};

const TONE_CYCLE: SchedulerColorTone[] = [
  "blue",
  "violet",
  "teal",
  "orange",
  "rose",
  "slate",
];

export function toDate(value: Date | string): Date {
  if (value instanceof Date) return new Date(value.getTime());
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  }
  const localDateTime =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d+))?$/.exec(value);
  if (localDateTime) {
    return new Date(
      Number(localDateTime[1]),
      Number(localDateTime[2]) - 1,
      Number(localDateTime[3]),
      Number(localDateTime[4]),
      Number(localDateTime[5]),
      Number(localDateTime[6] ?? 0),
      Number((localDateTime[7] ?? "0").slice(0, 3).padEnd(3, "0")),
    );
  }
  return new Date(value);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + amount);
  return next;
}

export function addMonths(date: Date, amount: number): Date {
  const next = new Date(date.getTime());
  next.setMonth(next.getMonth() + amount);
  return next;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function startOfWeek(date: Date, weekStartsOn = 0): Date {
  const start = startOfDay(date);
  const shift = (start.getDay() - weekStartsOn + 7) % 7;
  return addDays(start, -shift);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function differenceInDays(later: Date, earlier: Date): number {
  return Math.round((startOfDay(later).getTime() - startOfDay(earlier).getTime()) / 86_400_000);
}

export function differenceInMs(later: Date, earlier: Date): number {
  return later.getTime() - earlier.getTime();
}

export function addMs(date: Date, ms: number): Date {
  return new Date(date.getTime() + ms);
}

export function clampDate(date: Date, min: Date, max: Date): Date {
  const t = date.getTime();
  if (t < min.getTime()) return new Date(min.getTime());
  if (t > max.getTime()) return new Date(max.getTime());
  return date;
}

export function getMonthGrid(date: Date, weekStartsOn = 0): Date[] {
  const start = startOfWeek(startOfMonth(date), weekStartsOn);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export function getWeekDays(date: Date, weekStartsOn = 0): Date[] {
  const start = startOfWeek(date, weekStartsOn);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** Inclusive first instant of the agenda window. */
export const CALENDAR_AGENDA_DAYS = 14;

export type CalendarVisibleRange = {
  start: Date;
  /** Exclusive end (start of the day after the last visible day). */
  end: Date;
};

/**
 * Days the calendar actually paints for a view.
 * Month includes leading/trailing grid days, not just the named month.
 */
export function calendarVisibleRange(
  view: CalendarView,
  date: Date,
  weekStartsOn = 0,
): CalendarVisibleRange {
  if (view === "month") {
    const grid = getMonthGrid(date, weekStartsOn);
    return { start: grid[0], end: addDays(grid[grid.length - 1], 1) };
  }
  if (view === "week") {
    const days = getWeekDays(date, weekStartsOn);
    return { start: days[0], end: addDays(days[6], 1) };
  }
  if (view === "agenda") {
    const days = agendaDays(date, CALENDAR_AGENDA_DAYS);
    return { start: days[0], end: addDays(days[days.length - 1], 1) };
  }
  const start = startOfDay(date);
  return { start, end: addDays(start, 1) };
}

export function weekdayLabels(weekStartsOn = 0, locale?: string): string[] {
  const sunday = new Date(2026, 7, 2);
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(sunday, (weekStartsOn + i) % 7);
    return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(day);
  });
}

export function formatMonthYear(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date);
}

export function formatWeekRange(date: Date, weekStartsOn = 0, locale?: string): string {
  const days = getWeekDays(date, weekStartsOn);
  const start = days[0];
  const end = days[6];
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const startFmt = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(start);
  // `{ day, year }` without a month is an invalid Intl combination in most locales
  // ("2026 (day: 13)"), so the closing day and year are composed separately.
  const endFmt = sameMonth
    ? `${new Intl.DateTimeFormat(locale, { day: "numeric" }).format(end)}, ${new Intl.DateTimeFormat(locale, { year: "numeric" }).format(end)}`
    : new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }).format(end);
  return `${startFmt} – ${endFmt}`;
}

export function formatDayHeading(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatTime(date: Date, locale?: string, hour12 = true): string {
  return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", hour12 }).format(date);
}

export function formatHour(hour: number, locale?: string, hour12 = true): string {
  const date = new Date(2026, 0, 1, hour, 0);
  return new Intl.DateTimeFormat(locale, { hour: "numeric", hour12 }).format(date);
}

export function formatDateRange(
  start: Date,
  end: Date,
  allDay: boolean,
  locale?: string,
  hour12 = true,
): string {
  if (allDay) {
    const last = addMs(end, -1);
    if (isSameDay(start, last)) {
      return new Intl.DateTimeFormat(locale, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(start);
    }
    const fmt = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });
    return `${fmt.format(start)} – ${fmt.format(last)}`;
  }
  if (isSameDay(start, end) || isSameDay(start, addMs(end, -1))) {
    return `${formatTime(start, locale, hour12)} – ${formatTime(end, locale, hour12)}`;
  }
  const dayFmt = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });
  return `${dayFmt.format(start)} ${formatTime(start, locale, hour12)} – ${dayFmt.format(end)} ${formatTime(end, locale, hour12)}`;
}

export function formatDateSpan(start: Date, end: Date, locale?: string): string {
  const sameYear = start.getFullYear() === end.getFullYear();
  const startFmt = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  }).format(start);
  const endFmt = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(end);
  return `${startFmt} – ${endFmt}`;
}

export function occurrenceKey(event: NormalizedEvent): string {
  return event.occurrenceStart ? `${event.id}@${event.occurrenceStart.getTime()}` : event.id;
}

export function eventCanDrag(
  event: Pick<NormalizedEvent, "readOnly" | "draggable">,
  options: { readOnly?: boolean; enabled?: boolean },
): boolean {
  if (options.readOnly || event.readOnly || options.enabled === false || event.draggable === false) {
    return false;
  }
  return true;
}

export function eventCanResize(
  event: Pick<NormalizedEvent, "readOnly" | "resizable">,
  options: { readOnly?: boolean; enabled?: boolean },
): boolean {
  if (options.readOnly || event.readOnly || options.enabled === false || event.resizable === false) {
    return false;
  }
  return true;
}

export function resolveEventColor(
  event: Pick<SchedulerEvent, "color" | "resourceId">,
  resources: SchedulerResource[] = [],
): SchedulerColorTone {
  if (event.color) return event.color;
  const resource = resources.find((item) => item.id === event.resourceId);
  if (resource?.color) return resource.color;
  if (event.resourceId) {
    const index = resources.findIndex((item) => item.id === event.resourceId);
    return TONE_CYCLE[(index >= 0 ? index : hashString(event.resourceId)) % TONE_CYCLE.length];
  }
  return "blue";
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

export function normalizeEvents(
  events: SchedulerEvent[],
  resources: SchedulerResource[] = [],
): NormalizedEvent[] {
  return events
    .map((event) => {
      const start = toDate(event.start);
      const end = toDate(event.end);
      const ordered = end.getTime() >= start.getTime();
      return {
        id: event.id,
        title: event.title,
        start: ordered ? start : end,
        end: ordered ? end : start,
        resourceId: event.resourceId,
        allDay: Boolean(event.allDay),
        color: resolveEventColor(event, resources),
        description: event.description,
        rrule: event.rrule,
        exceptionDates: event.exceptionDates,
        timezone: event.timezone,
        readOnly: event.readOnly,
        draggable: event.draggable,
        resizable: event.resizable,
        data: event.data,
      };
    })
    .sort((a, b) => a.start.getTime() - b.start.getTime() || a.title.localeCompare(b.title));
}

/** Last occupied instant is exclusive-end minus 1ms. */
export function lastInstant(event: Pick<NormalizedEvent, "end">): Date {
  return addMs(event.end, event.end.getTime() === startOfDay(event.end).getTime() ? -1 : 0);
}

export function occupiesDay(event: NormalizedEvent, day: Date): boolean {
  const dayStart = startOfDay(day);
  const dayEnd = addDays(dayStart, 1);
  return event.start.getTime() < dayEnd.getTime() && event.end.getTime() > dayStart.getTime();
}

export function isMonthBar(event: NormalizedEvent): boolean {
  if (event.allDay) return true;
  return !isSameDay(event.start, lastInstant(event));
}

export type SpanSegment = {
  event: NormalizedEvent;
  startCol: number;
  span: number;
};

export type SpanLane = SpanSegment[];

export function weekSpanLanes(weekStart: Date, events: NormalizedEvent[]): SpanLane[] {
  return weekSpanLanesForDays(
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    events,
  );
}

export function weekSpanLanesForDays(days: Date[], events: NormalizedEvent[]): SpanLane[] {
  if (days.length === 0) return [];
  const weekStart = startOfDay(days[0]);
  const weekEnd = addDays(startOfDay(days[days.length - 1]), 1);
  const indexByKey = new Map(days.map((day, index) => [dayKey(day), index]));
  const segments: SpanSegment[] = [];

  for (const event of events) {
    if (!isMonthBar(event)) continue;
    if (event.end.getTime() <= weekStart.getTime() || event.start.getTime() >= weekEnd.getTime()) {
      continue;
    }
    let first = -1;
    let last = -1;
    for (const day of days) {
      if (!occupiesDay(event, day)) continue;
      const index = indexByKey.get(dayKey(day)) ?? -1;
      if (index < 0) continue;
      if (first === -1) first = index;
      last = index;
    }
    if (first === -1) continue;
    segments.push({ event, startCol: first, span: last - first + 1 });
  }

  segments.sort((a, b) => a.startCol - b.startCol || b.span - a.span);

  const lanes: SpanLane[] = [];
  for (const segment of segments) {
    const lane = lanes.find((items) =>
      items.every((item) => item.startCol + item.span <= segment.startCol),
    );
    if (lane) lane.push(segment);
    else lanes.push([segment]);
  }
  return lanes;
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function isoDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function filterWeekendDays(days: Date[], showWeekends: boolean): Date[] {
  if (showWeekends) return days;
  return days.filter((day) => day.getDay() !== 0 && day.getDay() !== 6);
}

export function weekNumber(date: Date): number {
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const day = new Date(utc);
  day.setUTCDate(day.getUTCDate() + 4 - (day.getUTCDay() || 7));
  const yearStart = Date.UTC(day.getUTCFullYear(), 0, 1);
  return Math.ceil(((utc - yearStart) / 86_400_000 + 1) / 7);
}

export function agendaDays(date: Date, count = 14): Date[] {
  const start = startOfDay(date);
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}

export function snapMs(ms: number, unit = 15 * 60_000): number {
  return Math.round(ms / unit) * unit;
}

export function resizeEvent(
  event: NormalizedEvent,
  edge: "start" | "end",
  nextInstant: Date,
): { start: Date; end: Date } {
  const min = 15 * 60_000;
  if (edge === "start") {
    const start = new Date(Math.min(nextInstant.getTime(), event.end.getTime() - min));
    return { start, end: event.end };
  }
  const end = new Date(Math.max(nextInstant.getTime(), event.start.getTime() + min));
  return { start: event.start, end };
}

export function toDatetimeLocalValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): Date {
  return toDate(value);
}

export function createEventId(): string {
  return `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function timedEventsOnDay(events: NormalizedEvent[], day: Date): NormalizedEvent[] {
  return events.filter((event) => !isMonthBar(event) && occupiesDay(event, day));
}

export type TimedLayoutItem = {
  event: NormalizedEvent;
  col: number;
  cols: number;
  top: number;
  height: number;
};

export function layoutTimedEvents(
  events: NormalizedEvent[],
  day: Date,
  hourStart: number,
  hourEnd: number,
): TimedLayoutItem[] {
  const dayStart = startOfDay(day);
  const windowStart = new Date(dayStart.getTime() + hourStart * 3_600_000);
  const windowEnd = new Date(dayStart.getTime() + hourEnd * 3_600_000);
  const windowMs = Math.max(1, windowEnd.getTime() - windowStart.getTime());

  const items = events
    .filter((event) => !event.allDay && occupiesDay(event, day))
    .map((event) => {
      const start = clampDate(event.start, windowStart, windowEnd);
      const end = clampDate(event.end, windowStart, windowEnd);
      const top = ((start.getTime() - windowStart.getTime()) / windowMs) * 100;
      const height = Math.max(3.2, ((end.getTime() - start.getTime()) / windowMs) * 100);
      return { event, start, end, top, height, col: 0, cols: 1 };
    })
    .sort((a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime());

  const columns: { end: number }[] = [];
  let active: number[] = [];

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    active = active.filter((idx) => items[idx].end.getTime() > item.start.getTime());
    let col = columns.findIndex((column) => column.end <= item.start.getTime());
    if (col === -1) {
      col = columns.length;
      columns.push({ end: item.end.getTime() });
    } else {
      columns[col].end = item.end.getTime();
    }
    item.col = col;
    active.push(i);
    const clusterCols = Math.max(columns.length, active.length);
    for (const idx of active) items[idx].cols = Math.max(items[idx].cols, clusterCols);
  }

  return items.map(({ event, col, cols, top, height }) => ({ event, col, cols, top, height }));
}

export function shiftByDays(event: NormalizedEvent, days: number): { start: Date; end: Date } {
  return { start: addDays(event.start, days), end: addDays(event.end, days) };
}

export function shiftByMs(event: NormalizedEvent, ms: number): { start: Date; end: Date } {
  return { start: addMs(event.start, ms), end: addMs(event.end, ms) };
}

export function hoursInView(hourStart: number, hourEnd: number): number[] {
  const hours: number[] = [];
  for (let hour = hourStart; hour < hourEnd; hour += 1) hours.push(hour);
  return hours;
}

export type TimelineRange = {
  start: Date;
  end: Date;
  ticks: { date: Date; label: string }[];
};

export function getTimelineRange(
  date: Date,
  scale: TimelineScale,
  locale?: string,
): TimelineRange {
  if (scale === "hours") {
    const start = startOfDay(date);
    const end = addDays(start, 2);
    const ticks = Array.from({ length: 8 }, (_, i) => {
      const tick = addMs(start, i * 6 * 3_600_000);
      return {
        date: tick,
        label: new Intl.DateTimeFormat(locale, { weekday: "short", hour: "numeric" }).format(tick),
      };
    });
    return { start, end, ticks };
  }

  if (scale === "days") {
    const start = startOfDay(addDays(date, -3));
    const end = addDays(start, 14);
    const ticks = Array.from({ length: 14 }, (_, i) => {
      const tick = addDays(start, i);
      return {
        date: tick,
        label: new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric" }).format(tick),
      };
    });
    return { start, end, ticks };
  }

  if (scale === "weeks") {
    const start = startOfWeek(addDays(date, -14), 1);
    const end = addDays(start, 7 * 8);
    const ticks = Array.from({ length: 8 }, (_, i) => {
      const tick = addDays(start, i * 7);
      return {
        date: tick,
        label: new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(tick),
      };
    });
    return { start, end, ticks };
  }

  const start = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  if (scale === "years") {
    const yearStart = new Date(date.getFullYear() - 1, 0, 1);
    const yearEnd = new Date(date.getFullYear() + 4, 0, 1);
    const ticks = Array.from({ length: 5 }, (_, i) => {
      const tick = new Date(date.getFullYear() - 1 + i, 0, 1);
      return { date: tick, label: String(tick.getFullYear()) };
    });
    return { start: yearStart, end: yearEnd, ticks };
  }
  const end = addMonths(start, 5);
  const ticks = Array.from({ length: 5 }, (_, i) => {
    const tick = addMonths(start, i);
    return {
      date: tick,
      label: new Intl.DateTimeFormat(locale, { month: "short" }).format(tick),
    };
  });
  return { start, end, ticks };
}

export function shiftTimelineDate(date: Date, scale: TimelineScale, direction: -1 | 1): Date {
  if (scale === "hours") return addDays(date, direction * 2);
  if (scale === "days") return addDays(date, direction * 14);
  if (scale === "weeks") return addDays(date, direction * 28);
  if (scale === "years") return addMonths(date, direction * 12);
  return addMonths(date, direction * 3);
}

export type TimelineBar = {
  event: NormalizedEvent;
  lane: number;
  left: number;
  width: number;
};

export function layoutTimelineBars(
  events: NormalizedEvent[],
  rangeStart: Date,
  rangeEnd: Date,
): TimelineBar[] {
  const rangeMs = Math.max(1, rangeEnd.getTime() - rangeStart.getTime());
  const items = events
    .filter((event) => event.end.getTime() > rangeStart.getTime() && event.start.getTime() < rangeEnd.getTime())
    .map((event) => {
      const start = clampDate(event.start, rangeStart, rangeEnd);
      const end = clampDate(event.end, rangeStart, rangeEnd);
      const left = ((start.getTime() - rangeStart.getTime()) / rangeMs) * 100;
      const width = Math.max(1.2, ((end.getTime() - start.getTime()) / rangeMs) * 100);
      return { event, start, end, left, width, lane: 0 };
    })
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const laneEnds: number[] = [];
  for (const item of items) {
    let lane = laneEnds.findIndex((end) => end <= item.start.getTime());
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(item.end.getTime());
    } else {
      laneEnds[lane] = item.end.getTime();
    }
    item.lane = lane;
  }

  return items.map(({ event, lane, left, width }) => ({ event, lane, left, width }));
}

export function eventColorStyle(
  tone: SchedulerColorTone,
  variant: "dot" | "bar" | "block" | "wash",
): CSSProperties {
  const color = SCHEDULER_COLOR_VARS[tone];
  // Event text mixes the tone with the primary text colour so it stays legible (AA) in every theme.
  const ink = `color-mix(in oklab, ${color} 70%, var(--spk-text-primary, currentColor))`;
  if (variant === "dot") return { backgroundColor: color };
  if (variant === "bar") {
    return {
      backgroundColor: `color-mix(in oklab, ${color} 16%, var(--spk-surface, transparent))`,
      boxShadow: `inset 2px 0 0 ${color}`,
      color: ink,
    };
  }
  if (variant === "wash") {
    return { backgroundColor: `color-mix(in oklab, ${color} 12%, transparent)`, color: ink };
  }
  return {
    backgroundColor: `color-mix(in oklab, ${color} 14%, var(--spk-surface, transparent))`,
    boxShadow: `inset 2px 0 0 ${color}`,
    color: ink,
  };
}

export function visibleEvents(
  events: NormalizedEvent[],
  hiddenResourceIds: ReadonlySet<string>,
): NormalizedEvent[] {
  if (hiddenResourceIds.size === 0) return events;
  return events.filter((event) => !event.resourceId || !hiddenResourceIds.has(event.resourceId));
}

