import { describe, expect, it } from "vitest";
import {
  DEFAULT_AI_COMMANDS,
  resolveAiCommandActions,
  resolveAiCommandPlacement,
  resolveAiPromptConfig,
  usesAiCommandMenu,
} from "./ai-command-menu";

describe("ai-command-menu helpers", () => {
  it("uses menu actions when provided", () => {
    const actions = resolveAiCommandActions(
      { actions: [{ id: "tone", label: "Adjust tone" }] },
      [{ id: "legacy", label: "Legacy" }],
    );
    expect(actions).toEqual([{ id: "tone", label: "Adjust tone" }]);
  });

  it("falls back to aiActions then defaults", () => {
    expect(resolveAiCommandActions(undefined, [{ id: "legacy", label: "Legacy" }])).toEqual([
      { id: "legacy", label: "Legacy" },
    ]);
    expect(resolveAiCommandActions(undefined, undefined)).toEqual(DEFAULT_AI_COMMANDS);
  });

  it("resolves prompt config", () => {
    expect(resolveAiPromptConfig(false)).toEqual({
      enabled: false,
      placeholder: "",
      submitLabel: "Send",
    });
    expect(resolveAiPromptConfig({ placeholder: "Ask AI…" })).toMatchObject({
      enabled: true,
      placeholder: "Ask AI…",
    });
  });

  it("enables the command menu when a handler exists", () => {
    expect(usesAiCommandMenu(undefined, true)).toBe(true);
    expect(usesAiCommandMenu(false, true)).toBe(false);
    expect(usesAiCommandMenu(undefined, false)).toBe(false);
  });

  it("defaults AI placement to dock", () => {
    expect(resolveAiCommandPlacement(undefined)).toBe("dock");
    expect(resolveAiCommandPlacement({ placement: "toolbar" })).toBe("toolbar");
  });
});
