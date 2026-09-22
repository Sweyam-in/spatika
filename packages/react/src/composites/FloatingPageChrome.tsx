/**
 * Floating page chrome — Apple liquid-glass toolbar under the app nav.
 *
 * Back and the page title share an identity control; search, filters, and
 * actions sit on the same frosted tray. Pair with `app-page-chrome` (or pass
 * `children` to `FloatingPageChromeBar`) so page content scrolls below the
 * bar instead of under it.
 */
import type { ReactNode, Ref } from "react";
import { ChevronLeft, Search, X } from "lucide-react";
import { cn } from "../lib/cn";
import { Input } from "../primitives/Input";

/** Shared control height for the sticky chrome row. */
export const FLOATING_PAGE_CHROME_HEIGHT_CLASS = "h-9";

/**
 * Pinned rail below the fixed app chrome. Not sticky — pair with
 * `app-page-chrome` so page content scrolls in `.app-page-chrome-body`.
 */
export const floatingPageChromeShellClass =
  "shrink-0 app-frame-pad pt-2 pb-1.5";

/** Inner Apple glass capsule that holds identity, search, and actions. */
export const floatingPageChromeTrayClass =
  "glass-page-toolbar flex w-full min-w-0 flex-col gap-2 px-1.5 py-1 sm:px-2";

/** App-bar utility island (settings + notifications) — still a standalone chip. */
const glassChip =
  "border border-line bg-surface-raised shadow-sm";

/** Inset control sitting on the page toolbar glass (not a second chip). */
const pageToolbarControl =
  "border border-line bg-surface shadow-none";

/** Combined back + page name — flat on the glass tray. */
export const floatingPageChromeIdentityClass =
  "flex h-9 min-w-0 shrink items-center rounded-[var(--spk-radius-sm)]";

/** Search field as an inset pill on the glass tray. */
export const floatingPageChromeSearchWrapClass = cn(
  "relative flex h-9 w-full max-w-md items-center rounded-[var(--spk-radius-sm)]",
  pageToolbarControl,
);

export const floatingPageChromeSearchInputClass =
  "h-9 w-full rounded-[var(--spk-radius-sm)] border-0! bg-transparent! py-0 pl-9 pr-8 text-body leading-none shadow-none!";

/** View & filters / sort — inset on the glass tray, same height as search. */
export const floatingPageChromePillClass = cn(
  "h-9 gap-1.5 rounded-[var(--spk-radius-sm)] px-2.5 text-body-sm font-medium hover:bg-hover data-[state=open]:bg-pressed",
  pageToolbarControl,
);

/** Icon-only control (mobile search, mobile sort). */
export const floatingPageChromeIconPillClass = cn(
  "h-9 w-9 shrink-0 rounded-[var(--spk-radius-sm)] hover:bg-hover data-[state=open]:bg-pressed",
  pageToolbarControl,
);

/** Cluster of related icon actions (add / layout / more). */
export const floatingPageChromeClusterClass = cn(
  "inline-flex h-9 w-fit items-center gap-0.5 rounded-[var(--spk-radius-sm)] p-0.5",
  pageToolbarControl,
);

/** App-bar utility island (settings + notifications). */
export const appChromeActionClusterClass = cn(
  "inline-flex h-9 w-fit items-center gap-0.5 rounded-[var(--spk-radius-sm)] p-0.5",
  glassChip,
);

/** Primary CTA in the chrome row. */
export const floatingPageChromePrimaryClass =
  "h-9 gap-1.5 px-3";

/** Gap between a trigger pill and its attached menu (leaves room for the caret). */
export const FLOATING_PAGE_CHROME_POPOVER_OFFSET = 10;

export const floatingPageChromeAttachedPopoverClass =
  "spk-overlay overflow-visible p-0";

/** Inner buttons sitting inside a glass cluster (no second chip). */
export const appChromeClusterButtonClass =
  "relative z-[70] h-8 w-8 shrink-0 rounded-[calc(var(--spk-radius-sm)-2px)] px-0 text-fg-secondary transition-colors hover:bg-hover hover:text-fg data-[state=open]:bg-pressed data-[state=open]:text-fg";

/**
 * Small pointer that visually joins a popover to its trigger.
 * `align="end"` matches popover `align="end"` (caret sits under the right-hand control).
 */
export function ChromeAttachedCaret({
  align = "end",
}: {
  align?: "start" | "end";
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute -top-[7px] h-3.5 w-3.5 rotate-45 border-l border-t border-line bg-surface-overlay",
        align === "end" ? "right-5" : "left-5",
      )}
    />
  );
}

