import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@spatika/react";

export default function Demo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger
        tabIndex={0}
        className="grid h-32 place-items-center rounded-[var(--spk-radius-md)] border border-dashed border-line-strong text-body-sm text-fg-secondary"
      >
        Right-click, long-press or press Shift+F10
      </ContextMenuTrigger>
      <ContextMenuContent>
        <DropdownMenuItem>Rename</DropdownMenuItem>
        <DropdownMenuItem>Move to…</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
