import { useState } from "react";

type CodeBlockProps = {
  code: string;
  language?: string;
};

export function CodeBlock({ code, language = "bash" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="code-block">
      <button type="button" onClick={copy}>
        {copied ? "Copied" : "Copy"}
      </button>
      <pre tabIndex={0}>
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}
