import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { THEME_IDS } from "@spatika/react";
import { describe, expect, it } from "vitest";
import { DesignPage } from "./DesignPage";

describe("DesignPage", () => {
  it("documents the four themes and points to the customize guide", () => {
    render(
      <MemoryRouter>
        <DesignPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Design language" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Themes" })).toBeInTheDocument();
    for (const id of THEME_IDS) {
      expect(screen.getByText(id)).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "customize" })).toHaveAttribute("href", "/customize");
  });

  it("keeps chrome and motion sections for the design language", () => {
    render(
      <MemoryRouter>
        <DesignPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Glass & surfaces" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Motion" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Creating a theme" })).not.toBeInTheDocument();
  });
});
