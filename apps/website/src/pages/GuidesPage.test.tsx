import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { GuidesPage } from "./GuidesPage";

describe("GuidesPage", () => {
  it("documents install and the agent surfaces", () => {
    render(
      <MemoryRouter>
        <GuidesPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Installation" })).toBeInTheDocument();
    expect(screen.getByText(/Everything you need to get Spatika running/i)).toBeInTheDocument();
    expect(screen.getByText(/Start by adding the tokens and React packages/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "App shell" })).toBeInTheDocument();
    expect(screen.getByText(/three things: AppHeader at the top/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Scheduler" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Charts" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Editor" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "For AI coding agents" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "/llms.txt" })).toHaveAttribute("href", "/llms.txt");
    expect(screen.getByRole("link", { name: "/AGENTS.md" })).toHaveAttribute("href", "/AGENTS.md");
    expect(screen.getByRole("link", { name: "Sweyam" })).toHaveAttribute("href", "https://sweyam.com");
    expect(screen.getByRole("link", { name: "Sreelal Chalil" })).toHaveAttribute("href", "https://github.com/SreelalChalil");
  });
});
