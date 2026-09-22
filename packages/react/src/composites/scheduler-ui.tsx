import type { HTMLAttributes, ReactNode } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { cn } from "../lib/cn";
import {
  eventColorStyle,
  formatDateRange,
  snapMs,
  startOfDay,
  type CalendarView,
  type NormalizedEvent,
  type SchedulerPreferences,
  type SchedulerResource,
  type TimelineScale,
} from "../lib/scheduler";
import { NativeSelect } from "../primitives/NativeSelect";
import { Button } from "../primitives/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../primitives/DropdownMenu";
import { Popover, PopoverContent, PopoverTrigger } from "../primitives/Popover";

export const CALENDAR_VIEW_LABEL: Record<CalendarView, string> = {
  month: "Month",
  week: "Week",
  day: "Day",
  agenda: "Agenda",
};

export const TIMELINE_SCALE_LABEL: Record<TimelineScale, string> = {
  hours: "Hours",
  days: "Days",
  weeks: "Weeks",
  months: "Months",
  years: "Years",
};

export type SchedulerToolbarDensity = "default" | "compact";

export type SchedulerToolbarProps = {
  title: ReactNode;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  menuLabel: string;
  menu: ReactNode;
  trailing?: ReactNode;
  /** Compact is a single desktop row. Defaults keep the stacked marketing toolbar. */
  density?: SchedulerToolbarDensity;
  /** Month/year jump. Sits beside the view menu. */
  dateJump?: ReactNode;
};

export function SchedulerToolbar({
  title,
  onPrev,
  onNext,
  onToday,
  menuLabel,
  menu,
  trailing,
  density = "default",
  dateJump,
}: SchedulerToolbarProps) {
  const nav = (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Previous"
        onClick={onPrev}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={onToday}>
        Today
      </Button>
      <Button type="button" variant="ghost" size="icon" aria-label="Next" onClick={onNext}>
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );

  const viewMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="min-w-[6.5rem] justify-between gap-2">
          {menuLabel}
          <ChevronDown className="size-3.5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{menu}</DropdownMenuContent>
    </DropdownMenu>
  );

  if (density === "compact") {
    return (
      <div
        data-slot="scheduler-toolbar"
        data-density="compact"
        className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border/50 px-3 py-2 sm:px-4 sm:py-3"
      >
        {nav}
        <h2 className="min-w-0 truncate text-center text-title-3 text-fg">
          {title}
        </h2>
        <div className="flex shrink-0 flex-nowrap items-center justify-end gap-2">
          {viewMenu}
          {dateJump}
          {trailing}
        </div>
      </div>
    );
  }

  return (
    <div
      data-slot="scheduler-toolbar"
      data-density="default"
      className="flex flex-col gap-3 border-b border-border/50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"
    >
      <h2 className="min-w-0 truncate text-title-2 text-fg sm:text-title-1">
        {title}
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        {nav}
        {viewMenu}
        {dateJump}
        {trailing}
      </div>
    </div>
  );
}

const DATE_JUMP_SELECT =
  "w-[5.25rem] min-w-[5.25rem] text-center [text-align-last:center]";

export type SchedulerDateJumpProps = {
  date: Date;
  locale?: string;
  yearOptions?: number[];
  onDateChange: (date: Date) => void;
};

function resolveYearOptions(year: number, yearOptions?: number[]) {
  if (yearOptions && yearOptions.length > 0) {
    return yearOptions.includes(year) ? yearOptions : [...yearOptions, year].sort((a, b) => a - b);
  }
  return Array.from({ length: 13 }, (_, index) => year - 8 + index);
}

