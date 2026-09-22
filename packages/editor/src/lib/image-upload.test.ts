import { describe, expect, it } from "vitest";
import { readImageFileAsDataUrl } from "./image-upload";

describe("readImageFileAsDataUrl", () => {
  it("rejects files over the size limit", async () => {
    const file = new File(["hello"], "big.png", { type: "image/png" });
    Object.defineProperty(file, "size", { value: 6 * 1024 * 1024 });
    const result = await readImageFileAsDataUrl(file, { maxSizeBytes: 5 * 1024 * 1024 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("5MB");
  });

  it("reads a small image as a data URL", async () => {
    const file = new File(["hello"], "small.png", { type: "image/png" });
    const result = await readImageFileAsDataUrl(file);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.src.startsWith("data:image/png;base64,")).toBe(true);
  });
});
