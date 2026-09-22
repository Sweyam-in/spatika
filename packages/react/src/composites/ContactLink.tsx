import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { Card } from "./Card";

export type ContactLinkProps = {
  href: string;
  name: ReactNode;
  label?: ReactNode;
  icon: ReactNode;
  iconBg?: string;
  iconColor?: string;
  className?: string;
  target?: string;
  rel?: string;
};

/** Contact / social row: tinted icon well, name, handle, trailing arrow. */
export function ContactLink({
  href,
  name,
  label,
  icon,
  iconBg,
  iconColor,
  className,
  target,
  rel,
}: ContactLinkProps) {
  const external = href.startsWith("http");
  return (
    <a
      data-slot="contact-link"
      href={href}
      target={target ?? (external ? "_blank" : undefined)}
      rel={rel ?? (external ? "noopener noreferrer" : undefined)}
      className={cn("group block rounded-2xl", className)}
    >
      <Card
        variant="panel"
        padding="md"
        className="flex items-center gap-4 p-4 group-hover:border-primary/25 group-hover:shadow-md"
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-foreground">{name}</p>
          {label ? <p className="truncate text-[12px] text-muted-foreground">{label}</p> : null}
        </div>
        <svg
          className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
        </svg>
      </Card>
    </a>
  );
}
