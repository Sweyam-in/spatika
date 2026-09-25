import { render, screen } from "@testing-library/react";
import type * as React from "react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("applies variant and size data via classes", () => {
    render(
      <Button variant="glass" size="touch">
        Glass
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "Glass" });
    expect(btn.className).toContain("glass");
    expect(btn.className).toMatch(/min-h-11|h-11/);
  });

  it("forwards clicks and disabled state", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Go</Button>);
    await user.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <Button onClick={onClick} disabled>
        Go
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Go" })).toBeDisabled();
  });

  it("blocks duplicate submits while loading but keeps keyboard focus", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const onClick = vi.fn();
    const { rerender } = render(
      <form onSubmit={onSubmit}>
        <Button type="submit" onClick={onClick}>
          Save
        </Button>
      </form>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    button.focus();
    await user.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);

    rerender(
      <form onSubmit={onSubmit}>
        <Button type="submit" onClick={onClick} loading>
          Save
        </Button>
      </form>,
    );
    expect(button).toHaveFocus();
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveAttribute("aria-busy", "true");

    await user.click(button);
    await user.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("ignores activation of a loading asChild button", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button asChild loading onClick={onClick}>
        <a href="#next">Continue</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Continue" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    await user.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });
});
