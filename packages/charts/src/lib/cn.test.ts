import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("merges class names and drops falsy values", () => {
    expect(cn("px-2", false && "hidden", "ok")).toBe("px-2 ok");
  });
});
