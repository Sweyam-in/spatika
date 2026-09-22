import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SpatikaThemeProvider } from "@spatika/react";
import { describe, expect, it } from "vitest";
import { ExtensionsSection } from "./ExtensionsSection";

function renderSection() {
  return render(
    <MemoryRouter>
      <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
        <ExtensionsSection />
      </SpatikaThemeProvider>
    </MemoryRouter>,
  );
}

describe("ExtensionsSection", () => {
  it("highlights scheduler, charts, and editor with doc links", () => {
    renderSection();
    expect(
      screen.getByRole("heading", { name: "Scheduler, charts, and editor" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Scheduler" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Charts" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Editor" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "EventCalendar" })).toHaveAttribute(
      "href",
      "/components/event-calendar",
    );
    expect(screen.getByRole("link", { name: "ChartContainer" })).toHaveAttribute(
      "href",
      "/components/chart-container",
    );
    expect(screen.getByRole("link", { name: "Playground" })).toHaveAttribute("href", "/demos/editor");
    expect(screen.getByText("npm install @spatika/charts @spatika/tokens")).toBeInTheDocument();
    expect(screen.getByText("npm install @spatika/editor @spatika/tokens")).toBeInTheDocument();
  });
});
