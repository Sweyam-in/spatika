import { useMemo, useState } from "react";
import {
  Activity,
  Bell,
  Building2,
  CircleHelp,
  CreditCard,
  Download,
  FileText,
  Gauge,
  KeyRound,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Users,
  Zap,
} from "lucide-react";
import {
  AppShell,
  Avatar,
  AvatarFallback,
  Badge,
  BarChart,
  Breadcrumb,
  Button,
  Card,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Chip,
  CommandPalette,
  DataTable,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  FormField,
  HeaderIconButton,
  IconButton,
  Input,
  Metric,
  MetricGroup,
  NavItem,
  NavSection,
  PageHeader,
  Panel,
  Progress,
  SearchTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sidebar,
  SparkLineChart,
  Tabs,
  TabsList,
  TabsTrigger,
  Timeline,
  TimelineItem,
  Toaster,
  TopBar,
  WorkspaceSwitcher,
  getInitials,
  useToast,
  type DataTableColumn,
} from "@spatika/react";
import { MONTHS_6, customers as seedCustomers, mrrMovement, mrrSparks, type Customer, type CustomerStatus, type Plan } from "./data";
import { ScreenUserMenu, money, shortDate, useSharedCommands } from "./shared";

const STATUS: Record<CustomerStatus, { label: string; variant: "success" | "info" | "warning" | "neutral" }> = {
  active: { label: "Active", variant: "success" },
  trialing: { label: "Trialing", variant: "info" },
  past_due: { label: "Past due", variant: "warning" },
  churned: { label: "Churned", variant: "neutral" },
};

const NAV_LABEL: Record<string, string> = {
  overview: "Overview",
  customers: "Customers",
  subscriptions: "Subscriptions",
  invoices: "Invoices",
  usage: "Usage",
  events: "Events",
  team: "Team",
  keys: "API keys",
  settings: "Settings",
  help: "Help",
};

const PLAN_VARIANT: Record<Plan, "neutral" | "accent" | "outline"> = {
  Starter: "neutral",
  Growth: "neutral",
  Scale: "accent",
  Enterprise: "outline",
};

type Tab = "all" | CustomerStatus;

export function AdminConsole() {
  return (
    <Toaster position="bottom-right">
      <AdminScreen />
    </Toaster>
  );
}

