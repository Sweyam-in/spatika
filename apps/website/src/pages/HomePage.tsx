import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  FileText,
  Home,
  Layers,
  Rows3,
  Search,
  Settings,
  Sparkles,
  Type,
  Users,
} from "lucide-react";
import {
  AppShell,
  AreaChart,
  Badge,
  Button,
  Card,
  Checkbox,
  DataTable,
  IconButton,
  Input,
  Metric,
  MetricGroup,
  NavItem,
  NavSection,
  PageHeader,
  Panel,
  SegmentedControl,
  Sidebar,
  SparkLineChart,
  Switch,
  TopBar,
  WorkspaceSwitcher,
  type DataTableColumn,
} from "@spatika/react";
import { AiFirstSection } from "@/components/AiFirstSection";
import { ContributeSection } from "@/components/ContributeSection";
import { ExtensionsSection } from "@/components/ExtensionsSection";
import { FAQS } from "@/data/seo";
import { INSTALL, SITE } from "@/data/site";
import { SHOWCASE_SCREENS, ScreenArt } from "@/showcase/screens/ShowcaseIndexPage";

const principles = [
  {
    icon: Layers,
    title: "Calm surfaces",
    body: "Solid material, hairline borders and restrained elevation. Glass is an opt-in material for chrome that floats over content.",
  },
  {
    icon: Type,
    title: "Hierarchy through type",
    body: "Size, weight and spacing carry structure. Sections are headings, not nested cards; numbers use tabular figures.",
  },
  {
    icon: Rows3,
    title: "Professional density",
    body: "Every control reads its size from density tokens. One attribute turns a consumer layout into an admin console.",
  },
  {
    icon: Sparkles,
    title: "Quiet personality",
    body: "A facet edge on raised material, a prism rail on active items, a crisp focus ring. Recognisable, never loud.",
  },
];

type Invoice = { id: string; customer: string; status: "paid" | "due" | "overdue" | "draft"; issued: string; amount: number };

const invoices: Invoice[] = [
  { id: "INV-2041", customer: "Lumen Labs", status: "paid", issued: "Sep 02", amount: 12_480 },
  { id: "INV-2042", customer: "Parallel Freight", status: "due", issued: "Sep 04", amount: 3_920.5 },
  { id: "INV-2043", customer: "Orchard Health", status: "overdue", issued: "Aug 21", amount: 8_150 },
  { id: "INV-2044", customer: "Kite & Key", status: "paid", issued: "Aug 30", amount: 1_240 },
  { id: "INV-2045", customer: "Northwind Analytics", status: "draft", issued: "Sep 09", amount: 22_000 },
  { id: "INV-2046", customer: "Juniper Retail", status: "due", issued: "Sep 10", amount: 640.75 },
];

const statusBadge: Record<Invoice["status"], { label: string; variant: "success" | "info" | "danger" | "neutral" }> = {
  paid: { label: "Paid", variant: "success" },
  due: { label: "Due", variant: "info" },
  overdue: { label: "Overdue", variant: "danger" },
  draft: { label: "Draft", variant: "neutral" },
};

const usd = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const invoiceColumns: DataTableColumn<Invoice>[] = [
  { id: "id", header: "Invoice", accessor: (r) => r.id, sortable: true, mobile: "subtitle", cell: (r) => <span className="spk-numeric">{r.id}</span> },
  { id: "customer", header: "Customer", accessor: (r) => r.customer, sortable: true, mobile: "title" },
  {
    id: "status",
    header: "Status",
    accessor: (r) => r.status,
    sortable: true,
    mobile: "subtitle",
    cell: (r) => (
      <Badge variant={statusBadge[r.status].variant} dot>
        {statusBadge[r.status].label}
      </Badge>
    ),
  },
  { id: "issued", header: "Issued", accessor: (r) => r.issued, hideBelow: "lg" },
  { id: "amount", header: "Amount", accessor: (r) => r.amount, sortable: true, numeric: true, cell: (r) => usd(r.amount) },
];

