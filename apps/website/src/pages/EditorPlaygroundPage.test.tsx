import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { EditorPlaygroundPage } from "./EditorPlaygroundPage";

vi.mock("@spatika/editor", () => ({
  AI_PROMPT_ACTION_ID: "prompt",
  SpatikaEditor: () => <div data-testid="editor-playground">Editor</div>,
}));

describe("EditorPlaygroundPage", () => {
  it("renders the standalone playground", () => {
    render(
      <MemoryRouter>
        <EditorPlaygroundPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Spatika Editor playground" })).toBeInTheDocument();
    expect(screen.getByText(/Take your time here/i)).toBeInTheDocument();
    expect(screen.getByTestId("editor-playground")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to component docs" })).toHaveAttribute(
      "href",
      "/components/spatika-editor",
    );
  });
});
