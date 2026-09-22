import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SpatikaThemeProvider } from "@spatika/react";
import { describe, expect, it } from "vitest";
import { DocsLayout } from "./DocsLayout";
import { SITE } from "@/data/site";

function renderLayout(
  props: Parameters<typeof DocsLayout>[0],
  path = "/components",
) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SpatikaThemeProvider defaultTheme="mukta" syncDocument={false}>
        <Routes>
          <Route element={<DocsLayout {...props} />}>
            <Route path="/components" element={<p>Outlet body</p>} />
            <Route path="/" element={<p>Home outlet</p>} />
          </Route>
        </Routes>
      </SpatikaThemeProvider>
    </MemoryRouter>,
  );
}

describe("DocsLayout", () => {
  it("renders chrome, outlet, and footer links", () => {
    renderLayout({ sidebar: { title: "Guides", items: [{ label: "Install", to: "/guides#installation" }] } });
    expect(screen.getByRole("link", { name: SITE.brand })).toHaveAttribute("href", "/");
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getByText("Outlet body")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Guides" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Install" })).toHaveAttribute("href", "/guides#installation");
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: SITE.sweyam })).toHaveAttribute("href", SITE.sweyamUrl);
    expect(screen.getByRole("link", { name: "sweyam.com" })).toHaveAttribute("href", SITE.sweyamUrl);
    expect(screen.getByRole("link", { name: SITE.author })).toHaveAttribute("href", SITE.authorUrl);
  });

  it("uses a wide main when there is no sidebar", () => {
    const { container } = renderLayout({ wide: true }, "/");
    expect(container.querySelector(".docs-layout")).toBeNull();
    expect(container.querySelector(".page-narrow")).toBeNull();
    expect(screen.getByText("Home outlet")).toBeInTheDocument();
  });

  it("toggles the mobile navigation panel", async () => {
    const user = userEvent.setup();
    const { container } = renderLayout({});
    const toggle = screen.getByRole("button", { name: "Open menu" });
    const panel = container.querySelector(".mobile-nav-panel");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(panel).toHaveAttribute("hidden");

    await user.click(toggle);
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    expect(panel).not.toHaveAttribute("hidden");

    await user.click(screen.getByRole("button", { name: "Close menu" }));
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
    expect(panel).toHaveAttribute("hidden");
  });
});
