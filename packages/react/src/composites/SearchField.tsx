import type { ComponentProps, ReactNode } from "react";
import { Search } from "lucide-react";
import { cn } from "../lib/cn";
import { Input } from "../primitives/Input";

export type SearchFieldProps = ComponentProps<"input"> & {
  containerClassName?: string;
  leading?: ReactNode;
};

/** Search input with leading icon — mobile-friendly min height. */
export function SearchField({
  className,
  containerClassName,
  leading,
  ...props
}: SearchFieldProps) {
  return (
    <div
      data-slot="search-field"
      className={cn("relative w-full", containerClassName)}
    >
      {/* inset-y + flex centers the icon without translate utilities (more reliable across app Tailwind scans) */}
      <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-fg-tertiary">
        {leading ?? <Search className="h-4 w-4 shrink-0" aria-hidden />}
      </span>
      <Input
        className={cn(
          "py-0 pl-9 leading-none",
          "[&::-webkit-search-decoration]:appearance-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
          className,
        )}
        type="search"
        {...props}
      />
    </div>
  );
}
