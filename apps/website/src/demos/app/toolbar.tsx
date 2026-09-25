import { Toolbar, ToolbarButton } from "@spatika/react";
import { Bold, Italic, Underline } from "lucide-react";
import { useState } from "react";

export default function Demo() {
  const [bold, setBold] = useState(true);
  return (
    <Toolbar aria-label="Formatting">
      <ToolbarButton active={bold} aria-pressed={bold} aria-label="Bold" onClick={() => setBold(!bold)}>
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton aria-label="Italic">
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton aria-label="Underline">
        <Underline className="size-4" />
      </ToolbarButton>
    </Toolbar>
  );
}
