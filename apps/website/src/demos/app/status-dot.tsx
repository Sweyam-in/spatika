import { StatusDot } from "@spatika/react";

export default function Demo() {
  return (
    <ul className="grid gap-2 text-body-sm">
      <li className="flex items-center gap-2">
        <StatusDot tone="success" label="Operational" /> API
      </li>
      <li className="flex items-center gap-2">
        <StatusDot tone="warning" pulse label="Degraded" /> Webhooks
      </li>
      <li className="flex items-center gap-2">
        <StatusDot tone="danger" label="Outage" /> Exports
      </li>
    </ul>
  );
}
