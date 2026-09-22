import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  SpatikaThemeProvider,
  THEME_IDS,
  THEME_LABELS,
  createTheme,
} from "@spatika/react";
import { describe, expect, it } from "vitest";
import { ThemeToolbar } from "./ThemeToolbar";

describe("ThemeToolbar", () => {
  it("lists built-in themes and selects one on press", async () => {
    const user = userEvent.setup();
    render(
      <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
        <ThemeToolbar />
      </SpatikaThemeProvider>,
    );

    const group = screen.getByRole("group", { name: "Theme" });
    for (const id of THEME_IDS) {
      expect(group).toContainElement(screen.getByRole("button", { name: THEME_LABELS[id] }));
    }
    expect(screen.getByRole("button", { name: "Mukta" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Usha" }));
    expect(screen.getByRole("button", { name: "Usha" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Mukta" })).toHaveAttribute("aria-pressed", "false");
  });

  it("cycles from Mukta when the current id is not a built-in theme", async () => {
    const user = userEvent.setup();
    const brand = createTheme({ id: "brand", palette: { primary: "#7c3aed" } });
    render(
      <SpatikaThemeProvider
        defaultTheme="brand"
        customThemes={[brand]}
        syncDocument={false}
      >
        <ThemeToolbar />
      </SpatikaThemeProvider>,
    );

    const cycle = screen.getByRole("button", { name: "Theme: Mukta. Tap to cycle." });
    await user.click(cycle);
    expect(screen.getByRole("button", { name: "Neelam" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Theme: Neelam/ })).toBeInTheDocument();
  });
});
