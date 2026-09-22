import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SiteNav } from "./SiteNav";

describe("SiteNav", () => {
  it("renders brand and links and opens the mobile menu", async () => {
    const user = userEvent.setup();
    render(
      <SiteNav
        brand={<a href="/">Brand</a>}
        links={[
          { href: "#about", label: "About" },
          { href: "/blog", label: "Blog" },
        ]}
      />,
    );
    expect(screen.getByText("Brand")).toBeInTheDocument();
    expect(screen.getAllByText("About").length).toBeGreaterThan(0);
    expect(screen.getByRole("navigation").className).toContain("spk-site-nav");
    const toggle = screen.getByRole("button", { name: "Toggle menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("does not pin to the viewport when contained and closes the menu on Escape", async () => {
    const user = userEvent.setup();
    render(
      <SiteNav
        contained
        brand={<a href="/">Brand</a>}
        links={[{ href: "#about", label: "About" }]}
      />,
    );
    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("absolute");
    expect(nav.className).not.toMatch(/\bfixed\b/);

    const toggle = screen.getByRole("button", { name: "Toggle menu" });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});
