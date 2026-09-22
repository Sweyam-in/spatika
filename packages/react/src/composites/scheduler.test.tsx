import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EventTimeline } from "./EventTimeline";
import type { SchedulerEvent, SchedulerResource } from "../lib/scheduler";

describe("EventTimeline", () => {
  const timelineEvents: SchedulerEvent[] = [
    {
      id: "api",
      title: "API V3 Development",
      start: "2026-07-01",
      end: "2026-09-20",
      allDay: true,
      resourceId: "eng",
    },
    {
      id: "ui",
      title: "Mobile App UI/UX",
      start: "2026-08-01",
      end: "2026-10-15",
      allDay: true,
      resourceId: "design",
    },
  ];
  const timelineResources: SchedulerResource[] = [
    { id: "design", title: "Design", color: "rose" },
    { id: "eng", title: "Engineering", color: "blue" },
  ];

  it("renders resource rows and event bars", () => {
    render(
      <EventTimeline
        defaultDate={new Date(2026, 7, 1)}
        events={timelineEvents}
        resources={timelineResources}
      />,
    );
    expect(screen.getAllByText("Design").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Engineering").length).toBeGreaterThan(0);
    expect(screen.getByText("API V3 Development")).toBeInTheDocument();
    expect(screen.getByText("Mobile App UI/UX")).toBeInTheDocument();
  });

  it("skips the built-in editor when showEventEditor is false", async () => {
    const user = userEvent.setup();
    const onEventClick = vi.fn();
    render(
      <EventTimeline
        defaultDate={new Date(2026, 7, 1)}
        events={timelineEvents}
        resources={timelineResources}
        showEventEditor={false}
        onEventClick={onEventClick}
      />,
    );
    await user.click(screen.getByText("API V3 Development"));
    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ id: "api" }));
    expect(screen.queryByRole("heading", { name: /event/i })).not.toBeInTheDocument();
  });
});
