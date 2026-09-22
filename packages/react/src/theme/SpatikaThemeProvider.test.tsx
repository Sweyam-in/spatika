import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTheme } from "../lib/create-theme";
import { SPATIKA_THEME_STORAGE_KEY } from "../lib/themes";
import { SpatikaThemeProvider, useSpatikaTheme } from "./SpatikaThemeProvider";

function ThemeProbe() {
  const { theme, setTheme, themes } = useSpatikaTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="count">{themes.length}</span>
      <button type="button" onClick={() => setTheme("neelam")}>
        Neelam
      </button>
    </div>
  );
}

function resetDocumentTheme() {
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-spk-theme");
  document.documentElement.style.colorScheme = "";
  document.getElementById("spk-custom-themes")?.remove();
  localStorage.removeItem(SPATIKA_THEME_STORAGE_KEY);
  localStorage.removeItem("spk-theme-test");
}

describe("SpatikaThemeProvider", () => {
  afterEach(() => {
    cleanup();
    resetDocumentTheme();
  });

  it("provides theme context and updates on setTheme", async () => {
    const user = userEvent.setup();
    render(
      <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
        <ThemeProbe />
      </SpatikaThemeProvider>,
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("mukta");
    expect(screen.getByTestId("count")).toHaveTextContent("4");

    await user.click(screen.getByRole("button", { name: "Neelam" }));
    expect(screen.getByTestId("theme")).toHaveTextContent("neelam");
  });

  it("applies the theme to document before paint", () => {
    render(
      <SpatikaThemeProvider defaultTheme="neelam">
        <ThemeProbe />
      </SpatikaThemeProvider>,
    );

    expect(document.documentElement.classList.contains("neelam")).toBe(true);
    expect(document.documentElement.getAttribute("data-spk-theme")).toBe("neelam");
  });

  it("restores and persists theme via storageKey", async () => {
    const user = userEvent.setup();
    localStorage.setItem("spk-theme-test", "sandhya");

    render(
      <SpatikaThemeProvider defaultTheme="mukta" storageKey="spk-theme-test">
        <ThemeProbe />
      </SpatikaThemeProvider>,
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("sandhya");
    expect(document.documentElement.classList.contains("sandhya")).toBe(true);

    await user.click(screen.getByRole("button", { name: "Neelam" }));
    expect(localStorage.getItem("spk-theme-test")).toBe("neelam");
  });

  it("throws outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ThemeProbe />)).toThrow(/SpatikaThemeProvider/);
    spy.mockRestore();
  });

  it("registers a custom theme and applies its base class on the wrapper", async () => {
    const user = userEvent.setup();
    const brand = createTheme({
      id: "brand",
      extends: "neelam",
      palette: { primary: "#22c55e" },
    });

    function CustomProbe() {
      const { theme, setTheme, themes } = useSpatikaTheme();
      return (
        <div>
          <span data-testid="theme">{theme}</span>
          <span data-testid="count">{themes.length}</span>
          <button type="button" onClick={() => setTheme("brand")}>
            Brand
          </button>
        </div>
      );
    }

    const { container } = render(
      <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false} customThemes={[brand]}>
        <CustomProbe />
      </SpatikaThemeProvider>,
    );

    expect(screen.getByTestId("count")).toHaveTextContent("5");
    await user.click(screen.getByRole("button", { name: "Brand" }));
    expect(screen.getByTestId("theme")).toHaveTextContent("brand");
    const root = container.querySelector("[data-slot='spatika-theme-provider']");
    expect(root).toHaveAttribute("data-spk-theme", "brand");
    expect(root).toHaveClass("neelam");
    expect(document.getElementById("spk-custom-themes")?.textContent).toContain("--primary: #22c55e;");
  });
});
