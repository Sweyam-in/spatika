import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SpatikaThemeProvider } from "@spatika/react";
import { describe, expect, it } from "vitest";
import { CustomizePage } from "./CustomizePage";

describe("CustomizePage", () => {
  it("documents createTheme, palette, breakpoints, and responsive hooks", () => {
    render(
      <MemoryRouter>
        <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
          <CustomizePage />
        </SpatikaThemeProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Customize" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Creating a theme" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Color palette" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Breakpoints" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Responsive design" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Grid" })).toHaveAttribute("href", "/components/grid");
    expect(screen.getAllByText(/createTheme/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/#7c3aed/).length).toBeGreaterThan(0);
  });
});
