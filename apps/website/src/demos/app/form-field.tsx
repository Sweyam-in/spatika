import { FormField, Input, Textarea } from "@spatika/react";

export default function Demo() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <FormField label="Work email" description="We send receipts here." required>
        <Input type="email" placeholder="you@company.com" />
      </FormField>
      <FormField label="Company size" error="Enter a number between 1 and 10,000">
        <Input defaultValue="0" inputMode="numeric" />
      </FormField>
      <FormField label="Notes" optional>
        <Textarea rows={3} />
      </FormField>
    </div>
  );
}
