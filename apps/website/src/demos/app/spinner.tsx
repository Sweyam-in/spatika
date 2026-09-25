import { Button, Spinner } from "@spatika/react";

export default function Demo() {
  return (
    <div className="flex items-center gap-4">
      <Spinner size="sm" label="Loading invoices" />
      <Spinner size="md" label="Loading" />
      <Button loading>Saving</Button>
    </div>
  );
}
