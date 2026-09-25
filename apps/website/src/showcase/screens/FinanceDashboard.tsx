import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Bell,
  CreditCard,
  Goal,
  Home,
  Landmark,
  LineChart as LineChartIcon,
  PiggyBank,
  Plus,
  Settings,
  Tags,
} from "lucide-react";
import {
  AppShell,
  AreaChart,
  Badge,
  BarChart,
  Breadcrumb,
  Button,
  Card,
  CommandPalette,
  DataTable,
  IconButton,
  Metric,
  MetricGroup,
  MobileTabBar,
  NavItem,
  NavSection,
  PageHeader,
  PageSection,
  Panel,
  PieChart,
  Progress,
  SearchTrigger,
  SegmentedControl,
  Sidebar,
  SparkLineChart,
  Toaster,
  TopBar,
  formatCompact,
  useToast,
  type DataTableColumn,
} from "@spatika/react";
import {
  MONTHS_12,
  MONTHS_6,
  accounts,
  cashflow,
  goals,
  netWorthSeries,
  spendingByCategory,
  transactions,
  type Transaction,
} from "./data";
import { Brand, ScreenUserMenu, money, shortDate, useSharedCommands } from "./shared";

const NAV = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { id: "budgets", label: "Budgets", icon: PiggyBank },
  { id: "goals", label: "Goals", icon: Goal },
  { id: "investments", label: "Investments", icon: LineChartIcon },
] as const;

type Period = "1m" | "3m" | "1y";

export function FinanceDashboard() {
  return (
    <Toaster position="bottom-right">
      <FinanceScreen />
    </Toaster>
  );
}

