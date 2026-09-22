import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/cn";
import { Button } from "./Button";
import { List, ListItemButton, ListItemIcon, ListItemText } from "./List";
import { Paper } from "./Paper";

export type TransferListProps = {
  left: string[];
  right: string[];
  onChange?: (next: { left: string[]; right: string[] }) => void;
  leftTitle?: string;
  rightTitle?: string;
  className?: string;
};

function move(source: string[], target: string[], picked: string[]) {
  return {
    source: source.filter((item) => !picked.includes(item)),
    target: [...target, ...source.filter((item) => picked.includes(item))],
  };
}

function Column({
  title,
  items,
  checked,
  onToggle,
}: {
  title: string;
  items: string[];
  checked: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <Paper variant="outlined" className="min-w-40 flex-1 overflow-hidden">
      <div className="border-b border-line-subtle px-3 py-2 text-caption font-medium text-fg-secondary">
        {title}
      </div>
      <List dense disablePadding className="max-h-48 overflow-auto">
        {items.map((item) => (
          <ListItemButton
            key={item}
            selected={checked.includes(item)}
            onClick={() => onToggle(item)}
          >
            <ListItemIcon>
              <span
                className={cn(
                  "size-3.5 rounded-sm border",
                  checked.includes(item) ? "border-primary bg-primary" : "border-border",
                )}
              />
            </ListItemIcon>
            <ListItemText primary={item} />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
}

/**
 * Two-list shuttle for picking items — MUI Transfer List analogue.
 */
function TransferList({
  left,
  right,
  onChange,
  leftTitle = "Choices",
  rightTitle = "Chosen",
  className,
}: TransferListProps) {
  const [checkedLeft, setCheckedLeft] = React.useState<string[]>([]);
  const [checkedRight, setCheckedRight] = React.useState<string[]>([]);

  const toggle = (item: string, side: "left" | "right") => {
    const setter = side === "left" ? setCheckedLeft : setCheckedRight;
    setter((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));
  };

  const toRight = () => {
    const next = move(left, right, checkedLeft);
    onChange?.({ left: next.source, right: next.target });
    setCheckedLeft([]);
  };
  const toLeft = () => {
    const next = move(right, left, checkedRight);
    onChange?.({ left: next.target, right: next.source });
    setCheckedRight([]);
  };

  return (
    <div data-slot="transfer-list" className={cn("flex items-center gap-3", className)}>
      <Column title={leftTitle} items={left} checked={checkedLeft} onToggle={(item) => toggle(item, "left")} />
      <div className="flex flex-col gap-2">
        <Button size="sm" variant="outline" disabled={!checkedLeft.length} onClick={toRight} aria-label="Move right">
          <ChevronRight className="size-4" />
        </Button>
        <Button size="sm" variant="outline" disabled={!checkedRight.length} onClick={toLeft} aria-label="Move left">
          <ChevronLeft className="size-4" />
        </Button>
      </div>
      <Column title={rightTitle} items={right} checked={checkedRight} onToggle={(item) => toggle(item, "right")} />
    </div>
  );
}
TransferList.displayName = "TransferList";

export { TransferList };
