import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { buildSpatikaExtensions, useSpatikaEditor } from "./use-spatika-editor";

describe("buildSpatikaExtensions", () => {
  it("adds mention and AI extensions when configured", () => {
    const extensions = buildSpatikaExtensions({
      value: "",
      onChange: () => {},
      mentions: [{ id: "1", label: "Asha" }],
      onAiCommand: async () => null,
    });
    const names = extensions.map((ext) => ext.name);
    expect(names).toContain("mention");
    expect(names).toContain("aiAction");
  });

  it("includes extended formatting extensions by default", () => {
    const extensions = buildSpatikaExtensions({
      value: "",
      onChange: () => {},
    });
    const names = extensions.map((ext) => ext.name);
    expect(names).toContain("taskList");
    expect(names).toContain("taskItem");
    expect(names).toContain("highlight");
    expect(names).toContain("textStyle");
    expect(names).toContain("subscript");
    expect(names).toContain("superscript");
  });
});

describe("useSpatikaEditor", () => {
  it("returns a ready editor and emits onChange updates", async () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useSpatikaEditor({
        value: "<p>Hello</p>",
        onChange,
        placeholder: "Write here…",
      }),
    );

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    result.current.editor?.commands.setContent("<p>Updated</p>");
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
      expect(onChange.mock.calls.at(-1)?.[0]).toContain("Updated");
    });

    result.current.editor?.destroy();
  });
});
