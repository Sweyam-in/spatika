import { AmountInput, FormField } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [amount, setAmount] = useState("1250.00");
  return (
    <FormField label="Transfer amount" className="w-full max-w-xs">
      <AmountInput value={amount} onChange={setAmount} currency="EUR" />
    </FormField>
  );
}
