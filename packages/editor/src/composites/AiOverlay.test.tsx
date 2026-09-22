import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AiOverlay } from "./AiOverlay";

describe("AiOverlay", () => {
  it("renders nothing when not visible", () => {
    const { container } = render(<AiOverlay visible={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the AI working message when visible", () => {
    render(<AiOverlay visible className="custom-overlay" />);
    expect(screen.getByText("AI is working…")).toBeInTheDocument();
    expect(screen.getByText("AI is working…").closest(".spk-editor-ai-overlay")).toHaveClass(
      "custom-overlay",
    );
  });
});
