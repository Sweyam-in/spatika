import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { expandVisibleEvents } from "../lib/rrule";
import { useControllableState } from "../lib/use-controllable-state";
import {
  eventCanDrag,
  eventCanResize,
  eventColorStyle,
  formatMonthYear,
  getTimelineRange,
  layoutTimelineBars,
  normalizeEvents,
  occurrenceKey,
  resizeEvent,
  shiftByMs,
  shiftTimelineDate,
  toDate,
  visibleEvents,
  type NormalizedEvent,
  type SchedulerEvent,
  type SchedulerResource,
  type TimelineScale,
} from "../lib/scheduler";
import { EventEditor, type EventEditorDraft } from "./EventEditor";
import {
  EventResizeHandle,
  ResourceLegend,
  SchedulerShell,
  SchedulerToolbar,
  TIMELINE_SCALE_LABEL,
} from "./scheduler-ui";
import { DropdownMenuItem } from "../primitives/DropdownMenu";

export type EventTimelineProps = {
  events?: SchedulerEvent[];
  resources?: SchedulerResource[];
  scale?: TimelineScale;
  defaultScale?: TimelineScale;
  onScaleChange?: (scale: TimelineScale) => void;
  date?: Date;
  defaultDate?: Date;
  onDateChange?: (date: Date) => void;
  scales?: TimelineScale[];
  locale?: string;
  readOnly?: boolean;
  areEventsDraggable?: boolean;
  areEventsResizable?: boolean;
  onEventClick?: (event: SchedulerEvent) => void;
  onEventChange?: (event: SchedulerEvent, next: Partial<SchedulerEvent>) => void;
  onEventCreate?: (event: SchedulerEvent) => void;
  onEventDelete?: (event: SchedulerEvent) => void;
  /**
   * Built-in create/edit dialog. Defaults to true.
   * Set false when the host owns create/edit.
   */
  showEventEditor?: boolean;
  className?: string;
};

const LANE_HEIGHT = 28;
const LANE_GAP = 4;
const ROW_PAD = 10;

