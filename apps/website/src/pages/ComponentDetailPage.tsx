import { Link, Navigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { ApiTable, ClassTable, SlotTable } from "@/components/ApiTable";
import { CodeBlock } from "@/components/CodeBlock";
import { DemoBlock } from "@/components/DemoBlock";
import { DocsToc } from "@/components/DocsToc";
import { usageSnippet } from "@/data/agent-docs";
import { componentImportCode, components } from "@/data/navigation";
import { SITE } from "@/data/site";
import { getComponentDoc } from "@/docs/catalog";
import { ExtraExample } from "@/docs/extra-examples";
import { ComponentDemo } from "@/demos/ComponentDemo";
import { Playground } from "@/components/Playground";
import { PLAYGROUNDS } from "@/docs/playground";

function InlineCode({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code key={index}>{part.slice(1, -1)}</code>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

export function ComponentDetailPage() {
  const { slug } = useParams();
  const entry = components.find((item) => item.slug === slug);

  if (!entry) {
    return <Navigate to="/components" replace />;
  }

  const doc = getComponentDoc(entry);
  const importCode = componentImportCode(entry);
  const agentHref = `/docs/${entry.slug}.md`;
  const index = components.findIndex((item) => item.slug === entry.slug);
  const prev = index > 0 ? components[index - 1] : undefined;
  const next = index >= 0 && index < components.length - 1 ? components[index + 1] : undefined;
  const related = doc.related
    .map((itemSlug) => components.find((item) => item.slug === itemSlug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const playground = PLAYGROUNDS[entry.slug];
  const toc = [
    { id: "preview", label: "Preview" },
    ...(playground ? [{ id: "playground", label: "Playground" }] : []),
    { id: "import", label: "Import" },
    { id: "usage", label: "Usage" },
    { id: "agent-markdown", label: "Agent Markdown" },
    { id: "props", label: "Props" },
    { id: "slots", label: "Slots" },
    { id: "css-classes", label: "CSS classes" },
    ...(doc.accessibility.length ? [{ id: "accessibility", label: "Accessibility" }] : []),
    ...(related.length ? [{ id: "related", label: "Related" }] : []),
  ];

  return (
    <article className="component-doc">
      <div className="component-doc-main">
        <p className="component-kicker">{entry.category}</p>
        <h1 className="page-title">{entry.name}</h1>
        <p className="page-lead">
          <InlineCode text={doc.intro} />
        </p>

        <div className="docs-toolbar">
          {entry.category === "Editor" && entry.slug === "spatika-editor" ? (
            <Link to="/demos/editor">Open full playground</Link>
          ) : null}
          <a href={agentHref}>
            <FileText size={15} />
            View as Markdown
          </a>
        </div>

        <h2 className="section-title" id="preview">
          Preview
        </h2>
        {doc.examples.map((example) => (
          <DemoBlock
            key={example.id}
            id={example.id}
            title={example.title}
            description={example.description}
            code={example.code}
          >
            {example.id === "basic" ? (
              <ComponentDemo slug={entry.slug} bare />
            ) : (
              <ExtraExample slug={entry.slug} id={example.id} />
            )}
          </DemoBlock>
        ))}

        {playground ? (
          <>
            <h2 className="section-title" id="playground">
              Playground
            </h2>
            <p className="docs-agent">
              Change props and see the real component update. Controls come from this version&apos;s API; the code below
              is what you would write.
            </p>
            <Playground key={entry.slug} config={playground} />
          </>
        ) : null}

        <h2 className="section-title" id="import">
          Import
        </h2>
        <CodeBlock language="tsx" code={importCode} />

        <h2 className="section-title" id="usage">
          Usage
        </h2>
        {doc.usage.map((section) => (
          <section key={section.id} id={section.id}>
            <h3 className="demo-block-title">{section.title}</h3>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="demo-block-lead">
                <InlineCode text={paragraph} />
              </p>
            ))}
          </section>
        ))}
        <CodeBlock language="tsx" code={usageSnippet(entry.slug)} />

        <h2 className="section-title" id="agent-markdown">
          Agent Markdown
        </h2>
        <p className="docs-agent">
          Canonical machine-readable docs for this component. Agents should fetch this file instead
          of scraping the page.
        </p>
        <p>
          <a href={agentHref}>
            {SITE.url}
            {agentHref}
          </a>
        </p>

        <h2 className="section-title" id="props">
          Props
        </h2>
        <ApiTable sections={doc.api} />

        <h2 className="section-title" id="slots">
          Slots
        </h2>
        <p className="docs-agent">
          Spatika slots are compound subcomponents and <code>data-slot</code> hooks. Pass{" "}
          <code>asChild</code> on roots that support it to replace the default element — the same
          idea as Material UI&apos;s <code>component</code> / <code>slots</code> API.
        </p>
        <SlotTable slots={doc.slots} />

        <h2 className="section-title" id="css-classes">
          CSS classes
        </h2>
        <p className="docs-agent">
          Target parts with <code>[data-slot]</code> selectors or named <code>.spk-*</code> /{" "}
          <code>.glass</code> utilities. Merge extra utilities through <code>className</code>.
        </p>
        <ClassTable classes={doc.classes} />

        {doc.accessibility.length ? (
          <>
            <h2 className="section-title" id="accessibility">
              Accessibility
            </h2>
            <ul className="docs-guidelines">
              {doc.accessibility.map((item) => (
                <li key={item}>
                  <InlineCode text={item} />
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {related.length ? (
          <>
            <h2 className="section-title" id="related">
              Related
            </h2>
            <div className="related-chips">
              {related.map((item) => (
                <Link key={item.slug} to={`/components/${item.slug}`} className="related-chip">
                  {item.name}
                </Link>
              ))}
            </div>
          </>
        ) : null}

        <nav className="docs-pager" aria-label="Adjacent components">
          {prev ? (
            <Link to={`/components/${prev.slug}`} className="docs-pager-link">
              <ChevronLeft size={16} />
              <span>
                <small>Previous</small>
                {prev.name}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to={`/components/${next.slug}`} className="docs-pager-link docs-pager-link--next">
              <span>
                <small>Next</small>
                {next.name}
              </span>
              <ChevronRight size={16} />
            </Link>
          ) : null}
        </nav>
      </div>
      <DocsToc items={toc} />
    </article>
  );
}
