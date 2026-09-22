import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cn } from "../lib/cn";
import { expandVisibleEvents } from "../lib/rrule";
import { useControllableState } from "../lib/use-controllable-state";
import {
  addDays,
  addMonths,
  agendaDays,
  calendarVisibleRange,
  CALENDAR_AGENDA_DAYS,
  DEFAULT_SCHEDULER_PREFERENCES,
  eventCanDrag,
  eventCanResize,
  eventColorStyle,
  filterWeekendDays,
  formatDateSpan,
  formatDayHeading,
  formatHour,
  formatMonthYear,
  formatTime,
  formatWeekRange,
  getMonthGrid,
  getWeekDays,
  hoursInView,
  isMonthBar,
  isSameDay,
  isSameMonth,
  isoDay,
  layoutTimedEvents,
  normalizeEvents,
  occupiesDay,
  occurrenceKey,
  resizeEvent,
  shiftByDays,
  startOfDay,
  timedEventsOnDay,
  toDate,
  visibleEvents,
  weekNumber,
  weekSpanLanesForDays,
  type CalendarView,
  type CalendarVisibleRange,
  type NormalizedEvent,
  type SchedulerEvent,
  type SchedulerPreferences,
  type SchedulerResource,
} from "../lib/scheduler";
import { EventEditor, type EventEditorDraft } from "./EventEditor";
import {
  CALENDAR_VIEW_LABEL,
  EventResizeHandle,
  ResourceLegend,
  SchedulerDateJump,
  SchedulerPreferencesMenu,
  SchedulerShell,
  SchedulerToolbar,
  type SchedulerToolbarDensity,
} from "./scheduler-ui";
import { DropdownMenuItem } from "../primitives/DropdownMenu";

export type EventCalendarEventVariant =
  | "month-bar"
  | "month-timed"
  | "all-day"
  | "time-grid"
  | "agenda";

export type EventCalendarEventRenderContext = {
  view: CalendarView;
  variant: EventCalendarEventVariant;
  locale?: string;
  hour12: boolean;
  source?: SchedulerEvent;
  defaultChildren: ReactNode;
};

export type EventCalendarToolbarContext = {
  view: CalendarView;
  date: Date;
  title: string;
  views: CalendarView[];
  locale?: string;
  preferences: Required<SchedulerPreferences>;
  onViewChange: (view: CalendarView) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onDateChange: (date: Date) => void;
  onPreferencesChange: (next: Required<SchedulerPreferences>) => void;
};

export type EventCalendarProps = {
  events?: SchedulerEvent[];
  resources?: SchedulerResource[];
  view?: CalendarView;
  defaultView?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  date?: Date;
  defaultDate?: Date;
  onDateChange?: (date: Date) => void;
  views?: CalendarView[];
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  hourStart?: number;
  hourEnd?: number;
  locale?: string;
  readOnly?: boolean;
  areEventsDraggable?: boolean;
  areEventsResizable?: boolean;
  preferences?: SchedulerPreferences;
  defaultPreferences?: SchedulerPreferences;
  onPreferencesChange?: (preferences: Required<SchedulerPreferences>) => void;
  onEventClick?: (event: SchedulerEvent) => void;
  onEventChange?: (event: SchedulerEvent, next: Partial<SchedulerEvent>) => void;
  onEventCreate?: (event: SchedulerEvent) => void;
  onEventDelete?: (event: SchedulerEvent) => void;
  onSlotClick?: (slot: { start: Date; end: Date; allDay: boolean }) => void;
  /**
   * Built-in create/edit dialog. Defaults to true.
   * Set false when the host owns create/edit (custom schedule modal, etc.).
   */
  showEventEditor?: boolean;
  /** Preferences gear in the default toolbar. Ignored when `renderToolbar` is set. */
  showPreferences?: boolean;
  /** Extra controls after the view menu. Ignored when `renderToolbar` is set. */
  toolbarTrailing?: ReactNode;
  /** Default toolbar layout. Compact is a single desktop row. Ignored when `renderToolbar` is set. */
  toolbarDensity?: SchedulerToolbarDensity;
  /** Month/year native selects on the default toolbar. Ignored when `renderToolbar` is set. */
  showDateJump?: boolean;
  /** Years in the date-jump select. Defaults to a window around the current year. */
  yearOptions?: number[];
  /** Fires when the painted date window changes. `end` is exclusive. */
  onVisibleRangeChange?: (range: CalendarVisibleRange & { view: CalendarView }) => void;
  /** Replace event chip contents. The kit still wraps with the click/drag trigger. */
  renderEvent?: (
    event: NormalizedEvent,
    context: EventCalendarEventRenderContext,
  ) => ReactNode;
  /** Replace the toolbar. The default kit toolbar is used when omitted. */
  renderToolbar?: (context: EventCalendarToolbarContext) => ReactNode;
  className?: string;
};

