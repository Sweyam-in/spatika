import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImageList, ImageListItem, ImageListItemBar } from "./ImageList";

describe("ImageList", () => {
  it("lays out items in a full-width grid with overlay titles", () => {
    const { container } = render(
      <ImageList cols={3} rowHeight={148} gap={10}>
        <ImageListItem>
          <img src="/coast.jpg" alt="Coast" />
          <ImageListItemBar title="Coast" subtitle="Pacific" />
        </ImageListItem>
        <ImageListItem>
          <img src="/dawn.jpg" alt="Dawn" />
          <ImageListItemBar title="Dawn" />
        </ImageListItem>
      </ImageList>,
    );

    const list = container.querySelector("[data-slot='image-list']");
    expect(list).toHaveAttribute("data-variant", "standard");
    expect(list).toHaveClass("w-full");
    expect(list).toHaveStyle({
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gridAutoRows: "148px",
    });
    expect(screen.getByText("Coast")).toBeInTheDocument();
    expect(screen.getByText("Pacific")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Coast" })).toBeInTheDocument();
    const item = container.querySelector("[data-slot='image-list-item']");
    expect(item).not.toHaveStyle({ marginBottom: "8px" });
  });

  it("switches to masonry columns without a css grid", () => {
    const { container } = render(
      <ImageList variant="masonry" cols={2} gap={12}>
        <ImageListItem>
          <img src="/dusk.jpg" alt="Dusk" />
        </ImageListItem>
      </ImageList>,
    );
    const list = container.querySelector("[data-slot='image-list']");
    expect(list).toHaveAttribute("data-variant", "masonry");
    expect(list).toHaveClass("block");
    expect(list).not.toHaveClass("grid");
    expect(list).toHaveStyle({ columnCount: "2" });
  });
});
