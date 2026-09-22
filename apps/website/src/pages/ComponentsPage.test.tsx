import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SpatikaThemeProvider } from "@spatika/react";
import { describe, expect, it, vi } from "vitest";
import { ComponentsPage } from "./ComponentsPage";
import { components } from "@/data/navigation";

vi.mock("@/demos/ComponentDemo", () => ({
  ComponentDemo: () => (
    <p>
      Preview <a href="#docs">component API</a>
    </p>
  ),
}));

describe("ComponentsPage", () => {
  it("keeps live previews out of the catalog card link so nested anchors stay valid", () => {
    render(
      <MemoryRouter>
        <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
          <ComponentsPage />
        </SpatikaThemeProvider>
      </MemoryRouter>,
    );
    const button = components.find((entry) => entry.slug === "button")!;
    const cardLink = screen.getByRole("link", { name: `${button.name}. ${button.description}` });
    expect(cardLink).toHaveAttribute("href", "/components/button");
    expect(cardLink.querySelector("a")).toBeNull();
    const preview = cardLink.closest("article")?.querySelector(".component-preview");
    expect(preview).toHaveAttribute("inert");
    expect((preview as HTMLElement).inert).toBe(true);
    const previewLink = preview?.querySelector("a");
    expect(previewLink).toHaveAttribute("href", "#docs");
    expect(cardLink.contains(previewLink)).toBe(false);
  });

  it("anchors category sections for deep links", () => {
    render(
      <MemoryRouter>
        <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
          <ComponentsPage />
        </SpatikaThemeProvider>
      </MemoryRouter>,
    );
    expect(document.getElementById("charts")).toBeInTheDocument();
    expect(document.getElementById("editor")).toBeInTheDocument();
  });
});
