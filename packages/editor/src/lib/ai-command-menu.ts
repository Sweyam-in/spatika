import type { AiActionDefinition, AiCommandMenuConfig, AiCommandPromptConfig } from "./types";

export const DEFAULT_AI_COMMANDS: AiActionDefinition[] = [
  { id: "proofread", label: "Proofread selection", requiresSelection: true },
  { id: "rewrite", label: "Rewrite selection", requiresSelection: true },
  { id: "shorten", label: "Make it shorter", requiresSelection: true },
  { id: "improve", label: "Improve writing", requiresSelection: true },
  { id: "expand", label: "Expand", requiresSelection: true },
  { id: "continue", label: "Write a new paragraph", requiresSelection: false },
];

/** Legacy three-action set for toolbar/bubble buttons when `aiCommandMenu` is false. */
export const DEFAULT_AI_ACTIONS: AiActionDefinition[] = [
  { id: "improve", label: "Improve writing", requiresSelection: true },
  { id: "shorten", label: "Make shorter", requiresSelection: true },
  { id: "expand", label: "Expand", requiresSelection: true },
];

export function resolveAiCommandActions(
  menu?: AiCommandMenuConfig | false,
  actions?: AiActionDefinition[],
): AiActionDefinition[] {
  if (menu && typeof menu === "object" && menu.actions?.length) {
    return menu.actions;
  }
  if (actions?.length) return actions;
  return DEFAULT_AI_COMMANDS;
}

export function resolveAiPromptConfig(
  prompt: AiCommandMenuConfig["prompt"] | undefined,
): Required<AiCommandPromptConfig> {
  if (prompt === false) {
    return { enabled: false, placeholder: "", submitLabel: "Send" };
  }
  const config = prompt === true || prompt === undefined ? {} : prompt;
  return {
    enabled: config.enabled ?? true,
    placeholder: config.placeholder ?? "Ask about this document or request a change…",
    submitLabel: config.submitLabel ?? "Send",
  };
}

export function resolveAiCommandPlacement(
  menu?: AiCommandMenuConfig | false,
): "toolbar" | "dock" {
  if (menu === false) return "toolbar";
  return menu?.placement ?? "dock";
}

export function usesAiCommandMenu(
  aiCommandMenu: AiCommandMenuConfig | false | undefined,
  hasHandler: boolean,
): boolean {
  if (!hasHandler) return false;
  return aiCommandMenu !== false;
}
