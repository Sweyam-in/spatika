import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Box, Grid } from "./Grid";

describe("Grid", () => {
  it("applies container layout and breakpoint spans including xl", () => {
    const { container } = render(
      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={4} lg={3} xl={2}>
          Cell
        </Grid>
      </Grid>,
    );

    const wrap = container.querySelector("[data-slot='grid'][data-container]");
    expect(wrap).toBeTruthy();
    expect(screen.getByText("Cell")).toBeInTheDocument();

    const item = container.querySelector("[data-slot='grid'][data-item]");
    expect(item?.className).toContain("col-span-12");
    expect(item?.className).toContain("sm:col-span-6");
    expect(item?.className).toContain("md:col-span-4");
    expect(item?.className).toContain("lg:col-span-3");
    expect(item?.className).toContain("xl:col-span-2");
  });

  it("skips auto spans and falls back to a full row", () => {
    const { container } = render(
      <Grid container>
        <Grid xs="auto" sm="auto" xl="auto">
          Auto
        </Grid>
        <Grid size="grow">Grow</Grid>
      </Grid>,
    );

    const items = container.querySelectorAll("[data-slot='grid'][data-item]");
    expect(items[0]?.className).not.toMatch(/\b(sm|md|lg|xl):col-span-/);
    expect(items[0]?.className).toContain("col-span-12");
    expect(items[1]?.className).toContain("col-span-12");
    expect(screen.getByText("Auto")).toBeInTheDocument();
    expect(screen.getByText("Grow")).toBeInTheDocument();
  });
});

describe("Box", () => {
  it("renders as a generic wrapper and can change the element", () => {
    render(
      <Box>
        <Box component="section">Panel</Box>
      </Box>,
    );
    expect(screen.getByText("Panel").tagName).toBe("SECTION");
  });
});
