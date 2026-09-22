import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LeadForm } from "./LeadForm";
import { SplitFeature, SplitFeatureGroup } from "./SplitFeature";
import { ComparisonTable } from "./ComparisonTable";
import { ArticleCard } from "./ArticleCard";
import { SiteFooter } from "../composites/SiteFooter";

describe("LeadForm", () => {
  it("submits the typed email", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LeadForm onSubmit={onSubmit} action="Subscribe" />);

    await user.type(screen.getByLabelText("Email address"), "sam@sweyam.com");
    await user.click(screen.getByRole("button", { name: "Subscribe" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toBe("sam@sweyam.com");
  });

  it("announces success after an async submit resolves", async () => {
    const user = userEvent.setup();
    render(<LeadForm onSubmit={async () => {}} successMessage="You're on the list." />);

    await user.type(screen.getByLabelText("Email address"), "sam@sweyam.com");
    await user.click(screen.getByRole("button", { name: "Subscribe" }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("You're on the list."));
  });

  it("shows an error message when the submit rejects", async () => {
    const user = userEvent.setup();
    render(
      <LeadForm
        onSubmit={async () => {
          throw new Error("nope");
        }}
        message={undefined}
      />,
    );

    await user.type(screen.getByLabelText("Email address"), "sam@sweyam.com");
    await user.click(screen.getByRole("button", { name: "Subscribe" }));

    await waitFor(() =>
      expect(document.querySelector('[data-slot="lead-form"]')?.getAttribute("data-status")).toBe("error"),
    );
  });

  it("keeps the label visible when asked and renders extra fields", () => {
    render(
      <LeadForm hideLabel={false} label="Work email" note="No spam, ever.">
        <input aria-label="Company" name="company" />
      </LeadForm>,
    );
    expect(screen.getByText("Work email")).toBeVisible();
    expect(screen.getByLabelText("Company")).toBeInTheDocument();
    expect(screen.getByText("No spam, ever.")).toBeInTheDocument();
  });

  it("posts to a native endpoint when given formAction", () => {
    const { container } = render(<LeadForm formAction="https://example.com/subscribe" />);
    const form = container.querySelector("form")!;
    expect(form).toHaveAttribute("action", "https://example.com/subscribe");
    expect(form).toHaveAttribute("method", "post");
  });
});

describe("SplitFeature", () => {
  it("renders copy, bullets, actions and media", () => {
    render(
      <SplitFeature
        eyebrow="Tables"
        title="Data tables that hold up"
        description="Sorting, filters and pinned columns."
        bullets={["Bulk actions", "Mobile layout"]}
        actions={<button type="button">See the docs</button>}
        media={<img alt="Table" src="/table.png" />}
      />,
    );
    expect(screen.getByRole("heading", { name: "Data tables that hold up" })).toBeInTheDocument();
    expect(screen.getByText("Bulk actions")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "See the docs" })).toBeInTheDocument();
    expect(screen.getByAltText("Table")).toBeInTheDocument();
  });

  it("flips sides on wide screens without changing DOM order", () => {
    const { container } = render(<SplitFeature title="Flipped" reverse media={<span>Shot</span>} />);
    const root = container.querySelector('[data-slot="split-feature"]')!;
    expect(root.getAttribute("data-reverse")).toBe("true");
    expect(root.firstElementChild?.getAttribute("data-slot")).toBe("split-feature-copy");
    expect(container.querySelector('[data-slot="split-feature-copy"]')?.className).toContain("lg:order-2");
  });
});

describe("SplitFeatureGroup", () => {
  it("alternates the sides of its children", () => {
    const { container } = render(
      <SplitFeatureGroup>
        <SplitFeature title="One" />
        <SplitFeature title="Two" />
        <SplitFeature title="Three" />
      </SplitFeatureGroup>,
    );
    const items = container.querySelectorAll('[data-slot="split-feature"]');
    expect(items[0]?.getAttribute("data-reverse")).toBeNull();
    expect(items[1]?.getAttribute("data-reverse")).toBe("true");
    expect(items[2]?.getAttribute("data-reverse")).toBeNull();
  });

  it("respects an explicit reverse on a child", () => {
    const { container } = render(
      <SplitFeatureGroup>
        <SplitFeature title="One" reverse />
        <SplitFeature title="Two" reverse={false} />
      </SplitFeatureGroup>,
    );
    const items = container.querySelectorAll('[data-slot="split-feature"]');
    expect(items[0]?.getAttribute("data-reverse")).toBe("true");
    expect(items[1]?.getAttribute("data-reverse")).toBeNull();
  });
});

