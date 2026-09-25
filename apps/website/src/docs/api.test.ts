import { describe, expect, it } from "vitest";
import { components } from "@/data/navigation";
import { getApi } from "./api";

describe("component API docs", () => {
  it("documents Button variants and touch sizes", () => {
    const button = components.find((entry) => entry.slug === "button")!;
    const sections = getApi(button);
    const names = sections[0]?.props.map((prop) => prop.name) ?? [];
    expect(names).toContain("variant");
    expect(names).toContain("size");
    expect(sections[0]?.props.find((prop) => prop.name === "size")?.type).toContain("touch");
  });

  it("documents media bleed and EntityMediaCard imageUrl", () => {
    const cover = getApi(components.find((entry) => entry.slug === "cover-hero")!);
    const profile = getApi(components.find((entry) => entry.slug === "profile-hero")!);
    const card = getApi(components.find((entry) => entry.slug === "entity-media-card")!);
    expect(cover[0]?.props.some((prop) => prop.name === "bleed")).toBe(true);
    expect(profile[0]?.props.some((prop) => prop.name === "bleed")).toBe(true);
    const names = card[0]?.props.map((prop) => prop.name) ?? [];
    expect(names).toContain("imageUrl");
    expect(names).not.toContain("src");
  });

  it("documents EventCalendar host customization props", () => {
    const calendar = getApi(components.find((entry) => entry.slug === "event-calendar")!);
    const names = calendar[0]?.props.map((prop) => prop.name) ?? [];
    expect(names).toContain("showEventEditor");
    expect(names).toContain("renderEvent");
    expect(names).toContain("renderToolbar");
    expect(names).toContain("toolbarDensity");
    expect(names).toContain("showDateJump");
    expect(names).toContain("onVisibleRangeChange");
  });

  it("does not duplicate series when a cartesian chart overrides the type", () => {
    for (const slug of ["range-bar-chart", "candlestick-chart", "range-area-chart", "boxplot-chart", "ohlc-chart"]) {
      const names = getApi(components.find((entry) => entry.slug === slug)!).flatMap((section) =>
        section.props.map((prop) => prop.name),
      );
      expect(names.filter((name) => name === "series")).toEqual(["series"]);
    }
    const rangeBar = getApi(components.find((entry) => entry.slug === "range-bar-chart")!);
    // Types come from the source: range series are [low, high] tuples.
    expect(rangeBar[0]?.props.find((prop) => prop.name === "series")?.type).toBe("RangeSeries[]");
  });
});
