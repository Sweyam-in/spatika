import { AI_PROMPT_ACTION_ID, SpatikaEditor } from "@spatika/editor";
import { Card } from "@spatika/react";
import { Link } from "react-router-dom";
import { useState } from "react";

const MENTIONS = [
  { id: "asha", label: "Asha Verma", subtitle: "Design" },
  { id: "dev", label: "Dev Kapoor", subtitle: "Engineering" },
  { id: "mira", label: "Mira Shah", subtitle: "Product" },
];

const INITIAL =
  "<h1>Make yourself at home</h1><p>Everything you see here is what you'd ship in your own app — nothing trimmed down for show. Highlight this paragraph and ask the AI dock to proofread or shorten it, or type <strong>/</strong> when you want a heading, list, or table.</p><p>Feel free to drag an image in, resize it, undo a few times, and type <strong>@</strong> to mention Asha, Dev, or Mira from the sample list.</p>";

export function EditorPlaygroundDemo() {
  const [value, setValue] = useState(INITIAL);

  return (
    <SpatikaEditor
      className="spk-editor-shell--playground"
      value={value}
      onChange={setValue}
      placeholder="Start writing…"
      heightClassName="min-h-[28rem]"
      mentions={MENTIONS}
      aiCommandMenu={{
        title: "AI Toolkit examples",
        actions: [
          { id: "proofread", label: "Proofread selection", requiresSelection: true },
          { id: "rewrite", label: "Rewrite selection", requiresSelection: true },
          { id: "shorten", label: "Make it shorter", requiresSelection: true },
          { id: "continue", label: "Write a new paragraph" },
          { id: "table", label: "Add comparison table" },
        ],
        prompt: { placeholder: "Ask about this document or request a change…" },
        placement: "dock",
      }}
      onAiCommand={async ({ actionId, prompt, selectedText, documentText }) => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        if (actionId === AI_PROMPT_ACTION_ID) {
          return `<p>${prompt ?? "AI update"} applied to the document.</p>`;
        }
        if (actionId === "continue") {
          return "<p>Spatika AI can draft new paragraphs from your backend.</p>";
        }
        if (actionId === "table") {
          return "<table><thead><tr><th>Option</th><th>Score</th></tr></thead><tbody><tr><td>Spatika</td><td>A+</td></tr></tbody></table>";
        }
        if (actionId === "shorten") {
          return selectedText.split(" ").slice(0, 6).join(" ") + "…";
        }
        const source = selectedText || documentText;
        return `${source} — refined with Spatika AI.`;
      }}
      toolbar={{ layout: "ribbon" }}
      mobileFullscreen
    />
  );
}

export function EditorPlaygroundPage() {
  return (
    <article className="editor-playground-page">
      <p className="component-kicker">Editor</p>
      <h1 className="page-title">Spatika Editor playground</h1>
      <p className="page-lead">
        Take your time here. This is the full editor, running outside the docs sidebar so nothing
        feels cramped. Highlight some text and try the AI dock at the bottom, type <strong>/</strong>{" "}
        for a new block, or <strong>@</strong> to pull in someone from the sample team. Drop in a
        table with the grid picker, upload an image and drag its corners to resize — and if a menu
        opens, it portals to the page so you&apos;ll always see it.
      </p>
      <div className="docs-toolbar">
        <Link to="/components/spatika-editor">Back to component docs</Link>
      </div>
      <Card padding="none" className="editor-playground-frame">
        <EditorPlaygroundDemo />
      </Card>
      <p className="editor-playground-note">
        Want to design the shell yourself?{" "}
        <Link to="/components/use-spatika-editor">useSpatikaEditor</Link> gives you the same
        editing engine without our toolbar.
      </p>
    </article>
  );
}
