import { Link } from "react-router-dom";
import { Button } from "@spatika/react";
import { BookOpen, Bot, FileText } from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";

const SKILL_COPY =
  "cp -R node_modules/@spatika/react/skills/spatika-ui .cursor/skills/spatika-ui";

const points = [
  {
    icon: FileText,
    title: "Machine index",
    body: (
      <>
        <a href="/llms.txt">/llms.txt</a> is the catalog.{" "}
        <a href="/llms-full.txt">/llms-full.txt</a> bundles install steps, recipes, and components
        in one file.
      </>
    ),
  },
  {
    icon: Bot,
    title: "Cursor skill",
    body: "Copy spatika-ui from the npm package into .cursor/skills. The skill tells the agent to import tokens, wrap SpatikaThemeProvider, and stop inventing components from scratch.",
  },
  {
    icon: BookOpen,
    title: "Component markdown",
    body: "Each export has a page at /docs/{slug}.md with usage notes and a snippet the agent can paste straight into your code.",
  },
] as const;

export function AiFirstSection() {
  return (
    <section className="ai-first" id="ai-first" aria-labelledby="ai-first-heading">
      <div className="ai-first-inner">
        <div className="ai-first-copy">
          <p className="ai-first-eyebrow">
            <Bot size={14} aria-hidden />
            AI first
          </p>
          <h2 className="ai-first-title" id="ai-first-heading">
            An AI-first component library
          </h2>
          <p className="ai-first-lead">
            Most kits assume a human will read the docs cover to cover. Spatika also ships the files
            an agent actually fetches, so Cursor or Claude Code reaches for <code>PageShell</code>{" "}
            instead of inventing another header.
          </p>
          <div className="ai-first-actions">
            <Button asChild size="touch">
              <a href="/llms.txt">Open llms.txt</a>
            </Button>
            <Button variant="secondary" asChild>
              <Link to="/guides#ai-agents">Agent setup</Link>
            </Button>
          </div>
          <div className="ai-first-skill">
            <CodeBlock code={SKILL_COPY} />
          </div>
        </div>

        <div className="ai-first-points">
          {points.map(({ icon: Icon, title, body }) => (
            <article key={title} className="ai-first-point">
              <span className="ai-first-point-icon" aria-hidden>
                <Icon size={16} />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
