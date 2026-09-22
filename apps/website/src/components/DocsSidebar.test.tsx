import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DocsSidebar } from "./DocsSidebar";

const groups = [
  {
    title: "Primitives",
    items: [
      { label: "Button", to: "/components/button" },
      { label: "Badge", to: "/components/badge" },
    ],
  },
  {
    title: "Charts",
    items: [{ label: "BarChart", to: "/components/bar-chart" }],
  },
];

function renderSidebar(path: string, props?: Partial<Parameters<typeof DocsSidebar>[0]>) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <DocsSidebar title="Components" groups={groups} {...props} />
    </MemoryRouter>,
  );
}

describe("DocsSidebar", () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("renders a flat item list when there are no groups", () => {
    render(
      <MemoryRouter>
        <DocsSidebar
          title="Design"
          items={[
            { label: "Themes", to: "/design#themes" },
            { label: "Motion", to: "/design#motion" },
          ]}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Design" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Themes" })).toHaveAttribute("href", "/design#themes");
    expect(screen.queryByRole("searchbox", { name: "Find a component" })).not.toBeInTheDocument();
  });

  it("keeps inactive groups collapsed and expands the active one", () => {
    renderSidebar("/components/button");
    expect(screen.getByRole("link", { name: "Button" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "BarChart" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Primitives/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /Charts/ })).toHaveAttribute("aria-expanded", "false");
  });

  it("filters groups by name and shows an empty state", async () => {
    const user = userEvent.setup();
    renderSidebar("/components");
    const search = screen.getByRole("searchbox", { name: "Find a component" });
    await user.type(search, "bar");
    expect(screen.getByRole("link", { name: "BarChart" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Button" })).not.toBeInTheDocument();
    expect(screen.getByText("1 of 3")).toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "zzzz");
    expect(screen.getByText(/No components match/)).toBeInTheDocument();
  });

  it("expands a collapsed group and clears search from All components", async () => {
    const user = userEvent.setup();
    renderSidebar("/components");
    expect(screen.queryByRole("link", { name: "Button" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Primitives/ }));
    expect(screen.getByRole("link", { name: "Button" })).toBeInTheDocument();

    const search = screen.getByRole("searchbox", { name: "Find a component" });
    await user.type(search, "badge");
    expect(search).toHaveValue("badge");
    await user.click(screen.getByRole("link", { name: "All components" }));
    expect(search).toHaveValue("");
  });
});
