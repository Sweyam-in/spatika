import { Calendar } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [date, setDate] = useState<Date | null>(new Date());
  return (
    <Calendar
      selected={date}
      onSelect={setDate}
      isDateDisabled={(day) => day.getDay() === 0 || day.getDay() === 6}
    />
  );
}
