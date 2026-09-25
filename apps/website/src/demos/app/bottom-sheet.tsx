import { BottomSheet, Button, ChipGroup, toggleOptionValue } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string[]>(["open"]);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Filters
      </Button>
      <BottomSheet open={open} onOpenChange={setOpen}>
        <div className="grid gap-4 p-4">
          <ChipGroup
            title="Status"
            variant="filter"
            options={[
              { value: "open", label: "Open" },
              { value: "paid", label: "Paid" },
              { value: "overdue", label: "Overdue" },
            ]}
            selected={status}
            onToggle={(value) => setStatus(toggleOptionValue(status, value))}
          />
          <Button onClick={() => setOpen(false)}>Show results</Button>
        </div>
      </BottomSheet>
    </>
  );
}
