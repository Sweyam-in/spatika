import type { Editor } from "@tiptap/core";
import {
  ArrowLeft,
  ArrowUp,
  MessageSquarePlus,
  PenLine,
  Plus,
  Search,
  Sparkles,
  Table2,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
  resolveAiCommandActions,
  resolveAiPromptConfig,
} from "../lib/ai-command-menu";
import type { AiActionDefinition, AiCommandMenuConfig } from "../lib/types";
import { AI_PROMPT_ACTION_ID } from "../lib/types";
import { cn } from "../lib/cn";
import { AiCommandPanel } from "./AiCommandPanel";
import type { AiCommandRunRequest } from "./AiCommandMenu";

const DEFAULT_ACTION_ICONS: Record<string, AiActionDefinition["icon"]> = {
  proofread: <Search className="size-4" />,
  rewrite: <PenLine className="size-4" />,
  shorten: <ArrowLeft className="size-4" />,
  improve: <Sparkles className="size-4" />,
  expand: <Plus className="size-4" />,
  continue: <Plus className="size-4" />,
  table: <Table2 className="size-4" />,
  comment: <MessageSquarePlus className="size-4" />,
};

function withDefaultIcons(actions: AiActionDefinition[]) {
  return actions.map((action) => ({
    ...action,
    icon: action.icon ?? DEFAULT_ACTION_ICONS[action.id],
  }));
}

type AiCommandDockProps = {
  editor: Editor | null;
  config?: AiCommandMenuConfig;
  actions?: AiActionDefinition[];
  onRun: (request: AiCommandRunRequest) => void;
  className?: string;
};

export function AiCommandDock({ editor, config, actions, onRun, className }: AiCommandDockProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const title = config?.title ?? "AI Toolkit examples";
  const commandActions = withDefaultIcons(resolveAiCommandActions(config, actions));
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

  const runAction = (actionId: string, userPrompt?: string) => {
    onRun({ actionId, prompt: userPrompt });
    setOpen(false);
    setPrompt("");
  };

  const submitPrompt = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    runAction(AI_PROMPT_ACTION_ID, trimmed);
  };

  if (!editor) return null;

  return (
    <div ref={rootRef} className={cn("spk-editor-ai-dock", className)}>
      {open ? (
        <AiCommandPanel
          id={panelId}
          title={title}
          actions={commandActions}
          hasSelection={hasSelection}
          onSelect={(actionId) => runAction(actionId)}
          className="spk-editor-ai-dock-panel"
        />
      ) : null}
      {promptConfig.enabled ? (
        <div className="spk-editor-ai-dock-bar" role="search">
          <button
            type="button"
            className={cn("spk-editor-ai-dock-trigger", open && "spk-editor-ai-dock-trigger--active")}
            aria-label="AI commands"
            aria-expanded={open}
            aria-controls={open ? panelId : undefined}
            onClick={() => setOpen((value) => !value)}
          >
            <Sparkles className="size-4" />
          </button>
          <label className="spk-editor-ai-dock-field">
            <span className="sr-only">{promptConfig.placeholder}</span>
            <input
              type="text"
              className="spk-editor-ai-dock-input"
              value={prompt}
              placeholder={promptConfig.placeholder}
              onFocus={() => setOpen(true)}
              onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submitPrompt();
              }
              if (event.key === "Escape") setOpen(false);
            }}
            />
          </label>
          <button
            type="button"
            className="spk-editor-ai-dock-submit"
            aria-label={promptConfig.submitLabel}
            disabled={!prompt.trim()}
            onClick={submitPrompt}
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
