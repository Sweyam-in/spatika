import { EditorContent } from "@tiptap/react";
import { useState } from "react";
import { EditorToolbar, SpatikaEditor, useSpatikaEditor } from "@spatika/editor";
import { RichTextEditor } from "@spatika/react";

const MENTIONS = [
  { id: "asha", label: "Asha Verma", subtitle: "Design" },
  { id: "dev", label: "Dev Kapoor", subtitle: "Engineering" },
  { id: "mira", label: "Mira Shah", subtitle: "Product" },
];

export function editorDemo(compact: boolean) {
  return {
    "spatika-editor": <SpatikaEditorDemo compact={compact} />,
    "use-spatika-editor": <HeadlessEditorDemo compact={compact} />,
    "rich-text-editor": <LegacyEditorDemo compact={compact} />,
  };
}

function SpatikaEditorDemo({ compact }: { compact: boolean }) {
  if (!compact) {
    return (
      <div className="editor-doc-preview">
        <p className="demo-block-lead">
          The preview on the component page is small on purpose — docs need to stay readable. When
          you want room to breathe, open the{" "}
          <a href="/demos/editor">full editor playground</a> and try tables, image upload, the AI
          dock, and menus that won&apos;t get cut off by the sidebar.
        </p>
      </div>
    );
  }

  const [value, setValue] = useState(
    "<p>Just a taste — open the full playground when you're ready to try tables, images, and the AI dock.</p>",
  );

  return (
    <SpatikaEditor
      value={value}
      onChange={setValue}
      placeholder="Write something memorable…"
      heightClassName="min-h-48"
      mentions={MENTIONS}
      aiCommandMenu={{
        title: "AI Toolkit examples",
        placement: "dock",
        prompt: { placeholder: "Ask about this document or request a change…" },
      }}
      onAiCommand={async ({ actionId, prompt, selectedText }) => {
        if (actionId === "prompt") return `<p>${prompt}</p>`;
        if (!selectedText) return null;
        return `${selectedText} — refined.`;
      }}
      toolbar={{ layout: "compact" }}
    />
  );
}

function HeadlessEditorDemo({ compact }: { compact: boolean }) {
  const [value, setValue] = useState(
    "<p>Same editing engine, your own toolbar — that's useSpatikaEditor.</p>",
  );
  const { editor, isReady } = useSpatikaEditor({
    value,
    onChange: setValue,
    placeholder: "Write here…",
  });

  if (!isReady || !editor) {
    return <p className="text-sm text-muted-foreground">Loading editor…</p>;
  }

  return (
    <div className="spk-editor-shell">
      <EditorToolbar
        editor={editor}
        config={{ layout: "compact", ai: false, insert: !compact }}
      />
      <EditorContent editor={editor} className={compact ? "min-h-32 px-3 py-2" : "min-h-48 px-3 py-2"} />
    </div>
  );
}

function LegacyEditorDemo({ compact }: { compact: boolean }) {
  const [value, setValue] = useState(
    "<p>RichTextEditor still works on older screens, but SpatikaEditor is where we're investing.</p>",
  );
  return (
    <RichTextEditor
      value={value}
      onChange={setValue}
      minHeightClassName={compact ? "min-h-24" : "min-h-32"}
    />
  );
}
