import * as React from "react";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../lib/cn";

export type AnnouncementPillProps = {
  children: ReactNode;
  /** Short leading label — "New", "v2.0", "Changelog". */
  tag?: ReactNode;
  /** Makes the pill a link and shows a chevron. */
  href?: string;
  onClick?: () => void;
  /** Hide the trailing chevron on a linked pill. */
  hideChevron?: boolean;
  className?: string;
};

/** The small "what's new" pill above a hero headline. Links when you give it an `href`. */
export function AnnouncementPill({
  children,
  tag,
  href,
  onClick,
  hideChevron = false,
  className,
}: AnnouncementPillProps) {
  const content = (
    <>
      {tag ? <span className="spk-mk-pill__tag">{tag}</span> : null}
      <span className="min-w-0 truncate">{children}</span>
      {href && !hideChevron ? (
        <span className="spk-mk-pill__chevron" aria-hidden="true">
          <ChevronRight className="size-3.5" />
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <a data-slot="announcement-pill" href={href} onClick={onClick} className={cn("spk-mk-pill", className)}>
        {content}
      </a>
    );
  }

  return (
    <span data-slot="announcement-pill" className={cn("spk-mk-pill", className)}>
      {content}
    </span>
  );
}

export type MarketingHeroProps = {
  title: ReactNode;
  /** Sub-headline. Keep it to a sentence or two — the measure is capped for readability. */
  lede?: ReactNode;
  /** Small label above the title. */
  eyebrow?: ReactNode;
  /** Usually an `AnnouncementPill`, above everything else. */
  announcement?: ReactNode;
  /** Call-to-action buttons. */
  actions?: ReactNode;
  /** Fine print under the actions — "No card required", "MIT licensed". */
  note?: ReactNode;
  /** Product shot, `ShowcaseFrame`, illustration or form. */
  media?: ReactNode;
  /** `stacked` centres the copy with media below; `split` puts media beside it. */
  layout?: "stacked" | "split";
  /** Copy alignment. Defaults to centred when stacked, start-aligned when split. */
  align?: "start" | "center";
  /** Trust strip under the hero — a `LogoCloud`, rating row or stat line. */
  footer?: ReactNode;
  /** Heading level. Use `h1` once per page. */
  as?: "h1" | "h2";
  className?: string;
};

/**
 * The top of a marketing page: announcement, headline, lede, calls to action and an
 * optional product shot. `layout="split"` puts the media beside the copy on wide screens
 * and stacks it underneath on phones.
 */
export function MarketingHero({
  title,
  lede,
  eyebrow,
  announcement,
  actions,
  note,
  media,
  layout = "stacked",
  align,
  footer,
  as: Heading = "h1",
  className,
}: MarketingHeroProps) {
  const split = layout === "split";
  const centered = (align ?? (split ? "start" : "center")) === "center";

  const copy = (
    <div
      data-slot="marketing-hero-copy"
      className={cn(
        "flex min-w-0 flex-col gap-5",
        centered && "items-center text-center",
      )}
    >
      {announcement ? <div className="min-w-0">{announcement}</div> : null}
      <div className={cn("flex flex-col gap-4", centered && "items-center")}>
        {eyebrow ? <p className="spk-mk-eyebrow">{eyebrow}</p> : null}
        <Heading data-slot="marketing-hero-title" className="spk-mk-hero__title">
          {title}
        </Heading>
        {lede ? (
          <p data-slot="marketing-hero-lede" className={cn("spk-mk-hero__lede", centered && "mx-auto")}>
            {lede}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div
          data-slot="marketing-hero-actions"
          className={cn("flex flex-wrap items-center gap-3", centered && "justify-center")}
        >
          {actions}
        </div>
      ) : null}
      {note ? <p className="text-body-sm text-fg-tertiary">{note}</p> : null}
    </div>
  );

  return (
    <div data-slot="marketing-hero" data-layout={layout} className={cn("flex flex-col gap-12", className)}>
      {split ? (
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {copy}
          {media ? (
            <div data-slot="marketing-hero-media" className="min-w-0">
              {media}
            </div>
          ) : null}
        </div>
      ) : (
        <>
          {copy}
          {media ? (
            <div data-slot="marketing-hero-media" className="min-w-0">
              {media}
            </div>
          ) : null}
        </>
      )}
      {footer ? (
        <div data-slot="marketing-hero-footer" className="min-w-0">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
