import { FormField, NumberInput } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [seats, setSeats] = useState<number | null>(12);
  return (
    <div className="grid w-full max-w-xs gap-4">
      <FormField label="Seats" description="Arrow keys step by 1, Page Up / Down by 10.">
        <NumberInput value={seats} onValueChange={setSeats} min={1} max={500} />
      </FormField>
      <FormField label="Monthly budget">
        <NumberInput
          defaultValue={4500}
          step={50}
          min={0}
          formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
        />
      </FormField>
    </div>
  );
}
