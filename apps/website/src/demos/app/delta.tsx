import { Delta } from "@spatika/react";

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Delta value={0.124} format="percent" label="vs last month" />
      <Delta value={-0.032} format="percent" />
      <Delta value={-0.08} format="percent" intent="inverse" label="churn" />
      <Delta value={1840} format="currency" currency="USD" variant="plain" />
    </div>
  );
}