/** Compact month/year native selects for calendar toolbars. */
export function SchedulerDateJump({
  date,
  locale,
  yearOptions,
  onDateChange,
}: SchedulerDateJumpProps) {
  const month = date.getMonth();
  const year = date.getFullYear();
  const years = resolveYearOptions(year, yearOptions);
  const months = Array.from({ length: 12 }, (_, index) =>
    new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(2020, index, 1)).toUpperCase(),
  );

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <NativeSelect
        size="sm"
        className={DATE_JUMP_SELECT}
        aria-label="Month"
        value={month}
        onChange={(event) => onDateChange(new Date(year, Number(event.target.value), 1))}
      >
        {months.map((label, index) => (
          <option key={label} value={index}>
            {label}
          </option>
        ))}
      </NativeSelect>
      <NativeSelect
        size="sm"
        className={cn(DATE_JUMP_SELECT, "tabular-nums")}
        aria-label="Year"
        value={year}
        onChange={(event) => onDateChange(new Date(Number(event.target.value), month, 1))}
      >
        {years.map((yearOption) => (
          <option key={yearOption} value={yearOption}>
            {yearOption}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}

export function SchedulerPreferencesMenu({
  value,
  onChange,
  disabled,
}: {
  value: Required<SchedulerPreferences>;
  onChange: (next: Required<SchedulerPreferences>) => void;
  disabled?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label="Preferences" disabled={disabled}>
          <Settings className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          onClick={() => onChange({ ...value, showWeekends: !value.showWeekends })}
        >
          {value.showWeekends ? "Hide weekends" : "Show weekends"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onChange({ ...value, showWeekNumber: !value.showWeekNumber })}
        >
          {value.showWeekNumber ? "Hide week numbers" : "Show week numbers"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange({ ...value, ampm: !value.ampm })}>
          {value.ampm ? "Use 24-hour time" : "Use 12-hour time"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            onChange({ ...value, weekStartsOn: value.weekStartsOn === 0 ? 1 : 0 })
          }
        >
          Week starts on {value.weekStartsOn === 0 ? "Monday" : "Sunday"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function EventResizeHandle({
  event,
  edge,
  axis,
  hourStart,
  hourEnd,
  onCommit,
}: {
  event: NormalizedEvent;
  edge: "start" | "end";
  axis: "ns" | "ew";
  hourStart?: number;
  hourEnd?: number;
  onCommit: (event: NormalizedEvent, edge: "start" | "end", instant: Date) => void;
}) {
  const ns = axis === "ns";
  return (
    <button
      type="button"
      aria-label={edge === "start" ? "Resize start" : "Resize end"}
      className={cn(
        "absolute z-10 touch-none bg-transparent",
        ns ? "inset-x-1 h-1.5 cursor-ns-resize" : "inset-y-1 w-1.5 cursor-ew-resize",
        ns && edge === "start" && "top-0",
        ns && edge === "end" && "bottom-0",
        !ns && edge === "start" && "left-0",
        !ns && edge === "end" && "right-0",
      )}
      onClick={(click) => click.stopPropagation()}
      onPointerDown={(pointer) => {
        pointer.stopPropagation();
        (pointer.currentTarget as HTMLElement).setPointerCapture?.(pointer.pointerId);
      }}
      onPointerUp={(pointer) => {
        pointer.stopPropagation();
        if (ns) {
          const column = (pointer.currentTarget as HTMLElement).closest(
            "[data-scheduler-day]",
          ) as HTMLElement | null;
          if (!column || hourStart == null || hourEnd == null) return;
          const rect = column.getBoundingClientRect();
          const ratio = Math.min(1, Math.max(0, (pointer.clientY - rect.top) / rect.height));
          const ms =
            startOfDay(event.start).getTime() + (hourStart + ratio * (hourEnd - hourStart)) * 3_600_000;
          onCommit(event, edge, new Date(snapMs(ms)));
          return;
        }
        const grid = (pointer.currentTarget as HTMLElement).closest(
          "[data-scheduler-grid]",
        ) as HTMLElement | null;
        if (!grid) return;
        const start = Number(grid.dataset.rangeStart);
        const end = Number(grid.dataset.rangeEnd);
        const rect = grid.getBoundingClientRect();
        const ratio = Math.min(1, Math.max(0, (pointer.clientX - rect.left) / rect.width));
        onCommit(event, edge, new Date(snapMs(start + ratio * (end - start))));
      }}
    />
  );
}


export function ResourceLegend({
  resources,
  hiddenIds,
  onToggle,
}: {
  resources: SchedulerResource[];
  hiddenIds: ReadonlySet<string>;
  onToggle: (id: string) => void;
}) {
  if (resources.length === 0) return null;
  return (
    <div
      data-slot="scheduler-resources"
      className="flex flex-wrap items-center gap-1.5 border-t border-border/50 px-3 py-2.5 sm:px-4"
    >
      <p className="mr-1 text-caption font-medium text-fg-tertiary">
        Resources
      </p>
      {resources.map((resource) => {
        const active = !hiddenIds.has(resource.id);
        const tone = resource.color ?? "blue";
        return (
          <button
            key={resource.id}
            type="button"
            onClick={() => onToggle(resource.id)}
            aria-pressed={active}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
              active
                ? "border-border/60 bg-background/80 text-foreground"
                : "border-transparent bg-muted/30 text-muted-foreground line-through",
            )}
          >
            <span
              className="size-2 rounded-full"
              style={eventColorStyle(tone, "dot")}
              aria-hidden
            />
            {resource.title}
          </button>
        );
      })}
    </div>
  );
}

export function EventPopover({
  event,
  resources,
  children,
  onOpenChange,
}: {
  event: NormalizedEvent;
  resources: SchedulerResource[];
  children: ReactNode;
  onOpenChange?: (open: boolean) => void;
}) {
  const resource = resources.find((item) => item.id === event.resourceId);
  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-72 p-3">
        <p className="text-sm font-bold text-foreground">{event.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatDateRange(event.start, event.end, event.allDay)}
        </p>
        {resource ? (
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <span className="size-2 rounded-full" style={eventColorStyle(event.color, "dot")} />
            {resource.title}
          </p>
        ) : null}
        {event.description ? (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{event.description}</p>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

export function SchedulerShell({
  className,
  slot,
  children,
  ...props
}: {
  className?: string;
  slot: string;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot={slot}
      className={cn(
        "relative overflow-hidden rounded-[var(--spk-radius-md)] border border-line bg-surface",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
