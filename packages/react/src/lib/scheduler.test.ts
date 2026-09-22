import { describe, expect, it } from "vitest";
import {
  addDays,
  calendarVisibleRange,
  CALENDAR_AGENDA_DAYS,
  eventColorStyle,
  formatDateRange,
  getMonthGrid,
  getTimelineRange,
  isMonthBar,
  lastInstant,
  layoutTimelineBars,
  layoutTimedEvents,
  normalizeEvents,
  occupiesDay,
  resizeEvent,
  shiftByDays,
  startOfWeek,
  toDate,
  weekSpanLanes,
  weekdayLabels,
} from "./scheduler";

describe("scheduler dates", () => {
  it("parses date-only ISO strings as local midnight", () => {
    const date = toDate("2026-08-03");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(7);
    expect(date.getDate()).toBe(3);
    expect(date.getHours()).toBe(0);
  });

  it("builds a 42-cell month grid starting on the week of the 1st", () => {
    const grid = getMonthGrid(new Date(2026, 7, 15), 0);
    expect(grid).toHaveLength(42);
    expect(grid[0].getDay()).toBe(0);
    expect(grid[0].getDate()).toBe(26);
    expect(grid[0].getMonth()).toBe(6);
  });

  it("reports the exclusive visible range for month, week, and agenda", () => {
    const month = calendarVisibleRange("month", new Date(2026, 7, 15), 0);
    expect(month.start.getDate()).toBe(26);
    expect(month.start.getMonth()).toBe(6);
    expect(month.end.getTime()).toBe(addDays(getMonthGrid(new Date(2026, 7, 15), 0)[41], 1).getTime());

    const week = calendarVisibleRange("week", new Date(2026, 7, 15), 0);
    expect(week.start.getDay()).toBe(0);
    expect(week.end.getTime() - week.start.getTime()).toBe(7 * 86_400_000);

    const agenda = calendarVisibleRange("agenda", new Date(2026, 7, 3), 0);
    expect(agenda.end.getTime() - agenda.start.getTime()).toBe(CALENDAR_AGENDA_DAYS * 86_400_000);
  });

  it("returns Sunday-first weekday labels by default", () => {
    const labels = weekdayLabels(0, "en-US");
    expect(labels[0]).toMatch(/^Sun/);
    expect(labels[6]).toMatch(/^Sat/);
  });

  it("treats all-day and multi-day events as month bars", () => {
    const events = normalizeEvents([
      {
        id: "run",
        title: "Morning Run",
        start: "2026-08-03T07:00:00",
        end: "2026-08-03T07:45:00",
      },
      {
        id: "bday",
        title: "Alice's Birthday",
        start: "2026-08-03",
        end: "2026-08-05",
        allDay: true,
      },
    ]);
    const run = events.find((event) => event.id === "run")!;
    const birthday = events.find((event) => event.id === "bday")!;
    expect(isMonthBar(run)).toBe(false);
    expect(isMonthBar(birthday)).toBe(true);
    expect(occupiesDay(birthday, new Date(2026, 7, 3))).toBe(true);
    expect(occupiesDay(birthday, new Date(2026, 7, 4))).toBe(true);
    expect(occupiesDay(birthday, new Date(2026, 7, 5))).toBe(false);
  });

  it("preserves host data on normalized events", () => {
    const [event] = normalizeEvents([
      {
        id: "run",
        title: "Morning Run",
        start: "2026-08-03T07:00:00",
        end: "2026-08-03T07:45:00",
        data: { kind: "CATCHUP" },
      },
    ]);
    expect(event.data).toEqual({ kind: "CATCHUP" });
  });
});