function AdminScreen() {
  const [workspace, setWorkspace] = useState("sweyam");
  const [nav, setNav] = useState("customers");
  const [customerList, setCustomerList] = useState(seedCustomers);
  const [addOpen, setAddOpen] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<Customer | null>(null);
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [plan, setPlan] = useState<string>("all");
  const [largeOnly, setLargeOnly] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { toast } = useToast();
  const shared = useSharedCommands();

  const scoped = workspace === "globex" ? customerList.slice(0, 3) : customerList;

  const counts = useMemo(() => {
    const by = { all: scoped.length, active: 0, trialing: 0, past_due: 0, churned: 0 } as Record<Tab, number>;
    scoped.forEach((c) => (by[c.status] += 1));
    return by;
  }, [scoped]);

  const rows = useMemo(
    () =>
      scoped.filter(
        (c) =>
          (tab === "all" || c.status === tab) &&
          (plan === "all" || c.plan === plan) &&
          (!largeOnly || c.seats >= 25) &&
          (!query || `${c.name} ${c.domain} ${c.owner}`.toLowerCase().includes(query.toLowerCase())),
      ),
    [scoped, tab, plan, largeOnly, query],
  );

  const columns: DataTableColumn<Customer>[] = [
    {
      id: "name",
      header: "Customer",
      accessor: (c) => c.name,
      sortable: true,
      pin: "left",
      width: 240,
      cell: (c) => (
        <span className="screen-cell">
          <span className="screen-mark" aria-hidden>
            {getInitials(c.name)}
          </span>
          <span className="screen-cell-stack">
            <span className="screen-list-title">{c.name}</span>
            <span className="screen-list-meta">{c.domain}</span>
          </span>
        </span>
      ),
    },
    { id: "plan", header: "Plan", accessor: (c) => c.plan, sortable: true, mobile: "subtitle", cell: (c) => <Badge variant={PLAN_VARIANT[c.plan]}>{c.plan}</Badge> },
    {
      id: "status",
      header: "Status",
      accessor: (c) => c.status,
      sortable: true,
      mobile: "subtitle",
      cell: (c) => (
        <Badge variant={STATUS[c.status].variant} dot>
          {STATUS[c.status].label}
        </Badge>
      ),
    },
    { id: "mrr", header: "MRR", accessor: (c) => c.mrr, sortable: true, numeric: true, width: 110, cell: (c) => money(c.mrr, 0) },
    { id: "seats", header: "Seats", accessor: (c) => c.seats, sortable: true, numeric: true, width: 80, hideBelow: "md" },
    {
      id: "owner",
      header: "Owner",
      accessor: (c) => c.owner,
      sortable: true,
      hideBelow: "lg",
      truncate: true,
      cell: (c) => (
        <span className="screen-cell">
          <Avatar size="xs">
            <AvatarFallback>{getInitials(c.owner)}</AvatarFallback>
          </Avatar>
          {c.owner}
        </span>
      ),
    },
    { id: "created", header: "Customer since", accessor: (c) => c.created, sortable: true, hideBelow: "xl", cell: (c) => shortDate(c.created) },
    {
      id: "active",
      header: "Last active",
      accessor: (c) => c.lastActive,
      sortable: true,
      hideBelow: "md",
      cell: (c) => <span className="screen-muted">{c.lastActive === 0 ? "Just now" : c.lastActive < 24 ? `${c.lastActive}h ago` : `${Math.round(c.lastActive / 24)}d ago`}</span>,
    },
  ];

  const commands = [
    {
      heading: "Sweyam Cloud",
      items: [
        { id: "new-customer", label: "Add customer", shortcut: ["C"], onSelect: () => setAddOpen(true) },
        { id: "export", label: "Export customers to CSV", onSelect: () => toast({ title: "Export started", description: `${rows.length} customers`, tone: "info" as const }) },
        { id: "go-invoices", label: "Go to Invoices", onSelect: () => setNav("invoices") },
      ],
    },
    ...shared,
  ];

  return (
    <>
      <AppShell
        density="compact"
        sidebar={
          <Sidebar
            header={
              <WorkspaceSwitcher
                value={workspace}
                onValueChange={setWorkspace}
                onCreate={() => toast({ title: "Create workspace" })}
                workspaces={[
                  { id: "sweyam", name: "Sweyam Cloud", description: "Scale · 14 admins" },
                  { id: "globex", name: "Globex", description: "Growth · 3 admins" },
                ]}
              />
            }
            footer={
              <>
                <NavItem icon={<CircleHelp />} label="Help & docs" active={nav === "help"} onClick={() => setNav("help")} />
                <ScreenUserMenu name="Priya Nair" email="priya@sweyam.cloud" />
              </>
            }
          >
            <NavSection>
              <NavItem icon={<LayoutDashboard />} label="Overview" active={nav === "overview"} onClick={() => setNav("overview")} />
              <NavItem icon={<Users />} label="Customers" meta="1,284" active={nav === "customers"} onClick={() => setNav("customers")} />
              <NavItem icon={<CreditCard />} label="Subscriptions" active={nav === "subscriptions"} onClick={() => setNav("subscriptions")} />
              <NavItem icon={<FileText />} label="Invoices" meta="3" active={nav === "invoices"} onClick={() => setNav("invoices")} />
              <NavItem icon={<Gauge />} label="Usage" active={nav === "usage"} onClick={() => setNav("usage")} />
              <NavItem icon={<Activity />} label="Events" active={nav === "events"} onClick={() => setNav("events")} />
            </NavSection>
            <NavSection title="Configure">
              <NavItem icon={<Building2 />} label="Team" active={nav === "team"} onClick={() => setNav("team")} />
              <NavItem icon={<KeyRound />} label="API keys" active={nav === "keys"} onClick={() => setNav("keys")} />
              <NavItem icon={<Settings />} label="Settings" active={nav === "settings"} onClick={() => setNav("settings")} />
            </NavSection>
          </Sidebar>
        }
        topbar={
          <TopBar
            title={<Breadcrumb className="max-md:hidden" items={[{ label: workspace === "globex" ? "Globex" : "Sweyam Cloud", href: "#" }, { label: NAV_LABEL[nav] ?? "Customers" }]} />}
            actions={
              <>
                <HeaderIconButton aria-label="Notifications, 4 unread" badge={4} size="sm">
                  <Bell className="size-4" />
                </HeaderIconButton>
                <ScreenUserMenu name="Priya Nair" email="priya@sweyam.cloud" variant="avatar" />
              </>
            }
          >
            <SearchTrigger placeholder="Search customers, invoices, events…" onOpen={() => setPaletteOpen(true)} />
          </TopBar>
        }
      >
        <div className="screen">
          {nav === "overview" || nav === "customers" ? (
          <PageHeader
            title={NAV_LABEL[nav]}
            description={
              nav === "overview"
                ? "Recurring revenue, movement and the events that changed it."
                : workspace === "globex"
                  ? "Globex workspace · 3 accounts on the Growth plan."
                  : "Accounts, plans and recurring revenue across every region."
            }
            actions={
              nav === "customers" ? (
              <>
                <Button variant="secondary" size="sm" leadingIcon={<Download />} onClick={() => toast({ title: "Export started", description: `${rows.length} customers`, tone: "info" })}>
                  Export
                </Button>
                <Button size="sm" leadingIcon={<Plus />} onClick={() => setAddOpen(true)}>
                  Add customer
                </Button>
              </>
              ) : undefined
            }
          >
            {nav === "customers" ? (
            <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
              <TabsList aria-label="Customer status">
                {(["all", "active", "trialing", "past_due", "churned"] as Tab[]).map((id) => (
                  <TabsTrigger key={id} value={id}>
                    {id === "all" ? "All" : STATUS[id].label}
                    <span className="screen-tab-count spk-numeric">{counts[id]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            ) : null}
          </PageHeader>
          ) : null}

          {nav === "overview" || nav === "customers" ? (
          <Card padding="none">
            <MetricGroup columns={4}>
              <Metric label="MRR" value={workspace === "globex" ? scoped.reduce((sum, c) => sum + c.mrr, 0) : 184_320} format="currency" precision={0} delta={0.064} caption="vs August" chart={<SparkLineChart data={mrrSparks.mrr} height={28} />} />
              <Metric label="Active customers" value={workspace === "globex" ? counts.active : 1_284} delta={0.031} caption="+38 this month" chart={<SparkLineChart data={mrrSparks.customers} height={28} color="var(--spk-viz-2)" />} />
              <Metric label="Net revenue churn" value={0.018} format="percent" delta={-0.004} deltaFormat="percent" deltaIntent="inverse" caption="Target < 2%" chart={<SparkLineChart data={mrrSparks.churn} height={28} color="var(--spk-viz-6)" />} />
              <Metric label="ARPA" value={143.55} format="currency" delta={0.022} caption="Avg revenue per account" chart={<SparkLineChart data={mrrSparks.arpa} height={28} color="var(--spk-viz-4)" />} />
            </MetricGroup>
          </Card>
          ) : null}

          {nav === "overview" ? (
          <div className="screen-grid screen-grid--2-1">
            <Panel title="MRR movement" description="Thousands of dollars per month" actions={<Badge variant="success" dot>Net +$9.8k</Badge>}>
              <BarChart
                height={230}
                stacked
                legendPosition="bottom"
                xAxis={[{ data: MONTHS_6 }]}
                yAxis={[{ valueFormatter: (v) => `$${v}k` }]}
                series={[
                  { label: "New", data: mrrMovement.newBiz, stack: "mrr", color: "var(--spk-viz-1)" },
                  { label: "Expansion", data: mrrMovement.expansion, stack: "mrr", color: "var(--spk-viz-2)" },
                  { label: "Churned", data: mrrMovement.churned, stack: "mrr", color: "var(--spk-viz-6)" },
                ]}
              />
            </Panel>
            <Panel title="Activity" actions={<Button variant="ghost" size="xs" onClick={() => setNav("events")}>View log</Button>}>
              <Timeline>
                <TimelineItem tone="success" title={<><strong>Vela Robotics</strong> upgraded to Enterprise</>} meta="12m" />
                <TimelineItem tone="warning" title={<><strong>Juniper Retail</strong> payment failed</>} meta="1h" description="Card declined · retry scheduled for tomorrow" />
                <TimelineItem tone="accent" title={<><strong>Diego</strong> added 12 seats to Parallel Freight</>} meta="3h" />
                <TimelineItem title={<><strong>Bright Harbor</strong> started a trial</>} meta="5h" />
                <TimelineItem tone="danger" title={<><strong>Quill Legal</strong> cancelled</>} meta="1d" description="Reason: moved to in-house tooling" />
              </Timeline>
            </Panel>
          </div>
          ) : null}

          {nav === "customers" ? (
          <DataTable
            aria-label="Customers"
            data={rows}
            columns={columns}
            getRowId={(c) => c.id}
            selectable
            stickyHeader
            maxHeight={560}
            pageSize={10}
            defaultSort={{ id: "mrr", direction: "desc" }}
            toolbar={
              <>
                <Input
                  size="sm"
                  leading={<Search />}
                  placeholder="Filter by name, domain, owner"
                  aria-label="Filter customers"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  containerClassName="screen-filter-input"
                />
                <Select value={plan} onValueChange={setPlan}>
                  <SelectTrigger size="sm" className="screen-filter-select" aria-label="Plan">
                    <SelectValue placeholder="Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All plans</SelectItem>
                    <SelectItem value="Starter">Starter</SelectItem>
                    <SelectItem value="Growth">Growth</SelectItem>
                    <SelectItem value="Scale">Scale</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                <Chip active={largeOnly} showCheck onClick={() => setLargeOnly((v) => !v)}>
                  25+ seats
                </Chip>
                <span className="screen-muted spk-numeric" style={{ marginLeft: "auto" }}>
                  {rows.length} customers
                </span>
              </>
            }
            bulkActions={(selectedRows, clear) => (
              <>
                <Button size="xs" variant="secondary" onClick={() => { toast({ title: `Email drafted to ${selectedRows.length} customers` }); clear(); }}>
                  Email
                </Button>
                <Button size="xs" variant="secondary" onClick={() => { toast({ title: "Export started", tone: "info" }); clear(); }}>
                  Export
                </Button>
                <Button size="xs" variant="destructive-soft" onClick={() => {
                  const removed = selectedRows;
                  const ids = new Set(removed.map((c) => c.id));
                  setCustomerList((list) => list.filter((c) => !ids.has(c.id)));
                  clear();
                  toast({
                    title: `${removed.length} customers archived`,
                    tone: "danger",
                    action: { label: "Undo", onClick: () => setCustomerList((list) => [...removed, ...list]) },
                  });
                }}>
                  Archive
                </Button>
              </>
            )}
            rowActions={(c) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <IconButton size="xs" aria-label={`Actions for ${c.name}`}>
                    <MoreHorizontal />
                  </IconButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => toast({ title: `Opened ${c.name}` })}>View customer</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => toast({ title: "Plan change", description: c.plan })}>
                    <Zap aria-hidden />
                    Change plan
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={() => setSuspendTarget(c)}>
                    Suspend account
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            renderExpanded={(c) => (
              <dl className="screen-props screen-props--wide">
                <dt>Customer ID</dt>
                <dd className="spk-numeric">{c.id}</dd>
                <dt>Region</dt>
                <dd>{c.region}</dd>
                <dt>Billing</dt>
                <dd>billing@{c.domain}</dd>
                <dt>Plan usage</dt>
                <dd>
                  <Progress value={c.usage * 100} size="xs" tone={c.usage > 0.85 ? "warning" : "accent"} style={{ maxWidth: 160 }} />
                  <span className="screen-muted spk-numeric">{Math.round(c.usage * 100)}%</span>
                </dd>
              </dl>
            )}
          />
          ) : null}

          {nav === "subscriptions" ? <PlanSummary customers={scoped} /> : null}
          {nav === "invoices" ? <InvoiceQueue customers={scoped.filter((c) => c.status === "past_due")} onOpenCustomer={() => setNav("customers")} /> : null}
          {nav === "usage" ? <UsageList customers={[...scoped].sort((a, b) => b.usage - a.usage)} /> : null}
          {nav === "events" ? <EventLog /> : null}
          {nav === "team" ? <TeamList customers={scoped} /> : null}
          {nav === "keys" ? <KeysEmpty /> : null}
          {nav === "settings" ? <WorkspaceSettings name={workspace === "globex" ? "Globex" : "Sweyam Cloud"} plan={workspace === "globex" ? "Growth · 3 admins" : "Scale · 14 admins"} /> : null}
          {nav === "help" ? <HelpPanel onOpenPalette={() => setPaletteOpen(true)} /> : null}
        </div>
      </AppShell>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} groups={commands} />
      <AddCustomerDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreate={(customer) => {
          setCustomerList((list) => [customer, ...list]);
          setNav("customers");
          setTab("all");
          toast({ title: "Customer added", description: customer.name, tone: "success" });
        }}
      />
      <AlertDialog open={suspendTarget !== null} onOpenChange={(open) => { if (!open) setSuspendTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend {suspendTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Billing stops and the workspace cannot sign in until you restore it. You can undo this from the customer row.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep active</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (!suspendTarget) return;
                const target = suspendTarget;
                setCustomerList((list) => list.map((c) => (c.id === target.id ? { ...c, status: "churned" } : c)));
                setSuspendTarget(null);
                toast({ title: `${target.name} suspended`, tone: "danger" });
              }}
            >
              Suspend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const PLANS: Plan[] = ["Starter", "Growth", "Scale", "Enterprise"];

function PlanSummary({ customers }: { customers: Customer[] }) {
  const rows = PLANS.map((plan) => {
    const members = customers.filter((c) => c.plan === plan && c.status !== "churned");
    return { plan, count: members.length, mrr: members.reduce((sum, c) => sum + c.mrr, 0) };
  });
  return (
    <>
      <PageHeader title="Subscriptions" description="Active and trialing accounts, grouped by plan. Churned accounts are excluded." />
      <Card padding="none">
        <ul className="screen-list">
          {rows.map((row) => (
            <li key={row.plan}>
              <Badge variant={PLAN_VARIANT[row.plan]}>{row.plan}</Badge>
              <div className="screen-list-main">
                <div className="screen-list-title">{row.count} accounts</div>
              </div>
              <div className="screen-list-value">{money(row.mrr, 0)}<div className="screen-muted">MRR</div></div>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}

function InvoiceQueue({ customers, onOpenCustomer }: { customers: Customer[]; onOpenCustomer: () => void }) {
  return (
    <>
      <PageHeader title="Invoices" description="Open items are accounts whose latest payment failed. Amount due is this month’s MRR." />
      {customers.length === 0 ? (
        <EmptyState title="No open invoices" description="Past-due accounts will appear here when a payment fails." actionLabel="View customers" onAction={onOpenCustomer} />
      ) : (
        <Card padding="none">
          <ul className="screen-list">
            {customers.map((c) => (
              <li key={c.id}>
                <div className="screen-list-main">
                  <div className="screen-list-title">{c.name}</div>
                  <div className="screen-list-meta">{c.domain} · {c.plan}</div>
                </div>
                <Badge variant="warning" dot>Past due</Badge>
                <div className="screen-list-value">{money(c.mrr, 0)}</div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}

function UsageList({ customers }: { customers: Customer[] }) {
  return (
    <>
      <PageHeader title="Usage" description="Share of plan quota. Accounts over 85% are marked so you can offer an upgrade before they hit the cap." />
      <Card padding="none">
        <ul className="screen-list">
          {customers.map((c) => (
            <li key={c.id}>
              <div className="screen-list-main">
                <div className="screen-list-title">{c.name}</div>
                <Progress value={c.usage * 100} size="xs" tone={c.usage > 0.85 ? "warning" : "accent"} aria-label={`${c.name} usage`} />
              </div>
              <div className="screen-list-value spk-numeric">{Math.round(c.usage * 100)}%</div>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}

function EventLog() {
  return (
    <>
      <PageHeader title="Events" description="Billing and seat changes from the last day." />
      <Panel title="Activity">
        <Timeline>
          <TimelineItem tone="success" title={<><strong>Vela Robotics</strong> upgraded to Enterprise</>} meta="12m" />
          <TimelineItem tone="warning" title={<><strong>Juniper Retail</strong> payment failed</>} meta="1h" description="Card declined · retry scheduled for tomorrow" />
          <TimelineItem tone="accent" title={<><strong>Diego</strong> added 12 seats to Parallel Freight</>} meta="3h" />
          <TimelineItem title={<><strong>Bright Harbor</strong> started a trial</>} meta="5h" />
          <TimelineItem tone="danger" title={<><strong>Quill Legal</strong> cancelled</>} meta="1d" description="Reason: moved to in-house tooling" />
        </Timeline>
      </Panel>
    </>
  );
}

function TeamList({ customers }: { customers: Customer[] }) {
  const owners = [...new Set(customers.map((c) => c.owner))];
  return (
    <>
      <PageHeader title="Team" description="Account owners on the customers in this workspace." />
      <Card padding="none">
        <ul className="screen-list">
          {owners.map((owner) => {
            const count = customers.filter((c) => c.owner === owner).length;
            return (
              <li key={owner}>
                <Avatar size="sm"><AvatarFallback>{getInitials(owner)}</AvatarFallback></Avatar>
                <div className="screen-list-main">
                  <div className="screen-list-title">{owner}</div>
                  <div className="screen-list-meta">{count} {count === 1 ? "account" : "accounts"}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}

function KeysEmpty() {
  return (
    <>
      <PageHeader title="API keys" description="Keys are issued by the live workspace. This preview is not connected to one." />
      <EmptyState title="No API keys in this preview" description="A connected workspace lists secret keys here. Nothing in this demo can call the billing API." />
    </>
  );
}

function WorkspaceSettings({ name, plan }: { name: string; plan: string }) {
  return (
    <>
      <PageHeader title="Settings" description="Workspace details for the account you have open." />
      <Card>
        <dl className="screen-props screen-props--wide">
          <dt>Workspace</dt>
          <dd>{name}</dd>
          <dt>Plan</dt>
          <dd>{plan}</dd>
          <dt>Billing email</dt>
          <dd>billing@sweyam.cloud</dd>
        </dl>
      </Card>
    </>
  );
}

function HelpPanel({ onOpenPalette }: { onOpenPalette: () => void }) {
  return (
    <>
      <PageHeader title="Help" description="Shortcuts for the work on this console." />
      <Card padding="none">
        <ul className="screen-list">
          <li>
            <div className="screen-list-main">
              <div className="screen-list-title">Search and jump</div>
              <div className="screen-list-meta">Open the command palette to switch sections or add a customer.</div>
            </div>
            <Button size="sm" variant="secondary" onClick={onOpenPalette}>Open palette</Button>
          </li>
          <li>
            <div className="screen-list-main">
              <div className="screen-list-title">Past-due accounts</div>
              <div className="screen-list-meta">Invoices lists failed payments. Suspend is confirmed before it changes status.</div>
            </div>
          </li>
        </ul>
      </Card>
    </>
  );
}

function AddCustomerDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (customer: Customer) => void;
}) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [plan, setPlan] = useState<Plan>("Growth");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setDomain("");
    setPlan("Growth");
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
          <DialogTitle>Add customer</DialogTitle>
          <DialogDescription>Creates an account on the Starter, Growth, Scale or Enterprise plan.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="grid gap-4">
            <FormField label="Company" required error={error ?? undefined}>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Lumen Labs" />
            </FormField>
            <FormField label="Domain" required>
              <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="lumenlabs.io" />
            </FormField>
            <FormField label="Plan">
              <Select value={plan} onValueChange={(value) => setPlan(value as Plan)}>
                <SelectTrigger aria-label="Plan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLANS.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (!name.trim() || !domain.trim()) {
                setError("Enter a company and a domain.");
                return;
              }
              const created = new Date();
              onCreate({
                id: `cus_${Date.now().toString(36)}`,
                name: name.trim(),
                domain: domain.trim().replace(/^https?:\/\//, ""),
                plan,
                status: "trialing",
                mrr: plan === "Starter" ? 29 : plan === "Growth" ? 99 : plan === "Scale" ? 349 : 1_450,
                seats: 3,
                owner: "Priya Nair",
                region: "us-east",
                created,
                lastActive: 0,
                usage: 0.04,
              });
              reset();
              onOpenChange(false);
            }}
          >
            Add customer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
