import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { EditorContent } from "@tiptap/react";
import type { MentionStorage } from "../extensions/mention";
import type { SlashCommandStorage } from "../extensions/slash-command";
import { defaultSlashCommands } from "../extensions/slash-command";
import { cn } from "../lib/cn";
import type { SpatikaEditorHandle, SpatikaEditorProps } from "../lib/types";
import { DEFAULT_TOOLBAR } from "../lib/types";
import {
  DEFAULT_AI_ACTIONS,
  resolveAiCommandActions,
  resolveAiCommandPlacement,
  usesAiCommandMenu,
} from "../lib/ai-command-menu";
import { useSpatikaEditor } from "../lib/use-spatika-editor";
import { AiCommandDock } from "./AiCommandDock";
import { AiOverlay } from "./AiOverlay";
import { EditorBubbleMenu } from "./EditorBubbleMenu";
import { EditorToolbar } from "./EditorToolbar";
import { ImageBubbleMenu } from "./ImageBubbleMenu";
import { MentionMenu } from "./MentionMenu";
import { SlashCommandMenu } from "./SlashCommandMenu";

const DEFAULT_AI_ACTIONS_LEGACY = DEFAULT_AI_ACTIONS;

export const SpatikaEditor = forwardRef<SpatikaEditorHandle, SpatikaEditorProps>(
  function SpatikaEditor(
    {
      value,
      onChange,
      placeholder,
      disabled,
      className,
      heightClassName = "min-h-[400px]",
      toolbar,
      toolbarActions,
      extensions,
      starterKit,
      slashCommands,
      mentions,
      onAiSelectionAction,
      onAiCommand,
      isAiProcessing,
      aiActions = DEFAULT_AI_ACTIONS_LEGACY,
      aiCommandMenu,
      imageInsert,
      onInsertImage,
      resizableImages = true,
      mobileFullscreen = false,
    },
    ref,
  ) {
    const shellRef = useRef<HTMLDivElement>(null);
    const [fullscreen, setFullscreen] = useState(false);
    const [slashState, setSlashState] = useState<SlashCommandStorage | null>(null);
    const [mentionState, setMentionState] = useState<MentionStorage | null>(null);
    const [aiBusyInternal, setAiBusyInternal] = useState(false);

    const { editor, isReady } = useSpatikaEditor({
      value,
      onChange,
      placeholder,
      disabled,
      extensions,
      starterKit,
      slashCommands,
      mentions,
      onAiSelectionAction,
      onAiCommand,
      resizableImages,
      imageInsert,
      onSlashUpdate: setSlashState,
      onMentionUpdate: setMentionState,
    });

    useImperativeHandle(
      ref,
      () => ({
        focus: () => editor?.commands.focus(),
        setContent: (html: string) => editor?.commands.setContent(html),
        getHTML: () => editor?.getHTML() ?? "",
        getJSON: () => editor?.getJSON(),
        expandFullscreen: () => setFullscreen(true),
        insertImage: (url: string) => {
          if (!url.trim() || !editor) return;
          editor.chain().focus().setImage({ src: url }).run();
        },
      }),
      [editor],
    );

    const toolbarConfig = { ...DEFAULT_TOOLBAR, ...toolbar };
    const allSlashCommands = useMemo(
      () => [...defaultSlashCommands(), ...(slashCommands ?? [])],
      [slashCommands],
    );

    const filteredSlashItems = useMemo(() => {
      const query = slashState?.query?.toLowerCase() ?? "";
      return allSlashCommands.filter((item) => {
        if (!query) return true;
        const haystack = [item.title, item.description, ...(item.keywords ?? [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      });
    }, [allSlashCommands, slashState?.query]);

    const filteredMentions = useMemo(() => {
      const query = mentionState?.query?.toLowerCase() ?? "";
      const contacts = mentions ?? [];
      return contacts.filter((contact) => contact.label.toLowerCase().includes(query));
    }, [mentions, mentionState?.query]);

    const aiHandler = onAiCommand
      ? onAiCommand
      : onAiSelectionAction
        ? async (context: import("../lib/types").AiCommandContext) =>
            onAiSelectionAction(context.actionId, context.selectedText)
        : undefined;

    const commandMenuEnabled = usesAiCommandMenu(aiCommandMenu, Boolean(aiHandler));
    const aiCommandPlacement = resolveAiCommandPlacement(aiCommandMenu);
    const toolbarAiEnabled = commandMenuEnabled && aiCommandPlacement === "toolbar";
    const dockAiEnabled = commandMenuEnabled && aiCommandPlacement === "dock";
    const commandActions = resolveAiCommandActions(
      aiCommandMenu === false ? undefined : aiCommandMenu,
      aiActions,
    );
    const bubbleActionsEnabled =
      Boolean(aiHandler) &&
      (commandMenuEnabled
        ? aiCommandMenu !== false && aiCommandMenu?.bubbleActions
        : true);

    const runAiCommand = useCallback(
      async (request: { actionId: string; prompt?: string }) => {
        if (!editor || !aiHandler) return;
        const { from, to } = editor.state.selection;
        const selectedText = from !== to ? editor.state.doc.textBetween(from, to, " ") : "";
        editor.commands.setAiSelection?.(from !== to ? { from, to } : null);
        editor.commands.setAiProcessing?.(true);
        setAiBusyInternal(true);
        try {
          const result = await aiHandler({
            actionId: request.actionId,
            prompt: request.prompt,
            selectedText,
            documentText: editor.state.doc.textContent,
            html: editor.getHTML(),
            selection: from !== to ? { from, to } : null,
          });
          if (result) {
            if (from !== to) {
              editor.chain().focus().insertContentAt({ from, to }, result).run();
            } else {
              editor.chain().focus().insertContentAt(from, result).run();
            }
          }
        } finally {
          editor.commands.setAiProcessing?.(false);
          editor.commands.setAiSelection?.(null);
          setAiBusyInternal(false);
        }
      },
      [editor, aiHandler],
    );

    const runLegacyAiAction = useCallback(
      async (actionId: string) => {
        if (!editor) return;
        const { from, to } = editor.state.selection;
        if (from === to) return;
        await runAiCommand({ actionId });
      },
      [editor, runAiCommand],
    );

    useEffect(() => {
      if (!mobileFullscreen || !editor) return;
      const onFocus = () => {
        if (window.matchMedia("(max-width: 767px)").matches) {
          setFullscreen(true);
        }
      };
      editor.on("focus", onFocus);
      return () => {
        editor.off("focus", onFocus);
      };
    }, [editor, mobileFullscreen]);

    const shell = (
      <div
        ref={shellRef}
        data-slot="spatika-editor"
        className={cn(
          "spk-editor-shell",
          disabled && "spk-editor-shell--disabled",
          fullscreen && "spk-editor-shell--fullscreen",
          dockAiEnabled && "spk-editor-shell--with-ai-dock",
          className,
        )}
      >
        <EditorToolbar
          editor={editor}
          config={toolbarConfig}
          toolbarActions={toolbarActions}
          aiActions={
            toolbarAiEnabled ? commandActions : !commandMenuEnabled ? aiActions : undefined
          }
          aiCommandMenu={aiCommandMenu === false ? false : aiCommandMenu}
          useAiCommandMenu={toolbarAiEnabled}
          onAiCommand={commandMenuEnabled ? runAiCommand : undefined}
          onAiAction={!commandMenuEnabled ? runLegacyAiAction : undefined}
          onInsertImage={onInsertImage}
          imageInsert={imageInsert}
        />
        <div className="spk-editor-body">
          <EditorContent
            editor={editor}
            className={cn("spk-editor-surface", heightClassName)}
          />
          <EditorBubbleMenu
            editor={editor}
            aiActions={bubbleActionsEnabled ? (commandMenuEnabled ? commandActions : aiActions) : undefined}
            onAiAction={runLegacyAiAction}
          />
          <ImageBubbleMenu editor={editor} />
          <SlashCommandMenu
            editor={editor}
            items={filteredSlashItems}
            query={slashState?.query ?? ""}
            activeIndex={slashState?.activeIndex ?? 0}
            open={Boolean(slashState?.range)}
            onSelect={(item) => {
              if (!editor || !slashState?.range) return;
              editor.chain().focus().deleteRange(slashState.range).run();
              item.command(editor);
              setSlashState(null);
            }}
          />
          <MentionMenu
            contacts={filteredMentions}
            query={mentionState?.query ?? ""}
            activeIndex={mentionState?.activeIndex ?? 0}
            open={Boolean(mentionState?.range)}
            onSelect={(contact) => {
              if (!editor || !mentionState?.range) return;
              editor
                .chain()
                .focus()
                .insertContentAt(mentionState.range, [
                  { type: "mention", attrs: { id: contact.id, label: contact.label } },
                  { type: "text", text: " " },
                ])
                .run();
              setMentionState(null);
            }}
          />
          <AiOverlay visible={Boolean(isAiProcessing || aiBusyInternal)} />
        </div>
        {dockAiEnabled ? (
          <div className="spk-editor-ai-dock-footer">
            <AiCommandDock
              editor={editor}
              config={aiCommandMenu === false ? undefined : aiCommandMenu}
              actions={commandActions}
              onRun={runAiCommand}
            />
          </div>
        ) : null}
        {fullscreen ? (
          <div className="spk-editor-fullscreen-bar">
            <button type="button" className="spk-editor-fullscreen-close" onClick={() => setFullscreen(false)}>
              Done
            </button>
          </div>
        ) : null}
      </div>
    );

    if (fullscreen && typeof document !== "undefined") {
      return createPortal(shell, document.body);
    }

    if (!isReady) {
      return (
        <div className={cn("spk-editor-shell spk-editor-shell--loading", className)} aria-busy="true">
          Loading editor…
        </div>
      );
    }

    return shell;
  },
);
