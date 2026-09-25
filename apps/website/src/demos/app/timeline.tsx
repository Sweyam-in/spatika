import { Timeline, TimelineItem } from "@spatika/react";

export default function Demo() {
  return (
    <Timeline>
      <TimelineItem tone="success" title="Payment received" meta="Today, 09:42" description="$1,250.00 via bank transfer" />
      <TimelineItem tone="accent" title="Invoice sent" meta="Sep 20" description="Emailed to ap@copperline.io" />
      <TimelineItem title="Invoice drafted" meta="Sep 18" />
    </Timeline>
  );
}
