import { cn } from "../lib/cn";

export type AccentRuleProps = {
  className?: string;
};

/** Short 4px marketing accent bar used under section titles. */
export function AccentRule({ className }: AccentRuleProps) {
  return (
    <div data-slot="accent-rule" className={cn("spk-hr-accent", className)} role="presentation" />
  );
}
