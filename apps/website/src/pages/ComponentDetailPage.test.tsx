import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SpatikaThemeProvider } from "@spatika/react";
import { describe, expect, it } from "vitest";
import { ComponentDetailPage } from "./ComponentDetailPage";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
        <Routes>
          <Route path="/components/:slug" element={<ComponentDetailPage />} />
          <Route path="/components" element={<p>Catalog</p>} />
        </Routes>
      </SpatikaThemeProvider>
    </MemoryRouter>,
  );
}

function headingNames() {
  return screen.getAllByRole("heading").map((node) => node.textContent);
}

describe("ComponentDetailPage", () => {
  it("orders description, preview, import, usage, then agent markdown", () => {
    renderAt("/components/button");
    expect(screen.getByRole("heading", { level: 1, name: "Button" })).toBeInTheDocument();
    expect(screen.getByText(/usually the right call/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View as Markdown" })).toHaveAttribute(
      "href",
      "/docs/button.md",
    );

    const names = headingNames();
    const preview = names.indexOf("Preview");
    const importHeading = names.indexOf("Import");
    const usage = names.indexOf("Usage");
    const agent = names.indexOf("Agent Markdown");
    const props = names.indexOf("Props");
    const slots = names.indexOf("Slots");
    const css = names.indexOf("CSS classes");
    expect(preview).toBeGreaterThan(-1);
    expect(importHeading).toBeGreaterThan(preview);
    expect(usage).toBeGreaterThan(importHeading);
    expect(agent).toBeGreaterThan(usage);
    expect(props).toBeGreaterThan(agent);
    expect(slots).toBeGreaterThan(props);
    expect(css).toBeGreaterThan(slots);
  });

  it("documents props, slots, and CSS classes", () => {
    renderAt("/components/button");
    expect(screen.getByRole("heading", { name: "Props" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Slots" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "CSS classes" })).toBeInTheDocument();
    expect(screen.getAllByText('[data-slot="button"]').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/import \{ Button \} from "@spatika\/react"/).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByRole("link", { name: /docs\/button.md/ })).toHaveAttribute(
      "href",
      "/docs/button.md",
    );
  });

  it("imports chart components from @spatika/charts", () => {
    renderAt("/components/bar-chart");
    expect(screen.getByRole("heading", { level: 1, name: "BarChart" })).toBeInTheDocument();
    expect(screen.getAllByText(/import \{ BarChart \} from "@spatika\/charts"/).length).toBeGreaterThan(
      0,
    );
  });

  it("imports editor components from @spatika/editor with styles", () => {
    renderAt("/components/spatika-editor");
    expect(screen.getByRole("heading", { level: 1, name: "SpatikaEditor" })).toBeInTheDocument();
    expect(screen.getAllByText(/@spatika\/editor\/styles\.css/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/import \{ SpatikaEditor \} from "@spatika\/editor"/).length).toBeGreaterThan(
      0,
    );
  });

  it("redirects unknown slugs to the catalog", () => {
    renderAt("/components/not-a-component");
    expect(screen.getByText("Catalog")).toBeInTheDocument();
  });
});
