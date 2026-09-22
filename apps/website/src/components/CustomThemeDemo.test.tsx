import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpatikaThemeProvider } from "@spatika/react";
import { describe, expect, it } from "vitest";
import { CustomThemeDemo } from "./CustomThemeDemo";

describe("CustomThemeDemo", () => {
  it("switches the nested theme overlay", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
        <CustomThemeDemo />
      </SpatikaThemeProvider>,
    );

    expect(screen.getByRole("heading", { name: "Violet brand" })).toBeInTheDocument();
    const frame = container.querySelector(".customize-live-frame");
    expect(frame).toHaveAttribute("data-spk-theme", "docs-violet");

    await user.click(screen.getByRole("button", { name: "Teal on Neelam" }));
    expect(screen.getByRole("heading", { name: "Teal brand" })).toBeInTheDocument();
    expect(frame).toHaveAttribute("data-spk-theme", "docs-teal");
    expect(frame).toHaveClass("neelam");
  });
});
