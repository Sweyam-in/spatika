import { DateInput, FormField } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [birthday, setBirthday] = useState<Date | null>(null);
  return (
    <FormField label="Date of birth" description="Type it — no calendar needed." className="w-full max-w-xs">
      <DateInput value={birthday} onValueChange={setBirthday} max={new Date()} name="birthday" />
    </FormField>
  );
}
