import { useState, type ReactNode } from "react";
import { Code2 } from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";

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

type DemoBlockProps = {
  id: string;
  title: string;
  description?: string;
  code: string;
  children: ReactNode;
};

export function DemoBlock({ id, title, description, code, children }: DemoBlockProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="demo-block" id={id}>
      <h3 className="demo-block-title">{title}</h3>
      {description ? (
        <p className="demo-block-lead">
          <InlineCode text={description} />
        </p>
      ) : null}
      <div className="demo-block-frame">
        <div className="demo-block-preview">{children}</div>
        <div className="demo-block-toolbar">
          <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
            <Code2 size={15} />
            {open ? "Hide code" : "Show code"}
          </button>
        </div>
        {open ? <CodeBlock language="tsx" code={code} /> : null}
      </div>
    </section>
  );
}
