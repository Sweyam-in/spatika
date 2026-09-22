import type { NormalizedEvent, SchedulerEvent } from "./scheduler";

function toDate(value: Date | string): Date {
  if (value instanceof Date) return new Date(value.getTime());
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  }
  return new Date(value);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + amount);
  return next;
}

function addMonths(date: Date, amount: number): Date {
  const next = new Date(date.getTime());
  next.setMonth(next.getMonth() + amount);
  return next;
}

function addMs(date: Date, ms: number): Date {
  return new Date(date.getTime() + ms);
}

const WEEKDAY: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

export type ParsedRRule = {
  freq: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval: number;
  count?: number;
  until?: Date;
  byDay?: { weekday: number; nth?: number }[];
  byMonthDay?: number[];
};

export function parseRRule(rrule: string): ParsedRRule | null {
  const parts = rrule
    .replace(/^RRULE:/i, "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
  const map = new Map<string, string>();
  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key && value) map.set(key.toUpperCase(), value);
  }
  const freq = map.get("FREQ") as ParsedRRule["freq"] | undefined;
  if (!freq || !["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].includes(freq)) return null;

  const untilRaw = map.get("UNTIL");
  let until: Date | undefined;
  if (untilRaw) {
    const compact = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})Z?)?$/.exec(untilRaw);
    until = compact
      ? new Date(
          Date.UTC(
            Number(compact[1]),
            Number(compact[2]) - 1,
            Number(compact[3]),
            Number(compact[4] ?? 23),
            Number(compact[5] ?? 59),
            Number(compact[6] ?? 59),
          ),
        )
      : toDate(untilRaw);
  }

  const byDay = map.get("BYDAY")
    ?.split(",")
    .flatMap((token) => {
      const match = /^(-?\d+)?(SU|MO|TU|WE|TH|FR|SA)$/.exec(token.trim().toUpperCase());
      if (!match) return [];
      return [{ weekday: WEEKDAY[match[2]], nth: match[1] ? Number(match[1]) : undefined }];
    });

  const byMonthDay = map
    .get("BYMONTHDAY")
    ?.split(",")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  return {
    freq,
    interval: Math.max(1, Number(map.get("INTERVAL") ?? 1) || 1),
    count: map.get("COUNT") ? Math.max(1, Number(map.get("COUNT"))) : undefined,
    until,
    byDay,
    byMonthDay,
  };
}

function nthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date | null {
  if (nth > 0) {
    const first = new Date(year, month, 1);
    const shift = (weekday - first.getDay() + 7) % 7;
    const day = 1 + shift + (nth - 1) * 7;
    const date = new Date(year, month, day);
    return date.getMonth() === month ? date : null;
  }
  const last = new Date(year, month + 1, 0);
  const shift = (last.getDay() - weekday + 7) % 7;
  const day = last.getDate() - shift + (nth + 1) * 7;
  const date = new Date(year, month, day);
  return date.getMonth() === month ? date : null;
}

function matchesByDay(date: Date, rule: ParsedRRule): boolean {
  if (!rule.byDay?.length) return true;
  return rule.byDay.some((item) => {
    if (item.weekday !== date.getDay()) return false;
    if (item.nth == null) return true;
    const found = nthWeekdayOfMonth(date.getFullYear(), date.getMonth(), item.weekday, item.nth);
    return found ? found.getDate() === date.getDate() : false;
  });
}

