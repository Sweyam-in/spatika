import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { Badge } from "../primitives/Badge";
import { Card } from "./Card";
import { Tag } from "./Tag";

export type CareerCardProps = {
  role: ReactNode;
  company: ReactNode;
  location?: ReactNode;
  period?: ReactNode;
  current?: boolean;
  bullets?: ReactNode[];
  tags?: string[];
  className?: string;
};

export type CareerTimelineProps = {
  children: ReactNode;
  className?: string;
};

/** Vertical career rail with a hairline and slot for CareerCard rows. */
export function CareerTimeline({ children, className }: CareerTimelineProps) {
  return (
    <div data-slot="career-timeline" className={cn("relative", className)}>
      <div className="absolute top-2 bottom-2 left-[5px] hidden w-px bg-border sm:block" aria-hidden />
      <div className="space-y-3">{children}</div>
    </div>
  );
}

/** Resume / experience card: role, company, period pill, bullets, tech tags. */
export function CareerCard({
  role,
  company,
  location,
  period,
  current = false,
  bullets = [],
  tags = [],
  className,
}: CareerCardProps) {
  return (
    <article data-slot="career-card" className={cn("relative sm:pl-8", className)}>
      <div
        className={cn(
          "absolute top-4 left-0 hidden h-2.5 w-2.5 rounded-full border-2 sm:block",
          current ? "border-primary bg-primary" : "border-border bg-background",
        )}
        aria-hidden
      />
      <Card
        variant="panel"
        padding="md"
        className={
          current
            ? "border-primary/25 bg-gradient-to-br from-[var(--background)] to-primary/[0.04] shadow-md"
            : "hover:border-primary/20"
        }
      >
        <div className="mb-2.5 flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-[15px] font-[900] leading-snug text-foreground sm:text-[16px]">{role}</h3>
            <p className="mt-0.5 text-[13px] font-bold text-primary">
              {company}
              {location ? (
                <span className="font-semibold text-muted-foreground"> · {location}</span>
              ) : null}
            </p>
          </div>
          {period ? (
            <Badge
              variant={current ? "default" : "secondary"}
              className={
                current
                  ? "rounded-full border-primary bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground"
                  : "rounded-full px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
              }
            >
              {current ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-foreground" /> : null}
              {period}
            </Badge>
          ) : null}
        </div>

        {bullets.length > 0 ? (
          <ul className="mb-3 space-y-1.5">
            {bullets.map((bullet, index) => (
              <li
                key={index}
                className="flex gap-2 text-[13px] leading-relaxed text-muted-foreground"
              >
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-primary/50" />
                {bullet}
              </li>
            ))}
          </ul>
        ) : null}

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        ) : null}
      </Card>
    </article>
  );
}
