import * as React from "react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type ArticleCardProps = {
  title: ReactNode;
  /** Link for the whole card. The title carries the link so the accessible name is right. */
  href?: string;
  /** Standfirst or excerpt. Clamped to three lines. */
  excerpt?: ReactNode;
  /** Cover image or illustration. */
  media?: ReactNode;
  /** Publication date — pass a formatted string, or a `<time>` element. */
  date?: ReactNode;
  /** "6 min read". */
  readingTime?: ReactNode;
  /** Category or tags — `Tag` elements, usually. */
  tags?: ReactNode;
  /** Author name. */
  author?: ReactNode;
  /** An `Avatar` or `InitialsAvatar`. */
  authorAvatar?: ReactNode;
  /** `card` — hairline surface · `plain` — no box · `horizontal` — media beside the copy. */
  variant?: "card" | "plain" | "horizontal";
  /** Bigger type for the lead story in a listing. */
  featured?: boolean;
  as?: "article" | "li" | "div";
  className?: string;
  children?: ReactNode;
};

/**
 * One entry in a blog, changelog or press listing — cover, title, excerpt and a byline.
 * Pair it with `Prose` for the post body itself.
 */
export function ArticleCard({
  title,
  href,
  excerpt,
  media,
  date,
  readingTime,
  tags,
  author,
  authorAvatar,
  variant = "card",
  featured = false,
  as: Comp = "article",
  className,
  children,
}: ArticleCardProps) {
  const Tag = Comp as "article";
  const horizontal = variant === "horizontal";
  const hasMeta = Boolean(date || readingTime);

  return (
    <Tag
      data-slot="article-card"
      data-variant={variant}
      data-featured={featured ? "true" : undefined}
      className={cn("spk-mk-article", horizontal && "spk-mk-article--row", className)}
    >
      {media ? (
        <div data-slot="article-card-media" className="spk-mk-article__media">
          {media}
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {tags ? <div className="flex flex-wrap items-center gap-1.5">{tags}</div> : null}

        <h3
          data-slot="article-card-title"
          className={cn(featured ? "text-title-1 tracking-tight" : "text-title-2", "text-fg")}
        >
          {href ? (
            <a href={href} className="spk-mk-article__link">
              {title}
            </a>
          ) : (
            title
          )}
        </h3>

        {excerpt ? <p className="spk-mk-article__excerpt">{excerpt}</p> : null}
        {children}

        {author || hasMeta ? (
          <div className="mt-auto flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-2 text-caption text-fg-tertiary">
            {authorAvatar ? <span className="shrink-0">{authorAvatar}</span> : null}
            {author ? <span className="text-fg-secondary">{author}</span> : null}
            {author && hasMeta ? <span aria-hidden="true">·</span> : null}
            {date ? <span data-slot="article-card-date">{date}</span> : null}
            {date && readingTime ? <span aria-hidden="true">·</span> : null}
            {readingTime ? <span data-slot="article-card-reading-time">{readingTime}</span> : null}
          </div>
        ) : null}
      </div>
    </Tag>
  );
}
