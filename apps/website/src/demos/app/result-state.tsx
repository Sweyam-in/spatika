import { Button, ResultState } from "@spatika/react";

export default function Demo() {
  return (
    <div className="grid w-full gap-4 md:grid-cols-2">
      <ResultState
        status="success"
        title="Payment received"
        description="We emailed a receipt to ap@copperline.io."
        actions={<Button size="sm">View invoice</Button>}
      />
      <ResultState
        status="error"
        title="Export failed"
        description="The file was larger than 2 GB. Narrow the date range and try again."
        actions={<Button size="sm" variant="secondary">Try again</Button>}
      />
    </div>
  );
}
