import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Blocks,
  Check,
  Gauge,
  Layers,
  Palette,
  ShieldCheck,
  Sparkles,
  Table2,
} from "lucide-react";
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
  Reveal,
  SectionHeading,
  SegmentedControl,
  ShowcaseFrame,
  SiteFooter,
  SiteNav,
  SplitFeature,
  SplitFeatureGroup,
  StatBand,
  StepFlow,
  TestimonialCard,
  Wordmark,
} from "@spatika/react";

const LOGOS = ["Sweyam", "Lumen Labs", "Parallel", "Northwind", "Juniper", "Orchard"];

const FEATURES = [
  { icon: Layers, title: "Calm surfaces", body: "Solid material, hairline borders and restrained elevation. Glass is opt-in, for chrome that floats." },
  { icon: Palette, title: "Four themes", body: "Two light, two dark — each designed, not inverted. Overlay your brand with createTheme." },
  { icon: Gauge, title: "Density control", body: "One attribute retunes every control in a region, from consumer to admin console." },
  { icon: Table2, title: "Real data tables", body: "Sorting, filters, pinned columns, bulk actions and a mobile layout that still works." },
  { icon: BarChart3, title: "Charts in the box", body: "Bar, line, area, pie, maps and sparklines — all reading the same theme tokens." },
  { icon: ShieldCheck, title: "Accessible defaults", body: "Focus rings, roles, reduced motion and reduced transparency handled for you." },
];

const QUOTES = [
  { quote: "We replaced three component libraries with one and shipped the dashboard in a week.", author: "Priya Nair", role: "Head of Product, Sweyam" },
  { quote: "The density switch alone saved us building a design system of our own.", author: "Marcus Webb", role: "Staff engineer, Northwind" },
  { quote: "Our marketing site and our product finally look like the same company.", author: "Hana Sato", role: "Design lead, Lumen Labs" },
];

const FAQS = [
  { question: "Is Spatika free to use?", answer: "Yes. Spatika is MIT licensed and the full source is on GitHub — use it in commercial products without asking." },
  { question: "Does it work with my framework?", answer: "The React package covers React 18 and 19. The token package is plain CSS, so Vue, Svelte and server-rendered templates can use the recipes directly." },
  { question: "Can I use my own brand colour?", answer: "Pass createTheme({ id, extends, palette }) to SpatikaThemeProvider. Hover, muted, border and focus states are derived from your base values automatically." },
  { question: "Do I need Tailwind?", answer: "No. The published stylesheet is prebuilt, so consumers import one CSS file and nothing else." },
];

/** Schematic of a product screen — drawn with tokens so it follows the active theme. */
function ProductArt({ height = 260 }: { height?: number }) {
  return (
    <div style={{ height, background: "var(--spk-canvas)", padding: "0.875rem" }}>
      <svg viewBox="0 0 160 90" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }} aria-hidden>
        <rect width="44" height="6" rx="3" fill="var(--spk-text-primary)" opacity="0.8" />
        <rect x="132" width="28" height="6" rx="3" fill="var(--spk-accent)" />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={i * 55} y="14" width="50" height="20" rx="3" fill="var(--spk-surface-subtle)" stroke="var(--spk-border-subtle)" />
        ))}
        {[0, 1, 2].map((i) => (
          <rect key={`v${i}`} x={i * 55 + 5} y="21" width={18 + i * 6} height="6" rx="2" fill="var(--spk-text-primary)" opacity="0.55" />
        ))}
        <path d="M0 78 L20 72 L40 74 L60 62 L80 64 L100 52 L120 46 L140 38 L160 30 L160 90 L0 90 Z" fill="var(--spk-accent)" opacity="0.12" />
        <path d="M0 78 L20 72 L40 74 L60 62 L80 64 L100 52 L120 46 L140 38 L160 30" fill="none" stroke="var(--spk-accent)" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

/**
 * Marketing showcase — a full landing page built only from `@spatika/react`.
 * Every band here is a shipped component; nothing is bespoke to this page.
 */
