import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DemoBlock } from "./DemoBlock";

describe("DemoBlock", () => {
  it("shows the preview and reveals code on demand", async () => {
    const user = userEvent.setup();
    render(
      <DemoBlock id="sizes" title="Sizes" description="Use `touch` on mobile." code="<Button size='touch' />">
        <span>Preview body</span>
      </DemoBlock>,
    );
    expect(screen.getByText("Sizes")).toBeInTheDocument();
    expect(screen.getByText("touch", { exact: false })).toBeInTheDocument();
    expect(screen.queryByText("<Button size='touch' />")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show code" }));
    expect(screen.getByText("<Button size='touch' />")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Hide code" }));
    expect(screen.queryByText("<Button size='touch' />")).not.toBeInTheDocument();
  });
});
