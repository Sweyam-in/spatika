import { describe, expect, it } from "vitest";
import { expandEventOccurrences, parseRRule } from "./rrule";
import { normalizeEvents } from "./scheduler";

describe("rrule", () => {
  it("parses FREQ, INTERVAL, BYDAY, and COUNT", () => {
    const rule = parseRRule("FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE;COUNT=6");
    expect(rule).toMatchObject({
      freq: "WEEKLY",
      interval: 2,
      count: 6,
    });
    expect(rule?.byDay?.map((item) => item.weekday)).toEqual([1, 3]);
  });

  it("expands weekly BYDAY into the visible range", () => {
    const [event] = normalizeEvents([
      {
        id: "standup",
        title: "Standup",
        start: "2026-08-03T10:00:00",
        end: "2026-08-03T10:15:00",
        rrule: "FREQ=WEEKLY;BYDAY=MO,WE,FR",
      },
    ]);
    const occurrences = expandEventOccurrences(
      event,
      new Date(2026, 7, 3),
      new Date(2026, 7, 8),
    );
    expect(occurrences.map((item) => item.start.getDay())).toEqual([1, 3, 5]);
    expect(occurrences.every((item) => item.id === "standup")).toBe(true);
  });

  it("skips exception dates", () => {
    const [event] = normalizeEvents([
      {
        id: "daily",
        title: "Daily",
        start: "2026-08-03T09:00:00",
        end: "2026-08-03T09:30:00",
        rrule: "FREQ=DAILY;COUNT=5",
        exceptionDates: ["2026-08-04"],
      },
    ]);
    const occurrences = expandEventOccurrences(
      event,
      new Date(2026, 7, 3),
      new Date(2026, 7, 10),
    );
    expect(occurrences.map((item) => item.start.getDate())).toEqual([3, 5, 6, 7]);
  });
});
