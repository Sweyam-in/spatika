import * as React from "react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type ProseProps = {
  children?: ReactNode;
  /** Render pre-sanitised HTML — for MDX output or a CMS body. */
  html?: string;
  /** `md` is the reading default; `sm` suits sidebars and changelog entries. */
  size?: "sm" | "md";
  /** Set the first paragraph at title size as a standfirst. */
  lead?: boolean;
  as?: "div" | "article" | "section";
  className?: string;
};

/**
 * Long-form typography for posts, changelogs, docs and legal pages: headings, lists,
 * quotes, code and figures styled from the theme with a capped measure.
 *
 * `html` is injected as-is — only pass markup you have sanitised or authored yourself.
 */
export function Prose({ children, html, size = "md", lead = false, as: Comp = "div", className }: ProseProps) {
  const Tag = Comp as "div";
  const props = {
    "data-slot": "prose",
    "data-size": size,
    "data-lead": lead ? "true" : undefined,
    className: cn("spk-prose", className),
  } as const;

  if (html != null) {
    return <Tag {...props} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return <Tag {...props}>{children}</Tag>;
}
