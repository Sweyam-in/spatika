import { useEffect, useState } from "react";
import {
  createEventId,
  fromDatetimeLocalValue,
  SCHEDULER_COLOR_TONES,
  toDatetimeLocalValue,
  toDate,
  type SchedulerColorTone,
  type SchedulerEvent,
  type SchedulerResource,
} from "../lib/scheduler";
import { Button } from "../primitives/Button";
import { Checkbox } from "../primitives/Checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../primitives/Dialog";
import { Input } from "../primitives/Input";
import { NativeSelect } from "../primitives/NativeSelect";
import { Textarea } from "../primitives/Textarea";
import { FormField } from "./FormField";

export type EventEditorDraft = {
  id?: string;
  title?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resourceId?: string;
  color?: SchedulerColorTone;
  description?: string;
  rrule?: string;
};

const RRULE_PRESETS: { value: string; label: string }[] = [
  { value: "", label: "Does not repeat" },
  { value: "FREQ=DAILY", label: "Daily" },
  { value: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR", label: "Every weekday" },
  { value: "FREQ=WEEKLY", label: "Weekly" },
  { value: "FREQ=MONTHLY", label: "Monthly" },
  { value: "FREQ=YEARLY", label: "Yearly" },
];

export function EventEditor({
  open,
  onOpenChange,
  draft,
  resources = [],
  readOnly = false,
  onSave,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: EventEditorDraft | null;
  resources?: SchedulerResource[];
  readOnly?: boolean;
  onSave: (event: SchedulerEvent) => void;
  onDelete?: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [resourceId, setResourceId] = useState("");
  const [color, setColor] = useState<SchedulerColorTone | "">("");
  const [description, setDescription] = useState("");
  const [rrule, setRrule] = useState("");

  useEffect(() => {
    if (!draft || !open) return;
    setTitle(draft.title ?? "");
    setStart(
      draft.allDay
        ? toDatetimeLocalValue(toDate(draft.start)).slice(0, 10)
        : toDatetimeLocalValue(toDate(draft.start)),
    );
    setEnd(
      draft.allDay
        ? toDatetimeLocalValue(toDate(draft.end)).slice(0, 10)
        : toDatetimeLocalValue(toDate(draft.end)),
    );
    setAllDay(Boolean(draft.allDay));
    setResourceId(draft.resourceId ?? "");
    setColor(draft.color ?? "");
    setDescription(draft.description ?? "");
    setRrule(draft.rrule ?? "");
  }, [draft, open]);

  const locked = readOnly;
  const isEdit = Boolean(draft?.id);

  function submit() {
    if (!draft || locked) return;
    const nextStart = allDay ? fromDatetimeLocalValue(`${start}T00:00`) : fromDatetimeLocalValue(start);
    const nextEnd = allDay
      ? fromDatetimeLocalValue(`${end || start}T00:00`)
      : fromDatetimeLocalValue(end || start);
    onSave({
      id: draft.id ?? createEventId(),
      title: title.trim() || "Untitled",
      start: nextStart,
      end: nextEnd.getTime() <= nextStart.getTime()
        ? new Date(nextStart.getTime() + (allDay ? 86_400_000 : 3_600_000))
        : nextEnd,
      allDay,
      resourceId: resourceId || undefined,
      color: color || undefined,
      description: description.trim() || undefined,
      rrule: rrule || undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{locked ? "Event" : isEdit ? "Edit event" : "New event"}</DialogTitle>
          <DialogDescription>
            {locked ? "This calendar is read-only." : "Title, time, resource, and recurrence."}
          </DialogDescription>
        </DialogHeader>
        {draft ? (
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <FormField id="spk-event-title" label="Title" required>
              <Input
                id="spk-event-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={locked}
                autoFocus={!locked}
              />
            </FormField>
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={allDay}
                onCheckedChange={(value) => {
                  const next = value === true;
                  setAllDay(next);
                  if (next) {
                    setStart(start.slice(0, 10));
                    setEnd((end || start).slice(0, 10));
                  } else {
                    setStart(start.length <= 10 ? `${start}T09:00` : start);
                    setEnd((end || start).length <= 10 ? `${end || start}T10:00` : end);
                  }
                }}
                disabled={locked}
              />
              All day
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField id="spk-event-start" label="Start">
                <Input
                  id="spk-event-start"
                  type={allDay ? "date" : "datetime-local"}
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                  disabled={locked}
                />
              </FormField>
              <FormField id="spk-event-end" label="End">
                <Input
                  id="spk-event-end"
                  type={allDay ? "date" : "datetime-local"}
                  value={end}
                  onChange={(event) => setEnd(event.target.value)}
                  disabled={locked}
                />
              </FormField>
            </div>
            {resources.length > 0 ? (
              <FormField id="spk-event-resource" label="Resource">
                <NativeSelect
                  id="spk-event-resource"
                  value={resourceId}
                  onChange={(event) => setResourceId(event.target.value)}
                  disabled={locked}
                  className="h-9 min-h-9"
                >
                  <option value="">None</option>
                  {resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.title}
                    </option>
                  ))}
                </NativeSelect>
              </FormField>
            ) : null}
            <FormField id="spk-event-color" label="Color">
              <NativeSelect
                id="spk-event-color"
                value={color}
                onChange={(event) => setColor(event.target.value as SchedulerColorTone | "")}
                disabled={locked}
                className="h-9 min-h-9"
              >
                <option value="">From resource</option>
                {SCHEDULER_COLOR_TONES.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </NativeSelect>
            </FormField>
            <FormField id="spk-event-repeat" label="Repeat">
              <NativeSelect
                id="spk-event-repeat"
                value={rrule}
                onChange={(event) => setRrule(event.target.value)}
                disabled={locked}
                className="h-9 min-h-9"
              >
                {RRULE_PRESETS.map((preset) => (
                  <option key={preset.value || "none"} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
                {rrule && !RRULE_PRESETS.some((preset) => preset.value === rrule) ? (
                  <option value={rrule}>Custom</option>
                ) : null}
              </NativeSelect>
            </FormField>
            <FormField id="spk-event-notes" label="Description">
              <Textarea
                id="spk-event-notes"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={locked}
                rows={3}
              />
            </FormField>
            <DialogFooter>
              {isEdit && onDelete && !locked ? (
                <Button
                  type="button"
                  variant="destructive"
                  className="sm:mr-auto"
                  onClick={() => {
                    onDelete(draft.id!);
                    onOpenChange(false);
                  }}
                >
                  Delete
                </Button>
              ) : null}
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {locked ? "Close" : "Cancel"}
              </Button>
              {!locked ? <Button type="submit">Save</Button> : null}
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
