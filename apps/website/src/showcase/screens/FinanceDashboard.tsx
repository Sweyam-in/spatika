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
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  FormField,
  IconButton,
  Input,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  transactions as seedTransactions,
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

const NAV_LABEL: Record<string, string> = {
  overview: "Overview",
  transactions: "Transactions",
  budgets: "Budgets",
  goals: "Goals",
  investments: "Investments",
  accounts: "Accounts",
  cards: "Cards",
  settings: "Settings",
};

/** Monthly caps already implied by the $4,500 budget on Overview. */
const BUDGET_LIMIT: Record<string, number> = {
  Housing: 2_200,
  Groceries: 700,
  Shopping: 400,
  Dining: 350,
  Transport: 250,
  Other: 600,
};

const CATEGORIES = Object.keys(BUDGET_LIMIT);

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
  const [addOpen, setAddOpen] = useState(false);
  const [accountFilter, setAccountFilter] = useState<string | null>(null);
  const [rows, setRows] = useState<Transaction[]>(seedTransactions);
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

  const visibleTx = useMemo(
    () => (accountFilter ? rows.filter((t) => t.account === accountFilter) : rows),
    [rows, accountFilter],
  );

  const openAccount = (name: string) => {
    setAccountFilter(name);
    setNav("transactions");
  };

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
        { id: "add-tx", label: "Add transaction", shortcut: ["N"], onSelect: () => setAddOpen(true) },
        { id: "link", label: "Link an account", onSelect: () => setNav("accounts") },
        ...NAV.map((item) => ({ id: `nav-${item.id}`, label: `Go to ${item.label}`, onSelect: () => setNav(item.id) })),
      ],
    },
    ...shared,
  ];

  const title = NAV_LABEL[nav] ?? "Overview";

  return (
    <>
      <AppShell
        sidebar={
          <Sidebar
            header={<Brand mark="K" name="Kasho" />}
            footer={
              <>
                <NavItem icon={<Settings />} label="Settings" active={nav === "settings"} onClick={() => setNav("settings")} />
                <ScreenUserMenu name="Maya Okafor" email="maya@kasho.app" />
              </>
            }
          >
            <NavSection>
              {NAV.map((item) => (
                <NavItem
                  key={item.id}
                  icon={<item.icon />}
                  label={item.label}
                  active={nav === item.id}
                  onClick={() => {
                    setAccountFilter(null);
                    setNav(item.id);
                  }}
                />
              ))}
            </NavSection>
            <NavSection title="Accounts">
              {accounts.map((account) => (
                <NavItem
                  key={account.id}
                  icon={<span className="screen-dot" style={{ background: account.color }} aria-hidden />}
                  label={account.name}
                  meta={formatCompact(account.balance, { precision: 1 })}
                  active={nav === "transactions" && accountFilter === account.name}
                  onClick={() => openAccount(account.name)}
                />
              ))}
            </NavSection>
          </Sidebar>
        }
        topbar={
          <TopBar
            title={<Breadcrumb className="max-md:hidden" items={[{ label: "Kasho", href: "#" }, { label: title }]} />}
            actions={
              <>
                <IconButton aria-label="Notifications" size="sm" onClick={() => toast({ title: "No new alerts", description: "Pending charges still show on Transactions." })}>
                  <Bell />
                </IconButton>
                <Button size="sm" aria-label="Add transaction" leadingIcon={<Plus />} onClick={() => setAddOpen(true)}>
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
              { id: "transactions", label: "Activity", icon: ArrowLeftRight, active: nav === "transactions", onClick: () => { setAccountFilter(null); setNav("transactions"); } },
              { id: "budgets", label: "Budgets", icon: Tags, active: nav === "budgets", onClick: () => setNav("budgets") },
              { id: "accounts", label: "Accounts", icon: Landmark, active: nav === "accounts", onClick: () => setNav("accounts") },
              { id: "cards", label: "Cards", icon: CreditCard, active: nav === "cards", onClick: () => setNav("cards") },
            ]}
          />
        }
      >
        <div className="screen">
          {nav === "overview" ? (
            <Overview
              period={period}
              onPeriod={setPeriod}
              series={series}
              assets={assets}
              liabilities={liabilities}
              spendTotal={spendTotal}
              recent={rows.slice(0, 4)}
              onSeeTransactions={() => {
                setAccountFilter(null);
                setNav("transactions");
              }}
              onSeeBudgets={() => setNav("budgets")}
            />
          ) : null}

          {nav === "transactions" ? (
            <PageHeader
              title={accountFilter ? accountFilter : "Transactions"}
              description={accountFilter ? "Activity on this account." : "Income, spending and transfers across every linked account."}
              actions={
                accountFilter ? (
                  <Button variant="secondary" size="sm" onClick={() => setAccountFilter(null)}>
                    All accounts
                  </Button>
                ) : (
                  <Button size="sm" leadingIcon={<Plus />} onClick={() => setAddOpen(true)}>
                    Add transaction
                  </Button>
                )
              }
            />
          ) : null}

          {nav === "transactions" ? (
            <DataTable
              aria-label="Transactions"
              data={visibleTx}
              columns={columns}
              getRowId={(t) => t.id}
              selectable
              selectedIds={selected}
              onSelectedIdsChange={setSelected}
              defaultSort={{ id: "date", direction: "desc" }}
              pageSize={10}
              empty={
                <EmptyState
                  variant="plain"
                  title="Nothing in this account yet"
                  description="New charges and transfers will show up here."
                  actionLabel="Add transaction"
                  onAction={() => setAddOpen(true)}
                />
              }
              bulkActions={(selectedRows, clear) => (
                <>
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => {
                      toast({ title: `${selectedRows.length} transactions recategorized`, tone: "success" });
                      clear();
                    }}
                  >
                    Categorize
                  </Button>
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => {
                      toast({ title: "Exported to CSV" });
                      clear();
                    }}
                  >
                    Export
                  </Button>
                </>
              )}
            />
          ) : null}

          {nav === "budgets" ? <Budgets spendTotal={spendTotal} onAdd={() => setAddOpen(true)} /> : null}
          {nav === "goals" ? <Goals /> : null}
          {nav === "investments" ? <AccountList kinds={["Brokerage", "Retirement"]} title="Investments" description="Brokerage and retirement balances, refreshed every 15 minutes." /> : null}
          {nav === "accounts" ? <AccountList title="Accounts" description="Checking, savings, investments and cards linked to Kasho." onOpen={openAccount} /> : null}
          {nav === "cards" ? <AccountList kinds={["Credit card"]} title="Cards" description="Balances are what you owe, not what you can spend." onOpen={openAccount} /> : null}
          {nav === "settings" ? (
            <>
              <PageHeader title="Settings" description="The profile signed in to this Kasho preview." />
              <Card>
                <dl className="screen-props screen-props--wide">
                  <dt>Name</dt>
                  <dd>Maya Okafor</dd>
                  <dt>Email</dt>
                  <dd>maya@kasho.app</dd>
                  <dt>Linked accounts</dt>
                  <dd className="spk-numeric">{accounts.length}</dd>
                </dl>
              </Card>
            </>
          ) : null}
        </div>
      </AppShell>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} groups={commands} />
      <AddTransactionDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreate={(tx) => {
          setRows((list) => [tx, ...list]);
          setNav("transactions");
          setAccountFilter(null);
          toast({ title: "Transaction added", description: tx.merchant, tone: "success" });
        }}
      />
    </>
  );
}