describe("scheduler layout", () => {
  it("packs multi-day bars into week lanes", () => {
    const events = normalizeEvents([
      {
        id: "bday",
        title: "Alice's Birthday",
        start: "2026-08-06",
        end: "2026-08-08",
        allDay: true,
      },
      {
        id: "offsite",
        title: "Offsite",
        start: "2026-08-03",
        end: "2026-08-07",
        allDay: true,
      },
    ]);
    const weekStart = startOfWeek(new Date(2026, 7, 5), 0);
    const lanes = weekSpanLanes(weekStart, events);
    expect(lanes.length).toBeGreaterThan(0);
    const offsite = lanes.flat().find((seg) => seg.event.id === "offsite");
    expect(offsite?.span).toBe(4);
  });

  it("splits overlapping timed events into columns", () => {
    const day = new Date(2026, 7, 3);
    const events = normalizeEvents([
      {
        id: "a",
        title: "A",
        start: "2026-08-03T09:00:00",
        end: "2026-08-03T10:00:00",
      },
      {
        id: "b",
        title: "B",
        start: "2026-08-03T09:30:00",
        end: "2026-08-03T10:30:00",
      },
    ]);
    const layout = layoutTimedEvents(events, day, 8, 18);
    expect(layout).toHaveLength(2);
    expect(Math.max(...layout.map((item) => item.cols))).toBeGreaterThanOrEqual(2);
  });

  it("places timeline bars within the visible range", () => {
    const events = normalizeEvents([
      {
        id: "api",
        title: "API V3",
        start: "2026-07-01",
        end: "2026-09-15",
        allDay: true,
        resourceId: "eng",
      },
    ]);
    const { start, end } = getTimelineRange(new Date(2026, 7, 1), "months");
    const bars = layoutTimelineBars(events, start, end);
    expect(bars).toHaveLength(1);
    expect(bars[0].width).toBeGreaterThan(10);
    expect(bars[0].left).toBeGreaterThanOrEqual(0);
  });

  it("builds hours and years timeline ranges", () => {
    const hours = getTimelineRange(new Date(2026, 7, 15), "hours");
    expect(hours.ticks).toHaveLength(8);
    const years = getTimelineRange(new Date(2026, 7, 15), "years");
    expect(years.ticks.map((tick) => tick.label)).toEqual(["2025", "2026", "2027", "2028", "2029"]);
  });

  it("shifts an event by whole days", () => {
    const [event] = normalizeEvents([
      {
        id: "gym",
        title: "Gym",
        start: "2026-08-03T18:00:00",
        end: "2026-08-03T19:00:00",
      },
    ]);
    const next = shiftByDays(event, 2);
    expect(next.start.getDate()).toBe(5);
    expect(next.start.getHours()).toBe(18);
    expect(next.end.getHours()).toBe(19);
  });

  it("resizes an event from the end edge with a 15-minute minimum", () => {
    const [event] = normalizeEvents([
      {
        id: "gym",
        title: "Gym",
        start: "2026-08-03T18:00:00",
        end: "2026-08-03T19:00:00",
      },
    ]);
    const longer = resizeEvent(event, "end", new Date(2026, 7, 3, 20, 0));
    expect(longer.end.getHours()).toBe(20);
    expect(longer.start.getHours()).toBe(18);
    const tooShort = resizeEvent(event, "end", new Date(2026, 7, 3, 18, 5));
    expect(tooShort.end.getTime() - tooShort.start.getTime()).toBe(15 * 60_000);
  });
});

describe("scheduler formatting", () => {
  it("formats a same-day timed range", () => {
    const start = new Date(2026, 7, 3, 7, 0);
    const end = new Date(2026, 7, 3, 7, 45);
    expect(formatDateRange(start, end, false, "en-US")).toMatch(/7:00/);
  });

  it("treats midnight exclusive ends as the previous instant", () => {
    const [event] = normalizeEvents([
      { id: "x", title: "X", start: "2026-08-03", end: "2026-08-04", allDay: true },
    ]);
    expect(lastInstant(event).getDate()).toBe(3);
  });
});

describe("eventColorStyle", () => {
  it("uses a tinted bar with a tone rail and legible ink for month-spanning events", () => {
    const style = eventColorStyle("rose", "bar");
    expect(style.backgroundColor).toContain("var(--spk-viz-6");
    expect(style.boxShadow).toBe("inset 2px 0 0 var(--spk-viz-6, var(--destructive))");
    expect(style.color).toContain("var(--spk-text-primary");
  });

  it("uses a solid tone for dots", () => {
    expect(eventColorStyle("blue", "dot")).toEqual({ backgroundColor: "var(--spk-viz-1, var(--chart-1))" });
  });
});
