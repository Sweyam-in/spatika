import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpatikaThemeProvider, THEME_IDS, THEME_LABELS } from "@spatika/react";
import { describe, expect, it } from "vitest";
import { ThemePreview } from "./ThemePreview";

describe("ThemePreview", () => {
  it("lists every built-in theme and marks the current one pressed", () => {
    render(
      <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
        <ThemePreview />
      </SpatikaThemeProvider>,
    );

    for (const id of THEME_IDS) {
      expect(screen.getByRole("button", { name: new RegExp(THEME_LABELS[id]) })).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: /Mukta/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Neelam/ })).toHaveAttribute("aria-pressed", "false");
  });

  it("switches the active theme when another card is pressed", async () => {
    const user = userEvent.setup();
    render(
      <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
        <ThemePreview />
      </SpatikaThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: /Sandhya/ }));
    expect(screen.getByRole("button", { name: /Sandhya/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Mukta/ })).toHaveAttribute("aria-pressed", "false");
  });
});
