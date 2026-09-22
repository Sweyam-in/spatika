import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CodeBlock } from "./CodeBlock";

describe("CodeBlock", () => {
  it("makes long code samples keyboard-scrollable", () => {
    render(<CodeBlock code={"import { Button } from '@spatika/react';\n".repeat(12)} />);
    const pre = screen.getByText(/import \{ Button \}/).closest("pre");
    expect(pre).toHaveAttribute("tabindex", "0");
  });

  it("copies code to the clipboard", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    render(<CodeBlock code="npm install @spatika/react" />);
    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(writeText).toHaveBeenCalledWith("npm install @spatika/react");

    vi.unstubAllGlobals();
  });
});
