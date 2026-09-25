import { ScrollArea } from "@spatika/react";

export default function Demo() {
  return (
    <ScrollArea aria-label="Changelog" maxHeight={200} fade className="w-full max-w-md rounded-[var(--spk-radius-md)] border border-line p-4">
      <ol className="grid gap-3 text-body-sm">
        {Array.from({ length: 12 }, (_, index) => (
          <li key={index}>
            <strong className="font-medium">v2.{12 - index}.0</strong> — fixes and improvements.
          </li>
        ))}
      </ol>
    </ScrollArea>
  );
}
