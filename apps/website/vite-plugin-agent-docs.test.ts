import { describe, expect, it } from "vitest";
import { spatikaAgentDocsPlugin } from "./vite-plugin-agent-docs";

describe("spatikaAgentDocsPlugin", () => {
  it("registers middleware and dist writers", () => {
    const plugin = spatikaAgentDocsPlugin();
    expect(plugin.name).toBe("spatika-agent-docs");
    expect(plugin.configureServer).toBeTypeOf("function");
    expect(plugin.closeBundle).toBeTypeOf("function");
  });
});
