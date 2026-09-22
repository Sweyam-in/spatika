import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RichTextEditor } from "./RichTextEditor";

vi.mock("@spatika/editor", () => ({
  SpatikaEditor: ({
    value,
    placeholder,
    heightClassName,
    toolbar,
  }: {
    value: string;
    placeholder?: string;
    heightClassName?: string;
    toolbar?: Record<string, unknown>;
  }) => (
    <div
      data-testid="spatika-editor-shim"
      data-value={value}
      data-placeholder={placeholder}
      data-height={heightClassName}
      data-toolbar={JSON.stringify(toolbar)}
    />
  ),
}));

describe("RichTextEditor", () => {
  it("delegates to SpatikaEditor with a compact legacy toolbar", () => {
    render(
      <RichTextEditor
        value="<p>Note</p>"
        placeholder="Write something…"
        minHeightClassName="min-h-40"
      />,
    );
    const shim = screen.getByTestId("spatika-editor-shim");
    expect(shim).toHaveAttribute("data-value", "<p>Note</p>");
    expect(shim).toHaveAttribute("data-placeholder", "Write something…");
    expect(shim).toHaveAttribute("data-height", "min-h-40");
    expect(shim).toHaveAttribute(
      "data-toolbar",
      JSON.stringify({
        layout: "compact",
        textStyle: false,
        alignment: false,
        insert: false,
        ai: false,
      }),
    );
  });
});
