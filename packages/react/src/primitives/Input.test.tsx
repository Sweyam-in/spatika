import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("renders an accessible textbox", () => {
    render(<Input aria-label="Email" placeholder="you@sweyam.com" />);
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "placeholder",
      "you@sweyam.com",
    );
  });

  it("accepts typed values", async () => {
    const user = userEvent.setup();
    render(<Input aria-label="Name" />);
    const input = screen.getByLabelText("Name");
    await user.type(input, "Ada");
    expect(input).toHaveValue("Ada");
  });
});
