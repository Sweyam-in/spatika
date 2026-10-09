import { describe, expect, it } from "vitest";
import { currentEntry, versionTriggerLabel } from "@/components/VersionSelector";
import { DOCS_VERSION, compareVersions, isNewerThanPublished, type VersionManifest } from "@/data/version";

const manifest: VersionManifest = {
  latest: "2.3.0",
  versions: [
    {
      version: "2.3.0+next",
      channel: "development",
      status: "development",
      path: "/next/",
      docs: "full",
    },
    {
      version: "2.3.0",
      channel: "stable",
      status: "current",
      path: "/docs/v2.3.0/",
      docs: "archive",
    },
  ],
};

describe("docs version label", () => {
  it("orders release numbers and ignores +next", () => {
    expect(compareVersions("2.6.0", "2.3.0")).toBe(1);
    expect(compareVersions("2.3.0+next", "2.3.0")).toBe(0);
    expect(compareVersions("2.2.0", "2.3.0")).toBe(-1);
  });

  it("treats a checkout newer than the published snapshot as the latest docs", () => {
    expect(isNewerThanPublished(manifest.latest)).toBe(compareVersions(DOCS_VERSION, "2.3.0") > 0);
    const current = currentEntry(manifest);
    if (compareVersions(DOCS_VERSION, "2.3.0") > 0) {
      expect(current.status).toBe("current");
      expect(current.version).toBe(DOCS_VERSION);
      expect(versionTriggerLabel(current)).toBe("Latest");
    }
  });
});