function exceptionSet(dates: Array<Date | string> | undefined): Set<string> {
  const set = new Set<string>();
  for (const value of dates ?? []) {
    const date = startOfDay(toDate(value));
    set.add(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
  }
  return set;
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/**
 * Expand a recurring event into occurrences overlapping [rangeStart, rangeEnd).
 * Non-recurring events are returned as a single occurrence.
 */
export function expandEventOccurrences(
  event: NormalizedEvent,
  rangeStart: Date,
  rangeEnd: Date,
  source?: SchedulerEvent,
): NormalizedEvent[] {
  if (!event.rrule) return [event];
  const rule = parseRRule(event.rrule);
  if (!rule) return [event];

  const duration = Math.max(0, event.end.getTime() - event.start.getTime());
  const exceptions = exceptionSet(source?.exceptionDates ?? event.exceptionDates);
  const occurrences: NormalizedEvent[] = [];
  const seed = new Date(event.start.getTime());
  let emitted = 0;
  const hardCap = rule.count ?? 400;

  const pushIfVisible = (start: Date) => {
    if (start.getTime() < seed.getTime() - 60_000) return;
    if (exceptions.has(dayKey(start))) return;
    if (rule.until && start.getTime() > rule.until.getTime()) return;
    const end = addMs(start, duration || 3_600_000);
    if (end.getTime() <= rangeStart.getTime() || start.getTime() >= rangeEnd.getTime()) return;
    occurrences.push({
      ...event,
      start,
      end,
      occurrenceStart: start,
    });
  };

  if (rule.freq === "DAILY") {
    let cursor = new Date(seed.getTime());
    while (emitted < hardCap && cursor.getTime() < rangeEnd.getTime() + duration) {
      if (!rule.until || cursor.getTime() <= rule.until.getTime()) {
        pushIfVisible(new Date(cursor.getTime()));
        emitted += 1;
      }
      cursor = addDays(cursor, rule.interval);
      if (rule.count && emitted >= rule.count) break;
    }
    return occurrences;
  }

  if (rule.freq === "WEEKLY") {
    const days = rule.byDay?.length
      ? [...new Set(rule.byDay.map((item) => item.weekday))].sort()
      : [seed.getDay()];
    let weekStart = addDays(startOfDay(seed), -seed.getDay());
    while (emitted < hardCap && weekStart.getTime() < rangeEnd.getTime()) {
      for (const weekday of days) {
        const start = new Date(
          weekStart.getFullYear(),
          weekStart.getMonth(),
          weekStart.getDate() + weekday,
          seed.getHours(),
          seed.getMinutes(),
          seed.getSeconds(),
        );
        if (start.getTime() < seed.getTime() - 60_000) continue;
        if (rule.until && start.getTime() > rule.until.getTime()) continue;
        pushIfVisible(start);
        emitted += 1;
        if (rule.count && emitted >= rule.count) return occurrences;
      }
      weekStart = addDays(weekStart, 7 * rule.interval);
    }
    return occurrences;
  }

  if (rule.freq === "MONTHLY") {
    let year = seed.getFullYear();
    let month = seed.getMonth();
    while (emitted < hardCap) {
      const monthStart = new Date(year, month, 1);
      if (monthStart.getTime() > rangeEnd.getTime()) break;
      const candidates: Date[] = [];
      if (rule.byDay?.length) {
        for (const item of rule.byDay) {
          const found = nthWeekdayOfMonth(year, month, item.weekday, item.nth ?? 1);
          if (found) {
            candidates.push(
              new Date(year, month, found.getDate(), seed.getHours(), seed.getMinutes(), seed.getSeconds()),
            );
          }
        }
      } else {
        const days = rule.byMonthDay?.length ? rule.byMonthDay : [seed.getDate()];
        for (const day of days) {
          const date = new Date(year, month, day, seed.getHours(), seed.getMinutes(), seed.getSeconds());
          if (date.getMonth() === month) candidates.push(date);
        }
      }
      for (const start of candidates.sort((a, b) => a.getTime() - b.getTime())) {
        if (rule.until && start.getTime() > rule.until.getTime()) continue;
        pushIfVisible(start);
        emitted += 1;
        if (rule.count && emitted >= rule.count) return occurrences;
      }
      const next = addMonths(new Date(year, month, 1), rule.interval);
      year = next.getFullYear();
      month = next.getMonth();
    }
    return occurrences;
  }

  let cursor = new Date(seed.getTime());
  while (emitted < hardCap && cursor.getTime() < rangeEnd.getTime() + duration) {
    if (matchesByDay(cursor, rule) && (!rule.until || cursor.getTime() <= rule.until.getTime())) {
      pushIfVisible(new Date(cursor.getTime()));
      emitted += 1;
    }
    cursor = addMonths(cursor, 12 * rule.interval);
    if (rule.count && emitted >= rule.count) break;
  }
  return occurrences;
}

export function expandVisibleEvents(
  events: NormalizedEvent[],
  rangeStart: Date,
  rangeEnd: Date,
  sources: SchedulerEvent[] = [],
): NormalizedEvent[] {
  return events.flatMap((event) =>
    expandEventOccurrences(
      event,
      rangeStart,
      rangeEnd,
      sources.find((item) => item.id === event.id),
    ),
  );
}
