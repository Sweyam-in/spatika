import type { ReactNode } from "react";
import { Gauge, Layers, Rows3, ShieldCheck, Sparkles, Type } from "lucide-react";
import {
  AnnouncementPill,
  ArticleCard,
  BentoCard,
  BentoGrid,
  Button,
  ComparisonTable,
  CtaBand,
  FaqSection,
  FeatureCard,
  FeatureGrid,
  InitialsAvatar,
  LeadForm,
  LogoCloud,
  MarketingHero,
  MarketingSection,
  Marquee,
  PricingCard,
  PricingTable,
  Prose,
  Reveal,
  SectionBackdrop,
  SectionHeading,
  ShowcaseFrame,
  SiteFooter,
  SplitFeature,
  SplitFeatureGroup,
  StatBand,
  StepFlow,
  TestimonialCard,
} from "@spatika/react";

const LOGOS = ["Sweyam", "Lumen Labs", "Parallel", "Northwind", "Juniper"];

/** Schematic of an app screen — drawn with tokens so frames follow the theme. */
function FrameArt({ height = 180 }: { height?: number }) {
  return (
    <div style={{ height, background: "var(--spk-canvas)", padding: "0.75rem" }}>
      <svg viewBox="0 0 120 60" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }} aria-hidden>
        <rect width="34" height="5" rx="2" fill="var(--spk-text-primary)" opacity="0.75" />
        <rect x="98" width="22" height="5" rx="2" fill="var(--spk-accent)" />
        <path
          d="M0 46 L15 42 L30 44 L45 34 L60 36 L75 26 L90 22 L105 16 L120 9 L120 60 L0 60 Z"
          fill="var(--spk-accent)"
          opacity="0.12"
        />
        <path
          d="M0 46 L15 42 L30 44 L45 34 L60 36 L75 26 L90 22 L105 16 L120 9"
          fill="none"
          stroke="var(--spk-accent)"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

