import type { Editor } from "@tiptap/core";
import { ArrowUp, Sparkles } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
  resolveAiCommandActions,
  resolveAiPromptConfig,
} from "../lib/ai-command-menu";
import type { AiActionDefinition, AiCommandMenuConfig } from "../lib/types";
import { AI_PROMPT_ACTION_ID } from "../lib/types";
import { cn } from "../lib/cn";
import { AiCommandPanel } from "./AiCommandPanel";
import { ToolbarButton } from "./ToolbarButton";

export type AiCommandRunRequest = {
  actionId: string;
  prompt?: string;
};

type AiCommandMenuProps = {
  editor: Editor | null;
  config?: AiCommandMenuConfig;
  actions?: AiActionDefinition[];
  onRun: (request: AiCommandRunRequest) => void;
  className?: string;
};

export function AiCommandMenu({ editor, config, actions, onRun, className }: AiCommandMenuProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const title = config?.title ?? "AI Toolkit examples";
  const commandActions = resolveAiCommandActions(config, actions);
  const promptConfig = resolveAiPromptConfig(config?.prompt);
  const hasSelection = Boolean(editor?.state?.selection && !editor.state.selection.empty);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    setPrompt("");
  };

  const runAction = (actionId: string, userPrompt?: string) => {
    onRun({ actionId, prompt: userPrompt });
    close();
  };

  const submitPrompt = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    runAction(AI_PROMPT_ACTION_ID, trimmed);
  };

  if (!editor) return null;

  return (
    <div ref={rootRef} className={cn("spk-editor-ai-menu", className)}>
      <ToolbarButton
        aria-label="AI commands"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? titleId : undefined}
        active={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Sparkles className="size-4" />
      </ToolbarButton>
      {open ? (
        <div className="spk-editor-ai-menu-shell" onMouseDown={(event) => event.stopPropagation()}>
          <AiCommandPanel
            id={titleId}
            title={title}
            actions={commandActions}
            hasSelection={hasSelection}
            onSelect={(actionId) => runAction(actionId)}
          />
          {promptConfig.enabled ? (
            <div className="spk-editor-ai-menu-prompt">
              <label className="spk-editor-ai-menu-prompt-field">
                <span className="sr-only">{promptConfig.placeholder}</span>
                <input
                  type="text"
                  className="spk-editor-ai-menu-prompt-input"
                  value={prompt}
                  placeholder={promptConfig.placeholder}
                  onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") submitPrompt();
                    if (event.key === "Escape") close();
                  }}
                  autoFocus
                />
              </label>
              <button
                type="button"
                className="spk-editor-ai-menu-prompt-submit"
                aria-label={promptConfig.submitLabel}
                disabled={!prompt.trim()}
                onClick={submitPrompt}
              >
                <ArrowUp className="size-4" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
