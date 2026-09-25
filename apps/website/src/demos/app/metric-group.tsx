import { Delta, Metric, MetricGroup } from "@spatika/react";

export default function Demo() {
  return (
    <MetricGroup columns={3} divided>
      <Metric label="MRR" value={48210} format="currency" currency="USD" delta={<Delta value={0.062} format="percent" />} />
      <Metric label="Active accounts" value={1284} delta={<Delta value={0.018} format="percent" />} />
      <Metric label="Churn" value={0.021} format="percent" delta={<Delta value={-0.004} format="percent" intent="inverse" />} />
    </MetricGroup>
  );
}
