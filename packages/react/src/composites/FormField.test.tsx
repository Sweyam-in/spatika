import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "../primitives/Input";
import { RadioGroup, RadioGroupItem } from "../primitives/RadioGroup";
import { FormField } from "./FormField";

describe("FormField", () => {
  it("labels, describes and flags its control without a hand-wired id", () => {
    render(
      <FormField label="Email" description="We never share it." error="Enter a valid address" required>
        <Input type="email" />
      </FormField>,
    );
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAccessibleDescription("Enter a valid address We never share it.");
    expect(screen.getByText("Email").closest("label")).toHaveAttribute("for", input.id);
  });

  it("keeps an id the control already has", () => {
    render(
      <FormField label="Name">
        <Input id="given-name" />
      </FormField>,
    );
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveAttribute("id", "given-name");
  });

  it("names controls a label element cannot, such as a radio group", () => {
    render(
      <FormField label="Plan">
        <RadioGroup defaultValue="pro">
          <RadioGroupItem value="free" aria-label="Free" />
          <RadioGroupItem value="pro" aria-label="Pro" />
        </RadioGroup>
      </FormField>,
    );
    expect(screen.getByRole("radiogroup", { name: "Plan" })).toBeInTheDocument();
  });

  it("announces errors through a persistent polite region instead of alerts", () => {
    const { rerender } = render(
      <FormField id="zip" label="ZIP">
        <Input />
      </FormField>,
    );
    const region = document.querySelector('[data-slot="form-field-error-region"]');
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toBeEmptyDOMElement();

    rerender(
      <FormField id="zip" label="ZIP" error="ZIP is required">
        <Input />
      </FormField>,
    );
    expect(document.querySelector('[data-slot="form-field-error-region"]')).toBe(region);
    expect(region).toHaveTextContent("ZIP is required");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
