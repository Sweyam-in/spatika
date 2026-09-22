import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "./SiteFooter";

describe("SiteFooter", () => {
  it("renders brand, copyright, links, and meta", () => {
    render(
      <SiteFooter
        brand={<span>Sweyam</span>}
        copyright="© 2026"
        links={[{ href: "#about", label: "About" }]}
        meta={<span>Powered by Spatika</span>}
      />,
    );
    expect(screen.getByText("Sweyam")).toBeInTheDocument();
    expect(screen.getByText("© 2026")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "#about");
    expect(screen.getByText("Powered by Spatika")).toBeInTheDocument();
  });

  it("omits the nav when there are no links and uses renderLink when provided", () => {
    const { rerender } = render(<SiteFooter brand={<span>Sweyam</span>} />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();

    rerender(
      <SiteFooter
        links={[{ href: "/docs", label: "Docs" }]}
        renderLink={(link, className) => (
          <a href={link.href} className={className} data-custom="true">
            {link.label}
          </a>
        )}
      />,
    );
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("data-custom", "true");
  });
});