function Overview({
  period,
  onPeriod,
  series,
  assets,
  liabilities,
  spendTotal,
  recent,
  onSeeTransactions,
  onSeeBudgets,
}: {
  period: Period;
  onPeriod: (period: Period) => void;
  series: { labels: string[]; data: number[] };
  assets: number;
  liabilities: number;
  spendTotal: number;
  recent: Transaction[];
  onSeeTransactions: () => void;
  onSeeBudgets: () => void;
}) {
  return (
    <>
      <PageHeader
        title="Overview"
        description="Net worth, cash and this month’s spending."
        actions={
          <SegmentedControl<Period>
            aria-label="Period"
            size="sm"
            value={period}
            onChange={onPeriod}
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
        <Panel
          title="Spending"
          description="September, by category"
          actions={
            <Button variant="ghost" size="xs" onClick={onSeeBudgets}>
              Budgets
            </Button>
          }
        >
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

      <PageSection title="Latest activity" actions={<Button variant="ghost" size="sm" onClick={onSeeTransactions}>View all</Button>}>
        <Card padding="none">
          <ul className="screen-list">
            {recent.map((tx) => (
              <li key={tx.id}>
                <span className="screen-mark" aria-hidden>
                  {tx.merchant.slice(0, 1)}
                </span>
                <div className="screen-list-main">
                  <div className="screen-list-title">{tx.merchant}</div>
                  <div className="screen-list-meta">
                    {tx.category} · {shortDate(tx.date)}
                  </div>
                </div>
                <div className={`screen-list-value${tx.amount > 0 ? " spk-positive" : ""}`}>{money(tx.amount)}</div>
              </li>
            ))}
          </ul>
        </Card>
      </PageSection>
    </>
  );
}

function Budgets({ spendTotal, onAdd }: { spendTotal: number; onAdd: () => void }) {
  const limit = Object.values(BUDGET_LIMIT).reduce((sum, n) => sum + n, 0);
  return (
    <>
      <PageHeader
        title="Budgets"
        description={`${money(spendTotal, 0)} spent of ${money(limit, 0)} planned for September.`}
        actions={
          <Button size="sm" leadingIcon={<Plus />} onClick={onAdd}>
            Add transaction
          </Button>
        }
      />
      <Card padding="none">
        <ul className="screen-list">
          {spendingByCategory.map((category) => {
            const cap = BUDGET_LIMIT[category.label] ?? category.value;
            const over = category.value > cap;
            return (
              <li key={category.label}>
                <span className="screen-dot" style={{ background: category.color }} aria-hidden />
                <div className="screen-list-main">
                  <div className="screen-list-title">{category.label}</div>
                  <Progress
                    value={category.value}
                    max={cap}
                    size="xs"
                    tone={over ? "danger" : category.value / cap > 0.85 ? "warning" : "accent"}
                    aria-label={`${category.label} budget`}
                  />
                </div>
                <div className={`screen-list-value${over ? " spk-negative" : ""}`}>
                  {money(category.value, 0)}
                  <div className="screen-muted spk-numeric">of {money(cap, 0)}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}

function Goals() {
  return (
    <>
      <PageHeader title="Goals" description="Automatic transfers run on the 1st of each month." />
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
    </>
  );
}

function AccountList({
  title,
  description,
  kinds,
  onOpen,
}: {
  title: string;
  description: string;
  kinds?: Array<(typeof accounts)[number]["kind"]>;
  onOpen?: (name: string) => void;
}) {
  const list = kinds ? accounts.filter((account) => kinds.includes(account.kind)) : accounts;
  return (
    <>
      <PageHeader title={title} description={description} />
      {list.length === 0 ? (
        <EmptyState title="No accounts in this group" description="Link an account and it will appear here." />
      ) : (
        <Card padding="none">
          <ul className="screen-list">
            {list.map((account) => (
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
                {onOpen ? (
                  <Button size="xs" variant="ghost" onClick={() => onOpen(account.name)}>
                    Activity
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}

function AddTransactionDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (tx: Transaction) => void;
}) {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Groceries");
  const [account, setAccount] = useState(accounts[0]!.name);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setMerchant("");
    setAmount("");
    setCategory("Groceries");
    setAccount(accounts[0]!.name);
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add transaction</DialogTitle>
          <DialogDescription>Record a charge or a credit. Outflows are stored as negative amounts.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="grid gap-4">
            <FormField label="Merchant" required error={error ?? undefined}>
              <Input value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="Greenleaf Market" />
            </FormField>
            <FormField label="Amount" required description="Use a minus sign for money leaving an account.">
              <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="-42.50" />
            </FormField>
            <FormField label="Category">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger aria-label="Category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                  <SelectItem value="Income">Income</SelectItem>
                  <SelectItem value="Transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Account">
              <Select value={account} onValueChange={setAccount}>
                <SelectTrigger aria-label="Account">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((item) => (
                    <SelectItem key={item.id} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const parsed = Number(amount.replace(/[$,]/g, ""));
              if (!merchant.trim()) {
                setError("Enter a merchant.");
                return;
              }
              if (!Number.isFinite(parsed) || parsed === 0) {
                setError("Enter a non-zero amount.");
                return;
              }
              onCreate({
                id: `t-${Date.now()}`,
                merchant: merchant.trim(),
                category,
                account,
                date: new Date(),
                amount: parsed,
                pending: true,
              });
              reset();
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
