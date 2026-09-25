import { FormField, TimeInput } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [start, setStart] = useState<string | null>("09:30");
  return (
    <div className="flex w-full max-w-md flex-wrap gap-4">
      <FormField label="Meeting starts" className="min-w-40 flex-1">
        <TimeInput value={start} onValueChange={setStart} minuteStep={15} min="08:00" max="18:00" />
      </FormField>
      <FormField label="Log time (24-hour)" className="min-w-40 flex-1">
        <TimeInput hourCycle={24} granularity="second" defaultValue="14:05:00" />
      </FormField>
    </div>
  );
}