export type FloatingPageChromeIdentityProps = {
  onBack?: () => void;
  title: ReactNode;
  count?: ReactNode;
  /** Spoken name for the count badge, e.g. "253 people". */
  countLabel?: string;
  backLabel?: string;
  className?: string;
};

export function FloatingPageChromeIdentity({
  onBack,
  title,
  count,
  countLabel,
  backLabel = "Go back",
  className,
}: FloatingPageChromeIdentityProps) {
  const backClassName =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted/70 active:scale-[0.96]";

  return (
    <div
      data-slot="floating-page-chrome-identity"
      className={cn(
        floatingPageChromeIdentityClass,
        "max-w-[min(28rem,calc(100%-6.5rem))]",
        className,
      )}
    >
      {onBack ? (
        <button type="button" onClick={onBack} aria-label={backLabel} className={backClassName}>
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
      ) : (
        <span className="w-2.5 shrink-0" aria-hidden />
      )}
      <h1 className="min-w-0 truncate text-sm font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      {count != null && count !== false ? (
        <span
          className="page-header-count ml-1.5 mr-2.5"
          aria-label={countLabel}
        >
          {count}
        </span>
      ) : (
        <span className="w-2.5 shrink-0" aria-hidden />
      )}
    </div>
  );
}

export type FloatingPageChromeSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder: string;
  inputRef?: Ref<HTMLInputElement>;
  className?: string;
  fullWidth?: boolean;
  type?: "search" | "text";
  "aria-label"?: string;
};

/** Search pill used in the chrome row and the mobile reveal row. */
export function FloatingPageChromeSearchField({
  value,
  onChange,
  onClear,
  placeholder,
  inputRef,
  className,
  fullWidth = false,
  type = "search",
  "aria-label": ariaLabel,
}: FloatingPageChromeSearchFieldProps) {
  return (
    <div
      data-slot="floating-page-chrome-search"
      className={cn(floatingPageChromeSearchWrapClass, fullWidth && "max-w-none", className)}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
      <Input
        ref={inputRef}
        type={type}
        enterKeyHint="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={floatingPageChromeSearchInputClass}
        autoComplete="off"
        aria-label={ariaLabel}
      />
      {value ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}

export type FloatingPageChromeBarProps = {
  identity: ReactNode;
  search?: ReactNode;
  actions?: ReactNode;
  below?: ReactNode;
  /** Page body — scrolls independently so it cannot pass under the toolbar. */
  children?: ReactNode;
  className?: string;
};

/**
 * Shared chrome row: identity, optional centered search, trailing actions.
 * `below` is a second row (mobile search, compact TOC) and is not itself a full-bleed bar.
 * Pass `children` to pin this bar above a nested scroller (content never slides under it).
 */
export function FloatingPageChromeBar({
  identity,
  search,
  actions,
  below,
  children,
  className,
}: FloatingPageChromeBarProps) {
  const bar = (
    <div
      data-slot="floating-page-chrome"
      className={cn(floatingPageChromeShellClass, children == null && className)}
    >
      <div className={floatingPageChromeTrayClass}>
        <div className="flex h-9 w-full min-w-0 items-center gap-2">
          {identity}
          {search ? (
            <>
              <div className="min-w-0 flex-1 md:hidden" aria-hidden />
              <div className="hidden min-w-0 flex-1 justify-center px-0.5 sm:px-2 md:flex">
                {search}
              </div>
            </>
          ) : (
            <div className="min-w-0 flex-1" aria-hidden />
          )}
          {actions ? (
            <div className="flex h-9 shrink-0 items-center justify-end gap-1.5">{actions}</div>
          ) : null}
        </div>
        {below}
      </div>
    </div>
  );

  if (children == null) return bar;

  return (
    <div className={cn("app-page-chrome", className)}>
      {bar}
      <div className="app-page-chrome-body">{children}</div>
    </div>
  );
}

/** Shell + glass tray for pages that compose the chrome row by hand. */
export function FloatingPageChromeShell({
  children,
  below,
  className,
}: {
  children: ReactNode;
  below?: ReactNode;
  className?: string;
}) {
  return (
    <div data-slot="floating-page-chrome-shell" className={cn(floatingPageChromeShellClass, className)}>
      <div className={floatingPageChromeTrayClass}>
        {children}
        {below}
      </div>
    </div>
  );
}