export function marketingDemos(compact: boolean): Record<string, ReactNode> {
  return {
    "marketing-section": (
      <div className="showcase-frame" style={{ width: "100%", overflow: "hidden" }}>
        <MarketingSection tone="wash" backdrop="aurora" spacing={compact ? "tight" : "default"} edge="both">
          <SectionHeading
            align="center"
            eyebrow="Platform"
            title="Everything in one system"
            subtitle="Tokens, components and patterns that follow the theme you pick."
          />
          <div className="flex justify-center">
            <Button>Explore components</Button>
          </div>
        </MarketingSection>
      </div>
    ),

    "section-backdrop": (
      <div className="grid w-full gap-3 sm:grid-cols-2">
        {(["aurora", "glow", "grid", "rays"] as const).map((kind) => (
          <div
            key={kind}
            className="relative isolate overflow-hidden rounded-[var(--spk-radius-md)] border border-line-subtle"
            style={{ minHeight: compact ? 76 : 120 }}
          >
            <SectionBackdrop kind={kind} />
            <p className="relative z-[1] p-4 text-label text-fg-secondary">{kind}</p>
          </div>
        ))}
      </div>
    ),

    "marketing-hero": (
      <MarketingHero
        as="h2"
        announcement={
          <AnnouncementPill href="#" tag="New">
            Marketing blocks ship with 2.1
          </AnnouncementPill>
        }
        title="Ship the interface, not the CSS"
        lede="A React design system for product teams — four themes, density control and an application shell."
        actions={
          <>
            <Button size="lg">Get started</Button>
            <Button size="lg" variant="secondary">
              Read the docs
            </Button>
          </>
        }
        note="MIT licensed · No build step required"
        media={
          compact ? undefined : (
            <ShowcaseFrame url="app.sweyam.com">
              <FrameArt />
            </ShowcaseFrame>
          )
        }
      />
    ),

    "announcement-pill": (
      <div className="flex flex-wrap items-center justify-center gap-3">
        <AnnouncementPill href="#" tag="New">
          Spatika 2.1 — marketing blocks
        </AnnouncementPill>
        <AnnouncementPill>Now in public beta</AnnouncementPill>
      </div>
    ),

    "feature-grid": (
      <FeatureGrid columns={3}>
        <FeatureCard
          variant="card"
          icon={<Layers />}
          title="Calm surfaces"
          description="Solid material, hairline borders and restrained elevation."
        />
        <FeatureCard
          variant="card"
          icon={<Type />}
          title="Hierarchy from type"
          description="Size, weight and spacing carry structure — not boxes."
        />
        <FeatureCard
          variant="card"
          icon={<Rows3 />}
          title="Professional density"
          description="One attribute retunes every control in a region."
        />
      </FeatureGrid>
    ),

    "bento-grid": (
      <BentoGrid columns={3}>
        <BentoCard
          span={2}
          emphasis
          shine
          icon={<Sparkles />}
          title="One system, four themes"
          description="Every component reads its colour from semantic tokens, so a theme change carries all the way through."
        />
        <BentoCard icon={<Gauge />} title="Charts included" description="SVG charts that follow the theme." />
        <BentoCard icon={<ShieldCheck />} title="Accessible by default" description="Focus rings, roles and reduced-motion handling." />
        <BentoCard
          span={2}
          title="Application shell"
          description="Sidebar, top bar, command palette and a mobile tab bar."
        />
      </BentoGrid>
    ),

    "pricing-table": (
      <PricingTable columns={3}>
        <PricingCard
          name="Free"
          price="$0"
          period="/month"
          description="For side projects."
          features={["Unlimited projects", "Community support"]}
          action={
            <Button variant="secondary" className="w-full">
              Start free
            </Button>
          }
        />
        <PricingCard
          featured
          badge="Most popular"
          name="Team"
          price="$19"
          period="/seat / month"
          description="For product teams."
          features={["Everything in Free", "Shared design tokens", { label: "SAML", excluded: true }]}
          action={<Button className="w-full">Start trial</Button>}
          note="14 days, no card"
        />
        <PricingCard
          name="Enterprise"
          price="Custom"
          description="For platform teams."
          features={["SAML and SCIM", "Priority support"]}
          action={
            <Button variant="secondary" className="w-full">
              Talk to us
            </Button>
          }
        />
      </PricingTable>
    ),

    "testimonial-card": (
      <div className="grid w-full gap-4 sm:grid-cols-2">
        <TestimonialCard
          quote="We replaced three component libraries with one and shipped the dashboard in a week."
          author="Priya Nair"
          role="Head of Product, Sweyam"
          avatar={<InitialsAvatar name="Priya Nair" className="size-9" />}
        />
        <TestimonialCard
          variant="featured"
          quote="The density switch alone saved us a design system of our own."
          author="Marcus Webb"
          role="Staff engineer, Northwind"
          avatar={<InitialsAvatar name="Marcus Webb" className="size-9" />}
        />
      </div>
    ),

    "logo-cloud": (
      <LogoCloud label="Trusted by teams at">
        {LOGOS.map((logo) => (
          <span key={logo} className="text-title-3 text-fg">
            {logo}
          </span>
        ))}
      </LogoCloud>
    ),

    "stat-band": (
      <StatBand
        stats={[
          { value: "99.98%", label: "Uptime" },
          { value: "2.4M", label: "Requests / day", hint: "p99 under 40ms" },
          { value: "180+", label: "Components" },
          { value: "4", label: "Themes" },
        ]}
      />
    ),

    "step-flow": (
      <StepFlow
        steps={[
          { title: "Install", description: "One package and one stylesheet." },
          { title: "Pick a theme", description: "Mukta, Neelam, Usha or Sandhya — or your brand." },
          { title: "Ship", description: "Compose screens from primitives and patterns." },
        ]}
      />
    ),

    "cta-band": (
      <CtaBand
        as="h3"
        tone="accent"
        title="Start building today"
        description="Install the package and have a themed screen running in minutes."
        actions={
          <Button variant="secondary" size="lg">
            npm install @spatika/react
          </Button>
        }
        note="MIT licensed"
      />
    ),

    "faq-section": (
      <FaqSection
        items={[
          { question: "Is Spatika free?", answer: "Yes — MIT licensed, and the source is on GitHub." },
          { question: "Does it support dark mode?", answer: "Two dark themes ship in the box: Neelam and Sandhya." },
          {
            question: "Can I use my own brand colour?",
            answer: "Pass createTheme({ id, extends, palette }) to SpatikaThemeProvider.",
          },
        ]}
      />
    ),

    marquee: (
      <Marquee duration={30}>
        {LOGOS.map((logo) => (
          <span key={logo} className="text-title-3 text-fg-secondary">
            {logo}
          </span>
        ))}
      </Marquee>
    ),

    reveal: (
      <FeatureGrid columns={3}>
        {[
          { title: "Tokens", body: "Semantic CSS variables, four themes." },
          { title: "Components", body: "Primitives, composites and patterns." },
          { title: "Charts", body: "SVG charts that follow the theme." },
        ].map((feature, index) => (
          <Reveal key={feature.title} delay={index * 80}>
            <FeatureCard variant="card" title={feature.title} description={feature.body} />
          </Reveal>
        ))}
      </FeatureGrid>
    ),

    "showcase-frame": (
      <div className="grid w-full gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <ShowcaseFrame url="app.sweyam.com" shine>
          <FrameArt height={compact ? 120 : 180} />
        </ShowcaseFrame>
        <ShowcaseFrame chrome="phone" className="mx-auto w-[9rem]">
          <FrameArt height={compact ? 140 : 220} />
        </ShowcaseFrame>
      </div>
    ),

    "lead-form": (
      <div className="w-full max-w-md">
        <LeadForm
          action="Join the waitlist"
          note="One email a month. Unsubscribe any time."
          onSubmit={async () => {
            await new Promise((resolve) => setTimeout(resolve, 600));
          }}
        />
      </div>
    ),

    "split-feature": (
      <SplitFeatureGroup className={compact ? "gap-8" : undefined}>
        <SplitFeature
          as="h3"
          eyebrow="Tables"
          title="Data tables that hold up"
          description="Sorting, filters, pinned columns and bulk actions."
          bullets={["Virtualised rows", "A mobile layout that still works"]}
          actions={<Button variant="secondary">See the docs</Button>}
          media={
            <ShowcaseFrame url="app.sweyam.com">
              <FrameArt height={compact ? 110 : 160} />
            </ShowcaseFrame>
          }
        />
        {compact ? null : (
          <SplitFeature
            as="h3"
            eyebrow="Charts"
            title="Charts on the same tokens"
            description="No second design language to maintain."
            media={
              <ShowcaseFrame chrome="window" title="Revenue">
                <FrameArt height={160} />
              </ShowcaseFrame>
            }
          />
        )}
      </SplitFeatureGroup>
    ),

    "comparison-table": (
      <ComparisonTable
        caption="Plan comparison"
        columns={[
          { id: "free", label: "Free", description: "For side projects" },
          {
            id: "team",
            label: "Team",
            description: "For product teams",
            featured: true,
            badge: "Popular",
          },
          { id: "ent", label: "Enterprise", description: "For platform teams" },
        ]}
        groups={[
          {
            label: "Collaboration",
            rows: [
              { label: "Projects", values: { free: "3", team: "Unlimited", ent: "Unlimited" } },
              { label: "Shared design tokens", values: { free: false, team: true, ent: true } },
            ],
          },
          {
            label: "Security",
            rows: [
              {
                label: "SAML and SCIM",
                hint: "Okta, Entra, Google",
                values: { free: false, team: false, ent: true },
              },
            ],
          },
        ]}
      />
    ),

    "article-card": (
      <div className="grid w-full gap-4 sm:grid-cols-2">
        <ArticleCard
          href="#"
          title="Spatika 2.1 adds a marketing layer"
          excerpt="Landing pages now run on the same tokens as your product screens."
          tags={<span className="spk-mk-pill__tag">Release</span>}
          author="Sreelal Chalil"
          authorAvatar={<InitialsAvatar name="Sreelal Chalil" className="size-6" />}
          date="21 Sep 2026"
          readingTime="6 min read"
        />
        <ArticleCard
          href="#"
          variant="plain"
          title="Designing four themes that are not inversions"
          excerpt="Why Neelam declares its own base values instead of flipping Mukta."
          tags={<span className="spk-mk-pill__tag">Design</span>}
          date="4 Sep 2026"
          readingTime="9 min read"
        />
      </div>
    ),

    "site-footer": (
      <SiteFooter
        brand={<span className="text-title-3 text-fg">Sweyam</span>}
        description="A React design system for product teams."
        action={<LeadForm action="Subscribe" layout="stacked" />}
        columns={[
          {
            title: "Product",
            links: [
              { href: "#", label: "Components" },
              { href: "#", label: "Themes" },
            ],
          },
          {
            title: "Company",
            links: [
              { href: "#", label: "About" },
              { href: "#", label: "Blog" },
            ],
          },
          {
            title: "Legal",
            links: [
              { href: "#", label: "Privacy" },
              { href: "#", label: "Terms" },
            ],
          },
        ]}
        copyright="© 2026 Sweyam"
      />
    ),

    prose: (
      <Prose lead size={compact ? "sm" : "md"}>
        <p>Spatika 2.1 adds a marketing layer to the system.</p>
        <h2>What changed</h2>
        <p>
          Landing pages are now built from the same tokens as your product screens, so a theme change
          carries all the way through. Browse the <a href="/components">component catalog</a>.
        </p>
        <ul>
          <li>Hero, feature, bento, pricing and CTA blocks</li>
          <li>Opt-in decoration that respects user preferences</li>
        </ul>
      </Prose>
    ),
  };
}
