import { ResizablePanels } from "@spatika/react";

export default function Demo() {
  return (
    <div className="h-64 w-full overflow-hidden rounded-[var(--spk-radius-md)] border border-line">
      <ResizablePanels defaultSizes={[32, 68]} minSizes={[20, 40]} handleLabels={["Resize message list"]} stackBelow={480}>
        <div className="h-full bg-surface-subtle p-4 text-body-sm text-fg-secondary">Inbox · 24 messages</div>
        <div className="h-full p-4 text-body-sm">Select a message to read it.</div>
      </ResizablePanels>
    </div>
  );
}