const MAX_TIMED_IN_CELL = 3;

function chunkWeeks<T>(items: T[]): T[][] {
  const weeks: T[][] = [];
  for (let i = 0; i < items.length; i += 7) weeks.push(items.slice(i, i + 7));
  return weeks;
}

function sourceEvent(events: SchedulerEvent[], id: string): SchedulerEvent | undefined {
  return events.find((event) => event.id === id);
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function draftFromSource(source: SchedulerEvent): EventEditorDraft {
  return {
    id: source.id,
    title: source.title,
    start: toDate(source.start),
    end: toDate(source.end),
    allDay: source.allDay,
    resourceId: source.resourceId,
    color: source.color,
    description: source.description,
    rrule: source.rrule,
  };
}

/** Month / week / day / agenda calendar with editor, resize, recurrence, and preferences. */
export function EventCalendar({
  events = [],
  resources = [],
  view: viewProp,
  defaultView = "month",
  onViewChange,
  date: dateProp,
  defaultDate,
  onDateChange,
  views = ["month", "week", "day", "agenda"],
  weekStartsOn = 0,
  hourStart = 7,
  hourEnd = 21,
  locale,
  readOnly = false,
  areEventsDraggable,
  areEventsResizable,
  preferences,
  defaultPreferences,
  onPreferencesChange,
  onEventClick,
  onEventChange,
  onEventCreate,
  onEventDelete,
  onSlotClick,
  showEventEditor = true,
  showPreferences = true,
  toolbarTrailing,
  toolbarDensity = "default",
  showDateJump = false,
  yearOptions,
  onVisibleRangeChange,
  renderEvent,
  renderToolbar,
  className,
}: EventCalendarProps) {
  const [view, setView] = useControllableState<CalendarView>({
    prop: viewProp,
    defaultProp: defaultView,
    onChange: onViewChange,
  });
  const [date, setDate] = useControllableState<Date>({
    prop: dateProp,
    defaultProp: defaultDate ?? new Date(),
    onChange: onDateChange,
  });
  const [prefs, setPrefs] = useControllableState<Required<SchedulerPreferences>>({
    prop: preferences
      ? { ...DEFAULT_SCHEDULER_PREFERENCES, weekStartsOn, ...defaultPreferences, ...preferences }
      : undefined,
    defaultProp: { ...DEFAULT_SCHEDULER_PREFERENCES, weekStartsOn, ...defaultPreferences },
    onChange: onPreferencesChange,
  });
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState<EventEditorDraft | null>(null);
  const dragRef = useRef<{ id: string; x: number; y: number; active: boolean } | null>(null);

  const resolvedView = view ?? "month";
  const resolvedDate = date ?? new Date();
  const resolvedPrefs = prefs ?? { ...DEFAULT_SCHEDULER_PREFERENCES, weekStartsOn };
  const startOn = resolvedPrefs.weekStartsOn;
  const today = startOfToday();
  const hour12 = resolvedPrefs.ampm;
  const canDrag = !readOnly && (areEventsDraggable ?? Boolean(onEventChange));
  const canResize = !readOnly && (areEventsResizable ?? Boolean(onEventChange));
  const editorLocked = readOnly || Boolean(draft?.id && sourceEvent(events, draft.id)?.readOnly);

  const range = useMemo(
    () => calendarVisibleRange(resolvedView, resolvedDate, startOn),
    [resolvedView, resolvedDate, startOn],
  );

  useEffect(() => {
    onVisibleRangeChange?.({ start: range.start, end: range.end, view: resolvedView });
  }, [range.start, range.end, resolvedView, onVisibleRangeChange]);

  const normalized = useMemo(() => {
    const visible = visibleEvents(normalizeEvents(events, resources), hiddenIds);
    return expandVisibleEvents(visible, range.start, range.end, events);
  }, [events, resources, hiddenIds, range.start, range.end]);

  const title =
    resolvedView === "month"
      ? formatMonthYear(resolvedDate, locale)
      : resolvedView === "week"
        ? formatWeekRange(resolvedDate, startOn, locale)
        : resolvedView === "agenda"
          ? formatDateSpan(range.start, addDays(range.end, -1), locale)
          : formatDayHeading(resolvedDate, locale);

  function go(direction: -1 | 1) {
    if (resolvedView === "month") setDate(addMonths(resolvedDate, direction));
    else if (resolvedView === "week") setDate(addDays(resolvedDate, direction * 7));
    else if (resolvedView === "agenda") setDate(addDays(resolvedDate, direction * 7));
    else setDate(addDays(resolvedDate, direction));
  }

  function toggleResource(id: string) {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openEvent(event: NormalizedEvent) {
    const source = sourceEvent(events, event.id);
    if (source) onEventClick?.(source);
    if (!showEventEditor) return;
    setDraft(source ? draftFromSource(source) : {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      resourceId: event.resourceId,
      color: event.color,
      description: event.description,
      rrule: event.rrule,
    });
  }

  function openSlot(slot: { start: Date; end: Date; allDay: boolean }) {
    onSlotClick?.(slot);
    if (readOnly || !showEventEditor) return;
    setDraft({ start: slot.start, end: slot.end, allDay: slot.allDay });
  }

  function handleEventPointerDown(event: NormalizedEvent, pointer: ReactPointerEvent) {
    if (!onEventChange || !eventCanDrag(event, { readOnly, enabled: canDrag })) return;
    (pointer.currentTarget as HTMLElement).setPointerCapture?.(pointer.pointerId);
    dragRef.current = { id: event.id, x: pointer.clientX, y: pointer.clientY, active: false };
  }

  function handleEventPointerMove(pointer: ReactPointerEvent) {
    const drag = dragRef.current;
    if (!drag) return;
    if (Math.hypot(pointer.clientX - drag.x, pointer.clientY - drag.y) > 6) {
      drag.active = true;
    }
  }

  function handleEventPointerUp(event: NormalizedEvent, pointer: ReactPointerEvent) {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag?.active || !onEventChange) return;
    const target = document
      .elementFromPoint(pointer.clientX, pointer.clientY)
      ?.closest("[data-scheduler-day]") as HTMLElement | null;
    const iso = target?.dataset.schedulerDay;
    if (!iso) return;
    const [year, month, day] = iso.split("-").map(Number);
    const targetDay = new Date(year, month - 1, day);
    const currentDay = startOfDay(event.start);
    const delta = Math.round((targetDay.getTime() - currentDay.getTime()) / 86_400_000);
    if (delta === 0) return;
    const source = sourceEvent(events, event.id);
    if (!source) return;
    const master = normalizeEvents([source], resources)[0];
    onEventChange(source, shiftByDays(master, delta));
  }

  function commitResize(event: NormalizedEvent, edge: "start" | "end", instant: Date) {
    if (!onEventChange) return;
    const next = resizeEvent(event, edge, instant);
    const source = sourceEvent(events, event.id);
    if (!source) return;
    const master = normalizeEvents([source], resources)[0];
    onEventChange(source, {
      start: new Date(master.start.getTime() + (next.start.getTime() - event.start.getTime())),
      end: new Date(master.end.getTime() + (next.end.getTime() - event.end.getTime())),
    });
  }

  function handleKeyDown(keyboard: ReactKeyboardEvent<HTMLDivElement>) {
    if (draft) return;
    const target = keyboard.target as HTMLElement;
    if (target.closest("input, textarea, select, [contenteditable='true']")) return;
    if (keyboard.key === "ArrowLeft") {
      keyboard.preventDefault();
      go(-1);
    } else if (keyboard.key === "ArrowRight") {
      keyboard.preventDefault();
      go(1);
    } else if (keyboard.key === "t" || keyboard.key === "T") {
      keyboard.preventDefault();
      setDate(new Date());
    }
  }

  function renderEventTrigger(
    event: NormalizedEvent,
    className: string,
    defaultChildren: ReactNode,
    options?: { resize?: "ns"; variant: EventCalendarEventVariant },
  ) {
    const source = sourceEvent(events, event.id);
    const variant = options?.variant ?? "month-timed";
    const children = renderEvent
      ? renderEvent(event, {
          view: resolvedView,
          variant,
          locale,
          hour12,
          source,
          defaultChildren,
        })
      : defaultChildren;
    if (renderEvent && children == null) return null;

    const resizable =
      options?.resize === "ns" &&
      eventCanResize(event, { readOnly, enabled: canResize }) &&
      Boolean(onEventChange);
    const painted = variant === "month-bar" || variant === "all-day" || variant === "time-grid";

    const button = (
      <button
        type="button"
        draggable={false}
        className={className}
        style={
          variant === "agenda"
            ? eventColorStyle(event.color, "wash")
            : painted
              ? eventColorStyle(event.color, resolvedView === "month" ? "bar" : "block")
              : undefined
        }
        onClick={() => {
          if (dragRef.current?.active) return;
          openEvent(event);
        }}
        onPointerDown={(pointer) => handleEventPointerDown(event, pointer)}
        onPointerMove={handleEventPointerMove}
        onPointerUp={(pointer) => handleEventPointerUp(event, pointer)}
      >
        {children}
      </button>
    );

    if (!resizable) return button;

    return (
      <div className="relative h-full min-h-0">
        {button}
        <EventResizeHandle
          edge="start"
          axis="ns"
          event={event}
          hourStart={hourStart}
          hourEnd={hourEnd}
          onCommit={commitResize}
        />
        <EventResizeHandle
          edge="end"
          axis="ns"
          event={event}
          hourStart={hourStart}
          hourEnd={hourEnd}
          onCommit={commitResize}
        />
      </div>
    );
  }

  return (
    <SchedulerShell
      slot="event-calendar"
      className={className}
      tabIndex={0}
      aria-label="Event calendar"
      onKeyDown={handleKeyDown}
    >
      {renderToolbar ? (
        renderToolbar({
          view: resolvedView,
          date: resolvedDate,
          title,
          views,
          locale,
          preferences: resolvedPrefs,
          onViewChange: (next) => setView(next),
          onPrev: () => go(-1),
          onNext: () => go(1),
          onToday: () => setDate(new Date()),
          onDateChange: (next) => setDate(next),
          onPreferencesChange: (next) => setPrefs(next),
        })
      ) : (
        <SchedulerToolbar
          title={title}
          density={toolbarDensity}
          onPrev={() => go(-1)}
          onNext={() => go(1)}
          onToday={() => setDate(new Date())}
          menuLabel={CALENDAR_VIEW_LABEL[resolvedView]}
          menu={views.map((item) => (
            <DropdownMenuItem key={item} onClick={() => setView(item)}>
              {CALENDAR_VIEW_LABEL[item]}
            </DropdownMenuItem>
          ))}
          dateJump={
            showDateJump ? (
              <SchedulerDateJump
                date={resolvedDate}
                locale={locale}
                yearOptions={yearOptions}
                onDateChange={(next) => setDate(next)}
              />
            ) : null
          }
          trailing={
            <>
              {toolbarTrailing}
              {showPreferences ? (
                <SchedulerPreferencesMenu
                  value={resolvedPrefs}
                  onChange={(next) => setPrefs(next)}
                />
              ) : null}
            </>
          }
        />
      )}

      {resolvedView === "month" ? (
        <MonthGrid
          date={resolvedDate}
          today={today}
          events={normalized}
          weekStartsOn={startOn}
          showWeekends={resolvedPrefs.showWeekends}
          showWeekNumber={resolvedPrefs.showWeekNumber}
          locale={locale}
          hour12={hour12}
          onSlotClick={openSlot}
          renderEventTrigger={renderEventTrigger}
        />
      ) : resolvedView === "agenda" ? (
        <AgendaList
          date={resolvedDate}
          events={normalized}
          showWeekends={resolvedPrefs.showWeekends}
          locale={locale}
          hour12={hour12}
          onSlotClick={openSlot}
          renderEventTrigger={renderEventTrigger}
        />
      ) : (
        <TimeGrid
          date={resolvedDate}
          today={today}
          events={normalized}
          view={resolvedView === "day" ? "day" : "week"}
          weekStartsOn={startOn}
          showWeekends={resolvedPrefs.showWeekends}
          hourStart={hourStart}
          hourEnd={hourEnd}
          locale={locale}
          hour12={hour12}
          onSlotClick={openSlot}
          renderEventTrigger={renderEventTrigger}
        />
      )}

      <ResourceLegend resources={resources} hiddenIds={hiddenIds} onToggle={toggleResource} />

      {showEventEditor ? (
        <EventEditor
          open={draft != null}
          onOpenChange={(open) => {
            if (!open) setDraft(null);
          }}
          draft={draft}
          resources={resources}
          readOnly={editorLocked}
          onSave={(event) => {
            if (event.id && sourceEvent(events, event.id)) {
              const source = sourceEvent(events, event.id)!;
              onEventChange?.(source, event);
            } else {
              onEventCreate?.(event);
            }
          }}
          onDelete={
            onEventDelete
              ? (id) => {
                  const source = sourceEvent(events, id);
                  if (source) onEventDelete(source);
                }
              : undefined
          }
        />
      ) : null}
    </SchedulerShell>
  );
}

function MonthGrid({
  date,
  today,
  events,
  weekStartsOn,
  showWeekends,
  showWeekNumber,
  locale,
  hour12,
  onSlotClick,
  renderEventTrigger,
}: {
  date: Date;
  today: Date;
  events: NormalizedEvent[];
  weekStartsOn: number;
  showWeekends: boolean;
  showWeekNumber: boolean;
  locale?: string;
  hour12: boolean;
  onSlotClick?: EventCalendarProps["onSlotClick"];
  renderEventTrigger: (
    event: NormalizedEvent,
    className: string,
    children: ReactNode,
    options?: { resize?: "ns"; variant: EventCalendarEventVariant },
  ) => ReactNode;
}) {
  const weeks = chunkWeeks(getMonthGrid(date, weekStartsOn));
  const headerDays = filterWeekendDays(getWeekDays(date, weekStartsOn), showWeekends);
  const columns = headerDays.length;
  const gridStyle = { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` };

  return (
    <div className="min-w-0">
      <div className="flex border-b border-line">
        {showWeekNumber ? <div className="w-8 shrink-0" /> : null}
        <div className="grid min-w-0 flex-1" style={gridStyle}>
          {headerDays.map((day) => (
            <div
              key={day.getDay()}
              className="px-2 py-2 text-center text-caption font-medium text-fg-tertiary"
            >
              {new Intl.DateTimeFormat(locale, { weekday: "short" }).format(day)}
            </div>
          ))}
        </div>
      </div>
      <div>
        {weeks.map((week) => {
          const days = filterWeekendDays(week, showWeekends);
          const lanes = weekSpanLanesForDays(days, events);
          return (
            <div key={week[0].toISOString()} className="flex border-b border-line-subtle last:border-b-0">
              {showWeekNumber ? (
                <div className="flex w-8 shrink-0 items-start justify-center pt-2 text-caption text-fg-tertiary spk-numeric">
                  {weekNumber(week[0])}
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <div className="grid" style={gridStyle}>
                  {days.map((day) => {
                    const inMonth = isSameMonth(day, date);
                    const isToday = isSameDay(day, today);
                    return (
                      <div
                        key={day.toISOString()}
                        data-scheduler-day={isoDay(day)}
                        className={cn(
                          "flex items-start justify-end px-1.5 pt-1.5",
                          !inMonth && "bg-surface-subtle/70",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            onSlotClick?.({
                              start: day,
                              end: addDays(day, 1),
                              allDay: true,
                            })
                          }
                          className={cn(
                            "flex size-6 items-center justify-center rounded-full text-caption font-medium spk-numeric",
                            isToday && "bg-accent-solid font-semibold text-primary-foreground",
                            !isToday && inMonth && "text-fg hover:bg-hover",
                            !isToday && !inMonth && "text-muted-foreground",
                          )}
                        >
                          {day.getDate()}
                        </button>
                      </div>
                    );
                  })}
                </div>
                {lanes.map((lane, laneIndex) => (
                  <div key={laneIndex} className="grid gap-px px-0.5 pb-0.5" style={gridStyle}>
                    {laneSlots(lane, columns).map((slot, slotIndex) =>
                      slot.kind === "empty" ? (
                        <div key={slotIndex} />
                      ) : (
                        <div
                          key={occurrenceKey(slot.event)}
                          className="min-w-0"
                          style={{ gridColumn: `span ${slot.span}` }}
                        >
                          {renderEventTrigger(
                            slot.event,
                            "flex min-h-6 w-full items-center truncate rounded-[var(--spk-radius-xs)] px-1.5 text-caption font-medium leading-none",
                            slot.event.title,
                            { variant: "month-bar" },
                          )}
                        </div>
                      ),
                    )}
                  </div>
                ))}
                <div className="grid min-h-[4.25rem]" style={gridStyle}>
                  {days.map((day) => {
                    const timed = timedEventsOnDay(events, day);
                    const visibleTimed = timed.slice(0, MAX_TIMED_IN_CELL);
                    const extra = timed.length - visibleTimed.length;
                    return (
                      <div
                        key={day.toISOString()}
                        data-scheduler-day={isoDay(day)}
                        className={cn(
                          "min-w-0 space-y-0.5 px-1 pb-2",
                          !isSameMonth(day, date) && "bg-surface-subtle/70",
                        )}
                        onClick={(click) => {
                          if ((click.target as HTMLElement).closest("button")) return;
                          onSlotClick?.({
                            start: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9),
                            end: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 10),
                            allDay: false,
                          });
                        }}
                      >
                        {visibleTimed.map((event) => (
                          <div key={occurrenceKey(event)} className="min-w-0">
                            {renderEventTrigger(
                              event,
                              "flex min-h-6 w-full min-w-0 items-center gap-1.5 rounded-[var(--spk-radius-xs)] px-1 py-0.5 text-left text-caption leading-tight text-fg transition-colors hover:bg-hover",
                              <>
                                <span
                                  className="size-1.5 shrink-0 rounded-full"
                                  style={eventColorStyle(event.color, "dot")}
                                />
                                <span className="shrink-0 text-fg-tertiary spk-numeric">
                                  {formatTime(event.start, locale, hour12)}
                                </span>
                                <span className="min-w-0 truncate font-medium">{event.title}</span>
                              </>,
                              { variant: "month-timed" },
                            )}
                          </div>
                        ))}
                        {extra > 0 ? (
                          <p className="px-1 text-caption font-medium text-fg-tertiary">+{extra} more</p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function laneSlots(lane: { event: NormalizedEvent; startCol: number; span: number }[], columns: number) {
  const slots: Array<
    | { kind: "empty"; span: 1 }
    | { kind: "event"; event: NormalizedEvent; span: number }
  > = [];
  let cursor = 0;
  const ordered = [...lane].sort((a, b) => a.startCol - b.startCol);
  for (const segment of ordered) {
    while (cursor < segment.startCol) {
      slots.push({ kind: "empty", span: 1 });
      cursor += 1;
    }
    slots.push({ kind: "event", event: segment.event, span: segment.span });
    cursor += segment.span;
  }
  while (cursor < columns) {
    slots.push({ kind: "empty", span: 1 });
    cursor += 1;
  }
  return slots;
}

function TimeGrid({
  date,
  today,
  events,
  view,
  weekStartsOn,
  showWeekends,
  hourStart,
  hourEnd,
  locale,
  hour12,
  onSlotClick,
  renderEventTrigger,
}: {
  date: Date;
  today: Date;
  events: NormalizedEvent[];
  view: "week" | "day";
  weekStartsOn: number;
  showWeekends: boolean;
  hourStart: number;
  hourEnd: number;
  locale?: string;
  hour12: boolean;
  onSlotClick?: EventCalendarProps["onSlotClick"];
  renderEventTrigger: (
    event: NormalizedEvent,
    className: string,
    children: ReactNode,
    options?: { resize?: "ns"; variant: EventCalendarEventVariant },
  ) => ReactNode;
}) {
  const days =
    view === "day"
      ? [date]
      : filterWeekendDays(getWeekDays(date, weekStartsOn), showWeekends);
  const hours = hoursInView(hourStart, hourEnd);
  const hourHeight = 48;
  const now = new Date();
  const showNow = days.some((day) => isSameDay(day, now));
  const nowTop =
    ((now.getHours() + now.getMinutes() / 60 - hourStart) / (hourEnd - hourStart)) * (hours.length * hourHeight);

  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-[640px]"
        style={{ gridTemplateColumns: `3.5rem repeat(${days.length}, minmax(0, 1fr))` }}
      >
        <div className="border-b border-line-subtle" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "border-b border-l border-line-subtle px-2 py-2 text-center",
              isSameDay(day, today) && "bg-accent-subtle",
            )}
          >
            <p className="text-caption font-medium text-fg-tertiary">
              {new Intl.DateTimeFormat(locale, { weekday: "short" }).format(day)}
            </p>
            <p
              className={cn(
                "mx-auto mt-0.5 flex size-7 items-center justify-center rounded-full text-body font-semibold spk-numeric",
                isSameDay(day, today) && "bg-accent-solid text-primary-foreground",
              )}
            >
              {day.getDate()}
            </p>
          </div>
        ))}

        <div className="border-b border-line-subtle" />
        {days.map((day) => {
          const allDay = events.filter((event) => isMonthBar(event) && occupiesDay(event, day));
          return (
            <div
              key={`allday-${day.toISOString()}`}
              data-scheduler-day={isoDay(day)}
              className="min-h-10 space-y-0.5 border-b border-l border-line-subtle p-1"
            >
              {allDay.map((event) => (
                <div key={occurrenceKey(event)}>
                  {renderEventTrigger(
                    event,
                    "flex h-5 w-full items-center truncate rounded-[var(--spk-radius-xs)] px-1.5 text-caption font-medium",
                    event.title,
                    { variant: "all-day" },
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="relative min-w-[640px]" style={{ height: hours.length * hourHeight }}>
        <div
          className="grid h-full"
          style={{ gridTemplateColumns: `3.5rem repeat(${days.length}, minmax(0, 1fr))` }}
        >
          <div className="relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="relative pr-2 text-right text-caption text-fg-tertiary spk-numeric"
                style={{ height: hourHeight }}
              >
                <span className="-translate-y-2 absolute right-2">{formatHour(hour, locale, hour12)}</span>
              </div>
            ))}
          </div>
          {days.map((day) => {
            const layout = layoutTimedEvents(events, day, hourStart, hourEnd);
            return (
              <div
                key={day.toISOString()}
                data-scheduler-day={isoDay(day)}
                className="relative border-l border-line-subtle"
                onClick={(click) => {
                  if ((click.target as HTMLElement).closest("button")) return;
                  const rect = click.currentTarget.getBoundingClientRect();
                  const ratio = (click.clientY - rect.top) / rect.height;
                  const hour = hourStart + ratio * (hourEnd - hourStart);
                  const startHour = Math.floor(hour);
                  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), startHour);
                  onSlotClick?.({
                    start,
                    end: new Date(start.getTime() + 3_600_000),
                    allDay: false,
                  });
                }}
              >
                {hours.map((hour) => (
                  <div key={hour} className="border-b border-line-subtle" style={{ height: hourHeight }} />
                ))}
                {layout.map((item) => (
                  <div
                    key={occurrenceKey(item.event)}
                    className="absolute px-0.5"
                    style={{
                      top: `${item.top}%`,
                      height: `${item.height}%`,
                      left: `${(item.col / item.cols) * 100}%`,
                      width: `${100 / item.cols}%`,
                    }}
                  >
                    {renderEventTrigger(
                      item.event,
                      "flex h-full w-full flex-col overflow-hidden rounded-[var(--spk-radius-sm)] px-2 py-1 text-left text-caption font-medium leading-tight",
                      <>
                        <span className="truncate">{item.event.title}</span>
                        <span className="truncate text-[0.6875rem] font-normal opacity-80 spk-numeric">
                          {formatTime(item.event.start, locale, hour12)}
                        </span>
                      </>,
                      { resize: "ns", variant: "time-grid" },
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        {showNow && nowTop > 0 && nowTop < hours.length * hourHeight ? (
          <div
            className="pointer-events-none absolute right-0 left-14 z-10 h-px bg-danger"
            style={{ top: nowTop }}
          >
            <span className="absolute -top-[3px] -left-1 size-[7px] rounded-full bg-danger ring-2 ring-surface" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AgendaList({
  date,
  events,
  showWeekends,
  locale,
  hour12,
  onSlotClick,
  renderEventTrigger,
}: {
  date: Date;
  events: NormalizedEvent[];
  showWeekends: boolean;
  locale?: string;
  hour12: boolean;
  onSlotClick?: EventCalendarProps["onSlotClick"];
  renderEventTrigger: (
    event: NormalizedEvent,
    className: string,
    children: ReactNode,
    options?: { resize?: "ns"; variant: EventCalendarEventVariant },
  ) => ReactNode;
}) {
  const days = filterWeekendDays(agendaDays(date, CALENDAR_AGENDA_DAYS), showWeekends);

  return (
    <div className="divide-y divide-line-subtle">
      {days.map((day) => {
        const items = events.filter((event) => occupiesDay(event, day));
        return (
          <div key={day.toISOString()} className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 px-3 py-3 sm:px-4">
            <button
              type="button"
              data-scheduler-day={isoDay(day)}
              className="text-left"
              onClick={() =>
                onSlotClick?.({
                  start: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9),
                  end: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 10),
                  allDay: false,
                })
              }
            >
              <p className="text-caption font-medium text-fg-tertiary">
                {new Intl.DateTimeFormat(locale, { weekday: "short" }).format(day)}
              </p>
              <p
                className={cn(
                  "text-title-2 spk-numeric",
                  isSameDay(day, startOfToday()) && "text-accent-text",
                )}
              >
                {new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(day)}
              </p>
            </button>
            <div className="min-w-0 space-y-1.5">
              {items.length === 0 ? (
                <p className="pt-2 text-body-sm text-fg-tertiary">No events</p>
              ) : (
                items.map((event) => (
                  <div key={occurrenceKey(event)} data-scheduler-day={isoDay(day)}>
                    {renderEventTrigger(
                      event,
                      "flex w-full min-w-0 items-start gap-2.5 rounded-[var(--spk-radius-sm)] px-2 py-1.5 text-left transition-colors hover:bg-hover",
                      <>
                        <span className="mt-1.5 size-2 shrink-0 rounded-full" style={eventColorStyle(event.color, "dot")} />
                        <span className="min-w-0">
                          <span className="block truncate text-body font-medium text-fg">{event.title}</span>
                          <span className="text-body-sm text-fg-secondary spk-numeric">
                            {event.allDay || isMonthBar(event)
                              ? "All day"
                              : `${formatTime(event.start, locale, hour12)} – ${formatTime(event.end, locale, hour12)}`}
                          </span>
                        </span>
                      </>,
                      { variant: "agenda" },
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
