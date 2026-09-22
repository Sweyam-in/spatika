import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/cn";

export type PaginationProps = {
  /** 1-based current page. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
  /**
   * `pages` — numbered buttons with ellipses (default ≥640px).
   * `compact` — "Page 3 of 12" with arrows (default on phones, dense toolbars).
   */
  variant?: "pages" | "compact";
  /** Pages shown either side of the current page in `pages` mode. */
  siblings?: number;
};

type PageToken = number | "gap-start" | "gap-end";

function pageTokens(page: number, count: number, siblings: number): PageToken[] {
  const total = siblings * 2 + 5;
  if (count <= total) return Array.from({ length: count }, (_, i) => i + 1);
  const start = Math.max(2, page - siblings);
  const end = Math.min(count - 1, page + siblings);
  const tokens: PageToken[] = [1];
  if (start > 2) tokens.push("gap-start");
  for (let p = start; p <= end; p += 1) tokens.push(p);
  if (end < count - 1) tokens.push("gap-end");
  tokens.push(count);
  return tokens;
}

const navButton = "spk-btn spk-btn--ghost spk-btn--icon-sm text-fg-secondary";

export function Pagination({ page, pageCount, onPageChange, className, variant, siblings = 1 }: PaginationProps) {
  const count = Math.max(1, pageCount);
  const prev = (
    <button type="button" className={navButton} aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
      <ChevronLeft />
    </button>
  );
  const next = (
    <button type="button" className={navButton} aria-label="Next page" disabled={page >= count} onClick={() => onPageChange(page + 1)}>
      <ChevronRight />
    </button>
  );
  const compact = (
    <span className="spk-numeric px-1 text-body-sm text-fg-secondary">
      Page <span className="text-fg">{page}</span> of {count}
    </span>
  );

  return (
    <nav data-slot="pagination" aria-label="Pagination" className={cn("flex items-center gap-1", className)}>
      {prev}
      {variant === "compact" ? (
        compact
      ) : (
        <>
          <span className={cn("sm:hidden", variant === "pages" && "hidden")}>{compact}</span>
          <ul className={cn("hidden items-center gap-0.5 sm:flex", variant === "pages" && "flex")}>
            {pageTokens(page, count, siblings).map((token) =>
              typeof token === "number" ? (
                <li key={token}>
                  <button
                    type="button"
                    aria-current={token === page ? "page" : undefined}
                    className={cn(
                      "spk-btn spk-btn--sm spk-numeric min-w-[var(--spk-control-h-sm)] px-1.5",
                      token === page ? "spk-btn--secondary" : "spk-btn--ghost text-fg-secondary",
                    )}
                    onClick={() => onPageChange(token)}
                  >
                    {token}
                  </button>
                </li>
              ) : (
                <li key={token} aria-hidden className="w-6 text-center text-body-sm text-fg-tertiary">
                  …
                </li>
              ),
            )}
          </ul>
        </>
      )}
      {next}
    </nav>
  );
}
