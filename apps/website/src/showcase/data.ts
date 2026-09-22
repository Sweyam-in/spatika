export type LeadStage = "new" | "qualified" | "proposal" | "won" | "lost";
export type LeadSource = "Website" | "LinkedIn" | "Referral" | "Event" | "Outbound";
export type CampaignStatus = "active" | "paused" | "draft";

export type LeadActivity = {
  id: string;
  title: string;
  meta: string;
  description: string;
  kind: "email" | "call" | "meeting" | "note";
};

export type Lead = {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  stage: LeadStage;
  source: LeadSource;
  value: number;
  score: number;
  owner: string;
  lastTouch: string;
  nextAction: string;
  location: string;
  notes: string;
  activity: LeadActivity[];
};

export type Campaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  enrolled: number;
  replies: number;
  replyRate: number;
  nextSend: string;
  description: string;
};

export const STAGE_LABEL: Record<LeadStage, string> = {
  new: "New",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

export const STAGE_BADGE: Record<LeadStage, "secondary" | "info" | "warm" | "default" | "outline"> = {
  new: "secondary",
  qualified: "info",
  proposal: "warm",
  won: "default",
  lost: "outline",
};

export const CAMPAIGN_BADGE: Record<CampaignStatus, "info" | "warm" | "secondary"> = {
  active: "info",
  paused: "warm",
  draft: "secondary",
};

export const LEADS: Lead[] = [
  {
    id: "maya-chen",
    name: "Maya Chen",
    title: "Head of Growth",
    company: "Northwind Analytics",
    email: "maya@northwind.io",
    stage: "qualified",
    source: "Website",
    value: 24_000,
    score: 86,
    owner: "Alex Rivera",
    lastTouch: "2h ago",
    nextAction: "Send product teardown",
    location: "Austin, US",
    notes: "Evaluating inbound capture tools for a Q3 rollout. Budget is approved; wants a 2-week pilot.",
    activity: [
      { id: "m1", kind: "meeting", title: "Discovery call", meta: "Yesterday · 32 min", description: "Walked through current form stack and CRM sync gaps." },
      { id: "m2", kind: "email", title: "Pilot proposal sent", meta: "Today · 9:14 AM", description: "Shared a 14-day pilot with website + LinkedIn capture." },
      { id: "m3", kind: "note", title: "Buying committee", meta: "Alex Rivera", description: "Needs sign-off from RevOps before a paid plan." },
    ],
  },
  {
    id: "jordan-hale",
    name: "Jordan Hale",
    title: "Founder",
    company: "Apex Logistics",
    email: "jordan@apexlogistics.co",
    stage: "new",
    source: "LinkedIn",
    value: 8_400,
    score: 61,
    owner: "Sam Okonkwo",
    lastTouch: "Today",
    nextAction: "Book intro call",
    location: "Chicago, US",
    notes: "Clicked the pricing page twice. Small team, likely needs the starter workspace.",
    activity: [
      { id: "j1", kind: "email", title: "Inbound form", meta: "Today · 11:02 AM", description: "Asked how capture credits work on the starter plan." },
      { id: "j2", kind: "note", title: "Fit check", meta: "Sam Okonkwo", description: "Good ICP — regional freight brokers, 12-person sales pod." },
    ],
  },
  {
    id: "priya-shah",
    name: "Priya Shah",
    title: "VP Marketing",
    company: "Harbor Health",
    email: "priya@harbor.health",
    stage: "proposal",
    source: "Referral",
    value: 42_000,
    score: 92,
    owner: "Alex Rivera",
    lastTouch: "Yesterday",
    nextAction: "Legal review follow-up",
    location: "Toronto, CA",
    notes: "Referred by an existing customer. Wants HIPAA-ready capture and a dedicated success manager.",
    activity: [
      { id: "p1", kind: "meeting", title: "Security review", meta: "Mon · 45 min", description: "IT asked about SSO, audit logs, and data residency." },
      { id: "p2", kind: "email", title: "MSA in legal", meta: "Yesterday", description: "Waiting on their counsel. Target signature this week." },
      { id: "p3", kind: "call", title: "Champion check-in", meta: "Tue · 12 min", description: "Priya is pushing for a September kickoff." },
    ],
  },
  {
    id: "luca-moretti",
    name: "Luca Moretti",
    title: "Demand Gen Lead",
    company: "Lumen Studio",
    email: "luca@lumen.studio",
    stage: "qualified",
    source: "Event",
    value: 18_500,
    score: 74,
    owner: "Jordan Lee",
    lastTouch: "3d ago",
    nextAction: "Share event recap deck",
    location: "Milan, IT",
    notes: "Met at a SaaS summit. Interested in event-sourced leads plus enrichment.",
    activity: [
      { id: "l1", kind: "note", title: "Booth conversation", meta: "3 days ago", description: "Captured badge scan and a handwritten follow-up request." },
      { id: "l2", kind: "email", title: "Thanks + recap", meta: "2 days ago", description: "Sent the capture flow used by similar agencies." },
    ],
  },
  {
    id: "nina-okada",
    name: "Nina Okada",
    title: "Revenue Operations",
    company: "Brightline CRM",
    email: "nina@brightline.app",
    stage: "won",
    source: "Website",
    value: 31_200,
    score: 95,
    owner: "Sam Okonkwo",
    lastTouch: "Last week",
    nextAction: "Kickoff on Thursday",
    location: "Tokyo, JP",
    notes: "Closed on annual. Wants native CRM write-back and duplicate suppression.",
    activity: [
      { id: "n1", kind: "meeting", title: "Contract signed", meta: "Last week", description: "Annual workspace, 8 seats, success package." },
      { id: "n2", kind: "email", title: "Kickoff invite", meta: "Fri", description: "Onboarding call scheduled for Thursday 10:00 JST." },
    ],
  },
  {
    id: "owen-brooks",
    name: "Owen Brooks",
    title: "Sales Director",
    company: "Fieldkit",
    email: "owen@fieldkit.co",
    stage: "new",
    source: "Outbound",
    value: 12_000,
    score: 54,
    owner: "Jordan Lee",
    lastTouch: "5d ago",
    nextAction: "Second-touch sequence",
    location: "Denver, US",
    notes: "Opened the sequence twice. No reply yet — try a short Loom of the capture widget.",
    activity: [
      { id: "o1", kind: "email", title: "Outbound intro", meta: "5 days ago", description: "Personalized around their field-sales motion." },
      { id: "o2", kind: "note", title: "No reply", meta: "Yesterday", description: "Move to the re-engage campaign if silent after Friday." },
    ],
  },
  {
    id: "amelia-ross",
    name: "Amelia Ross",
    title: "CMO",
    company: "Northstar Legal",
    email: "amelia@northstar.legal",
    stage: "proposal",
    source: "Referral",
    value: 56_000,
    score: 88,
    owner: "Alex Rivera",
    lastTouch: "4h ago",
    nextAction: "Confirm workshop date",
    location: "London, UK",
    notes: "Wants a capture + routing workshop for partners. High ACV, longer cycle.",
    activity: [
      { id: "a1", kind: "call", title: "Scope workshop", meta: "Today · 4h ago", description: "90-minute working session for partner intake forms." },
      { id: "a2", kind: "email", title: "Hold dates", meta: "Today", description: "Offered next Tuesday or Thursday morning UK time." },
    ],
  },
  {
    id: "diego-alves",
    name: "Diego Alves",
    title: "Product Marketing",
    company: "Orbit Pay",
    email: "diego@orbitpay.com",
    stage: "lost",
    source: "LinkedIn",
    value: 9_600,
    score: 41,
    owner: "Sam Okonkwo",
    lastTouch: "2w ago",
    nextAction: "Revisit next quarter",
    location: "São Paulo, BR",
    notes: "Chose to stay on spreadsheets for now. Ask again after their Series A close.",
    activity: [
      { id: "d1", kind: "email", title: "Closed-lost note", meta: "2 weeks ago", description: "Timing, not product. Open to a Q4 check-in." },
    ],
  },
];

export const CAMPAIGNS: Campaign[] = [
  {
    id: "inbound-welcome",
    name: "Inbound welcome",
    status: "active",
    enrolled: 128,
    replies: 44,
    replyRate: 34,
    nextSend: "Today · 4:00 PM",
    description: "Three-step nurture for website captures: intro, product proof, book a time.",
  },
  {
    id: "demo-follow-up",
    name: "Demo follow-up",
    status: "active",
    enrolled: 56,
    replies: 21,
    replyRate: 38,
    nextSend: "Tomorrow · 9:30 AM",
    description: "Same-day recap plus a two-day nudge with the recording and next step.",
  },
  {
    id: "re-engage",
    name: "Re-engage cold leads",
    status: "paused",
    enrolled: 84,
    replies: 9,
    replyRate: 11,
    nextSend: "Paused",
    description: "Light-touch sequence for leads quiet for 21+ days. Paused while copy is rewritten.",
  },
  {
    id: "partner-intros",
    name: "Partner intros",
    status: "draft",
    enrolled: 0,
    replies: 0,
    replyRate: 0,
    nextSend: "Not scheduled",
    description: "Warm intro flow for agency and consultant referrals.",
  },
];

export const PIPELINE_STAGES: { id: LeadStage; label: string; hint: string }[] = [
  { id: "new", label: "New", hint: "Needs first touch" },
  { id: "qualified", label: "Qualified", hint: "Fit confirmed" },
  { id: "proposal", label: "Proposal", hint: "In review" },
  { id: "won", label: "Won", hint: "Closed this month" },
];

export const FUNNEL = [
  { id: "visited", label: "Visited site", value: 4820, pct: 100 },
  { id: "captured", label: "Captured", value: 640, pct: 13 },
  { id: "qualified", label: "Qualified", value: 188, pct: 4 },
  { id: "won", label: "Won", value: 27, pct: 0.6 },
];

export const SOURCES: { name: LeadSource; leads: number; pct: number }[] = [
  { name: "Website", leads: 86, pct: 42 },
  { name: "LinkedIn", leads: 48, pct: 23 },
  { name: "Referral", leads: 36, pct: 17 },
  { name: "Event", leads: 22, pct: 11 },
  { name: "Outbound", leads: 14, pct: 7 },
];

export const INSIGHT_TIPS = [
  {
    id: "speed",
    title: "Reply to new website leads within an hour",
    body: "Qualified conversion is 2.4× higher when the first touch lands the same morning.",
  },
  {
    id: "event",
    title: "Event captures are stalling in New",
    body: "12 summit leads have no owner task. Route them into the welcome sequence.",
  },
  {
    id: "referral",
    title: "Referrals close fastest",
    body: "Median time-to-won is 11 days versus 29 for outbound. Ask customers for one intro this week.",
  },
];

export const NOTIFICATIONS = [
  {
    id: "n-priya",
    title: "Harbor Health is in legal",
    body: "Priya asked for a signature target this week.",
    createdAtLabel: "2h ago",
    leadId: "priya-shah",
  },
  {
    id: "n-jordan",
    title: "New website capture",
    body: "Jordan Hale from Apex Logistics submitted pricing.",
    createdAtLabel: "Today",
    leadId: "jordan-hale",
  },
  {
    id: "n-campaign",
    title: "Inbound welcome sending soon",
    body: "44 replies this week · next send at 4:00 PM.",
    createdAtLabel: "Reminder",
    leadId: null as string | null,
  },
];

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function greetingForHour(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function getLead(id: string | undefined) {
  return LEADS.find((lead) => lead.id === id);
}

export function pipelineValue(leads: Lead[] = LEADS) {
  return leads.filter((lead) => lead.stage !== "lost" && lead.stage !== "won").reduce((sum, lead) => sum + lead.value, 0);
}

export function winRate(leads: Lead[] = LEADS) {
  const decided = leads.filter((lead) => lead.stage === "won" || lead.stage === "lost");
  if (!decided.length) return 0;
  return Math.round((leads.filter((lead) => lead.stage === "won").length / decided.length) * 100);
}

export function countByStage(stage: LeadStage, leads: Lead[] = LEADS) {
  return leads.filter((lead) => lead.stage === stage).length;
}
