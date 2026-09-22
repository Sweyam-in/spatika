import * as React from "react";
import { cn } from "../lib/cn";

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return <kbd data-slot="kbd" className={cn("spk-kbd", className)} {...props} />;
}

export { Kbd };
