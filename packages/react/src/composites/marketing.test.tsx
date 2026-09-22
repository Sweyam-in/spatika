import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tag } from "./Tag";
import { SectionHeading } from "./SectionHeading";
import { SiteNav } from "./SiteNav";
import { SiteFooter } from "./SiteFooter";
import { GradientText } from "./GradientText";
import { Wordmark } from "./Wordmark";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { FloatChip } from "./FloatChip";
import { MetaChip } from "./MetaChip";
import { IconTile } from "./IconTile";
import { ContactLink } from "./ContactLink";
import { CareerCard, CareerTimeline } from "./CareerCard";
import { ProjectCard } from "./ProjectCard";
import { PresenceDot } from "./PresenceDot";
import { AccentRule } from "./AccentRule";

describe("Tag", () => {
  it("renders label text", () => {
    render(<Tag>Java</Tag>);
    expect(screen.getByText("Java")).toBeInTheDocument();
  });

  it("supports color tones from the marketing site", () => {
    render(<Tag variant="orange">AWS</Tag>);
    expect(screen.getByText("AWS").className).toMatch(/orange/);
  });
});

describe("SectionHeading", () => {
  it("renders eyebrow, title, and subtitle without a header element", () => {
    const { container } = render(
      <SectionHeading eyebrow="Product" title="What's shipping" subtitle="Glass composites." />,
    );
    expect(screen.getByText("Product")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What's shipping" })).toBeInTheDocument();
    expect(screen.getByText("Glass composites.")).toBeInTheDocument();
    expect(container.querySelector("header")).toBeNull();
    expect(container.querySelector("[data-slot='section-heading']")).toBeTruthy();
  });
});

describe("SiteNav", () => {
  it("renders brand and links", async () => {
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
    await user.click(screen.getByRole("button", { name: "Toggle menu" }));
    expect(screen.getByLabelText("Toggle menu")).toHaveAttribute("aria-expanded", "true");
  });

  it("does not pin to the viewport when contained", () => {
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
  });
});

describe("SiteFooter", () => {
  it("renders brand, copyright, and links", () => {
    render(
      <SiteFooter
        brand={<span>Sweyam</span>}
        copyright="© 2026"
        links={[{ href: "#about", label: "About" }]}
        meta={<MetaChip>Next.js</MetaChip>}
      />,
    );
    expect(screen.getByText("Sweyam")).toBeInTheDocument();
    expect(screen.getByText("© 2026")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();
  });
});

describe("marketing chrome", () => {
  it("renders a gradient wordmark", () => {
    render(<Wordmark name="Sweyam" accent=".io" />);
    expect(screen.getByText("Sweyam")).toBeInTheDocument();
    expect(screen.getByText(".io")).toBeInTheDocument();
  });

  it("renders gradient text", () => {
    render(<GradientText>Spatika</GradientText>);
    expect(screen.getByText("Spatika")).toBeInTheDocument();
  });

  it("renders an availability badge with a live pip", () => {
    render(<AvailabilityBadge>Live</AvailabilityBadge>);
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='presence-dot']")).toBeTruthy();
  });

  it("renders a float chip", () => {
    render(<FloatChip icon="✨" title="Glass" subtitle="UI" />);
    expect(screen.getByText("Glass")).toBeInTheDocument();
    expect(screen.getByText("UI")).toBeInTheDocument();
  });

  it("renders a live float chip", () => {
    render(<FloatChip live>In production</FloatChip>);
    expect(screen.getByText("In production")).toBeInTheDocument();
  });

  it("renders a presence dot", () => {
    render(<PresenceDot label="Online" />);
    expect(screen.getByLabelText("Online")).toBeInTheDocument();
  });

  it("renders an accent rule", () => {
    const { container } = render(<AccentRule />);
    expect(container.querySelector("[data-slot='accent-rule']")).toBeTruthy();
  });
});

describe("IconTile", () => {
  it("renders title and description", () => {
    render(<IconTile icon="🏦" title="Banking" description="Markets" />);
    expect(screen.getByText("Banking")).toBeInTheDocument();
    expect(screen.getByText("Markets")).toBeInTheDocument();
  });
});

describe("ContactLink", () => {
  it("renders name, label, and href", () => {
    render(
      <ContactLink href="mailto:hi@example.com" name="Email" label="hi@example.com" icon="@" />,
    );
    const link = screen.getByRole("link", { name: /Email/ });
    expect(link).toHaveAttribute("href", "mailto:hi@example.com");
    expect(screen.getByText("hi@example.com")).toBeInTheDocument();
  });
});

describe("CareerCard", () => {
  it("renders a current role with tags", () => {
    render(
      <CareerTimeline>
        <CareerCard
          role="Engineer"
          company="Sweyam"
          location="Remote"
          period="2024 — Present"
          current
          bullets={["Shipped the thing."]}
          tags={["Java"]}
        />
      </CareerTimeline>
    );
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText("Sweyam")).toBeInTheDocument();
    expect(screen.getByText("Shipped the thing.")).toBeInTheDocument();
    expect(screen.getByText("Java")).toBeInTheDocument();
  });
});

describe("ProjectCard", () => {
  it("renders title, company, outcome, and tags", () => {
    render(
      <ProjectCard
        title="Spatika UI"
        company="Open source"
        outcome="Shipped"
        description="Glass React design system."
        tags={["React"]}
      />,
    );
    expect(screen.getByText("Spatika UI")).toBeInTheDocument();
    expect(screen.getByText("Open source")).toBeInTheDocument();
    expect(screen.getByText("Shipped")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });
});
