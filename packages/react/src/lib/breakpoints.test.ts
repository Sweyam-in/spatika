import { describe, expect, it } from "vitest";
import {
  BREAKPOINTS,
  BREAKPOINT_KEYS,
  breakpointBetween,
  breakpointDown,
  breakpointUp,
} from "./breakpoints";

describe("breakpoints", () => {
  it("matches Tailwind viewport widths", () => {
    expect(BREAKPOINTS).toEqual({ xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280 });
    expect(BREAKPOINT_KEYS).toEqual(["xs", "sm", "md", "lg", "xl"]);
  });

  it("builds min-width and max-width queries", () => {
    expect(breakpointUp("xs")).toBe("(min-width: 0px)");
    expect(breakpointUp("md")).toBe("(min-width: 768px)");
    expect(breakpointDown("md")).toBe("(max-width: 767px)");
    expect(breakpointDown("xl")).toBe("(max-width: 1279px)");
  });

  it("builds an inclusive range", () => {
    expect(breakpointBetween("sm", "lg")).toBe(
      "(min-width: 640px) and (max-width: 1023px)",
    );
    expect(breakpointBetween("md")).toBe("(min-width: 768px)");
  });
});
