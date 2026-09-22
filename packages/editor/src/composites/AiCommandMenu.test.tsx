import type { Editor } from "@tiptap/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AI_PROMPT_ACTION_ID } from "../lib/types";
import { AiCommandMenu } from "./AiCommandMenu";

function createEditor(hasSelection = false) {
  return {
    state: {
      selection: { empty: !hasSelection },
    },
  } as unknown as Editor;
}

describe("AiCommandMenu", () => {
  it("opens the customizable command menu", async () => {
    const onRun = vi.fn();
    render(
      <AiCommandMenu
        editor={createEditor()}
        config={{ title: "Journal AI" }}
        onRun={onRun}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "AI commands" }));
    expect(screen.getByRole("dialog", { name: "Journal AI" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Proofread selection" })).toBeDisabled();
  });

  it("runs preset actions and prompt submissions", async () => {
    const onRun = vi.fn();
    render(
      <AiCommandMenu
        editor={createEditor(true)}
        config={{
          actions: [{ id: "rewrite", label: "Rewrite selection", requiresSelection: true }],
          prompt: { placeholder: "Ask the doc…", submitLabel: "Run" },
        }}
        onRun={onRun}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "AI commands" }));
    await userEvent.click(screen.getByRole("button", { name: "Rewrite selection" }));
    expect(onRun).toHaveBeenCalledWith({ actionId: "rewrite", prompt: undefined });

    await userEvent.click(screen.getByRole("button", { name: "AI commands" }));
    await userEvent.type(screen.getByPlaceholderText("Ask the doc…"), "Add a summary");
    await userEvent.click(screen.getByRole("button", { name: "Run" }));
    expect(onRun).toHaveBeenLastCalledWith({
      actionId: AI_PROMPT_ACTION_ID,
      prompt: "Add a summary",
    });
  });

  it("hides the prompt field when disabled", async () => {
    render(
      <AiCommandMenu
        editor={createEditor()}
        config={{ prompt: false }}
        onRun={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "AI commands" }));
    expect(screen.queryByRole("button", { name: "Send" })).not.toBeInTheDocument();
  });
});