export function LandingPage() {
  const [billing, setBilling] = useState("yearly");
  const yearly = billing === "yearly";

  return (
    <div className="min-h-dvh bg-canvas">
      <SiteNav
        brand={<Wordmark name="Spatika" accent=" UI" />}
        links={[
          { href: "#features", label: "Features" },
          { href: "#pricing", label: "Pricing" },
          { href: "#faq", label: "FAQ" },
        ]}
      />

      <main>
        <MarketingSection backdrop={{ kind: "aurora", animated: true }} className="pt-28">
          <MarketingHero
            announcement={
              <AnnouncementPill href="/components" tag="New">
                Marketing blocks ship with 2.1
              </AnnouncementPill>
            }
            title="Ship the interface, not the CSS"
            lede="Spatika is a React design system for product teams — four designed themes, density control, an application shell, data tables and charts, all reading the same semantic tokens."
            actions={
              <>
                <Button size="lg" asChild>
                  <Link to="/guides">Get started</Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/components">Browse components</Link>
                </Button>
              </>
            }
            note="MIT licensed · One stylesheet · No build step required"
            media={
              <ShowcaseFrame url="app.sweyam.com" shine>
                <ProductArt />
              </ShowcaseFrame>
            }
            footer={
              <LogoCloud label="Trusted by teams at" variant="marquee">
                {LOGOS.map((logo) => (
                  <span key={logo} className="text-title-2 text-fg">
                    {logo}
                  </span>
                ))}
              </LogoCloud>
            }
          />
        </MarketingSection>

        <MarketingSection tone="wash" edge="both" spacing="tight">
          <StatBand
            stats={[
              { value: "180+", label: "Components" },
              { value: "4", label: "Designed themes" },
              { value: "99.98%", label: "Uptime", hint: "on the hosted docs" },
              { value: "<40ms", label: "p99 render", hint: "on a mid-range phone" },
            ]}
          />
        </MarketingSection>

        <MarketingSection id="features">
          <SectionHeading
            align="center"
            eyebrow="What you get"
            title="A system, not a component dump"
            subtitle="Every piece reads its colour, spacing and motion from the same tokens — so a theme change carries all the way through."
          />
          <FeatureGrid columns={3}>
            {FEATURES.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 60}>
                <FeatureCard
                  variant="card"
                  icon={<feature.icon />}
                  title={feature.title}
                  description={feature.body}
                />
              </Reveal>
            ))}
          </FeatureGrid>
        </MarketingSection>

        <MarketingSection tone="wash" edge="both" backdrop={{ kind: "grid", strength: 0.6 }}>
          <SectionHeading
            eyebrow="Built in"
            title="Everything a product screen needs"
            subtitle="The parts most teams rebuild from scratch, already designed and tested."
          />
          <BentoGrid columns={3}>
            <BentoCard
              span={2}
              rows={2}
              emphasis
              shine
              icon={<Sparkles />}
              title="One system, four themes"
              description="Mukta, Neelam, Usha and Sandhya are designed independently — dark themes declare their own base values instead of inverting the light ones."
              media={
                <ShowcaseFrame chrome="window" title="Dashboard">
                  <ProductArt height={200} />
                </ShowcaseFrame>
              }
            />
            <BentoCard icon={<Blocks />} title="Application shell" description="Sidebar, top bar, ⌘K palette and a mobile tab bar that already agree with each other." />
            <BentoCard icon={<Table2 />} title="Data tables" description="Sorting, filters, pinned columns and bulk actions." />
            <BentoCard span={3} icon={<BarChart3 />} title="Charts, calendar and an editor" description="Optional packages that stay on the same tokens — no second design language to maintain." />
          </BentoGrid>
        </MarketingSection>

        <MarketingSection>
          <SplitFeatureGroup>
            <SplitFeature
              eyebrow="Data tables"
              title="Tables that hold up under real data"
              description="Sorting, filters, pinned columns and bulk actions — with a mobile layout that stays usable instead of turning into a horizontal scroll."
              bullets={["Column pinning and visibility", "Row selection with bulk actions", "Toolbar filters that read the same tokens"]}
              actions={
                <Button variant="secondary" asChild>
                  <Link to="/components/data-table">See DataTable</Link>
                </Button>
              }
              media={
                <ShowcaseFrame url="app.sweyam.com">
                  <ProductArt height={240} />
                </ShowcaseFrame>
              }
            />
            <SplitFeature
              eyebrow="Charts"
              title="Charts that follow the theme"
              description="Bar, line, area, pie, maps and sparklines read the same visualization tokens as everything else — so there is no second design language to keep in sync."
              bullets={["Theme-aware series colours", "Zoom, brush and export toolbars", "Tabular figures throughout"]}
              actions={
                <Button variant="secondary" asChild>
                  <Link to="/components/bar-chart">See the charts</Link>
                </Button>
              }
              media={
                <ShowcaseFrame chrome="window" title="Revenue">
                  <ProductArt height={240} />
                </ShowcaseFrame>
              }
            />
          </SplitFeatureGroup>
        </MarketingSection>

        <MarketingSection>
          <SectionHeading align="center" eyebrow="How it works" title="Three steps to a themed screen" />
          <StepFlow
            steps={[
              { title: "Install", description: "One package and one prebuilt stylesheet. No Tailwind required in your app." },
              { title: "Pick a theme", description: "Wrap the app in SpatikaThemeProvider, or overlay your brand with createTheme." },
              { title: "Compose", description: "Build screens from primitives, composites and patterns — the same ones this page uses." },
            ]}
          />
        </MarketingSection>

        <MarketingSection tone="wash" edge="both">
          <SectionHeading align="center" eyebrow="Customers" title="What teams say" />
          <div className="grid gap-4 md:grid-cols-3">
            {QUOTES.map((quote, index) => (
              <Reveal key={quote.author} delay={index * 80}>
                <TestimonialCard
                  {...quote}
                  variant={index === 1 ? "featured" : "card"}
                  avatar={<InitialsAvatar name={quote.author} className="size-9" />}
                />
              </Reveal>
            ))}
          </div>
          <div className="mt-12">
            <Marquee duration={45}>
              {LOGOS.map((logo) => (
                <span key={logo} className="text-title-2 text-fg-tertiary">
                  {logo}
                </span>
              ))}
            </Marquee>
          </div>
        </MarketingSection>

        <MarketingSection id="pricing">
          <SectionHeading
            align="center"
            eyebrow="Pricing"
            title="Free forever, paid when you need the extras"
            subtitle="The library itself is MIT licensed. Paid plans cover hosted design tokens and support."
          />
          <PricingTable
            columns={3}
            toolbar={
              <SegmentedControl
                aria-label="Billing period"
                value={billing}
                onChange={setBilling}
                options={[
                  { value: "monthly", label: "Monthly" },
                  { value: "yearly", label: "Yearly · −20%" },
                ]}
              />
            }
          >
            <PricingCard
              name="Open source"
              price="$0"
              period="forever"
              description="Everything in the npm packages."
              features={["All 180+ components", "Four themes", "Community support"]}
              action={
                <Button variant="secondary" className="w-full" asChild>
                  <Link to="/guides">Install</Link>
                </Button>
              }
            />
            <PricingCard
              featured
              badge="Most popular"
              name="Team"
              price={yearly ? "$15" : "$19"}
              period="/seat / month"
              description="For product teams sharing a brand."
              features={[
                "Everything in Open source",
                "Hosted brand tokens",
                "Figma kit",
                { label: "SAML", excluded: true },
              ]}
              action={<Button className="w-full">Start trial</Button>}
              note="14 days, no card required"
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              description="For platform teams with many apps."
              features={["Everything in Team", "SAML and SCIM", "Priority support", "Design review"]}
              action={
                <Button variant="secondary" className="w-full">
                  Talk to us
                </Button>
              }
            />
          </PricingTable>

          <div className="mt-14">
            <SectionHeading
              align="center"
              title="Compare the plans"
              subtitle="Everything in the open source package stays free, forever."
              showRule={false}
            />
            <ComparisonTable
              caption="Comparison of the Open source, Team and Enterprise plans"
              columns={[
                { id: "free", label: "Open source", description: "For side projects" },
                { id: "team", label: "Team", description: "For product teams", featured: true, badge: "Popular" },
                { id: "ent", label: "Enterprise", description: "For platform teams" },
              ]}
              groups={[
                {
                  label: "The library",
                  rows: [
                    { label: "All 180+ components", values: { free: true, team: true, ent: true } },
                    { label: "Four designed themes", values: { free: true, team: true, ent: true } },
                    { label: "Charts, calendar and editor", values: { free: true, team: true, ent: true } },
                  ],
                },
                {
                  label: "Brand and collaboration",
                  rows: [
                    { label: "Hosted brand tokens", values: { free: false, team: true, ent: true } },
                    { label: "Figma kit", values: { free: false, team: true, ent: true } },
                    { label: "Seats", values: { free: "Unlimited", team: "Per seat", ent: "Unlimited" } },
                  ],
                },
                {
                  label: "Security and support",
                  rows: [
                    { label: "Community support", values: { free: true, team: true, ent: true } },
                    { label: "Priority support", values: { free: false, team: true, ent: true } },
                    { label: "SAML and SCIM", hint: "Okta, Entra, Google", values: { free: false, team: false, ent: true } },
                    { label: "Design review", values: { free: false, team: false, ent: true } },
                  ],
                },
              ]}
            />
          </div>
        </MarketingSection>

        <MarketingSection tone="wash" edge="top">
          <SectionHeading
            eyebrow="Writing"
            title="From the changelog"
            subtitle="Release notes and design notes from the team building it."
          />
          <div className="grid gap-4 md:grid-cols-3">
            <ArticleCard
              href="/guides"
              title="Spatika 2.1 adds a marketing layer"
              excerpt="Landing pages now run on the same tokens as your product screens — heroes, pricing, testimonials and CTAs."
              author="Sreelal Chalil"
              authorAvatar={<InitialsAvatar name="Sreelal Chalil" className="size-6" />}
              date="21 Sep 2026"
              readingTime="6 min read"
            />
            <ArticleCard
              href="/design"
              title="Four themes that are not inversions"
              excerpt="Why Neelam declares its own base values instead of flipping Mukta upside down."
              author="Sreelal Chalil"
              authorAvatar={<InitialsAvatar name="Sreelal Chalil" className="size-6" />}
              date="4 Sep 2026"
              readingTime="9 min read"
            />
            <ArticleCard
              href="/customize"
              title="Density is one attribute"
              excerpt="How a single data-density switch retunes an entire region from consumer to admin console."
              author="Sreelal Chalil"
              authorAvatar={<InitialsAvatar name="Sreelal Chalil" className="size-6" />}
              date="18 Aug 2026"
              readingTime="4 min read"
            />
          </div>
        </MarketingSection>

        <MarketingSection id="faq" tone="wash" edge="top">
          <FaqSection
            structuredData
            title="Questions"
            description="Still stuck? The guides cover installation, theming and publishing in more depth."
            items={FAQS}
            aside={
              <Button variant="secondary" asChild>
                <Link to="/guides">Read the guides</Link>
              </Button>
            }
          />
        </MarketingSection>

        <MarketingSection tone="wash" spacing="tight">
          <CtaBand
            tone="accent"
            backdrop={{ kind: "rays", strength: 0.5 }}
            title="Start building today"
            description="Install the package and have a themed, accessible screen running in minutes."
            actions={
              <Button size="lg" variant="secondary" asChild>
                <Link to="/guides">Get started</Link>
              </Button>
            }
            note="MIT licensed · Works with React 18 and 19"
          />
        </MarketingSection>
      </main>

      <SiteFooter
        brand={<Wordmark name="Spatika" accent=" UI" />}
        description="A React design system for product teams — and now for the pages around the product."
        action={
          <LeadForm
            label="Release notes"
            action="Subscribe"
            placeholder="you@company.com"
            note="Release notes only. No marketing email."
            onSubmit={async () => {
              await new Promise((resolve) => setTimeout(resolve, 600));
            }}
          />
        }
        columns={[
          {
            title: "Product",
            links: [
              { href: "/components", label: "Components" },
              { href: "/design", label: "Design language" },
              { href: "/customize", label: "Theming" },
              { href: "/showcase", label: "Showcase" },
            ],
          },
          {
            title: "Resources",
            links: [
              { href: "/guides", label: "Guides" },
              { href: "/llms.txt", label: "For AI agents" },
              { href: "https://www.npmjs.com/package/@spatika/react", label: "npm" },
            ],
          },
          {
            title: "Project",
            links: [
              { href: "https://github.com/SreelalChalil/spatika", label: "GitHub" },
              { href: "/guides#contribute", label: "Contribute" },
              { href: "/guides#publishing", label: "Releases" },
            ],
          },
        ]}
        copyright="© 2026 Sweyam · Built with Spatika"
        legal={
          <span className="inline-flex items-center gap-1.5">
            <Check className="size-3.5" /> MIT licensed
          </span>
        }
      />

      <div className="fixed bottom-4 left-4 z-50">
        <Button size="sm" variant="secondary" asChild>
          <Link to="/showcase">
            <ArrowLeft className="size-4" /> All showcases
          </Link>
        </Button>
      </div>
    </div>
  );
}
