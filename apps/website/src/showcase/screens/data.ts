/* Showcase datasets. Everything is fictional. */

export const MONTHS_12 = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
export const MONTHS_6 = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];

/* ─── Finance (Kasho) ──────────────────────────────────────────────────── */

export const netWorthSeries = [182_400, 184_100, 183_200, 188_900, 191_300, 189_800, 195_600, 199_200, 201_700, 204_900, 207_300, 214_880];

export type Account = {
  id: string;
  name: string;
  institution: string;
  kind: "Checking" | "Savings" | "Brokerage" | "Retirement" | "Credit card";
  mask: string;
  balance: number;
  trend: number[];
  color: string;
};

export const accounts: Account[] = [
  { id: "chk", name: "Everyday checking", institution: "Northbank", kind: "Checking", mask: "4821", balance: 8_420.55, trend: [7.1, 8.4, 6.9, 9.2, 7.8, 8.4], color: "var(--spk-viz-1)" },
  { id: "sav", name: "High-yield savings", institution: "Northbank", kind: "Savings", mask: "1170", balance: 32_150.0, trend: [28, 28.9, 29.6, 30.4, 31.2, 32.15], color: "var(--spk-viz-2)" },
  { id: "brk", name: "Index portfolio", institution: "Meridian", kind: "Brokerage", mask: "0934", balance: 118_940.32, trend: [104, 108, 106, 112, 115, 118.9], color: "var(--spk-viz-4)" },
  { id: "ret", name: "401(k)", institution: "Harbor", kind: "Retirement", mask: "7702", balance: 72_300.0, trend: [66, 67.5, 68.2, 69.9, 71, 72.3], color: "var(--spk-viz-7)" },
  { id: "cc", name: "Rewards card", institution: "Northbank", kind: "Credit card", mask: "3318", balance: -2_184.1, trend: [1.6, 2.4, 1.9, 2.8, 2.1, 2.18], color: "var(--spk-viz-6)" },
];

export type Transaction = {
  id: string;
  merchant: string;
  category: string;
  account: string;
  date: Date;
  amount: number;
  pending?: boolean;
};

