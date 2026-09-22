import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";
import { FormField } from "./FormField";
import { PageHeader } from "./PageHeader";
import { StatusDot } from "./StatusDot";
import { EntityCard, EntityCardChip, EntityCardMeta, EntityCardTitle } from "./EntityCard";

describe("composites smoke", () => {
  it("renders EmptyState", () => {
    render(<EmptyState title="Nothing here" description="Try again" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    expect(screen.getByText("Try again")).toBeInTheDocument();
  });

  it("renders PageHeader", () => {
    render(<PageHeader title="Directory" description="People" />);
    expect(screen.getByText("Directory")).toBeInTheDocument();
  });

  it("renders FormField with label", () => {
    render(
      <FormField id="email" label="Email">
        <input id="email" aria-label="Email" />
      </FormField>,
    );
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders StatusDot", () => {
    const { container } = render(<StatusDot tone="success" />);
    expect(container.querySelector('[data-slot="status-dot"]')).toBeTruthy();
  });

  it("renders EntityCard rows", () => {
    render(
      <EntityCard interactive>
        <div>
          <EntityCardTitle>Alex Chen</EntityCardTitle>
          <EntityCardMeta>Product designer</EntityCardMeta>
        </div>
        <EntityCardChip>Active</EntityCardChip>
      </EntityCard>,
    );
    expect(screen.getByText("Alex Chen")).toBeInTheDocument();
    expect(screen.getByText("Product designer")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });
});
