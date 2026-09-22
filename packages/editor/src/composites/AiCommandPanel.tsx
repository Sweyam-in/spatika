import type { AiActionDefinition } from "../lib/types";
import { Sparkles } from "lucide-react";
import { cn } from "../lib/cn";

type AiCommandPanelProps = {
  title: string;
  actions: AiActionDefinition[];
  hasSelection: boolean;
  onSelect: (actionId: string) => void;
  className?: string;
  id?: string;
};

function actionDisabled(action: AiActionDefinition, hasSelection: boolean) {
  return Boolean(action.requiresSelection && !hasSelection);
}

export function AiCommandPanel({
  title,
  actions,
  hasSelection,
  onSelect,
  className,
  id,
}: AiCommandPanelProps) {
  return (
    <div id={id} className={cn("spk-editor-ai-panel", className)} role="dialog" aria-label={title}>
      <div className="spk-editor-ai-panel-title">{title}</div>
      <ul className="spk-editor-ai-panel-list" aria-label={title}>
        {actions.map((action) => {
          const disabled = actionDisabled(action, hasSelection);
          return (
            <li key={action.id}>
              <button
                type="button"
                className="spk-editor-ai-panel-item"
                disabled={disabled}
                onClick={() => onSelect(action.id)}
              >
                <span className="spk-editor-ai-panel-item-icon" aria-hidden="true">
                  {action.icon ?? <Sparkles className="size-4" />}
                </span>
                <span className="spk-editor-ai-panel-item-copy">
                  <span className="spk-editor-ai-panel-item-label">{action.label}</span>
                  {action.description ? (
                    <span className="spk-editor-ai-panel-item-desc">{action.description}</span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
