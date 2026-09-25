import { DatePicker, FormField } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [due, setDue] = useState<Date | null>(null);
  return (
    <FormField label="Due date" className="w-full max-w-xs">
      <DatePicker value={due} onValueChange={setDue} min={new Date()} clearable />
    </FormField>
  );
}
