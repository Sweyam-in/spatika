import type { Editor } from "@tiptap/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AI_PROMPT_ACTION_ID } from "../lib/types";
import { AiCommandDock } from "./AiCommandDock";

function createEditor(hasSelection = false) {
  return {
    state: {
      selection: { empty: !hasSelection },
    },
  } as unknown as Editor;
}

describe("AiCommandDock", () => {
  it("opens the Tiptap-style action panel from the dock", async () => {
    render(
      <AiCommandDock
        editor={createEditor()}
        config={{ title: "AI Toolkit examples" }}
        onRun={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "AI commands" }));
    expect(screen.getByRole("dialog", { name: "AI Toolkit examples" })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Ask about this document or request a change…"),
    ).toBeInTheDocument();
  });

  it("submits a prompt from the dock bar", async () => {
    const onRun = vi.fn();
    render(<AiCommandDock editor={createEditor()} onRun={onRun} />);

    await userEvent.type(
      screen.getByPlaceholderText("Ask about this document or request a change…"),
      "Summarize this doc",
    );
    await userEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(onRun).toHaveBeenCalledWith({
      actionId: AI_PROMPT_ACTION_ID,
      prompt: "Summarize this doc",
    });
  });
});
