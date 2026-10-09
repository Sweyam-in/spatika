import { useState } from "react";
import { Check, Copy } from "lucide-react";

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
      <pre tabIndex={0}>
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <button type="button" onClick={copy} aria-label={copied ? "Copied" : "Copy"}>
        {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
      </button>
    </div>
  );
}
