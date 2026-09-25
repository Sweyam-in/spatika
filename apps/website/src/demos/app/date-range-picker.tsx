import { DateRangePicker, FormField, type DateRange } from "@spatika/react";
import { useState } from "react";

const DAY = 86_400_000;

export default function Demo() {
  const [range, setRange] = useState<DateRange>({ from: null, to: null });
  return (
    <FormField label="Reporting period" className="w-full max-w-sm">
      <DateRangePicker
        value={range}
        onValueChange={setRange}
        max={new Date()}
        presets={[
          { label: "Last 7 days", range: () => ({ from: new Date(Date.now() - 6 * DAY), to: new Date() }) },
          { label: "Last 30 days", range: () => ({ from: new Date(Date.now() - 29 * DAY), to: new Date() }) },
          {
            label: "This month",
            range: () => {
              const now = new Date();
              return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
            },
          },
        ]}
      />
    </FormField>
  );
}
