import { render, screen } from "@testing-library/react";
import { SpatikaThemeProvider } from "@spatika/react";
import { describe, expect, it } from "vitest";
import { ComponentDemo } from "./ComponentDemo";

describe("ComponentDemo", () => {
  it("renders the compact button preview", () => {
    render(
      <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
        <ComponentDemo slug="button" compact />
      </SpatikaThemeProvider>,
    );
    expect(screen.getByRole("button", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Glass" })).toBeInTheDocument();
  });

  it("renders an empty state with a reset action", () => {
    render(
      <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
        <ComponentDemo slug="empty-state" compact />
      </SpatikaThemeProvider>,
    );
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("uses generic Spatika copy for career and project demos", () => {
    const { rerender } = render(
      <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
        <ComponentDemo slug="career-card" compact />
      </SpatikaThemeProvider>,
    );
    expect(screen.getByText("Staff engineer")).toBeInTheDocument();
    expect(screen.getByText("Sweyam")).toBeInTheDocument();
    expect(screen.queryByText(/Nissan/i)).not.toBeInTheDocument();

    rerender(
      <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
        <ComponentDemo slug="project-card" compact />
      </SpatikaThemeProvider>,
    );
    expect(screen.getByText("Spatika UI")).toBeInTheDocument();
    expect(screen.queryByText(/OmniChannel/i)).not.toBeInTheDocument();
  });

  it("contains media heroes and aligns media tiles", () => {
    const { rerender } = render(
      <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
        <ComponentDemo slug="cover-hero" />
      </SpatikaThemeProvider>,
    );
    expect(screen.getByText("Coastal Drive")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='cover-hero']")).not.toHaveAttribute(
      "data-cover-bleed",
    );

    rerender(
      <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
        <ComponentDemo slug="profile-hero" />
      </SpatikaThemeProvider>,
    );
    expect(screen.getByText("Alex Chen")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='profile-hero']")).not.toHaveAttribute(
      "data-cover-bleed",
    );

    rerender(
      <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
        <ComponentDemo slug="entity-media-card" />
      </SpatikaThemeProvider>,
    );
    const cards = document.querySelectorAll("[data-slot='entity-media-card']");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveAttribute("data-size", "large");
    expect(cards[1]).toHaveAttribute("data-size", "large");
    expect(screen.getByText("Jordan Lee")).toBeInTheDocument();

    rerender(
      <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
        <ComponentDemo slug="image-list" />
      </SpatikaThemeProvider>,
    );
    expect(screen.getByText("Coast")).toBeInTheDocument();
    expect(screen.getByText("Dawn")).toBeInTheDocument();
    expect(screen.getByText("Dusk")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='image-list']")).toHaveClass("w-full");
  });

  it("uses agenda and compact chrome for the catalog calendar preview", () => {
    render(
      <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
        <ComponentDemo slug="event-calendar" compact />
      </SpatikaThemeProvider>,
    );
    expect(document.querySelector('[data-density="compact"]')).toBeTruthy();
    expect(screen.getByRole("heading", { name: /–/i })).toBeInTheDocument();
  });
});
