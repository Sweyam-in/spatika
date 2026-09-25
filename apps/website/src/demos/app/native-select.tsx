import { FormField, NativeSelect } from "@spatika/react";

export default function Demo() {
  return (
    <FormField label="Country" className="w-full max-w-xs">
      <NativeSelect defaultValue="in">
        <option value="in">India</option>
        <option value="de">Germany</option>
        <option value="us">United States</option>
      </NativeSelect>
    </FormField>
  );
}
