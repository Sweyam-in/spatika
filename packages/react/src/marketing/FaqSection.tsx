import * as React from "react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../primitives/Accordion";

export type FaqItem = {
  question: string;
  /** Rich answers are fine — pass a node. `structuredData` needs plain strings. */
  answer: ReactNode;
};

export type FaqSectionProps = {
  items: FaqItem[];
  /** Heading above the list. */
  title?: ReactNode;
  /** A line under the title — often a "still stuck? talk to us" pointer. */
  description?: ReactNode;
  /** Aside beside the list on wide screens — support links, contact card. */
  aside?: ReactNode;
  /** Let several answers stay open at once. */
  multiple?: boolean;
  /** Question opened on first render. */
  defaultOpen?: string;
  /**
   * Emit FAQPage JSON-LD alongside the list. Only answers that are plain strings are
   * included, since structured data cannot carry markup.
   */
  structuredData?: boolean;
  className?: string;
};

function faqJsonLd(items: FaqItem[]) {
  const entities = items
    .filter((item) => typeof item.answer === "string")
    .map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer as string },
    }));

  if (!entities.length) return null;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entities,
  });
}

/**
 * Frequently asked questions on an `Accordion`. Set `structuredData` to also emit
 * FAQPage JSON-LD — the markup search engines read for rich results.
 */
export function FaqSection({
  items,
  title,
  description,
  aside,
  multiple = false,
  defaultOpen,
  structuredData = false,
  className,
}: FaqSectionProps) {
  const jsonLd = structuredData ? faqJsonLd(items) : null;

  const list = (
    <Accordion
      type={multiple ? "multiple" : "single"}
      defaultValue={defaultOpen}
      className="min-w-0"
      data-slot="faq-section-list"
    >
      {items.map((item, index) => (
        <AccordionItem key={index} value={item.question}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>
            {typeof item.answer === "string" ? (
              <p className="text-body text-fg-secondary">{item.answer}</p>
            ) : (
              item.answer
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );

  return (
    <div
      data-slot="faq-section"
      className={cn(aside ? "grid gap-10 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]" : "flex flex-col gap-8", className)}
    >
      {title || description || aside ? (
        <div className="flex min-w-0 flex-col gap-3">
          {title ? <h2 className="text-title-1 tracking-tight text-fg">{title}</h2> : null}
          {description ? <p className="text-body text-fg-secondary">{description}</p> : null}
          {aside}
        </div>
      ) : null}
      {list}
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      ) : null}
    </div>
  );
}