/** The same composition rendered in two themes side by side. */
function PreviewPane({ theme, label }: { theme: "mukta" | "neelam"; label: string }) {
  const [on, setOn] = useState(true);
  const [period, setPeriod] = useState("30d");
  return (
    <div className={`home-preview-pane ${theme}`} data-spk-theme={theme}>
      <div className="home-preview-label">
        <span>{label}</span>
        <code>{theme}</code>
      </div>
      <div className="home-preview-stack">
        <Card padding="none">
          <MetricGroup columns={2}>
            <Metric
              label="Revenue"
              value={48_210}
              format="currency"
              precision={0}
              delta={0.124}
              caption="vs last period"
              chart={<SparkLineChart data={[31, 34, 33, 38, 41, 39, 44, 48]} height={28} showHighlight={false} />}
            />
            <Metric label="Refund rate" value={0.021} format="percent" delta={-0.003} deltaIntent="inverse" caption="Target < 3%" />
          </MetricGroup>
        </Card>
        <div className="home-row">
          <SegmentedControl
            aria-label={`${label} period`}
            size="sm"
            value={period}
            onChange={setPeriod}
            options={[
              { value: "7d", label: "7d" },
              { value: "30d", label: "30d" },
              { value: "90d", label: "90d" },
            ]}
          />
          <Badge variant="success" dot>
            Live
          </Badge>
          <Badge variant="warning">3 flagged</Badge>
        </div>
        <Input leading={<Search />} placeholder="Search customers" aria-label={`${label} search`} />
        <div className="home-row">
          <Button size="sm">Create invoice</Button>
          <Button size="sm" variant="secondary">
            Export
          </Button>
          <Button size="sm" variant="ghost">
            Cancel
          </Button>
        </div>
        <div className="home-row">
          <Switch checked={on} onCheckedChange={setOn} aria-label={`${label} auto-pay`} />
          <span className="screen-muted">Auto-pay {on ? "on" : "off"}</span>
          <Checkbox defaultChecked aria-label={`${label} reminders`} />
          <span className="screen-muted">Reminders</span>
        </div>
      </div>
    </div>
  );
}

function InstallLine() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="home-install">
      <span>{INSTALL.both}</span>
      <IconButton
        size="xs"
        aria-label={copied ? "Copied" : "Copy install command"}
        onClick={() => {
          void navigator.clipboard?.writeText(INSTALL.both).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          });
        }}
      >
        {copied ? <Check /> : <Copy />}
      </IconButton>
    </div>
  );
}

function ShellPreview() {
  const [nav, setNav] = useState("customers");
  return (
    <div className="home-shell-frame">
      <AppShell
        sidebar={
          <Sidebar
            header={
              <WorkspaceSwitcher
                value="sweyam"
                onValueChange={() => undefined}
                workspaces={[
                  { id: "sweyam", name: "Sweyam Cloud", description: "Scale plan" },
                  { id: "globex", name: "Globex", description: "Growth plan" },
                ]}
              />
            }
            footer={<NavItem icon={<Settings />} label="Settings" />}
          >
            <NavSection>
              <NavItem icon={<Home />} label="Overview" active={nav === "overview"} onClick={() => setNav("overview")} />
              <NavItem icon={<Users />} label="Customers" meta="1,284" active={nav === "customers"} onClick={() => setNav("customers")} />
              <NavItem icon={<FileText />} label="Invoices" meta="3" active={nav === "invoices"} onClick={() => setNav("invoices")} />
            </NavSection>
            <NavSection title="Projects">
              <NavItem icon={<span className="screen-dot" style={{ background: "var(--spk-viz-1)" }} />} label="Q4 launch" />
              <NavItem icon={<span className="screen-dot" style={{ background: "var(--spk-viz-2)" }} />} label="Billing v2" />
            </NavSection>
          </Sidebar>
        }
        topbar={
          <TopBar
            title="Customers"
            hideSidebarToggle
            actions={
              <Button size="sm" variant="secondary">
                Export
              </Button>
            }
          />
        }
      >
        <div className="home-shell-body">
          <PageHeader title="Customers" description="1,284 active accounts across 4 regions." />
          <Card padding="none">
            <MetricGroup columns={3}>
              <Metric label="MRR" value={184_320} format="currency" precision={0} delta={0.064} />
              <Metric label="Active" value={1_284} delta={0.031} />
              <Metric label="Churn" value={0.018} format="percent" delta={-0.004} deltaIntent="inverse" />
            </MetricGroup>
          </Card>
        </div>
      </AppShell>
    </div>
  );
}

