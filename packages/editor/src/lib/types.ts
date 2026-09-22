import type { Editor, Extensions } from "@tiptap/core";
import type { StarterKitOptions } from "@tiptap/starter-kit";
import type { ReactNode } from "react";

export type SpatikaEditorToolbarConfig = {
  /** Show text style group (paragraph, headings). Default true. */
  textStyle?: boolean;
  /** Show inline formatting (bold, italic, underline, strike, code, sub/sup, colors, blockquote). Default true. */
  inlineFormat?: boolean;
  /** Show list controls (bullet, numbered, task). Default true. */
  lists?: boolean;
  /** Show text alignment (left, center, right, justify). Default true. */
  alignment?: boolean;
  /** Show insert controls (link, divider, table, image). Default true. */
  insert?: boolean;
  /** Show AI actions. Default true. */
  ai?: boolean;
  /** Show undo/redo controls. Default true. */
  history?: boolean;
  /** Toolbar layout. Default "ribbon". */
  layout?: "ribbon" | "compact";
};

export type ImageInsertGalleryPhoto = {
  id: string | number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
};

export type ImageInsertConfig = {
  /** Maximum files per drop or picker action. Default 3. */
  maxFiles?: number;
  /** Maximum bytes per file. Default 5MB. */
  maxSizeBytes?: number;
  /** Accepted MIME types for uploads. Default `image/*`. */
  accept?: string;
  /** Host-owned upload handler. Defaults to inline base64 data URLs. */
  onUpload?: (file: File) => Promise<string>;
  /** Optional quick-pick gallery shown above upload/URL controls. */
  galleryPhotos?: ImageInsertGalleryPhoto[];
  /** Called when the insert-image panel opens (e.g. prefetch gallery assets). */
  onGalleryPrefetch?: () => void;
  /** Opens a host gallery picker (full library). */
  onGalleryOpen?: () => void;
  /** Empty-state copy when `galleryPhotos` is empty but gallery is enabled. */
  galleryEmptyMessage?: string;
  /** Label for the host gallery action button. Default "Open gallery". */
  galleryOpenLabel?: string;
  /** Width applied when inserting from the gallery quick-pick. */
  galleryInsertWidth?: string;
};

export type SlashCommandItem = {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  keywords?: string[];
  command: (editor: Editor) => void;
};

export type MentionContact = {
  id: string;
  label: string;
  avatarUrl?: string;
  subtitle?: string;
};

export type AiActionDefinition = {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  /** When true the action stays disabled until the user selects text. */
  requiresSelection?: boolean;
};

export type AiCommandPromptConfig = {
  enabled?: boolean;
  placeholder?: string;
  submitLabel?: string;
};

export type AiCommandMenuConfig = {
  /** Panel heading. Default "AI commands". */
  title?: string;
  /** Preset actions shown in the menu. Falls back to `aiActions` then defaults. */
  actions?: AiActionDefinition[];
  /** Free-form prompt field. Default enabled. Pass `false` to hide it. */
  prompt?: boolean | AiCommandPromptConfig;
  /** Mirror preset actions in the selection bubble menu. Default false. */
  bubbleActions?: boolean;
  /** Where the AI command UI renders. Default `dock` (Tiptap-style prompt bar). */
  placement?: "toolbar" | "dock";
};

/** Sent to `onAiCommand` when the user runs a preset action or submits a prompt. */
export type AiCommandContext = {
  /** Preset action id, or `"prompt"` for a free-form request. */
  actionId: string;
  /** User text from the prompt field when `actionId` is `"prompt"`. */
  prompt?: string;
  selectedText: string;
  documentText: string;
  html: string;
  selection: { from: number; to: number } | null;
};

export const AI_PROMPT_ACTION_ID = "prompt";

export type SpatikaEditorHandle = {
  focus: () => void;
  setContent: (html: string) => void;
  getHTML: () => string;
  getJSON: () => unknown;
  expandFullscreen: () => void;
  insertImage: (url: string) => void;
};

export type PlaceholderConfig =
  | string
  | ((node: { type: string; level?: number; pos: number }) => string);

export type UseSpatikaEditorOptions = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: PlaceholderConfig;
  disabled?: boolean;
  extensions?: Extensions;
  starterKit?: Partial<StarterKitOptions>;
  slashCommands?: SlashCommandItem[];
  mentions?: MentionContact[];
  /** @deprecated Prefer `onAiCommand` for preset actions and free-form prompts. */
  onAiSelectionAction?: (action: string, selectedText: string) => Promise<string | null>;
  onAiCommand?: (context: AiCommandContext) => Promise<string | null>;
  resizableImages?: boolean;
  onSlashUpdate?: (state: import("../extensions/slash-command").SlashCommandStorage) => void;
  onMentionUpdate?: (state: import("../extensions/mention").MentionStorage) => void;
  imageInsert?: ImageInsertConfig;
};

export type SpatikaEditorProps = UseSpatikaEditorOptions & {
  className?: string;
  heightClassName?: string;
  toolbar?: SpatikaEditorToolbarConfig;
  toolbarActions?: ReactNode;
  isAiProcessing?: boolean;
  /** Preset AI actions for legacy toolbar/bubble buttons when `aiCommandMenu` is false. */
  aiActions?: AiActionDefinition[];
  /** Tiptap-style AI command menu. Default on when an AI handler is provided. Pass `false` for legacy buttons. */
  aiCommandMenu?: AiCommandMenuConfig | false;
  imageInsert?: ImageInsertConfig;
  onInsertImage?: () => void;
  mobileFullscreen?: boolean;
};

export const DEFAULT_TOOLBAR: Required<SpatikaEditorToolbarConfig> = {
  textStyle: true,
  inlineFormat: true,
  lists: true,
  alignment: true,
  insert: true,
  ai: true,
  history: true,
  layout: "ribbon",
};

export const DEFAULT_SLASH_COMMANDS: SlashCommandItem[] = [];
