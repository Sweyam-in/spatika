import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Link2 } from "lucide-react";
import { ToolbarPopover } from "./ToolbarPopover";

describe("ToolbarPopover", () => {
  it("opens a glass panel and closes on cancel", async () => {
    const close = vi.fn();
    render(
      <ToolbarPopover label="Insert link" title="Insert link" icon={<Link2 className="size-4" />}>
        {({ close: closePanel }) => (
          <button type="button" onClick={() => { close(); closePanel(); }}>
            Done
          </button>
        )}
      </ToolbarPopover>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Insert link" }));
    expect(screen.getByRole("dialog", { name: "Insert link" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(close).toHaveBeenCalled();
  });
});
