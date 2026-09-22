import { useState, type ReactNode } from "react";
import { FileText, Home, Plus, Settings, Users } from "lucide-react";
import {
  AppShell,
  Badge,
  Button,
  Card,
  CommandPalette,
  DataTable,
  Metric,
  MetricGroup,
  NavItem,
  NavSection,
  PageSection,
  Panel,
  SearchTrigger,
  Sidebar,
  SparkLineChart,
  TopBar,
  WorkspaceSwitcher,
  type DataTableColumn,
} from "@spatika/react";

type Row = { id: string; name: string; team: string; status: "active" | "invited" | "suspended"; seats: number };

const rows: Row[] = [
  { id: "1", name: "Hana Sato", team: "Design", status: "active", seats: 12 },
  { id: "2", name: "Diego Alvarez", team: "Platform", status: "active", seats: 48 },
  { id: "3", name: "Priya Nair", team: "Growth", status: "invited", seats: 6 },
  { id: "4", name: "Marcus Webb", team: "Support", status: "suspended", seats: 3 },
  { id: "5", name: "Elena Petrova", team: "Finance", status: "active", seats: 21 },
];

const tone = { active: "success", invited: "info", suspended: "neutral" } as const;

const columns: DataTableColumn<Row>[] = [
  { id: "name", header: "Name", accessor: (r) => r.name, sortable: true },
  { id: "team", header: "Team", accessor: (r) => r.team, sortable: true, mobile: "subtitle", hideBelow: "sm" },
  {
    id: "status",
    header: "Status",
    accessor: (r) => r.status,
    mobile: "subtitle",
    cell: (r) => (
      <Badge variant={tone[r.status]} dot>
        {r.status}
      </Badge>
    ),
  },
  { id: "seats", header: "Seats", accessor: (r) => r.seats, sortable: true, numeric: true },
];

function PaletteDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <SearchTrigger placeholder="Search or run a command…" onOpen={() => setOpen(true)} hotkey={false} />
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        groups={[
          {
            heading: "Navigate",
            items: [
              { id: "home", label: "Overview", icon: <Home />, shortcut: ["G", "O"], onSelect: () => undefined },
              { id: "people", label: "People", icon: <Users />, shortcut: ["G", "P"], onSelect: () => undefined },
            ],
          },
          { heading: "Create", items: [{ id: "new", label: "New document", icon: <Plus />, shortcut: ["C"], onSelect: () => undefined }] },
        ]}
      />
    </>
  );
}

function ShellDemo() {
  const [active, setActive] = useState("people");
  return (
    <div className="home-shell-frame" style={{ height: "26rem" }}>
      <AppShell
        sidebar={
          <Sidebar
            header={<WorkspaceSwitcher value="a" onValueChange={() => undefined} workspaces={[{ id: "a", name: "Sweyam" }]} />}
            footer={<NavItem icon={<Settings />} label="Settings" />}
          >
            <NavSection>
              <NavItem icon={<Home />} label="Overview" active={active === "home"} onClick={() => setActive("home")} />
              <NavItem icon={<Users />} label="People" meta="24" active={active === "people"} onClick={() => setActive("people")} />
              <NavItem icon={<FileText />} label="Docs" active={active === "docs"} onClick={() => setActive("docs")} />
            </NavSection>
          </Sidebar>
        }
        topbar={<TopBar title="People" actions={<Button size="sm">Invite</Button>} />}
      >
        <div className="home-shell-body">
          <PageSection title="Team" description="Everyone with access to this workspace.">
            <DataTable aria-label="Team" data={rows.slice(0, 3)} columns={columns} getRowId={(r) => r.id} />
          </PageSection>
        </div>
      </AppShell>
    </div>
  );
}

export function systemDemos(compact: boolean): Record<string, ReactNode> {
  return {
    metric: (
      <Card padding="none" style={{ width: "100%" }}>
        <MetricGroup columns={compact ? 2 : 3}>
          <Metric label="MRR" value={184_320} format="currency" precision={0} delta={0.064} caption="vs August" chart={compact ? undefined : <SparkLineChart data={[148, 152, 158, 166, 171, 184]} height={28} />} />
          <Metric label="Churn" value={0.018} format="percent" delta={-0.004} deltaIntent="inverse" caption="Target < 2%" />
          {compact ? null : <Metric label="Latency p95" value={182} unit="ms" delta={0.08} deltaFormat="percent" deltaIntent="inverse" caption="last 24h" />}
        </MetricGroup>
      </Card>
    ),
    "data-table": (
      <DataTable
        aria-label="Members"
        data={compact ? rows.slice(0, 3) : rows}
        columns={columns}
        getRowId={(r) => r.id}
        selectable={!compact}
        bulkActions={(selected, clear) => (
          <Button size="xs" variant="secondary" onClick={clear}>
            Remove {selected.length}
          </Button>
        )}
        className="w-full"
      />
    ),
    "app-shell": compact ? (
      <div className="screen-muted">Sidebar · TopBar · content — see the live frame on the component page.</div>
    ) : (
      <ShellDemo />
    ),
    "command-palette": <PaletteDemo />,
    "page-section": (
      <PageSection title="Accounts" description="Balances refresh every 15 minutes." actions={<Button size="sm" variant="secondary">Link account</Button>} style={{ width: "100%" }}>
        <p className="screen-muted" style={{ margin: 0 }}>
          Sections are a heading and spacing — no card needed.
        </p>
      </PageSection>
    ),
    panel: (
      <Panel title="Revenue" description="Last 6 months" actions={<Badge variant="success" dot>+12%</Badge>} style={{ width: "100%" }}>
        <SparkLineChart data={[12, 18, 16, 24, 28, 34]} height={compact ? 40 : 80} />
      </Panel>
    ),
  };
}
