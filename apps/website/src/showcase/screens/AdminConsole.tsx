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
  Chip,
  CommandPalette,
  DataTable,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { MONTHS_6, customers, mrrMovement, mrrSparks, type Customer, type CustomerStatus, type Plan } from "./data";
import { ScreenUserMenu, money, shortDate, useSharedCommands } from "./shared";

const STATUS: Record<CustomerStatus, { label: string; variant: "success" | "info" | "warning" | "neutral" }> = {
  active: { label: "Active", variant: "success" },
  trialing: { label: "Trialing", variant: "info" },
  past_due: { label: "Past due", variant: "warning" },
  churned: { label: "Churned", variant: "neutral" },
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
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [plan, setPlan] = useState<string>("all");
  const [largeOnly, setLargeOnly] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { toast } = useToast();
  const shared = useSharedCommands();

  const counts = useMemo(() => {
    const by = { all: customers.length, active: 0, trialing: 0, past_due: 0, churned: 0 } as Record<Tab, number>;
    customers.forEach((c) => (by[c.status] += 1));
    return by;
  }, []);

  const rows = useMemo(
    () =>
      customers.filter(
        (c) =>
          (tab === "all" || c.status === tab) &&
          (plan === "all" || c.plan === plan) &&
          (!largeOnly || c.seats >= 25) &&
          (!query || `${c.name} ${c.domain} ${c.owner}`.toLowerCase().includes(query.toLowerCase())),
      ),
    [tab, plan, largeOnly, query],
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
        { id: "new-customer", label: "Add customer", shortcut: ["C"], onSelect: () => toast({ title: "New customer", description: "The create flow would open here." }) },
        { id: "export", label: "Export customers to CSV", onSelect: () => toast({ title: "Export started", tone: "info" as const }) },
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
                <NavItem icon={<CircleHelp />} label="Help & docs" />
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
              <NavItem icon={<Building2 />} label="Team" />
              <NavItem icon={<KeyRound />} label="API keys" />
              <NavItem icon={<Settings />} label="Settings" />
            </NavSection>
          </Sidebar>
        }
        topbar={
          <TopBar
            title={<Breadcrumb className="max-md:hidden" items={[{ label: "Sweyam Cloud", href: "#" }, { label: "Customers" }]} />}
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
          <PageHeader
            title="Customers"
            description="Accounts, plans and recurring revenue across every region."
            actions={
              <>
                <Button variant="secondary" size="sm" leadingIcon={<Download />} onClick={() => toast({ title: "Export started", tone: "info" })}>
                  Export
                </Button>
                <Button size="sm" leadingIcon={<Plus />} onClick={() => toast({ title: "New customer", description: "The create flow would open here." })}>
                  Add customer
                </Button>
              </>
            }
          >
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
          </PageHeader>

          <Card padding="none">
            <MetricGroup columns={4}>
              <Metric label="MRR" value={184_320} format="currency" precision={0} delta={0.064} caption="vs August" chart={<SparkLineChart data={mrrSparks.mrr} height={28} />} />
              <Metric label="Active customers" value={1_284} delta={0.031} caption="+38 this month" chart={<SparkLineChart data={mrrSparks.customers} height={28} color="var(--spk-viz-2)" />} />
              <Metric label="Net revenue churn" value={0.018} format="percent" delta={-0.004} deltaFormat="percent" deltaIntent="inverse" caption="Target < 2%" chart={<SparkLineChart data={mrrSparks.churn} height={28} color="var(--spk-viz-6)" />} />
              <Metric label="ARPA" value={143.55} format="currency" delta={0.022} caption="Avg revenue per account" chart={<SparkLineChart data={mrrSparks.arpa} height={28} color="var(--spk-viz-4)" />} />
            </MetricGroup>
          </Card>

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
            <Panel title="Activity" actions={<Button variant="ghost" size="xs">View log</Button>}>
              <Timeline>
                <TimelineItem tone="success" title={<><strong>Vela Robotics</strong> upgraded to Enterprise</>} meta="12m" />
                <TimelineItem tone="warning" title={<><strong>Juniper Retail</strong> payment failed</>} meta="1h" description="Card declined · retry scheduled for tomorrow" />
                <TimelineItem tone="accent" title={<><strong>Diego</strong> added 12 seats to Parallel Freight</>} meta="3h" />
                <TimelineItem title={<><strong>Bright Harbor</strong> started a trial</>} meta="5h" />
                <TimelineItem tone="danger" title={<><strong>Quill Legal</strong> cancelled</>} meta="1d" description="Reason: moved to in-house tooling" />
              </Timeline>
            </Panel>
          </div>

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
                <Button size="xs" variant="destructive-soft" onClick={() => { toast({ title: `${selectedRows.length} customers archived`, tone: "danger", action: { label: "Undo", onClick: () => undefined } }); clear(); }}>
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
                  <DropdownMenuItem variant="destructive" onSelect={() => toast({ title: `${c.name} suspended`, tone: "danger" })}>
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
        </div>
      </AppShell>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} groups={commands} />
    </>
  );
}