describe("ComparisonTable", () => {
  const columns = [
    { id: "free", label: "Free" },
    { id: "team", label: "Team", featured: true, badge: "Popular" },
  ];

  it("renders a table with row headers and column headers", () => {
    render(
      <ComparisonTable
        caption="Plan comparison"
        columns={columns}
        rows={[
          { label: "Projects", values: { free: "3", team: "Unlimited" } },
          { label: "SAML", values: { free: false, team: true } },
        ]}
      />,
    );
    expect(screen.getByRole("table", { name: "Plan comparison" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Free/ })).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: /Projects/ })).toBeInTheDocument();
    expect(screen.getByText("Unlimited")).toBeInTheDocument();
  });

  it("gives booleans a text equivalent instead of a bare icon", () => {
    render(
      <ComparisonTable
        columns={columns}
        rows={[{ label: "SAML", values: { free: false, team: true } }]}
      />,
    );
    expect(screen.getByText("Included")).toBeInTheDocument();
    expect(screen.getByText("Not included")).toBeInTheDocument();
  });

  it("marks the featured column on every cell", () => {
    const { container } = render(
      <ComparisonTable columns={columns} rows={[{ label: "Seats", values: { free: "1", team: "50" } }]} />,
    );
    expect(container.querySelectorAll('[data-featured="true"]').length).toBe(2);
  });

  it("groups rows into sections", () => {
    render(
      <ComparisonTable
        columns={columns}
        groups={[
          { label: "Security", rows: [{ label: "SAML", values: { free: false, team: true } }] },
          { label: "Support", rows: [{ label: "Priority", values: { free: false, team: true } }] },
        ]}
      />,
    );
    expect(screen.getByText("Security")).toBeInTheDocument();
    expect(screen.getByText("Support")).toBeInTheDocument();
  });

  it("scrolls inside its own container", () => {
    const { container } = render(<ComparisonTable columns={columns} rows={[]} />);
    expect(container.querySelector('[data-slot="comparison-table"]')?.className).toContain(
      "spk-mk-compare-scroll",
    );
  });
});

describe("ArticleCard", () => {
  it("renders the title as the link and shows the byline", () => {
    render(
      <ArticleCard
        href="/blog/spatika-2-1"
        title="Spatika 2.1 adds a marketing layer"
        excerpt="Landing pages now run on the same tokens as your product."
        author="Sreelal Chalil"
        date="21 Sep 2026"
        readingTime="6 min read"
      />,
    );
    const link = screen.getByRole("link", { name: "Spatika 2.1 adds a marketing layer" });
    expect(link).toHaveAttribute("href", "/blog/spatika-2-1");
    expect(screen.getByText("Sreelal Chalil")).toBeInTheDocument();
    expect(screen.getByText("6 min read")).toBeInTheDocument();
  });

  it("renders without a link when there is no href", () => {
    render(<ArticleCard title="Draft post" />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByRole("heading", { name: "Draft post" })).toBeInTheDocument();
  });

  it("supports the horizontal and featured variants", () => {
    const { container } = render(
      <ArticleCard variant="horizontal" featured title="Lead story" media={<img alt="Cover" src="/c.png" />} />,
    );
    const root = container.querySelector('[data-slot="article-card"]')!;
    expect(root.className).toContain("spk-mk-article--row");
    expect(root.getAttribute("data-featured")).toBe("true");
    expect(screen.getByAltText("Cover")).toBeInTheDocument();
  });
});

describe("SiteFooter columns", () => {
  it("renders a sitemap footer with columns, description, action and legal row", () => {
    render(
      <SiteFooter
        brand={<span>Sweyam</span>}
        description="A React design system for product teams."
        action={<button type="button">Subscribe</button>}
        columns={[
          { title: "Product", links: [{ href: "/components", label: "Components" }] },
          { title: "Company", links: [{ href: "/about", label: "About" }] },
        ]}
        copyright="© 2026 Sweyam"
        legal={<a href="/privacy">Privacy</a>}
      />,
    );
    expect(screen.getByRole("navigation", { name: "Product" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Components" })).toHaveAttribute("href", "/components");
    expect(screen.getByText("A React design system for product teams.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Subscribe" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy" })).toBeInTheDocument();
    expect(screen.getByText("© 2026 Sweyam")).toBeInTheDocument();
  });

  it("still renders the slim row when no columns are given", () => {
    const { container } = render(<SiteFooter brand={<span>Sweyam</span>} copyright="© 2026" />);
    expect(container.querySelector('[data-slot="site-footer"]')?.getAttribute("data-layout")).toBe("row");
  });

  it("uses renderLink inside columns", () => {
    render(
      <SiteFooter
        columns={[{ title: "Product", links: [{ href: "/docs", label: "Docs" }] }]}
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
