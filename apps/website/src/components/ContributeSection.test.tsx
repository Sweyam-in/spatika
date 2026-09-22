import { render, screen } from "@testing-library/react";
import { SpatikaThemeProvider } from "@spatika/react";
import { describe, expect, it } from "vitest";
import { SITE } from "@/data/site";
import { ContributeSection } from "./ContributeSection";

function renderSection() {
  return render(
    <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
      <ContributeSection />
    </SpatikaThemeProvider>,
  );
}

describe("ContributeSection", () => {
  it("links to the GitHub repo and issue tracker", () => {
    renderSection();
    expect(screen.getByRole("heading", { name: "Contribute on GitHub" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View repository" })).toHaveAttribute("href", SITE.github);
    expect(screen.getByRole("link", { name: "Open an issue" })).toHaveAttribute(
      "href",
      SITE.githubNewIssue,
    );
  });

  it("outlines the contribution steps", () => {
    renderSection();
    expect(screen.getByRole("heading", { name: "Star the repo" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fork & branch" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Open a pull request" })).toBeInTheDocument();
    expect(screen.getByText(/Add tests for behavior changes/i)).toBeInTheDocument();
    expect(screen.getByText(/apps\/website/)).toBeInTheDocument();
    expect(screen.getByText(/packages\/react/)).toBeInTheDocument();
  });
});
