import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { Badge } from "../primitives/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { Tag } from "./Tag";

export type ProjectCardProps = {
  title: ReactNode;
  company?: ReactNode;
  outcome?: ReactNode;
  description?: ReactNode;
  tags?: string[];
  className?: string;
};

/** Marketing project tile: title, company, outcome pill, body, tech tags. */
export function ProjectCard({
  title,
  company,
  outcome,
  description,
  tags = [],
  className,
}: ProjectCardProps) {
  return (
    <Card
      variant="panel"
      padding="md"
      className={cn(
        "group flex h-full flex-col hover:border-primary/30 hover:shadow-md",
        className,
      )}
    >
      <CardHeader className="mb-2">
        <div className="min-w-0">
          <CardTitle className="text-[15px] leading-snug font-[900] group-hover:text-primary sm:text-[16px]">
            {title}
          </CardTitle>
          {company ? (
            <p className="mt-0.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              {company}
            </p>
          ) : null}
        </div>
        {outcome ? (
          <Badge variant="warm" className="rounded-full px-2.5 py-1 text-[10px] font-semibold">
            {outcome}
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {description ? (
          <p className="mb-3 flex-1 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