function sourceEvent(events: SchedulerEvent[], id: string): SchedulerEvent | undefined {
  return events.find((event) => event.id === id);
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

function timelineTitle(scale: TimelineScale, date: Date, rangeStart: Date, rangeEnd: Date, locale?: string): string {
  if (scale === "hours") {
    return new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric" }).format(date);
  }
  if (scale === "years") {
    return `${rangeStart.getFullYear()}–${rangeEnd.getFullYear() - 1}`;
  }
  if (scale === "months") return String(date.getFullYear());
  return formatMonthYear(date, locale);
}

/** Horizontal resource timeline — rows are resources, bars are allocations across time. */
export function EventTimeline({
  events = [],
  resources = [],
  scale: scaleProp,
  defaultScale = "months",
  onScaleChange,
  date: dateProp,
  defaultDate,
  onDateChange,
  scales = ["hours", "days", "weeks", "months", "years"],
  locale,
  readOnly = false,
  areEventsDraggable,
  areEventsResizable,
  onEventClick,
  onEventChange,
  onEventCreate,
  onEventDelete,
  showEventEditor = true,
  className,
}: EventTimelineProps) {
  const [scale, setScale] = useControllableState<TimelineScale>({
    prop: scaleProp,
    defaultProp: defaultScale,
    onChange: onScaleChange,
  });
  const [date, setDate] = useControllableState<Date>({
    prop: dateProp,
    defaultProp: defaultDate ?? new Date(),
    onChange: onDateChange,
  });
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState<EventEditorDraft | null>(null);
  const dragRef = useRef<{ id: string; x: number; active: boolean } | null>(null);

  const resolvedScale = scale ?? "months";
  const resolvedDate = date ?? new Date();
  const range = useMemo(
    () => getTimelineRange(resolvedDate, resolvedScale, locale),
    [resolvedDate, resolvedScale, locale],
  );
  const canDrag = !readOnly && (areEventsDraggable ?? Boolean(onEventChange));
  const canResize = !readOnly && (areEventsResizable ?? Boolean(onEventChange));
  const editorLocked = readOnly || Boolean(draft?.id && sourceEvent(events, draft.id)?.readOnly);

  const normalized = useMemo(() => {
    const visible = visibleEvents(normalizeEvents(events, resources), hiddenIds);
    return expandVisibleEvents(visible, range.start, range.end, events);
  }, [events, resources, hiddenIds, range.start, range.end]);

  const visibleResources = resources.filter((resource) => !hiddenIds.has(resource.id));
  const rows = visibleResources.length > 0
    ? visibleResources
    : [{ id: "__all", title: "Events", color: "blue" as const }];

  const title = timelineTitle(resolvedScale, resolvedDate, range.start, range.end, locale);

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

  function handlePointerDown(event: NormalizedEvent, pointer: ReactPointerEvent) {
    if (!onEventChange || !eventCanDrag(event, { readOnly, enabled: canDrag })) return;
    (pointer.currentTarget as HTMLElement).setPointerCapture?.(pointer.pointerId);
    dragRef.current = { id: event.id, x: pointer.clientX, active: false };
  }

  function handlePointerMove(pointer: ReactPointerEvent) {
    const drag = dragRef.current;
    if (!drag) return;
    if (Math.abs(pointer.clientX - drag.x) > 6) drag.active = true;
  }

  function handlePointerUp(event: NormalizedEvent, pointer: ReactPointerEvent) {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag?.active || !onEventChange) return;
    const grid = (pointer.currentTarget as HTMLElement).closest("[data-scheduler-grid]") as HTMLElement | null;
    if (!grid) return;
    const rect = grid.getBoundingClientRect();
    const rangeMs = range.end.getTime() - range.start.getTime();
    const deltaPx = pointer.clientX - drag.x;
    const deltaMs = (deltaPx / rect.width) * rangeMs;
    const source = sourceEvent(events, event.id);
    if (!source) return;
    const master = normalizeEvents([source], resources)[0];
    onEventChange(source, shiftByMs(master, deltaMs));
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

  function renderBar(event: NormalizedEvent): ReactNode {
    const resizable = eventCanResize(event, { readOnly, enabled: canResize }) && Boolean(onEventChange);
    const button = (
      <button
        type="button"
        className="flex h-6 w-full items-center truncate rounded-md px-2 text-left text-[11px] font-semibold shadow-sm"
        style={eventColorStyle(event.color, "bar")}
        onClick={() => {
          if (dragRef.current?.active) return;
          openEvent(event);
        }}
        onPointerDown={(pointer) => handlePointerDown(event, pointer)}
        onPointerMove={handlePointerMove}
        onPointerUp={(pointer) => handlePointerUp(event, pointer)}
      >
        {event.title}
      </button>
    );

    if (!resizable) return button;

    return (
      <div className="relative h-full">
        {button}
        <EventResizeHandle event={event} edge="start" axis="ew" onCommit={commitResize} />
        <EventResizeHandle event={event} edge="end" axis="ew" onCommit={commitResize} />
      </div>
    );
  }

  return (
    <SchedulerShell slot="event-timeline" className={className} aria-label="Event timeline">
      <SchedulerToolbar
        title={title}
        onPrev={() => setDate(shiftTimelineDate(resolvedDate, resolvedScale, -1))}
        onNext={() => setDate(shiftTimelineDate(resolvedDate, resolvedScale, 1))}
        onToday={() => setDate(new Date())}
        menuLabel={TIMELINE_SCALE_LABEL[resolvedScale]}
        menu={scales.map((item) => (
          <DropdownMenuItem key={item} onClick={() => setScale(item)}>
            {TIMELINE_SCALE_LABEL[item]}
          </DropdownMenuItem>
        ))}
      />

      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid" style={{ gridTemplateColumns: "11rem minmax(0, 1fr)" }}>
            <div className="border-b border-r border-border/50 px-3 py-2 text-caption font-medium text-fg-tertiary">
              Resource
            </div>
            <div
              className="grid border-b border-border/50"
              style={{ gridTemplateColumns: `repeat(${range.ticks.length}, minmax(0, 1fr))` }}
            >
              {range.ticks.map((tick) => (
                <div
                  key={tick.date.toISOString()}
                  className="border-l border-border/40 px-2 py-2 text-center text-xs font-bold text-foreground first:border-l-0"
                >
                  {tick.label}
                </div>
              ))}
            </div>

            {rows.map((resource) => {
              const rowEvents =
                resource.id === "__all"
                  ? normalized
                  : normalized.filter((event) => event.resourceId === resource.id);
              const bars = layoutTimelineBars(rowEvents, range.start, range.end);
              const laneCount = Math.max(1, ...bars.map((bar) => bar.lane + 1), 1);
              const height = ROW_PAD * 2 + laneCount * LANE_HEIGHT + (laneCount - 1) * LANE_GAP;
              const tone = resource.color ?? (rowEvents[0]?.color ?? "blue");

              return (
                <div key={resource.id} className="contents">
                  <div
                    className="flex items-center gap-2 border-b border-r border-border/40 px-3 py-2"
                    style={{ minHeight: height }}
                  >
                    <span className="size-2.5 shrink-0 rounded-full" style={eventColorStyle(tone, "dot")} />
                    <span className="truncate text-sm font-semibold text-foreground">{resource.title}</span>
                  </div>
                  <div
                    data-scheduler-grid
                    data-range-start={range.start.getTime()}
                    data-range-end={range.end.getTime()}
                    className="relative border-b border-border/40"
                    style={{
                      minHeight: height,
                      backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent calc(${100 / range.ticks.length}% - 1px), color-mix(in srgb, var(--border) 40%, transparent) calc(${100 / range.ticks.length}% - 1px), color-mix(in srgb, var(--border) 40%, transparent) ${100 / range.ticks.length}%)`,
                    }}
                  >
                    {bars.map((bar) => (
                      <div
                        key={occurrenceKey(bar.event)}
                        className="absolute"
                        style={{
                          top: ROW_PAD + bar.lane * (LANE_HEIGHT + LANE_GAP),
                          left: `${bar.left}%`,
                          width: `${bar.width}%`,
                          height: LANE_HEIGHT,
                        }}
                      >
                        {renderBar(bar.event)}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ResourceLegend
        resources={resources}
        hiddenIds={hiddenIds}
        onToggle={toggleResource}
      />

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
              onEventChange?.(sourceEvent(events, event.id)!, event);
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