export function HomePage() {
  const [density, setDensity] = useState<"compact" | "comfortable">("compact");

  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-wrap">
          <div className="home-eyebrow">
            <span className="home-version">2.0</span>
            <span>
              Open source · MIT ·{" "}
              <a href={SITE.sweyamUrl} target="_blank" rel="noreferrer">
                {SITE.sweyam}
              </a>
            </span>
          </div>
          <h1 className="home-title">
            Spatika UI
            <span>clarity, not frost.</span>
          </h1>
          <p className="home-tagline">{SITE.tagline}</p>
          <p className="home-lead">
            Spatika (Sanskrit स्फटिक, crystal — often spelled <strong>Spadik</strong>) is {SITE.sweyam}&apos;s
            AI-first, open-source React toolkit for SaaS, finance, productivity and admin software:
            semantic tokens, density control, an application shell, data tables, charts, a calendar
            and an editor that all speak the same visual language, plus a skill and MCP server so
            coding agents can use the real APIs instead of guessing.
          </p>
          <div className="home-actions">
            <Button asChild size="lg" trailingIcon={<ArrowRight />}>
              <Link to="/guides#installation">Get started</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/components">Browse components</Link>
            </Button>
            <InstallLine />
          </div>

          <div className="home-preview" aria-label="The same components in light and dark themes">
            <PreviewPane theme="mukta" label="Mukta · light" />
            <PreviewPane theme="neelam" label="Neelam · dark" />
          </div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="principles-heading">
        <div className="home-wrap">
          <div className="home-section-head">
            <div>
              <p className="home-kicker">Design language</p>
              <h2 id="principles-heading" className="home-h2">
                Restrained by default, expressive when it matters.
              </h2>
            </div>
            <p className="home-sub">
              2.0 rebuilds Spatika from the tokens up — fewer boxes, clearer type, calmer surfaces —
              so the product in front of your users gets the attention.
            </p>
          </div>
          <div className="home-principles">
            {principles.map(({ icon: Icon, title, body }) => (
              <article key={title} className="home-principle">
                <Icon aria-hidden />
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="data-heading">
        <div className="home-wrap">
          <div className="home-section-head">
            <div>
              <p className="home-kicker">Data-heavy UI</p>
              <h2 id="data-heading" className="home-h2">
                Data is the interface.
              </h2>
            </div>
            <p className="home-sub">
              Sorting, selection, pinned columns, sticky headers and a phone list layout come with{" "}
              <code>DataTable</code>. Metrics, deltas and charts share one numeric voice.
            </p>
          </div>
          <div className="home-density-bar">
            <SegmentedControl
              aria-label="Density"
              value={density}
              onChange={setDensity}
              options={[
                { value: "compact", label: "Compact" },
                { value: "comfortable", label: "Comfortable" },
              ]}
            />
            <span className="screen-muted">
              <code>data-density="{density}"</code>
            </span>
          </div>
          <div className="home-data" data-density={density}>
            <DataTable
              aria-label="Invoices"
              data={invoices}
              columns={invoiceColumns}
              getRowId={(r) => r.id}
              selectable
              defaultSort={{ id: "amount", direction: "desc" }}
              bulkActions={(rows, clear) => (
                <Button size="xs" variant="secondary" onClick={clear}>
                  Send {rows.length} reminders
                </Button>
              )}
            />
            <Panel title="Collected" description="Last 12 weeks">
              <Metric label="This quarter" value={284_910} format="currency" precision={0} delta={0.082} caption="vs Q2" size="lg" />
              <div style={{ marginTop: "1rem" }}>
                <AreaChart
                  height={150}
                  hideLegend
                  showMark={false}
                  xAxis={[{ data: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"] }]}
                  yAxis={[{ min: 0, valueFormatter: (v) => `$${v}k` }]}
                  series={[{ label: "Collected", data: [18, 21, 19, 24, 22, 26, 25, 23, 27, 29, 28, 32] }]}
                />
              </div>
            </Panel>
          </div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="shell-heading">
        <div className="home-wrap">
          <div className="home-section-head">
            <div>
              <p className="home-kicker">Application shell</p>
              <h2 id="shell-heading" className="home-h2">
                Start on the product, not the frame.
              </h2>
            </div>
            <p className="home-sub">
              <code>AppShell</code>, <code>Sidebar</code>, <code>NavItem</code>, <code>TopBar</code>,
              workspace and user menus. The rail collapses on desktop, becomes a sheet on phones, and
              the inset layout frames your content.
            </p>
          </div>
          <ShellPreview />
        </div>
      </section>

      <section className="home-section" aria-labelledby="screens-heading">
        <div className="home-wrap">
          <div className="home-section-head">
            <div>
              <p className="home-kicker">Showcase</p>
              <h2 id="screens-heading" className="home-h2">
                Three complete applications.
              </h2>
            </div>
            <p className="home-sub">Built only with Spatika components — no custom component styling.</p>
          </div>
          <div className="home-screens">
            {SHOWCASE_SCREENS.map((screen) => (
              <Link key={screen.to} to={screen.to} className="home-screen">
                <ScreenArt kind={screen.art} />
                <h3>
                  {screen.title}
                  <ArrowUpRight aria-hidden />
                </h3>
                <p>{screen.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ExtensionsSection />

      <AiFirstSection />

      <section className="seo-faq" aria-labelledby="faq-heading">
        <div className="seo-faq-header">
          <h2 id="faq-heading">Questions</h2>
          <p>If you searched for Spadik, you found the right library — स्फटिक, often romanized that way.</p>
        </div>
        <div className="seo-faq-list">
          {FAQS.map((faq) => (
            <details key={faq.question} className="seo-faq-item">
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <ContributeSection />
    </div>
  );
}
