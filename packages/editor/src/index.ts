export { SpatikaEditor } from "./composites/SpatikaEditor";
export { EditorToolbar } from "./composites/EditorToolbar";
export { EditorBubbleMenu } from "./composites/EditorBubbleMenu";
export { ImageBubbleMenu } from "./composites/ImageBubbleMenu";
export { SlashCommandMenu } from "./composites/SlashCommandMenu";
export { MentionMenu } from "./composites/MentionMenu";
export { AiCommandMenu } from "./composites/AiCommandMenu";
export { AiCommandDock } from "./composites/AiCommandDock";
export { AiCommandPanel } from "./composites/AiCommandPanel";
export type { AiCommandRunRequest } from "./composites/AiCommandMenu";
export { AiOverlay } from "./composites/AiOverlay";
export { ToolbarButton } from "./composites/ToolbarButton";

export { useSpatikaEditor, buildSpatikaExtensions } from "./lib/use-spatika-editor";

export {
  DEFAULT_AI_ACTIONS,
  DEFAULT_AI_COMMANDS,
  resolveAiCommandActions,
  resolveAiCommandPlacement,
  resolveAiPromptConfig,
  usesAiCommandMenu,
} from "./lib/ai-command-menu";

export { createSlashCommandExtension, defaultSlashCommands } from "./extensions/slash-command";
export { createMentionExtension } from "./extensions/mention";
export { ResizableImage } from "./extensions/resizable-image";
export { createAiActionExtension } from "./extensions/ai-action";

export type {
  SpatikaEditorProps,
  SpatikaEditorHandle,
  SpatikaEditorToolbarConfig,
  SlashCommandItem,
  MentionContact,
  AiActionDefinition,
  AiCommandContext,
  AiCommandMenuConfig,
  AiCommandPromptConfig,
  ImageInsertConfig,
  ImageInsertGalleryPhoto,
  PlaceholderConfig,
  UseSpatikaEditorOptions,
} from "./lib/types";

export { AI_PROMPT_ACTION_ID } from "./lib/types";

export type { SlashCommandStorage } from "./extensions/slash-command";
export type { MentionStorage } from "./extensions/mention";
export type { ImageAlign } from "./extensions/resizable-image";