function daysAgo(n: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

export const transactions: Transaction[] = [
  { id: "t1", merchant: "Greenleaf Market", category: "Groceries", account: "Rewards card", date: daysAgo(0), amount: -86.42, pending: true },
  { id: "t2", merchant: "Payroll — Studio Nine", category: "Income", account: "Everyday checking", date: daysAgo(1), amount: 4_210.0 },
  { id: "t3", merchant: "Cedar Apartments", category: "Housing", account: "Everyday checking", date: daysAgo(2), amount: -2_150.0 },
  { id: "t4", merchant: "Metro Transit", category: "Transport", account: "Rewards card", date: daysAgo(2), amount: -42.5 },
  { id: "t5", merchant: "Blue Door Café", category: "Dining", account: "Rewards card", date: daysAgo(3), amount: -18.9 },
  { id: "t6", merchant: "Meridian — Dividend", category: "Income", account: "Index portfolio", date: daysAgo(4), amount: 312.44 },
  { id: "t7", merchant: "City Power & Light", category: "Utilities", account: "Everyday checking", date: daysAgo(5), amount: -96.18 },
  { id: "t8", merchant: "Fieldhouse Outfitters", category: "Shopping", account: "Rewards card", date: daysAgo(6), amount: -149.0 },
  { id: "t9", merchant: "Greenleaf Market", category: "Groceries", account: "Rewards card", date: daysAgo(7), amount: -64.03 },
  { id: "t10", merchant: "Transfer to savings", category: "Transfer", account: "Everyday checking", date: daysAgo(8), amount: -500.0 },
  { id: "t11", merchant: "Soundwave Music", category: "Subscriptions", account: "Rewards card", date: daysAgo(9), amount: -10.99 },
  { id: "t12", merchant: "Blue Door Café", category: "Dining", account: "Rewards card", date: daysAgo(10), amount: -23.4 },
  { id: "t13", merchant: "Harbor — Contribution", category: "Retirement", account: "401(k)", date: daysAgo(11), amount: 650.0 },
  { id: "t14", merchant: "Pine Street Pharmacy", category: "Health", account: "Rewards card", date: daysAgo(12), amount: -31.75 },
];

export const spendingByCategory = [
  { label: "Housing", value: 2_150, color: "var(--spk-viz-1)" },
  { label: "Groceries", value: 612, color: "var(--spk-viz-2)" },
  { label: "Shopping", value: 402, color: "var(--spk-viz-4)" },
  { label: "Dining", value: 348, color: "var(--spk-viz-3)" },
  { label: "Transport", value: 214, color: "var(--spk-viz-7)" },
  { label: "Other", value: 334, color: "var(--spk-viz-5)" },
];

export const cashflow = {
  income: [6_120, 6_180, 6_420, 6_210, 6_890, 6_520],
  spending: [4_380, 4_120, 4_690, 4_050, 4_470, 4_060],
};

export const goals = [
  { id: "g1", name: "Emergency fund", saved: 18_000, target: 20_000, note: "On track · Dec 2026" },
  { id: "g2", name: "Japan trip", saved: 3_400, target: 6_000, note: "Needs $420/mo · Apr 2027" },
  { id: "g3", name: "New car", saved: 9_800, target: 25_000, note: "Behind by $1,200" },
];

/* ─── SaaS admin (Sweyam Cloud) ────────────────────────────────────────── */

export type Plan = "Starter" | "Growth" | "Scale" | "Enterprise";
export type CustomerStatus = "active" | "trialing" | "past_due" | "churned";

export type Customer = {
  id: string;
  name: string;
  domain: string;
  plan: Plan;
  status: CustomerStatus;
  mrr: number;
  seats: number;
  owner: string;
  region: string;
  created: Date;
  lastActive: number; // hours ago
  usage: number; // 0..1 of plan quota
};

const COMPANY = [
  ["Lumen Labs", "lumenlabs.io"], ["Parallel Freight", "parallelfreight.com"], ["Orchard Health", "orchard.health"],
  ["Kite & Key", "kiteandkey.co"], ["Northwind Analytics", "northwind.dev"], ["Juniper Retail", "juniper.shop"],
  ["Fathom Energy", "fathom.energy"], ["Bright Harbor", "brightharbor.org"], ["Quill Legal", "quill.law"],
  ["Stratus Media", "stratus.media"], ["Tandem Bikes", "tandembikes.com"], ["Vela Robotics", "vela.ai"],
  ["Basil & Salt", "basilsalt.kitchen"], ["Copperline", "copperline.io"], ["Mosaic Schools", "mosaic.edu"],
  ["Helio Solar", "heliosolar.co"], ["Ridgeway Bank", "ridgeway.bank"], ["Pixelwright", "pixelwright.studio"],
  ["Outpost Travel", "outpost.travel"], ["Canopy Insurance", "canopy.insure"], ["Arcadia Games", "arcadia.gg"],
  ["Sable Security", "sable.security"], ["Tidal Logistics", "tidal.logistics"], ["Beacon Clinics", "beaconclinics.com"],
] as const;

const OWNERS = ["Priya Nair", "Diego Alvarez", "Hana Sato", "Marcus Webb", "Elena Petrova"];
const PLANS: Plan[] = ["Starter", "Growth", "Scale", "Enterprise"];
const PLAN_PRICE: Record<Plan, number> = { Starter: 29, Growth: 99, Scale: 349, Enterprise: 1_450 };
const STATUSES: CustomerStatus[] = ["active", "active", "active", "trialing", "active", "past_due", "active", "churned"];
const REGIONS = ["us-east", "eu-west", "ap-south", "us-west"];

export const customers: Customer[] = COMPANY.map(([name, domain], i) => {
  const plan = PLANS[(i * 7) % 4]!;
  const seats = 3 + ((i * 13) % 58);
  const created = new Date();
  created.setDate(created.getDate() - (18 + i * 23));
  return {
    id: `cus_${(4100 + i * 37).toString(36)}`,
    name,
    domain,
    plan,
    status: STATUSES[i % STATUSES.length]!,
    mrr: plan === "Enterprise" ? PLAN_PRICE[plan] + seats * 12 : PLAN_PRICE[plan] + Math.round(seats * (plan === "Starter" ? 0 : 4.5)),
    seats,
    owner: OWNERS[i % OWNERS.length]!,
    region: REGIONS[i % REGIONS.length]!,
    created,
    lastActive: (i * 5) % 70,
    usage: ((i * 17) % 95) / 100 + 0.04,
  };
});

export const mrrSparks = {
  mrr: [148, 152, 158, 161, 166, 171, 175, 178, 184],
  customers: [1_180, 1_196, 1_210, 1_224, 1_238, 1_251, 1_262, 1_270, 1_284],
  churn: [2.4, 2.3, 2.3, 2.1, 2.2, 2.0, 1.9, 2.2, 1.8],
  arpa: [131, 133, 134, 136, 137, 139, 140, 141, 143.5],
};

export const mrrMovement = {
  newBiz: [8.2, 9.1, 7.6, 10.4, 11.2, 12.8],
  expansion: [4.1, 3.8, 5.2, 4.9, 6.1, 6.6],
  churned: [-3.2, -2.6, -3.9, -2.4, -3.1, -2.2],
};

/* ─── Productivity (Atlas) ─────────────────────────────────────────────── */

export type Task = {
  id: string;
  title: string;
  status: "progress" | "next" | "done";
  assignee: string;
  due: string;
  tag: { label: string; tone: "blue" | "green" | "orange" | "purple" | "cyan" };
  priority: "high" | "medium" | "low";
};

export const tasks: Task[] = [
  { id: "a1", title: "Finalize pricing page copy", status: "progress", assignee: "Hana Sato", due: "Today", tag: { label: "Marketing", tone: "orange" }, priority: "high" },
  { id: "a2", title: "QA onboarding checklist on Android", status: "progress", assignee: "Diego Alvarez", due: "Tomorrow", tag: { label: "Mobile", tone: "green" }, priority: "medium" },
  { id: "a3", title: "Record launch walkthrough video", status: "progress", assignee: "Priya Nair", due: "Thu", tag: { label: "Launch", tone: "blue" }, priority: "medium" },
  { id: "a4", title: "Draft changelog for 4.0", status: "next", assignee: "Marcus Webb", due: "Fri", tag: { label: "Docs", tone: "purple" }, priority: "low" },
  { id: "a5", title: "Sync with support on macros", status: "next", assignee: "Elena Petrova", due: "Mon", tag: { label: "Support", tone: "cyan" }, priority: "medium" },
  { id: "a6", title: "Load-test billing webhooks", status: "next", assignee: "Diego Alvarez", due: "Tue", tag: { label: "Platform", tone: "blue" }, priority: "high" },
  { id: "a7", title: "Approve launch email", status: "done", assignee: "Hana Sato", due: "Mon", tag: { label: "Marketing", tone: "orange" }, priority: "medium" },
  { id: "a8", title: "Ship new empty states", status: "done", assignee: "Priya Nair", due: "Last week", tag: { label: "Design", tone: "purple" }, priority: "low" },
];

export const launchDoc = `<h1>Q4 launch plan</h1>
<p>We ship <strong>Atlas 4.0</strong> on the second Tuesday of next month. This doc is the single source of truth for scope, owners and the go/no-go checklist.</p>
<h2>Goals</h2>
<ul>
  <li>Move 30% of trial workspaces to the new onboarding by week two.</li>
  <li>Cut time-to-first-project from 11 minutes to under 4.</li>
  <li>Zero P1 incidents during the rollout window.</li>
</ul>
<h2>Scope</h2>
<p>Everything behind the <code>atlas_v4</code> flag: the command bar, calendar sync, and the redesigned editor. Mobile ships a week later.</p>
<blockquote>If a feature is not in QA by Friday, it moves to 4.1 — no exceptions.</blockquote>
<h2>Checklist</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><p>Pricing page approved</p></li>
  <li data-type="taskItem" data-checked="false"><p>Status page runbook updated</p></li>
  <li data-type="taskItem" data-checked="false"><p>Support macros published</p></li>
</ul>`;

export function atlasEvents() {
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const at = (day: number, hour: number, minute = 0) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + day);
    d.setHours(hour, minute, 0, 0);
    return d;
  };
  return [
    { id: "e1", title: "Launch stand-up", start: at(0, 9, 30), end: at(0, 10), color: "blue" as const },
    { id: "e2", title: "Pricing review", start: at(1, 11), end: at(1, 12), color: "orange" as const },
    { id: "e3", title: "Design crit", start: at(1, 14), end: at(1, 15, 30), color: "violet" as const },
    { id: "e4", title: "Launch stand-up", start: at(2, 9, 30), end: at(2, 10), color: "blue" as const },
    { id: "e5", title: "Support training", start: at(2, 13), end: at(2, 14), color: "teal" as const },
    { id: "e6", title: "Go / no-go", start: at(3, 16), end: at(3, 17), color: "rose" as const },
    { id: "e7", title: "Launch stand-up", start: at(4, 9, 30), end: at(4, 10), color: "blue" as const },
    { id: "e8", title: "Team retro", start: at(4, 15), end: at(4, 16), color: "slate" as const },
  ];
}
