import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpatikaThemeProvider, THEME_IDS, THEME_LABELS, createTheme } from "@spatika/react";
import { describe, expect, it } from "vitest";
import { ThemeToolbar } from "./ThemeToolbar";

describe("ThemeToolbar", () => {
  it("opens a menu of the built-in themes and switches on selection", async () => {
    const user = userEvent.setup();
    render(
      <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
        <ThemeToolbar />
      </SpatikaThemeProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Theme: Mukta" });
    await user.click(trigger);
    // The menu is named by its trigger (WAI-ARIA menu button pattern).
    const menu = screen.getByRole("menu", { name: "Theme: Mukta" });
    for (const id of THEME_IDS) {
      expect(menu).toContainElement(screen.getByRole("menuitemradio", { name: new RegExp(`^${THEME_LABELS[id]}`) }));
    }
    expect(screen.getByRole("menuitemradio", { name: /^Mukta/ })).toHaveAttribute("aria-checked", "true");

    await user.click(screen.getByRole("menuitemradio", { name: /^Usha/ }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Theme: Usha" })).toHaveFocus();
  });

  it("is keyboard operable", async () => {
    const user = userEvent.setup();
    render(
      <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
        <ThemeToolbar />
      </SpatikaThemeProvider>,
    );
    screen.getByRole("button", { name: "Theme: Mukta" }).focus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByRole("menu")).toContainElement(document.activeElement as HTMLElement));
    const first = document.activeElement;
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).not.toBe(first);
    const chosen = document.activeElement?.textContent ?? "";
    await user.keyboard("{Enter}");
    const name = THEME_IDS.map((id) => THEME_LABELS[id]).find((label) => chosen.startsWith(label));
    expect(screen.getByRole("button", { name: `Theme: ${name}` })).toBeInTheDocument();
  });

  it("names a custom theme and checks no built-in", async () => {
    const user = userEvent.setup();
    const brand = createTheme({ id: "brand", palette: { primary: "#7c3aed" } });
    render(
      <SpatikaThemeProvider defaultTheme="brand" customThemes={[brand]} syncDocument={false}>
        <ThemeToolbar />
      </SpatikaThemeProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Theme: brand" }));
    for (const item of screen.getAllByRole("menuitemradio")) {
      expect(item).toHaveAttribute("aria-checked", "false");
    }
  });
});
