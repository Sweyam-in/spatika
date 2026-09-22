import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MarketingSection, SectionBackdrop } from "./MarketingSection";
import { AnnouncementPill, MarketingHero } from "./MarketingHero";
import { FeatureCard, FeatureGrid } from "./FeatureGrid";
import { BentoCard, BentoGrid } from "./BentoGrid";
import { PricingCard, PricingTable } from "./PricingTable";
import { TestimonialCard } from "./TestimonialCard";
import { LogoCloud } from "./LogoCloud";
import { StatBand } from "./StatBand";
import { StepFlow } from "./StepFlow";
import { CtaBand } from "./CtaBand";
import { FaqSection } from "./FaqSection";
import { Marquee } from "./Marquee";
import { Reveal } from "./Reveal";
import { ShowcaseFrame } from "./ShowcaseFrame";
import { Prose } from "./Prose";

describe("MarketingSection", () => {
  it("renders a section with tone and an inner container", () => {
    const { container } = render(
      <MarketingSection tone="wash" edge="top">
        <p>Body</p>
      </MarketingSection>,
    );
    const section = container.querySelector("section")!;
    expect(section.className).toContain("spk-mk-section");
    expect(section.dataset.tone).toBe("wash");
    expect(section.dataset.edge).toBe("top");
    expect(container.querySelector('[data-slot="marketing-section-inner"]')?.className).toContain(
      "spk-mk-section__inner",
    );
  });

  it("accepts a backdrop kind as a shorthand string", () => {
    const { container } = render(<MarketingSection backdrop="aurora">Body</MarketingSection>);
    const backdrop = container.querySelector('[data-slot="section-backdrop"]')!;
    expect(backdrop.getAttribute("data-kind")).toBe("aurora");
    expect(backdrop.getAttribute("aria-hidden")).toBe("true");
  });

  it("drops the max-width container when width is full", () => {
    const { container } = render(<MarketingSection width="full">Body</MarketingSection>);
    const inner = container.querySelector('[data-slot="marketing-section-inner"]')!;
    expect(inner.className).not.toContain("spk-mk-section__inner");
    expect(inner.getAttribute("data-width")).toBe("full");
  });

  it("carries backdrop strength as a custom property", () => {
    const { container } = render(<SectionBackdrop kind="grid" strength={0.4} animated />);
    const backdrop = container.querySelector('[data-slot="section-backdrop"]') as HTMLElement;
    expect(backdrop.style.getPropertyValue("--spk-mk-backdrop-strength")).toBe("0.4");
    expect(backdrop.dataset.animated).toBe("true");
  });
});

describe("MarketingHero", () => {
  it("renders the headline as an h1 with lede, actions and note", () => {
    render(
      <MarketingHero
        title="Ship the interface, not the CSS"
        lede="A React design system for product teams."
        actions={<button type="button">Get started</button>}
        note="MIT licensed"
      />,
    );
    expect(screen.getByRole("heading", { level: 1, name: /Ship the interface/ })).toBeInTheDocument();
    expect(screen.getByText("A React design system for product teams.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Get started" })).toBeInTheDocument();
    expect(screen.getByText("MIT licensed")).toBeInTheDocument();
  });

  it("puts media beside the copy when split", () => {
    const { container } = render(
      <MarketingHero layout="split" title="Split" media={<img alt="Product" src="/shot.png" />} />,
    );
    expect(container.querySelector('[data-slot="marketing-hero"]')?.getAttribute("data-layout")).toBe("split");
    expect(screen.getByAltText("Product")).toBeInTheDocument();
  });

  it("centres stacked copy by default and start-aligns split copy", () => {
    const { container, rerender } = render(<MarketingHero title="Stacked" />);
    expect(container.querySelector('[data-slot="marketing-hero-copy"]')?.className).toContain("text-center");

    rerender(<MarketingHero layout="split" title="Split" />);
    expect(container.querySelector('[data-slot="marketing-hero-copy"]')?.className).not.toContain("text-center");
  });
});

describe("AnnouncementPill", () => {
  it("renders a link with a tag and a chevron when given an href", () => {
    const { container } = render(
      <AnnouncementPill href="/changelog" tag="New">
        Charts ship with 2.1
      </AnnouncementPill>,
    );
    const link = screen.getByRole("link", { name: /Charts ship with 2.1/ });
    expect(link).toHaveAttribute("href", "/changelog");
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(container.querySelector(".spk-mk-pill__chevron")).toBeTruthy();
  });

  it("renders a plain span without an href", () => {
    const { container } = render(<AnnouncementPill>Now in beta</AnnouncementPill>);
    expect(screen.queryByRole("link")).toBeNull();
    expect(container.querySelector(".spk-mk-pill__chevron")).toBeNull();
  });
});

