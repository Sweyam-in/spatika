import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  breakpointDown,
  breakpointUp,
  useBreakpoint,
  useBreakpointDown,
  useBreakpointUp,
  useIsMobile,
  useMediaQuery,
} from "./use-media-query";

function Probe({ query }: { query: string }) {
  const matches = useMediaQuery(query);
  return <span data-testid="mq">{String(matches)}</span>;
}

function BreakpointProbe() {
  const current = useBreakpoint();
  const mdUp = useBreakpointUp("md");
  const mdDown = useBreakpointDown("md");
  const mobile = useIsMobile();
  return (
    <div>
      <span data-testid="bp">{current}</span>
      <span data-testid="up">{String(mdUp)}</span>
      <span data-testid="down">{String(mdDown)}</span>
      <span data-testid="mobile">{String(mobile)}</span>
    </div>
  );
}

function mockMatchMedia(matching: (query: string) => boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: matching(query),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }),
  });
}

describe("useMediaQuery", () => {
  afterEach(() => {
    cleanup();
  });

  it("is false until mounted, then follows matchMedia", () => {
    mockMatchMedia((query) => query.includes("900"));
    render(<Probe query="(min-width: 900px)" />);
    expect(screen.getByTestId("mq")).toHaveTextContent("true");
  });

  it("reports the current breakpoint and aliases", () => {
    mockMatchMedia((query) => {
      if (query === breakpointUp("sm")) return true;
      if (query === breakpointUp("md")) return true;
      if (query === breakpointUp("lg")) return false;
      if (query === breakpointUp("xl")) return false;
      if (query === breakpointDown("md")) return false;
      return false;
    });
    render(<BreakpointProbe />);
    expect(screen.getByTestId("bp")).toHaveTextContent("md");
    expect(screen.getByTestId("up")).toHaveTextContent("true");
    expect(screen.getByTestId("down")).toHaveTextContent("false");
    expect(screen.getByTestId("mobile")).toHaveTextContent("false");
  });

  it("treats viewports below md as mobile", () => {
    mockMatchMedia((query) => query === breakpointDown("md"));
    render(<BreakpointProbe />);
    expect(screen.getByTestId("bp")).toHaveTextContent("xs");
    expect(screen.getByTestId("mobile")).toHaveTextContent("true");
  });
});
