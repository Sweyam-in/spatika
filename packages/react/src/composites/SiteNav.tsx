import { useEffect, useId, useState, type ReactNode } from "react";
import { cn } from "../lib/cn";

export type SiteNavLink = {
  href: string;
  label: string;
};

export type SiteNavProps = {
  brand: ReactNode;
  links: SiteNavLink[];
  /** Render each link (e.g. Next.js `<Link>`). Defaults to `<a>`. */
  renderLink?: (link: SiteNavLink, className: string) => ReactNode;
  className?: string;
  /** Extra classes for the inner max-width row. */
  innerClassName?: string;
  /**
   * Pin the bar to a relatively positioned parent instead of the viewport.
   * Use this in docs previews and embedded shells.
   */
  contained?: boolean;
};

const desktopLinkClass =
  "relative rounded-full px-3.5 py-2 text-[13px] font-bold text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground";

const mobileLinkClass =
  "flex items-center rounded-2xl px-4 py-4 text-xl font-bold text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary";

/**
 * Marketing-site navbar: fixed bar, brand, desktop links, and a 3-line mobile menu.
 *
 * Transparent at rest so a hero can run under it; past 20px of scroll it becomes a frosted
 * bar (`.spk-site-nav` recipe) that stays opaque where backdrop-filter is unavailable, under
 * `prefers-reduced-transparency`, and in the flat Sandhya theme.
 */
export function SiteNav({
  brand,
  links,
  renderLink,
  className,
  innerClassName,
  contained = false,
}: SiteNavProps) {
  const [scrolled, setScrolled] = useState(contained);
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (contained) return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [contained]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const renderItem = (link: SiteNavLink, itemClass: string) => {
    const close = () => setOpen(false);
    if (renderLink) {
      return (
        <span className="contents" onClick={close}>
          {renderLink(link, itemClass)}
        </span>
      );
    }
    return (
      <a href={link.href} className={itemClass} onClick={close}>
        {link.label}
      </a>
    );
  };

  return (
    <nav
      data-slot="site-nav"
      data-scrolled={scrolled ? "true" : "false"}
      className={cn(
        "inset-x-0 top-0 transition-all duration-500",
        contained
          ? "absolute z-10"
          : "spk-site-nav fixed z-50",
        scrolled ? "border-b border-line shadow-md" : "bg-transparent",
        className,
      )}
    >
      <div className={cn("mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", innerClassName)}>
        <div className="flex h-14 items-center justify-between sm:h-16">
          <div className="flex min-w-0 items-center">{brand}</div>

          <div className="hidden items-center gap-0.5 md:flex">
            {links.map((link) => (
              <span key={`${link.href}-${link.label}`}>{renderItem(link, desktopLinkClass)}</span>
            ))}
          </div>

          <button
            type="button"
            className="spk-touch-target -mr-2 p-2 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="flex h-4 w-6 flex-col justify-between" aria-hidden>
              <span
                className={cn(
                  "block h-[2px] w-6 rounded-full bg-foreground transition-transform duration-200",
                  open && "translate-y-[7px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "block h-[2px] w-6 rounded-full bg-foreground transition-opacity duration-200",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "block h-[2px] w-6 rounded-full bg-foreground transition-transform duration-200",
                  open && "-translate-y-[7px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <div
          id={menuId}
          data-slot="site-nav-menu"
          className="border-b border-line shadow-2xl md:hidden"
        >
          <div className="flex flex-col gap-2 px-6 py-8">
            {links.map((link) => (
              <div key={`${link.href}-${link.label}`}>{renderItem(link, mobileLinkClass)}</div>
            ))}
          </div>
        </div>
      ) : null}
    </nav>
  );
}
