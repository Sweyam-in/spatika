import { describe, expect, it } from "vitest";
import type { ComponentDoc } from "./types";

describe("docs types", () => {
  it("describes a component documentation record", () => {
    const doc: ComponentDoc = {
      intro: "Primary actions.",
      examples: [{ id: "basic", title: "Basic", code: "<Button>Save</Button>" }],
      usage: [{ id: "import", title: "Import", paragraphs: ["Import from @spatika/react."] }],
      accessibility: ["Buttons are keyboard reachable."],
      api: [{ name: "Button", props: [{ name: "variant", type: "string", description: "Visual style." }] }],
      slots: [{ name: "button", className: '[data-slot="button"]', defaultComponent: "button", description: "Root." }],
      classes: [{ className: '[data-slot="button"]', ruleName: "button", description: "Root slot." }],
      related: ["icon-button"],
    };
    expect(doc.examples[0]?.id).toBe("basic");
    expect(doc.api[0]?.props[0]?.name).toBe("variant");
    expect(doc.slots[0]?.name).toBe("button");
    expect(doc.classes[0]?.ruleName).toBe("button");
    expect(doc.related).toContain("icon-button");
  });
});
