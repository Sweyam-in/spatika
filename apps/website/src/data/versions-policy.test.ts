import { describe, expect, it } from "vitest";
import { buildManifest, compareVersions } from "../../../../scripts/lib/versions.mjs";

const dates = {
  "1.5.0": "2026-01-10",
  "1.6.0": "2026-02-01",
  "2.0.0": "2026-03-01",
  "2.1.0": "2026-04-01",
  "2.1.1": "2026-04-05",
  "2.2.0": "2026-09-01",
  "2.3.0-rc.1": "2026-09-10",
};

describe("docs version policy", () => {
  it("orders versions semantically, with pre-releases before their release", () => {
    expect(["2.10.0", "2.2.0", "2.3.0-rc.1", "2.3.0"].sort(compareVersions)).toEqual([
      "2.2.0",
      "2.3.0-rc.1",
      "2.3.0",
      "2.10.0",
    ]);
  });

  it("classifies current, supported, archived and pre-release versions", () => {
    const manifest = buildManifest({
      published: Object.keys(dates),
      dates,
      fullDocs: ["2.2.0"],
      development: "2.4.0",
      now: new Date("2026-10-15"),
    });
    const status = Object.fromEntries(manifest.versions.map((entry) => [entry.version, entry.status]));
    expect(manifest.latest).toBe("2.2.0");
    expect(status).toMatchObject({
      "2.4.0": "development",
      "2.3.0-rc.1": "prerelease",
      "2.2.0": "current",
      "2.1.1": "supported", // 2.2.0 shipped six weeks ago
      "2.1.0": "archived", // superseded by the 2.1.1 patch
      "2.0.0": "archived", // 2.1.0 shipped more than six months ago
      "1.6.0": "supported", // newest release of the previous major
      "1.5.0": "archived",
    });
  });

  it("serves the current release at the root only when it has a full build", () => {
    const withFull = buildManifest({ published: ["2.2.0"], dates, fullDocs: ["2.2.0"] });
    expect(withFull.versions[0]).toMatchObject({ version: "2.2.0", path: "/", docs: "full" });
    const archiveOnly = buildManifest({ published: ["2.2.0"], dates, fullDocs: [] });
    expect(archiveOnly.versions[0]).toMatchObject({ path: "/docs/v2.2.0/", docs: "archive" });
  });
});
