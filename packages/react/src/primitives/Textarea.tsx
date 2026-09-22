import * as React from "react";
import { cn } from "../lib/cn";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn("spk-field spk-field--multiline", className)}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
