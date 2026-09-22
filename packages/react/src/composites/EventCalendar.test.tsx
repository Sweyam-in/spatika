import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EventCalendar } from "./EventCalendar";
import type { SchedulerEvent, SchedulerResource } from "../lib/scheduler";

const resources: SchedulerResource[] = [
  { id: "work", title: "Work", color: "violet" },
  { id: "health", title: "Health", color: "teal" },
];

const events: SchedulerEvent[] = [
  {
    id: "run",
    title: "Morning Run",
    start: "2026-08-03T07:00:00",
    end: "2026-08-03T07:45:00",
    resourceId: "health",
  },
  {
    id: "bday",
    title: "Alice's Birthday",
    start: "2026-08-06",
    end: "2026-08-08",
    allDay: true,
    resourceId: "work",
    color: "rose",
  },
  {
    id: "review",
    title: "Design Review",
    start: "2026-08-09T14:00:00",
    end: "2026-08-09T16:00:00",
    resourceId: "work",
  },
];

describe("EventCalendar", () => {
  it("renders the month heading, weekday labels, and events", () => {
    render(
      <EventCalendar
        defaultDate={new Date(2026, 7, 15)}
        events={events}
        resources={resources}
        locale="en-US"
      />,
    );
    expect(screen.getByRole("heading", { name: /August 2026/i })).toBeInTheDocument();
    expect(screen.getByText(/Sun/)).toBeInTheDocument();
    expect(screen.getByText("Morning Run")).toBeInTheDocument();
    expect(screen.getByText("Alice's Birthday")).toBeInTheDocument();
    expect(screen.getByText("Work")).toBeInTheDocument();
  });

  it("jumps to today from the toolbar", async () => {
    const user = userEvent.setup();
    const onDateChange = vi.fn();
    render(
      <EventCalendar
        defaultDate={new Date(2025, 0, 1)}
        onDateChange={onDateChange}
        events={events}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Today" }));
    expect(onDateChange).toHaveBeenCalled();
    const next = onDateChange.mock.calls[0][0] as Date;
    const now = new Date();
    expect(next.getFullYear()).toBe(now.getFullYear());
    expect(next.getMonth()).toBe(now.getMonth());
  });

  it("fires onEventClick for a timed event", async () => {
    const user = userEvent.setup();
    const onEventClick = vi.fn();
    render(
      <EventCalendar
        defaultDate={new Date(2026, 7, 15)}
        events={events}
        resources={resources}
        locale="en-US"
        onEventClick={onEventClick}
      />,
    );
    await user.click(screen.getByText("Morning Run"));
    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ id: "run" }));
  });

  it("switches to week view from the menu", async () => {
    const user = userEvent.setup();
    render(
      <EventCalendar defaultDate={new Date(2026, 7, 15)} events={events} locale="en-US" />,
    );
    await user.click(screen.getByRole("button", { name: /month/i }));
    await user.click(screen.getByRole("menuitem", { name: "Week" }));
    expect(screen.getByRole("heading", { name: /2026/ })).toBeInTheDocument();
  });

  it("lists events in agenda view", () => {
    render(
      <EventCalendar
        defaultView="agenda"
        defaultDate={new Date(2026, 7, 3)}
        events={events}
        locale="en-US"
      />,
    );
    expect(screen.getByRole("heading", { name: /Aug 3/ })).toBeInTheDocument();
    expect(screen.getAllByText("No events").length).toBeGreaterThan(0);
    expect(screen.getByText("Morning Run")).toBeInTheDocument();
    expect(screen.getAllByText("Alice's Birthday").length).toBeGreaterThan(0);
  });

  it("opens the editor and saves title changes", async () => {
    const user = userEvent.setup();
    const onEventChange = vi.fn();
    render(
      <EventCalendar
        defaultDate={new Date(2026, 7, 15)}
        events={events}
        resources={resources}
        locale="en-US"
        onEventChange={onEventChange}
      />,
    );
    await user.click(screen.getByText("Morning Run"));
    const title = screen.getByRole("textbox", { name: /title/i });
    await user.clear(title);
    await user.type(title, "Jog");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onEventChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: "run" }),
      expect.objectContaining({ title: "Jog" }),
    );
  });

  it("creates an event from a day slot", async () => {
    const user = userEvent.setup();
    const onEventCreate = vi.fn();
    render(
      <EventCalendar
        defaultDate={new Date(2026, 7, 15)}
        events={events}
        locale="en-US"
        onEventCreate={onEventCreate}
      />,
    );
    await user.click(screen.getByRole("button", { name: "15" }));
    expect(screen.getByRole("heading", { name: "New event" })).toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: /title/i }), "Focus time");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onEventCreate).toHaveBeenCalledWith(expect.objectContaining({ title: "Focus time" }));
  });

  it("skips the built-in editor when showEventEditor is false", async () => {
    const user = userEvent.setup();
    const onEventClick = vi.fn();
    const onSlotClick = vi.fn();
    render(
      <EventCalendar
        defaultDate={new Date(2026, 7, 15)}
        events={events}
        resources={resources}
        locale="en-US"
        showEventEditor={false}
        onEventClick={onEventClick}
        onSlotClick={onSlotClick}
      />,
    );
    await user.click(screen.getByText("Morning Run"));
    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ id: "run" }));
    expect(screen.queryByRole("heading", { name: /event/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "15" }));
    expect(onSlotClick).toHaveBeenCalled();
    expect(screen.queryByRole("heading", { name: "New event" })).not.toBeInTheDocument();
  });

  it("renders custom event chips and toolbar", async () => {
    const user = userEvent.setup();
    const onDateChange = vi.fn();
    render(
      <EventCalendar
        defaultDate={new Date(2026, 7, 15)}
        events={events}
        resources={resources}
        locale="en-US"
        showEventEditor={false}
        showPreferences={false}
        toolbarTrailing={<button type="button">Jump year</button>}
        renderEvent={(event) => <span>★ {event.title}</span>}
        renderToolbar={({ title, onToday }) => (
          <div>
            <p>{title}</p>
            <button type="button" onClick={onToday}>
              Jump today
            </button>
          </div>
        )}
        onDateChange={onDateChange}
      />,
    );
    expect(screen.getByText("★ Morning Run")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Preferences" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Jump year" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Jump today" }));
    expect(onDateChange).toHaveBeenCalled();
  });

  it("keeps toolbarTrailing on the default toolbar", () => {
    render(
      <EventCalendar
        defaultDate={new Date(2026, 7, 15)}
        events={events}
        locale="en-US"
        showPreferences={false}
        toolbarTrailing={<button type="button">Jump year</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Jump year" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /August 2026/i })).toBeInTheDocument();
  });

  it("renders a compact toolbar with equal month and year jumps", () => {
    render(
      <EventCalendar
        defaultDate={new Date(2026, 7, 15)}
        events={events}
        locale="en-US"
        showPreferences={false}
        toolbarDensity="compact"
        showDateJump
      />,
    );
    expect(document.querySelector('[data-density="compact"]')).toBeTruthy();
    expect(screen.getByLabelText("Month")).toHaveAttribute("data-size", "sm");
    expect(screen.getByLabelText("Year")).toHaveAttribute("data-size", "sm");
    expect(screen.getByLabelText("Month")).toHaveValue("7");
    expect(screen.getByLabelText("Year")).toHaveValue("2026");
  });

  it("keeps adjacent-month day numbers at full muted contrast", () => {
    render(
      <EventCalendar
        defaultDate={new Date(2026, 7, 15)}
        events={[]}
        locale="en-US"
        showPreferences={false}
      />,
    );
    const julyDay = document.querySelector('[data-scheduler-day="2026-07-26"] button');
    expect(julyDay).toBeTruthy();
    expect(julyDay?.className).toMatch(/text-muted-foreground/);
    expect(julyDay?.className).not.toMatch(/\/70/);
  });

  it("sizes month event chips for touch-friendly targets", () => {
    render(
      <EventCalendar
        defaultDate={new Date(2026, 7, 15)}
        events={events}
        locale="en-US"
        showPreferences={false}
        showEventEditor={false}
      />,
    );
    const birthday = screen.getByRole("button", { name: "Alice's Birthday" });
    expect(birthday.className).toMatch(/min-h-6/);
    const timed = screen.getByRole("button", { name: /Morning Run/i });
    expect(timed.className).toMatch(/min-h-6/);
  });

  it("reports the visible range for week view", () => {
    const onVisibleRangeChange = vi.fn();
    render(
      <EventCalendar
        defaultDate={new Date(2026, 7, 15)}
        defaultView="week"
        locale="en-US"
        onVisibleRangeChange={onVisibleRangeChange}
      />,
    );
    expect(onVisibleRangeChange).toHaveBeenCalled();
    const range = onVisibleRangeChange.mock.calls[0][0] as {
      view: string;
      start: Date;
      end: Date;
    };
    expect(range.view).toBe("week");
    expect(range.start.getDay()).toBe(0);
    expect(range.end.getTime() - range.start.getTime()).toBe(7 * 86_400_000);
  });
});