function FinanceScreen() {
  const [nav, setNav] = useState<string>("overview");
  const [period, setPeriod] = useState<Period>("1y");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const { toast } = useToast();
  const shared = useSharedCommands();

  const series = useMemo(() => {
    const take = period === "1m" ? 2 : period === "3m" ? 4 : 12;
    return { labels: MONTHS_12.slice(-take), data: netWorthSeries.slice(-take) };
  }, [period]);

  const assets = accounts.filter((a) => a.balance > 0).reduce((sum, a) => sum + a.balance, 0);
  const liabilities = accounts.filter((a) => a.balance < 0).reduce((sum, a) => sum + a.balance, 0);
  const spendTotal = spendingByCategory.reduce((sum, c) => sum + c.value, 0);

  const columns: DataTableColumn<Transaction>[] = [
    {
      id: "merchant",
      header: "Merchant",
      accessor: (t) => t.merchant,
      sortable: true,
      cell: (t) => (
        <span className="screen-cell">
          <span className="screen-mark" aria-hidden>
            {t.merchant.slice(0, 1)}
          </span>
          <span className="screen-cell-text">
            {t.merchant}
            {t.pending ? (
              <Badge variant="neutral" className="screen-cell-badge">
                Pending
              </Badge>
            ) : null}
          </span>
        </span>
      ),
    },
    {
      id: "category",
      header: "Category",
      accessor: (t) => t.category,
      sortable: true,
      hideBelow: "lg",
      mobile: "subtitle",
      cell: (t) => <Badge variant={t.amount > 0 ? "success" : "neutral"}>{t.category}</Badge>,
    },
    { id: "account", header: "Account", accessor: (t) => t.account, hideBelow: "md", cell: (t) => <span className="screen-muted">{t.account}</span> },
    { id: "date", header: "Date", accessor: (t) => t.date, sortable: true, mobile: "subtitle", cell: (t) => shortDate(t.date), width: 96 },
    {
      id: "amount",
      header: "Amount",
      accessor: (t) => t.amount,
      sortable: true,
      numeric: true,
      width: 120,
      cell: (t) => <span className={t.amount > 0 ? "spk-positive" : undefined}>{money(t.amount)}</span>,
    },
  ];

  const commands = [
    {
      heading: "Kasho",
      items: [
        { id: "add-tx", label: "Add transaction", shortcut: ["N"], onSelect: () => toast({ title: "New transaction", description: "The form would open here." }) },
        { id: "link", label: "Link an account", onSelect: () => toast({ title: "Account linking started", tone: "info" as const }) },
        ...NAV.map((item) => ({ id: `nav-${item.id}`, label: `Go to ${item.label}`, onSelect: () => setNav(item.id) })),
      ],
    },
    ...shared,
  ];

  return (
    <>
      <AppShell
        sidebar={
          <Sidebar
            header={<Brand mark="K" name="Kasho" />}
            footer={
              <>
                <NavItem icon={<Settings />} label="Settings" />
                <ScreenUserMenu name="Maya Okafor" email="maya@kasho.app" />
              </>
            }
          >
            <NavSection>
              {NAV.map((item) => (
                <NavItem key={item.id} icon={<item.icon />} label={item.label} active={nav === item.id} onClick={() => setNav(item.id)} />
              ))}
            </NavSection>
            <NavSection title="Accounts">
              {accounts.map((account) => (
                <NavItem
                  key={account.id}
                  icon={<span className="screen-dot" style={{ background: account.color }} aria-hidden />}
                  label={account.name}
                  meta={formatCompact(account.balance, { precision: 1 })}
                />
              ))}
            </NavSection>
          </Sidebar>
        }
        topbar={
          <TopBar
            title={<Breadcrumb className="max-md:hidden" items={[{ label: "Kasho", href: "#" }, { label: "Overview" }]} />}
            actions={
              <>
                <IconButton aria-label="Notifications" size="sm">
                  <Bell />
                </IconButton>
                <Button
                  size="sm"
                  aria-label="Add transaction"
                  leadingIcon={<Plus />}
                  onClick={() => toast({ title: "New transaction", description: "The form would open here." })}
                >
                  <span className="max-sm:hidden">Add transaction</span>
                </Button>
              </>
            }
          >
            <SearchTrigger placeholder="Search transactions, accounts…" onOpen={() => setPaletteOpen(true)} />
          </TopBar>
        }
        mobileNav={
          <MobileTabBar
            items={[
              { id: "overview", label: "Overview", icon: Home, active: nav === "overview", onClick: () => setNav("overview") },
              { id: "transactions", label: "Activity", icon: ArrowLeftRight, active: nav === "transactions", onClick: () => setNav("transactions") },
              { id: "budgets", label: "Budgets", icon: Tags, active: nav === "budgets", onClick: () => setNav("budgets") },
              { id: "accounts", label: "Accounts", icon: Landmark, active: nav === "accounts", onClick: () => setNav("accounts") },
              { id: "cards", label: "Cards", icon: CreditCard, active: nav === "cards", onClick: () => setNav("cards") },
            ]}
          />
        }
      >
        <div className="screen">
          <PageHeader
            title="Good morning, Maya"
            description="Here’s where your money stands today."
            actions={
              <SegmentedControl<Period>
                aria-label="Period"
                size="sm"
                value={period}
                onChange={setPeriod}
                options={[
                  { value: "1m", label: "1M" },
                  { value: "3m", label: "3M" },
                  { value: "1y", label: "1Y" },
                ]}
              />
            }
          />

          <section className="screen-hero" aria-label="Net worth">
            <div>
              <Metric
                size="xl"
                label="Net worth"
                value={netWorthSeries[netWorthSeries.length - 1]!}
                format="currency"
                precision={0}
                delta={0.037}
                caption="vs last month"
              />
              <div className="screen-legend" style={{ marginTop: "1.25rem" }}>
                <div className="screen-legend-row">
                  <span className="screen-dot" style={{ background: "var(--spk-viz-2)" }} />
                  <span>Assets</span>
                  <span>{money(assets, 0)}</span>
                </div>
                <div className="screen-legend-row">
                  <span className="screen-dot" style={{ background: "var(--spk-viz-6)" }} />
                  <span>Liabilities</span>
                  <span>{money(liabilities, 0)}</span>
                </div>
              </div>
            </div>
            <AreaChart
              height={220}
              hideLegend
              showMark={false}
              xAxis={[{ data: series.labels }]}
              yAxis={[{ min: 0, valueFormatter: (v) => `$${Math.round(v / 1000)}k` }]}
              series={[{ label: "Net worth", data: series.data }]}
            />
          </section>

          <Card padding="none">
            <MetricGroup columns={4}>
              <Metric label="Cash" value={40_570.55} format="currency" precision={0} delta={0.012} caption="2 accounts" chart={<SparkLineChart data={[38, 39.2, 38.6, 40.1, 39.7, 40.6]} height={28} color="var(--spk-viz-2)" />} />
              <Metric label="Investments" value={191_240.32} format="currency" precision={0} delta={0.052} caption="YTD +11.4%" chart={<SparkLineChart data={[170, 174, 176, 181, 186, 191]} height={28} color="var(--spk-viz-4)" />} />
              <Metric label="Credit card" value={2_184.1} format="currency" precision={0} delta={0.14} deltaIntent="inverse" caption="Due Sep 28" chart={<SparkLineChart data={[1.6, 2.4, 1.9, 2.8, 2.1, 2.18]} height={28} color="var(--spk-viz-6)" />} />
              <Metric label="Spent this month" value={spendTotal} format="currency" precision={0} delta={-0.06} deltaIntent="inverse" caption="of $4,500 budget" chart={<Progress value={spendTotal} max={4_500} size="xs" aria-label="Monthly budget used" />} />
            </MetricGroup>
          </Card>

          <div className="screen-grid screen-grid--2-1">
            <Panel
              title="Cash flow"
              description="Income vs. spending, last 6 months"
              actions={
                <Badge variant="success" dot>
                  +$2,093 avg surplus
                </Badge>
              }
            >
              <BarChart
                height={240}
                legendPosition="bottom"
                xAxis={[{ data: MONTHS_6 }]}
                yAxis={[{ min: 0, valueFormatter: (v) => `$${(v / 1000).toFixed(0)}k` }]}
                series={[
                  { label: "Income", data: cashflow.income, color: "var(--spk-viz-2)" },
                  { label: "Spending", data: cashflow.spending, color: "var(--spk-viz-1)" },
                ]}
              />
            </Panel>
            <Panel title="Spending" description="September, by category">
              <PieChart
                height={170}
                hideLegend
                labelFormatter={() => null}
                series={[{ data: spendingByCategory.map((c) => ({ label: c.label, value: c.value, color: c.color })), innerRadius: 54, paddingAngle: 1.5 }]}
              />
              <div className="screen-legend" style={{ marginTop: "1rem" }}>
                {spendingByCategory.map((c) => (
                  <div key={c.label} className="screen-legend-row">
                    <span className="screen-dot" style={{ background: c.color }} />
                    <span>{c.label}</span>
                    <span>{money(c.value, 0)}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <PageSection
            title="Accounts"
            description="Balances refresh every 15 minutes."
            actions={
              <Button variant="secondary" size="sm" leadingIcon={<Plus />} onClick={() => toast({ title: "Account linking started", tone: "info" })}>
                Link account
              </Button>
            }
          >
            <Card padding="none">
              <ul className="screen-list">
                {accounts.map((account) => (
                  <li key={account.id}>
                    <span className="screen-mark" aria-hidden>
                      {account.institution.slice(0, 2)}
                    </span>
                    <div className="screen-list-main">
                      <div className="screen-list-title">{account.name}</div>
                      <div className="screen-list-meta">
                        {account.kind} · {account.institution} ••{account.mask}
                      </div>
                    </div>
                    <div className="screen-spark" aria-hidden>
                      <SparkLineChart data={account.trend} height={28} color={account.color} showHighlight={false} />
                    </div>
                    <div className={`screen-list-value${account.balance < 0 ? " spk-negative" : ""}`}>{money(account.balance)}</div>
                  </li>
                ))}
              </ul>
            </Card>
          </PageSection>

          <PageSection title="Recent transactions" actions={<Button variant="ghost" size="sm">View all</Button>}>
            <DataTable
              aria-label="Recent transactions"
              data={transactions}
              columns={columns}
              getRowId={(t) => t.id}
              selectable
              selectedIds={selected}
              onSelectedIdsChange={setSelected}
              defaultSort={{ id: "date", direction: "desc" }}
              pageSize={8}
              bulkActions={(rows, clear) => (
                <>
                  <Button size="xs" variant="secondary" onClick={() => { toast({ title: `${rows.length} transactions recategorized`, tone: "success" }); clear(); }}>
                    Categorize
                  </Button>
                  <Button size="xs" variant="secondary" onClick={() => { toast({ title: "Exported to CSV" }); clear(); }}>
                    Export
                  </Button>
                </>
              )}
            />
          </PageSection>

          <PageSection title="Goals" description="Automatic transfers run on the 1st of each month.">
            <div className="screen-grid screen-grid--3">
              {goals.map((goal) => {
                const pct = goal.saved / goal.target;
                return (
                  <Card key={goal.id} className="screen-goal">
                    <div className="screen-goal-head">
                      <h3 className="spk-text-title-3">{goal.name}</h3>
                      <span className="screen-muted spk-numeric">{Math.round(pct * 100)}%</span>
                    </div>
                    <p className="spk-numeric" style={{ margin: 0 }}>
                      <strong>{money(goal.saved, 0)}</strong> <span className="screen-muted">of {money(goal.target, 0)}</span>
                    </p>
                    <Progress
                      value={goal.saved}
                      max={goal.target}
                      tone={pct > 0.8 ? "success" : pct < 0.45 ? "warning" : "accent"}
                      aria-label={`${goal.name} saved`}
                      aria-valuetext={`${money(goal.saved, 0)} of ${money(goal.target, 0)}`}
                    />
                    <p className="screen-muted" style={{ margin: 0 }}>
                      {goal.note}
                    </p>
                  </Card>
                );
              })}
            </div>
          </PageSection>
        </div>
      </AppShell>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} groups={commands} />
    </>
  );
}
