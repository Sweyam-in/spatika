import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SpatikaThemeProvider } from "@spatika/react";
import { describe, expect, it } from "vitest";
import { HomePage } from "./HomePage";
import { SITE } from "@/data/site";

function renderHome() {
  return render(
    <MemoryRouter>
      <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
        <HomePage />
      </SpatikaThemeProvider>
    </MemoryRouter>,
  );
}

describe("HomePage", () => {
  it("does not attribute the hero to the author", () => {
    renderHome();
    expect(screen.queryByText(/Sreelal Chalil/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Sreelal Chalil/i })).not.toBeInTheDocument();
  });

  it("references Sweyam in the hero", () => {
    renderHome();
    expect(screen.getByRole("link", { name: "Sweyam" })).toHaveAttribute("href", "https://sweyam.com");
    expect(screen.getByText(/Sweyam's open-source React design system/)).toBeInTheDocument();
  });

  it("explains Spatika as Sanskrit crystal, also spelled Spadik", () => {
    renderHome();
    expect(screen.getByRole("heading", { level: 1, name: /Spatika UI/ })).toBeInTheDocument();
    expect(screen.getByText(SITE.tagline)).toBeInTheDocument();
    expect(screen.getByText(/Sanskrit स्फटिक, crystal/)).toBeInTheDocument();
    expect(screen.getByText("Spadik")).toBeInTheDocument();
    expect(screen.getByText(/you found the right library/)).toBeInTheDocument();
  });

  it("leads with the 2.0 design principles and data-first sections", () => {
    renderHome();
    expect(screen.getByRole("heading", { name: "Calm surfaces" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Professional density" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Data is the interface/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Scheduler, charts, and editor" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Questions" })).toBeInTheDocument();
  });

  it("links to the showcase applications", () => {
    renderHome();
    expect(screen.getByRole("link", { name: /Finance dashboard/ })).toHaveAttribute("href", "/showcase/finance");
    expect(screen.getByRole("link", { name: /SaaS admin/ })).toHaveAttribute("href", "/showcase/admin");
    expect(screen.getByRole("link", { name: /Productivity workspace/ })).toHaveAttribute("href", "/showcase/workspace");
  });

  it("links coding agents to llms.txt from the AI-first section", () => {
    renderHome();
    expect(screen.getByRole("heading", { name: "An AI-first component library" })).toBeInTheDocument();
    expect(screen.getByText(/read the docs cover to cover/i)).toBeInTheDocument();
    const agents = screen.getByRole("link", { name: "Open llms.txt" });
    expect(agents).toHaveAttribute("href", "/llms.txt");
  });
});
