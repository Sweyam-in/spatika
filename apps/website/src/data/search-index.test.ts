import { describe, expect, it } from "vitest";
import { buildSearchIndex, scoreSearch } from "./search-index";

describe("docs search", () => {
  const index = buildSearchIndex();
  const rank = (query: string) =>
    index
      .map((entry) => ({ entry, score: scoreSearch(`${entry.title} ${entry.id}`, query, entry.keywords) }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((result) => result.entry.title);

  it("indexes every component page, guide and resource page", () => {
    expect(index.filter((entry) => entry.group === "Components").length).toBeGreaterThan(180);
    expect(index.some((entry) => entry.to === "/versions")).toBe(true);
    expect(index.some((entry) => entry.to === "/guides#installation")).toBe(true);
  });

  it("finds components by the words people use, not only Spatika's names", () => {
    // An exact name ranks first (there is a low-level Modal); the synonym brings Dialog next.
    expect(rank("modal").slice(0, 3)).toEqual(expect.arrayContaining(["Modal", "Dialog"]));
    expect(rank("loader")).toContain("Spinner");
    expect(rank("wizard")).toContain("Stepper");
    expect(rank("datagrid")[0]).toBe("DataTable");
  });

  it("ranks title matches first and requires every term", () => {
    expect(rank("date")[0]).toMatch(/^Date/);
    expect(rank("date range")[0]).toBe("DateRangePicker");
    expect(rank("zzzz")).toEqual([]);
  });
});
