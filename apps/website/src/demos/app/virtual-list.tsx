import { VirtualList } from "@spatika/react";

const events = Array.from({ length: 10_000 }, (_, index) => ({
  id: index + 1,
  label: `Webhook delivered · evt_${(48_213 + index).toString(36)}`,
}));

export default function Demo() {
  return (
    <VirtualList
      aria-label="Event log"
      items={events}
      itemHeight={36}
      height={288}
      getKey={(event) => event.id}
      className="w-full rounded-[var(--spk-radius-md)] border border-line"
      renderItem={(event) => (
        <div className="flex h-full items-center justify-between gap-3 border-b border-line-subtle px-3 text-body-sm">
          <span className="truncate">{event.label}</span>
          <span className="spk-numeric text-fg-tertiary">#{event.id}</span>
        </div>
      )}
    />
  );
}
