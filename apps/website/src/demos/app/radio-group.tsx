import { FormField, Label, RadioGroup, RadioGroupItem } from "@spatika/react";

export default function Demo() {
  return (
    <FormField label="Billing cycle">
      <RadioGroup defaultValue="yearly" className="grid gap-2">
        {[
          { value: "monthly", label: "Monthly" },
          { value: "yearly", label: "Yearly — two months free" },
        ].map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <RadioGroupItem id={`billing-${option.value}`} value={option.value} />
            <Label htmlFor={`billing-${option.value}`}>{option.label}</Label>
          </div>
        ))}
      </RadioGroup>
    </FormField>
  );
}
