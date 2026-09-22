import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Label } from "./Label";
import { Separator } from "./Separator";
import { Skeleton } from "./Skeleton";
import { Spinner } from "./Spinner";
import { Kbd } from "./Kbd";

describe("primitive smoke", () => {
  it("renders Label", () => {
    render(<Label htmlFor="x">Name</Label>);
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("renders Separator", () => {
    const { container } = render(<Separator />);
    expect(container.querySelector('[data-slot="separator-root"]')).toBeTruthy();
  });

  it("renders Skeleton", () => {
    const { container } = render(<Skeleton className="h-4 w-20" />);
    expect(container.querySelector('[data-slot="skeleton"]')).toBeTruthy();
  });

  it("renders Spinner", () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('[data-slot="spinner"]')).toBeTruthy();
  });

  it("renders Kbd", () => {
    render(<Kbd>⌘K</Kbd>);
    expect(screen.getByText("⌘K")).toBeInTheDocument();
  });
});