describe("FeatureGrid", () => {
  it("renders feature cards with icons and links", () => {
    render(
      <FeatureGrid columns={2}>
        <FeatureCard title="Themes" description="Four of them." variant="card" />
        <FeatureCard title="Density" href="/docs/density" />
      </FeatureGrid>,
    );
    expect(screen.getByRole("heading", { name: "Themes" })).toBeInTheDocument();
    expect(screen.getByText("Four of them.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Density/ })).toHaveAttribute("href", "/docs/density");
  });

  it("marks linked cards as interactive", () => {
    const { container } = render(<FeatureCard title="Docs" href="/docs" />);
    const card = container.querySelector('[data-slot="feature-card"]')!;
    expect(card.getAttribute("data-interactive")).toBe("true");
  });
});

describe("BentoGrid", () => {
  it("passes span and row counts through as custom properties", () => {
    const { container } = render(
      <BentoGrid columns={3}>
        <BentoCard title="Wide" span={2} rows={2} emphasis />
      </BentoGrid>,
    );
    const grid = container.querySelector('[data-slot="bento-grid"]') as HTMLElement;
    const card = container.querySelector('[data-slot="bento-card"]') as HTMLElement;
    expect(grid.style.getPropertyValue("--spk-mk-bento-cols")).toBe("3");
    expect(card.style.getPropertyValue("--spk-mk-bento-span")).toBe("2");
    expect(card.style.getPropertyValue("--spk-mk-bento-rows")).toBe("2");
    expect(card.dataset.emphasis).toBe("true");
  });
});

describe("PricingTable", () => {
  it("renders plans, features and excluded features", () => {
    const { container } = render(
      <PricingTable columns={2}>
        <PricingCard name="Free" price="$0" period="/month" features={["Unlimited projects"]} />
        <PricingCard
          name="Team"
          price="$19"
          period="/seat / month"
          featured
          badge="Most popular"
          features={["Everything in Free", { label: "SAML", excluded: true }]}
          action={<button type="button">Start trial</button>}
        />
      </PricingTable>,
    );
    expect(screen.getByRole("heading", { name: "Free" })).toBeInTheDocument();
    expect(screen.getByText("$19")).toBeInTheDocument();
    expect(screen.getByText("Most popular")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start trial" })).toBeInTheDocument();

    const featured = container.querySelector('[data-featured="true"]')!;
    expect(within(featured as HTMLElement).getByText("SAML").closest("li")?.dataset.muted).toBe("true");
    expect(within(featured as HTMLElement).getByText("Everything in Free").closest("li")?.dataset.muted).toBeUndefined();
  });

  it("uses tabular figures for the amount", () => {
    const { container } = render(<PricingCard name="Team" price="$19" />);
    expect(container.querySelector('[data-slot="pricing-card-amount"]')?.className).toContain("spk-numeric");
  });
});

describe("TestimonialCard", () => {
  it("renders a figure with a quote and attribution", () => {
    render(
      <TestimonialCard
        quote="We shipped the dashboard in a week."
        author="Priya Nair"
        role="Head of Product, Sweyam"
      />,
    );
    expect(screen.getByText("We shipped the dashboard in a week.")).toBeInTheDocument();
    expect(screen.getByText("Priya Nair")).toBeInTheDocument();
    expect(screen.getByText("Head of Product, Sweyam")).toBeInTheDocument();
  });

  it("hides the decorative quote mark from assistive tech", () => {
    const { container } = render(<TestimonialCard quote="Good." author="Sam" />);
    expect(container.querySelector(".spk-mk-quote__mark")?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("LogoCloud", () => {
  it("wraps each logo and renders the label", () => {
    const { container } = render(
      <LogoCloud label="Trusted by teams at">
        <span>Sweyam</span>
        <span>Lumen</span>
      </LogoCloud>,
    );
    expect(screen.getByText("Trusted by teams at")).toBeInTheDocument();
    expect(container.querySelectorAll('[data-slot="logo-cloud-item"]')).toHaveLength(2);
  });

  it("scrolls in a marquee when asked", () => {
    const { container } = render(
      <LogoCloud variant="marquee">
        <span>Sweyam</span>
      </LogoCloud>,
    );
    expect(container.querySelector('[data-slot="marquee"]')).toBeTruthy();
  });
});

describe("StatBand", () => {
  it("renders each stat as a value and label pair", () => {
    render(
      <StatBand
        stats={[
          { value: "99.98%", label: "Uptime" },
          { value: "2.4M", label: "Requests / day", hint: "p99 under 40ms" },
        ]}
      />,
    );
    expect(screen.getByText("99.98%")).toBeInTheDocument();
    expect(screen.getByText("Requests / day")).toBeInTheDocument();
    expect(screen.getByText("p99 under 40ms")).toBeInTheDocument();
  });
});

describe("StepFlow", () => {
  it("renders an ordered list and numbers the steps", () => {
    const { container } = render(
      <StepFlow
        steps={[
          { title: "Install", description: "One package." },
          { title: "Theme", description: "Pick one of four." },
          { title: "Ship" },
        ]}
      />,
    );
    expect(container.querySelector("ol")).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("connects every step but the last", () => {
    const { container } = render(
      <StepFlow steps={[{ title: "One" }, { title: "Two" }]} />,
    );
    const items = container.querySelectorAll('[data-slot="step-flow-item"]');
    expect(items[0]?.getAttribute("data-connected")).toBe("true");
    expect(items[1]?.getAttribute("data-connected")).toBeNull();
  });
});

describe("CtaBand", () => {
  it("renders the ask with actions and a tone", () => {
    const { container } = render(
      <CtaBand
        tone="accent"
        title="Start building"
        description="Install and ship today."
        actions={<button type="button">Install</button>}
        note="No card required"
      />,
    );
    expect(screen.getByRole("heading", { name: "Start building" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Install" })).toBeInTheDocument();
    expect(container.querySelector('[data-slot="cta-band"]')?.getAttribute("data-tone")).toBe("accent");
  });
});

describe("FaqSection", () => {
  it("opens an answer when the question is activated", async () => {
    const user = userEvent.setup();
    render(
      <FaqSection
        title="Questions"
        items={[
          { question: "Is it free?", answer: "Yes — MIT licensed." },
          { question: "Does it do dark mode?", answer: "Two dark themes." },
        ]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Is it free?" }));
    expect(screen.getByText("Yes — MIT licensed.")).toBeVisible();
  });

  it("emits FAQPage JSON-LD only for string answers", () => {
    const { container } = render(
      <FaqSection
        structuredData
        items={[
          { question: "Is it free?", answer: "Yes." },
          { question: "Rich?", answer: <em>Markup</em> },
        ]}
      />,
    );
    const script = container.querySelector('script[type="application/ld+json"]')!;
    const data = JSON.parse(script.textContent!);
    expect(data["@type"]).toBe("FAQPage");
    expect(data.mainEntity).toHaveLength(1);
    expect(data.mainEntity[0].name).toBe("Is it free?");
  });

  it("omits the script when structured data is off", () => {
    const { container } = render(<FaqSection items={[{ question: "Q", answer: "A" }]} />);
    expect(container.querySelector('script[type="application/ld+json"]')).toBeNull();
  });
});

describe("Marquee", () => {
  it("duplicates the track and hides the copy from assistive tech", () => {
    const { container } = render(
      <Marquee duration={20}>
        <span>Sweyam</span>
      </Marquee>,
    );
    const root = container.querySelector('[data-slot="marquee"]') as HTMLElement;
    expect(root.style.getPropertyValue("--spk-mk-marquee-duration")).toBe("20s");
    expect(screen.getAllByText("Sweyam")).toHaveLength(2);
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });
});

describe("Reveal", () => {
  it("renders content visible when IntersectionObserver is unavailable", () => {
    const { container } = render(<Reveal delay={120}>Visible anyway</Reveal>);
    const root = container.querySelector('[data-slot="reveal"]') as HTMLElement;
    expect(screen.getByText("Visible anyway")).toBeInTheDocument();
    expect(root.dataset.visible).toBe("true");
    expect(root.style.getPropertyValue("--spk-mk-reveal-delay")).toBe("120ms");
  });
});

describe("ShowcaseFrame", () => {
  it("draws browser chrome with a URL", () => {
    const { container } = render(
      <ShowcaseFrame url="app.sweyam.com" tilt>
        <img alt="Dashboard" src="/shot.png" />
      </ShowcaseFrame>,
    );
    expect(screen.getByText("app.sweyam.com")).toBeInTheDocument();
    expect(screen.getByAltText("Dashboard")).toBeInTheDocument();
    const frame = container.querySelector('[data-slot="showcase-frame"]') as HTMLElement;
    expect(frame.dataset.tilt).toBe("true");
    expect(container.querySelector('[data-slot="showcase-frame-bar"]')?.getAttribute("aria-hidden")).toBe("true");
  });

  it("omits the bar for the phone and bare variants", () => {
    const { container, rerender } = render(<ShowcaseFrame chrome="phone">Screen</ShowcaseFrame>);
    expect(container.querySelector('[data-slot="showcase-frame-bar"]')).toBeNull();
    expect(container.querySelector(".spk-mk-frame__notch")).toBeTruthy();

    rerender(<ShowcaseFrame chrome="none">Screen</ShowcaseFrame>);
    expect(container.querySelector('[data-slot="showcase-frame-bar"]')).toBeNull();
  });
});

describe("Prose", () => {
  it("styles long-form children", () => {
    const { container } = render(
      <Prose lead>
        <p>Standfirst</p>
      </Prose>,
    );
    const root = container.querySelector('[data-slot="prose"]') as HTMLElement;
    expect(root.className).toContain("spk-prose");
    expect(root.dataset.lead).toBe("true");
    expect(screen.getByText("Standfirst")).toBeInTheDocument();
  });

  it("renders supplied html", () => {
    const { container } = render(<Prose html="<p>From a CMS</p>" size="sm" />);
    expect(screen.getByText("From a CMS")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="prose"]')?.getAttribute("data-size")).toBe("sm");
  });
});
