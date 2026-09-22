import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AiCommandPanel } from "./AiCommandPanel";

const actions = [
  { id: "rewrite", label: "Rewrite selection", requiresSelection: true },
  { id: "continue", label: "Write a new paragraph", description: "Draft below the cursor" },
];

describe("AiCommandPanel", () => {
  it("renders the action list in a dialog", () => {
    render(
      <AiCommandPanel
        title="AI Toolkit examples"
        actions={actions}
        hasSelection={false}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog", { name: "AI Toolkit examples" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rewrite selection" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Write a new paragraph/i })).toBeEnabled();
    expect(screen.getByText("Draft below the cursor")).toBeInTheDocument();
  });

  it("calls onSelect for enabled actions", async () => {
    const onSelect = vi.fn();
    render(
      <AiCommandPanel
        title="AI Toolkit examples"
        actions={actions}
        hasSelection
        onSelect={onSelect}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Rewrite selection" }));
    expect(onSelect).toHaveBeenCalledWith("rewrite");
  });
});
