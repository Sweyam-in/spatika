import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ApiTable, ClassTable, SlotTable } from "./ApiTable";

describe("ApiTable", () => {
  it("makes prop tables keyboard-scrollable", () => {
    const { container } = render(
      <ApiTable
        sections={[
          {
            name: "Button",
            props: [
              {
                name: "variant",
                type: "string",
                description: "Visual style.",
              },
            ],
          },
        ]}
      />,
    );
    expect(container.querySelector(".api-table-wrap")).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
  });

  it("makes slot and class tables keyboard-scrollable", () => {
    const slots = render(
      <SlotTable
        slots={[
          {
            name: "button",
            className: '[data-slot="button"]',
            defaultComponent: "button",
            description: "Root.",
          },
        ]}
      />,
    );
    expect(slots.container.querySelector(".api-table-wrap")).toHaveAttribute("tabindex", "0");

    const classes = render(
      <ClassTable
        classes={[
          {
            className: ".glass",
            ruleName: "glass",
            description: "Frosted surface.",
          },
        ]}
      />,
    );
    expect(classes.container.querySelector(".api-table-wrap")).toHaveAttribute("tabindex", "0");
  });
});
