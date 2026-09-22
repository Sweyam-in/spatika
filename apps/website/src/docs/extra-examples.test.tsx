import { render, screen } from "@testing-library/react";
import { SpatikaThemeProvider } from "@spatika/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { ExtraExample } from "./extra-examples";

function wrap(ui: ReactElement) {
  return render(
    <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
      {ui}
    </SpatikaThemeProvider>,
  );
}

describe("ExtraExample", () => {
  it("renders the button size variants", () => {
    wrap(<ExtraExample slug="button" id="sizes" />);
    expect(screen.getByRole("button", { name: "Touch" })).toBeInTheDocument();
  });

  it("renders a host-owned EventCalendar toolbar", () => {
    wrap(<ExtraExample slug="event-calendar" id="custom" />);
    expect(screen.getByText("★ Morning Run")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Today" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Preferences" })).not.toBeInTheDocument();
  });

  it("renders a compact EventCalendar toolbar with month and year jumps", () => {
    wrap(<ExtraExample slug="event-calendar" id="compact" />);
    expect(screen.getByLabelText("Month")).toBeInTheDocument();
    expect(screen.getByLabelText("Year")).toBeInTheDocument();
    expect(document.querySelector('[data-density="compact"]')).toBeTruthy();
  });

  it("returns nothing for an unknown example", () => {
    const { container } = wrap(<ExtraExample slug="button" id="missing" />);
    expect(container.textContent).toBe("");
  });
});
