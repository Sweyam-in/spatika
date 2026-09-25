/** Canonical copy-paste snippets for agent docs. Keys match `components[].slug`. */
export const SNIPPETS: Record<string, string> = {
  "lead-form": `import { LeadForm } from "@spatika/react";

<LeadForm
  action="Join the waitlist"
  placeholder="you@company.com"
  note="One email a month. Unsubscribe any time."
  onSubmit={async (email) => {
    await fetch("/api/subscribe", { method: "POST", body: JSON.stringify({ email }) });
  }}
/>`,

  "split-feature": `import { Button, ShowcaseFrame, SplitFeature, SplitFeatureGroup } from "@spatika/react";

<SplitFeatureGroup>
  <SplitFeature
    eyebrow="Tables"
    title="Data tables that hold up"
    description="Sorting, filters, pinned columns and bulk actions."
    bullets={["Virtualised rows", "Mobile layout that still works"]}
    actions={<Button variant="secondary">See the docs</Button>}
    media={<ShowcaseFrame url="app.sweyam.com"><img src="/table.png" alt="" /></ShowcaseFrame>}
  />
  <SplitFeature
    eyebrow="Charts"
    title="Charts on the same tokens"
    description="No second design language to maintain."
    media={<ShowcaseFrame chrome="window"><img src="/charts.png" alt="" /></ShowcaseFrame>}
  />
</SplitFeatureGroup>`,

  "comparison-table": `import { ComparisonTable } from "@spatika/react";

<ComparisonTable
  caption="Plan comparison"
  columns={[
    { id: "free", label: "Free" },
    { id: "team", label: "Team", featured: true, badge: "Popular" },
    { id: "ent", label: "Enterprise" },
  ]}
  groups={[
    {
      label: "Collaboration",
      rows: [
        { label: "Projects", values: { free: "3", team: "Unlimited", ent: "Unlimited" } },
        { label: "Shared tokens", values: { free: false, team: true, ent: true } },
      ],
    },
    {
      label: "Security",
      rows: [{ label: "SAML and SCIM", values: { free: false, team: false, ent: true } }],
    },
  ]}
/>`,

  "article-card": `import { ArticleCard, InitialsAvatar, Tag } from "@spatika/react";

<ArticleCard
  href="/blog/spatika-2-1"
  title="Spatika 2.1 adds a marketing layer"
  excerpt="Landing pages now run on the same tokens as your product screens."
  tags={<Tag>Release</Tag>}
  author="Sreelal Chalil"
  authorAvatar={<InitialsAvatar name="Sreelal Chalil" className="size-6" />}
  date="21 Sep 2026"
  readingTime="6 min read"
/>`,

  "marketing-section": `import { MarketingSection, SectionHeading } from "@spatika/react";

<MarketingSection tone="wash" backdrop="aurora" edge="both">
  <SectionHeading align="center" eyebrow="Platform" title="Everything in one system" />
</MarketingSection>`,

  "section-backdrop": `import { MarketingSection, SectionBackdrop } from "@spatika/react";

<MarketingSection backdrop={{ kind: "glow", strength: 0.7, animated: true }}>
  Content sits above the wash.
</MarketingSection>

// Or place one inside any positioned element:
<div className="relative isolate">
  <SectionBackdrop kind="grid" strength={0.5} />
</div>`,

  "marketing-hero": `import { AnnouncementPill, Button, MarketingHero, ShowcaseFrame } from "@spatika/react";

<MarketingHero
  layout="split"
  announcement={<AnnouncementPill href="/changelog" tag="New">Charts ship with 2.1</AnnouncementPill>}
  title="Ship the interface, not the CSS"
  lede="A React design system for product teams — four themes, density control and an application shell."
  actions={
    <>
      <Button size="lg">Get started</Button>
      <Button size="lg" variant="secondary">Read the docs</Button>
    </>
  }
  note="MIT licensed · No build step required"
  media={<ShowcaseFrame url="app.sweyam.com" tilt><img src="/shot.png" alt="Dashboard" /></ShowcaseFrame>}
/>`,

  "announcement-pill": `import { AnnouncementPill } from "@spatika/react";

<AnnouncementPill href="/changelog" tag="New">
  Spatika 2.1 — marketing blocks
</AnnouncementPill>`,

  "feature-grid": `import { FeatureCard, FeatureGrid } from "@spatika/react";
import { Layers, Rows3, Type } from "lucide-react";

<FeatureGrid columns={3}>
  <FeatureCard variant="card" icon={<Layers />} title="Calm surfaces" description="Solid material, hairline borders, restrained elevation." />
  <FeatureCard variant="card" icon={<Type />} title="Hierarchy from type" description="Size, weight and spacing carry structure." />
  <FeatureCard variant="card" icon={<Rows3 />} title="Professional density" description="One attribute retunes a whole region." />
</FeatureGrid>`,

  "bento-grid": `import { BentoCard, BentoGrid } from "@spatika/react";

<BentoGrid columns={3}>
  <BentoCard span={2} emphasis shine title="One system, four themes" description="Every component reads its colour from semantic tokens." />
  <BentoCard title="Charts included" description="SVG charts that follow the theme." />
  <BentoCard title="Data tables" description="Sorting, filters, pinned columns." />
  <BentoCard span={2} title="Application shell" description="Sidebar, top bar, command palette, mobile tab bar." />
</BentoGrid>`,

  "pricing-table": `import { Button, PricingCard, PricingTable } from "@spatika/react";

<PricingTable columns={3}>
  <PricingCard name="Free" price="$0" period="/month" description="For side projects." features={["Unlimited projects", "Community support"]} action={<Button variant="secondary" className="w-full">Start free</Button>} />
  <PricingCard featured badge="Most popular" name="Team" price="$19" period="/seat / month" description="For product teams." features={["Everything in Free", "Shared design tokens", { label: "SAML", excluded: true }]} action={<Button className="w-full">Start trial</Button>} note="14 days, no card" />
  <PricingCard name="Enterprise" price="Custom" description="For platform teams." features={["SAML and SCIM", "Priority support"]} action={<Button variant="secondary" className="w-full">Talk to us</Button>} />
</PricingTable>`,

  "testimonial-card": `import { InitialsAvatar, TestimonialCard } from "@spatika/react";

<TestimonialCard
  quote="We replaced three component libraries with one and shipped the dashboard in a week."
  author="Priya Nair"
  role="Head of Product, Sweyam"
  avatar={<InitialsAvatar name="Priya Nair" className="size-9" />}
/>`,

  "logo-cloud": `import { LogoCloud } from "@spatika/react";

<LogoCloud label="Trusted by teams at">
  <span>Sweyam</span>
  <span>Lumen Labs</span>
  <span>Parallel</span>
  <span>Northwind</span>
</LogoCloud>`,

  "stat-band": `import { StatBand } from "@spatika/react";

<StatBand
  stats={[
    { value: "99.98%", label: "Uptime" },
    { value: "2.4M", label: "Requests / day", hint: "p99 under 40ms" },
    { value: "180+", label: "Components" },
    { value: "4", label: "Themes" },
  ]}
/>`,

  "step-flow": `import { StepFlow } from "@spatika/react";

<StepFlow
  steps={[
    { title: "Install", description: "One package and one stylesheet." },
    { title: "Pick a theme", description: "Mukta, Neelam, Usha or Sandhya — or your brand." },
    { title: "Ship", description: "Compose screens from primitives and patterns." },
  ]}
/>`,

  "cta-band": `import { Button, CtaBand } from "@spatika/react";

<CtaBand
  tone="accent"
  title="Start building today"
  description="Install the package and have a themed screen running in minutes."
  actions={<Button variant="secondary" size="lg">npm install @spatika/react</Button>}
  note="MIT licensed"
/>`,

  "faq-section": `import { FaqSection } from "@spatika/react";

<FaqSection
  structuredData
  title="Questions"
  items={[
    { question: "Is Spatika free?", answer: "Yes — MIT licensed, and the source is on GitHub." },
    { question: "Does it support dark mode?", answer: "Two dark themes ship in the box: Neelam and Sandhya." },
  ]}
/>`,

  marquee: `import { Marquee } from "@spatika/react";

<Marquee duration={40} pauseOnHover>
  <span>Sweyam</span>
  <span>Lumen Labs</span>
  <span>Parallel</span>
</Marquee>`,

  reveal: `import { FeatureCard, FeatureGrid, Reveal } from "@spatika/react";

<FeatureGrid>
  {features.map((feature, index) => (
    <Reveal key={feature.title} delay={index * 80}>
      <FeatureCard variant="card" title={feature.title} description={feature.body} />
    </Reveal>
  ))}
</FeatureGrid>`,

  "showcase-frame": `import { ShowcaseFrame } from "@spatika/react";

<ShowcaseFrame url="app.sweyam.com" tilt shine>
  <img src="/dashboard.png" alt="Sweyam dashboard" />
</ShowcaseFrame>`,

  prose: `import { Prose } from "@spatika/react";

<Prose lead>
  <p>Spatika 2.1 adds a marketing layer to the system.</p>
  <h2>What changed</h2>
  <p>Landing pages are now built from the same tokens as your product screens.</p>
</Prose>`,

  button: `import { Button } from "@spatika/react";

<Button>Primary</Button>
<Button variant="glass" size="touch">Glass</Button>
<Button variant="gradient" size="xl">Get in touch</Button>`,

  "button-group": `import { Button, ButtonGroup } from "@spatika/react";

<ButtonGroup>
  <Button variant="outline">Left</Button>
  <Button variant="outline">Center</Button>
  <Button variant="outline">Right</Button>
</ButtonGroup>`,

  "icon-button": `import { IconButton } from "@spatika/react";
import { Search } from "lucide-react";

<IconButton aria-label="Search" variant="glass">
  <Search />
</IconButton>`,

  fab: `import { Fab } from "@spatika/react";
import { Plus } from "lucide-react";

<Fab aria-label="Add">
  <Plus />
</Fab>
<Fab variant="extended" size="md">
  <Plus />
  Compose
</Fab>`,

  link: `import { Link } from "@spatika/react";

<Link href="/docs">Component API</Link>`,

  typography: `import { Typography } from "@spatika/react";

<Typography variant="h4">Pipeline health</Typography>
<Typography variant="body2" color="muted">
  Theme type scale — captions, body, and display.
</Typography>`,

  badge: `import { Badge } from "@spatika/react";

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>`,

  avatar: `import { Avatar, AvatarFallback, InitialsAvatar } from "@spatika/react";

<Avatar>
  <AvatarFallback>AC</AvatarFallback>
</Avatar>
<InitialsAvatar name="Jordan Lee" className="size-10 text-sm font-bold" />`,

  "avatar-group": `import { AvatarGroup, InitialsAvatar } from "@spatika/react";

<AvatarGroup max={3}>
  <InitialsAvatar name="Alex Chen" className="size-10 text-sm font-bold" />
  <InitialsAvatar name="Jordan Lee" className="size-10 text-sm font-bold" />
  <InitialsAvatar name="Sam Rivera" className="size-10 text-sm font-bold" />
</AvatarGroup>`,

  accordion: `import {
  Accordion,
  AccordionActions,
  AccordionContent,
  AccordionItem,
  AccordionSummary,
  Button,
} from "@spatika/react";

<Accordion type="single" defaultValue="faq-1">
  <AccordionItem value="faq-1">
    <AccordionSummary>What is Spatika?</AccordionSummary>
    <AccordionContent>
      A React design system with shared tokens, four themes, and app chrome.
    </AccordionContent>
    <AccordionActions>
      <Button size="sm">Install</Button>
    </AccordionActions>
  </AccordionItem>
</Accordion>`,

  "button-base": `import { ButtonBase } from "@spatika/react";

<ButtonBase className="rounded-xl border border-border/50 px-4 py-2 text-sm font-bold">
  Pressable
</ButtonBase>`,

  rating: `import { Rating } from "@spatika/react";

<Rating value={3} onChange={setRating} />`,

  box: `import { Box } from "@spatika/react";

<Box className="rounded-xl border border-border/40 bg-card/40 px-4 py-3">
  Generic box
</Box>`,

  chip: `import { Chip } from "@spatika/react";

<Chip active>Active</Chip>
<Chip>Favorites</Chip>`,

  tag: `import { Tag } from "@spatika/react";

<Tag>Java</Tag>
<Tag variant="primary">AWS</Tag>
<Tag variant="orange">Kubernetes</Tag>`,

  wordmark: `import { Wordmark } from "@spatika/react";

<Wordmark name="Sweyam" accent=".io" />`,

  "gradient-text": `import { GradientText } from "@spatika/react";

<p className="text-2xl font-black">
  Hello <GradientText>Spatika</GradientText>
</p>`,

  "availability-badge": `import { AvailabilityBadge } from "@spatika/react";

<AvailabilityBadge>In office</AvailabilityBadge>
<AvailabilityBadge tone="success">Live</AvailabilityBadge>`,

  tabs: `import { Tabs, TabsContent, TabsList, TabsTrigger } from "@spatika/react";

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Pipeline health and recent leads.</TabsContent>
  <TabsContent value="activity">Calls and emails from this week.</TabsContent>
</Tabs>`,

  switch: `import { Switch } from "@spatika/react";

<Switch checked={notify} onCheckedChange={setNotify} aria-label="Notifications" />`,

  input: `import { Input } from "@spatika/react";

<Input placeholder="Search contacts…" />`,

  "text-field": `import { TextField } from "@spatika/react";

<TextField
  label="Email"
  placeholder="alex@sweyam.com"
  helperText="We'll never share this."
  fullWidth
/>`,

  autocomplete: `import { Autocomplete } from "@spatika/react";

<Autocomplete
  label="Movie"
  options={["Inception", "Heat", "Her"]}
  value={movie}
  onChange={setMovie}
  placeholder="Search films…"
/>`,

  "outlined-input": `import { InputAdornment, OutlinedInput } from "@spatika/react";

<OutlinedInput
  placeholder="Amount"
  startAdornment={<InputAdornment>$</InputAdornment>}
  endAdornment={<InputAdornment position="end">USD</InputAdornment>}
/>`,

  "form-control": `import { FormControl, FormHelperText, FormLabel, Input } from "@spatika/react";

<FormControl required>
  <FormLabel>Workspace</FormLabel>
  <Input placeholder="sweyam" />
  <FormHelperText>Lowercase, no spaces.</FormHelperText>
</FormControl>`,

  select: `import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@spatika/react";

<Select defaultValue="neelam">
  <SelectTrigger className="w-[200px]">
    <SelectValue placeholder="Theme" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="mukta">Mukta</SelectItem>
    <SelectItem value="neelam">Neelam</SelectItem>
    <SelectItem value="usha">Usha</SelectItem>
    <SelectItem value="sandhya">Sandhya</SelectItem>
  </SelectContent>
</Select>`,

  "textarea-autosize": `import { TextareaAutosize } from "@spatika/react";

<TextareaAutosize placeholder="Write a note…" minRows={2} />`,

  "spatika-editor": `import "@spatika/editor/styles.css";
import { AI_PROMPT_ACTION_ID, SpatikaEditor } from "@spatika/editor";

<SpatikaEditor
  value={html}
  onChange={setHtml}
  placeholder="Start writing…"
  mentions={[{ id: "1", label: "Asha Verma" }]}
  aiCommandMenu={{
    title: "Doc AI",
    actions: [
      { id: "rewrite", label: "Rewrite selection", requiresSelection: true },
      { id: "continue", label: "Write a new paragraph" },
    ],
    prompt: { placeholder: "Edit this document with AI…" },
  }}
  onAiCommand={async ({ actionId, prompt, selectedText, documentText, html }) => {
    if (actionId === AI_PROMPT_ACTION_ID) return runPrompt(prompt, { documentText, html });
    return rewrite(actionId, selectedText);
  }}
  toolbar={{ layout: "ribbon" }}
/>`,

  "use-spatika-editor": `import "@spatika/editor/styles.css";
import { EditorContent } from "@tiptap/react";
import { useSpatikaEditor } from "@spatika/editor";

const { editor, isReady } = useSpatikaEditor({
  value: html,
  onChange: setHtml,
  placeholder: "Start writing…",
});

return isReady ? <EditorContent editor={editor} /> : null;`,

  "rich-text-editor": `import "@spatika/editor/styles.css";
import { RichTextEditor } from "@spatika/react";

<RichTextEditor value={html} onChange={setHtml} placeholder="Write something…" />`,

  "transfer-list": `import { TransferList } from "@spatika/react";

<TransferList
  left={["Java", "Go"]}
  right={["TypeScript"]}
  onChange={({ left, right }) => {
    setLeft(left);
    setRight(right);
  }}
/>`,

  checkbox: `import { Checkbox, FormControlLabel } from "@spatika/react";

<FormControlLabel
  control={<Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} />}
  label="I agree to the terms"
/>`,

  "form-control-label": `import { FormControlLabel, Switch } from "@spatika/react";

<FormControlLabel
  control={<Switch checked={notify} onCheckedChange={setNotify} />}
  label="Push notifications"
/>`,

  slider: `import { Slider } from "@spatika/react";

<Slider value={volume} onValueChange={setVolume} />`,

  "toggle-button": `import { ToggleButton, ToggleButtonGroup } from "@spatika/react";

<ToggleButtonGroup exclusive value={align} onValueChange={setAlign} aria-label="Alignment">
  <ToggleButton value="left">Left</ToggleButton>
  <ToggleButton value="center">Center</ToggleButton>
  <ToggleButton value="right">Right</ToggleButton>
</ToggleButtonGroup>`,

  "search-field": `import { SearchField } from "@spatika/react";

<SearchField placeholder="Search people, lists, notes…" />`,

  "chip-group": `import { ChipGroup, toggleOptionValue } from "@spatika/react";

<ChipGroup
  options={[
    { value: "all", label: "All" },
    { value: "fav", label: "Favorites" },
    { value: "archived", label: "Archived" },
  ]}
  selected={chips}
  onToggle={(value) => setChips(toggleOptionValue(chips, value))}
  variant="filter"
/>`,

  "segmented-control": `import { SegmentedControl } from "@spatika/react";

<SegmentedControl
  aria-label="Period"
  value={period}
  onChange={setPeriod}
  options={[
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
  ]}
/>`,

  paper: `import { Paper, Typography } from "@spatika/react";

<Paper className="p-4" variant="glass">
  <Typography variant="subtitle2">Glass paper</Typography>
</Paper>`,

  grid: `import { Grid, Paper } from "@spatika/react";

<Grid container spacing={2}>
  <Grid xs={6}><Paper className="p-3">6</Paper></Grid>
  <Grid xs={6}><Paper className="p-3">6</Paper></Grid>
</Grid>`,

  masonry: `import { Masonry, Paper } from "@spatika/react";

<Masonry columns={3} spacing={8}>
  <Paper className="h-16" />
  <Paper className="h-10" />
  <Paper className="h-20" />
</Masonry>`,

  stack: `import { Badge, Button, Stack, Typography } from "@spatika/react";

<Stack direction="row" spacing={2} align="center">
  <Badge>New</Badge>
  <Typography variant="body2">Stacked with gap</Typography>
  <Button size="sm">Action</Button>
</Stack>`,

  container: `import { Container } from "@spatika/react";

<Container maxWidth="sm">Page content</Container>`,

  list: `import {
  InitialsAvatar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@spatika/react";

<Paper variant="outlined">
  <List disablePadding>
    <ListItem disablePadding>
      <ListItemButton>
        <ListItemIcon>
          <InitialsAvatar name="Alex Chen" className="size-8 text-[10px] font-bold" />
        </ListItemIcon>
        <ListItemText primary="Alex Chen" secondary="Product designer" />
      </ListItemButton>
    </ListItem>
  </List>
</Paper>`,

  card: `import { Card, CardContent, CardHeader, CardTitle } from "@spatika/react";

<Card>
  <CardHeader>
    <CardTitle>Surface card</CardTitle>
  </CardHeader>
  <CardContent>Structured content with header and body regions.</CardContent>
</Card>`,

  "glass-card": `// Deprecated in 2.0 — prefer <Card surface="raised">. GlassCard maps onto the same surfaces.
import { CardContent, CardHeader, CardTitle, GlassCard } from "@spatika/react";

<GlassCard>
  <CardHeader>
    <CardTitle>Frosted panel</CardTitle>
  </CardHeader>
  <CardContent>Elevated calm surface from the token system.</CardContent>
</GlassCard>`,

  metric: `import { Card, Metric, MetricGroup, SparkLineChart } from "@spatika/react";

<Card padding="none">
  <MetricGroup columns={3}>
    <Metric label="MRR" value={184320} format="currency" precision={0} delta={0.064} caption="vs August"
      chart={<SparkLineChart data={[148, 152, 158, 166, 171, 184]} height={28} />} />
    <Metric label="Churn" value={0.018} format="percent" delta={-0.004} deltaIntent="inverse" />
    <Metric label="Latency p95" value={182} unit="ms" delta={0.08} deltaIntent="inverse" />
  </MetricGroup>
</Card>`,

  "data-table": `import { Badge, Button, DataTable, type DataTableColumn } from "@spatika/react";

const columns: DataTableColumn<Customer>[] = [
  { id: "name", header: "Customer", accessor: (c) => c.name, sortable: true, pin: "left", width: 220 },
  { id: "status", header: "Status", accessor: (c) => c.status, mobile: "subtitle",
    cell: (c) => <Badge variant="success" dot>{c.status}</Badge> },
  { id: "mrr", header: "MRR", accessor: (c) => c.mrr, sortable: true, numeric: true },
];

<DataTable
  aria-label="Customers"
  data={customers}
  columns={columns}
  getRowId={(c) => c.id}
  density="compact"
  selectable
  pageSize={20}
  bulkActions={(rows, clear) => <Button size="xs" variant="secondary" onClick={clear}>Export {rows.length}</Button>}
/>`,

  "app-shell": `import { AppShell, NavItem, NavSection, SearchTrigger, Sidebar, TopBar, UserMenu, WorkspaceSwitcher } from "@spatika/react";

<AppShell
  sidebar={
    <Sidebar
      header={<WorkspaceSwitcher workspaces={workspaces} value={id} onValueChange={setId} />}
      footer={<UserMenu name="Maya Okafor" email="maya@sweyam.com">…</UserMenu>}
    >
      <NavSection>
        <NavItem icon={<Home />} label="Overview" active />
        <NavItem icon={<Users />} label="Customers" meta="1,284" />
      </NavSection>
    </Sidebar>
  }
  topbar={<TopBar title="Customers"><SearchTrigger onOpen={openPalette} /></TopBar>}
>
  {page}
</AppShell>`,

  "command-palette": `import { CommandPalette, SearchTrigger } from "@spatika/react";
import { useState } from "react";

export function Search({ goHome }: { goHome: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <SearchTrigger onOpen={() => setOpen(true)} />
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        groups={[{ heading: "Navigate", items: [{ id: "home", label: "Overview", shortcut: ["G", "O"], onSelect: goHome }] }]}
      />
    </>
  );
}`,

  "page-section": `import { Button, PageSection } from "@spatika/react";

<PageSection title="Accounts" description="Balances refresh every 15 minutes."
  actions={<Button size="sm" variant="secondary">Link account</Button>}>
  <AccountList />
</PageSection>`,

  panel: `import { Panel, LineChart } from "@spatika/react";

<Panel title="Revenue" description="Last 6 months" actions={<SegmentedControl … />}>
  <LineChart height={240} xAxis={[{ data: months }]} series={[{ label: "Revenue", data }]} />
</Panel>`,

  "stat-card": `import { SparkLineChart, StatCard } from "@spatika/react";

<StatCard
  label="Users"
  value="144k"
  hint="+12 this week"
  chart={<SparkLineChart data={[8, 12, 9, 16, 14, 22]} height={40} />}
/>`,

  "section-heading": `import { SectionHeading } from "@spatika/react";

<SectionHeading
  eyebrow="Product"
  title="What's shipping"
  subtitle="Glass composites for app chrome, charts, and marketing."
/>`,

  "icon-tile": `import { IconTile } from "@spatika/react";

<IconTile icon="⌘" title="Design systems" description="Tokens, themes, and chrome." />`,

  "career-card": `import { CareerCard, CareerTimeline } from "@spatika/react";

<CareerTimeline>
  <CareerCard
    role="Staff engineer"
    company="Sweyam"
    period="2022 — now"
    current
    bullets={["Shipped the glass design system"]}
    tags={["React", "TypeScript"]}
  />
</CareerTimeline>`,

  "project-card": `import { ProjectCard } from "@spatika/react";

<ProjectCard
  title="Spatika UI"
  company="Open source"
  outcome="Shipped"
  description="Glass React design system."
  tags={["React", "Tokens"]}
/>`,

  "float-chip": `import { FloatChip } from "@spatika/react";

<FloatChip>San Francisco</FloatChip>`,

  "meta-chip": `import { MetaChip } from "@spatika/react";

<MetaChip>Powered by Spatika</MetaChip>`,

  "entity-card": `import {
  EntityCard,
  EntityCardChip,
  EntityCardMeta,
  EntityCardTitle,
  InitialsAvatar,
} from "@spatika/react";

<EntityCard interactive>
  <InitialsAvatar name="Alex Chen" className="size-10 shrink-0 text-sm font-bold" />
  <div className="min-w-0 flex-1">
    <EntityCardTitle>Alex Chen</EntityCardTitle>
    <EntityCardMeta>Product designer · San Francisco</EntityCardMeta>
  </div>
  <EntityCardChip>Active</EntityCardChip>
</EntityCard>`,

  "list-row": `import { Badge, ListRow } from "@spatika/react";

<ListRow active trailing={<Badge variant="secondary">Active</Badge>}>
  <strong>Alex Chen</strong>
  <p className="text-muted">Product designer</p>
</ListRow>`,

  stepper: `import { Step, StepLabel, Stepper } from "@spatika/react";

<Stepper activeStep={1}>
  <Step><StepLabel>Account</StepLabel></Step>
  <Step><StepLabel>Details</StepLabel></Step>
  <Step><StepLabel>Done</StepLabel></Step>
</Stepper>`,

  "mobile-stepper": `import { MobileStepper } from "@spatika/react";

<MobileStepper steps={3} activeStep={1} variant="dots" />`,

  "app-bar": `import { AppBar, Toolbar, Typography } from "@spatika/react";

<AppBar position="sticky">
  <Toolbar>
    <Typography variant="h6">Spatika</Typography>
  </Toolbar>
</AppBar>`,

  "bottom-navigation": `import { BottomNavigation, BottomNavigationAction } from "@spatika/react";
import { Home, Search, User } from "lucide-react";

<BottomNavigation value={nav} onChange={(_event, value) => setNav(value)}>
  <BottomNavigationAction value="home" label="Home" icon={<Home />} />
  <BottomNavigationAction value="search" label="Search" icon={<Search />} />
  <BottomNavigationAction value="you" label="You" icon={<User />} />
</BottomNavigation>`,

  menu: `import { Button, Menu, MenuItem } from "@spatika/react";

<Button variant="outline" onClick={(event) => setAnchor(event.currentTarget)}>
  Open menu
</Button>
<Menu anchorEl={anchor} open={Boolean(anchor)} onOpenChange={(next) => !next && setAnchor(null)}>
  <MenuItem onClick={() => setAnchor(null)}>Duplicate</MenuItem>
  <MenuItem onClick={() => setAnchor(null)}>Archive</MenuItem>
</Menu>`,

  breadcrumb: `import { Breadcrumb } from "@spatika/react";

<Breadcrumb items={[{ label: "Leads", href: "/leads" }, { label: "Alex Chen" }]} />`,

  pagination: `import { Pagination } from "@spatika/react";

<Pagination page={2} pageCount={12} onPageChange={setPage} />`,

  "speed-dial": `import { SpeedDial, SpeedDialAction } from "@spatika/react";
import { Plus, Share2 } from "lucide-react";

<SpeedDial ariaLabel="Create" icon={<Plus />}>
  <SpeedDialAction icon={<Share2 />} tooltipTitle="Share" />
</SpeedDial>`,

  "app-header": `import { AppHeader } from "@spatika/react";

<AppHeader variant="chrome" title="Spatika" />`,

  "site-nav": `import { SiteNav } from "@spatika/react";

<SiteNav
  brand="Spatika"
  links={[
    { label: "Product", href: "/product" },
    { label: "Docs", href: "/docs" },
  ]}
/>`,

  "site-footer": `import { SiteFooter } from "@spatika/react";

<SiteFooter brand="Spatika" links={[{ label: "GitHub", href: "https://github.com" }]} />`,

  "contact-link": `import { ContactLink } from "@spatika/react";

<ContactLink href="mailto:hi@example.com" name="Email" label="hi@example.com" icon="@" />`,

  "floating-page-chrome": `import {
  Button,
  FloatingPageChromeBar,
  FloatingPageChromeIdentity,
  FloatingPageChromeSearchField,
} from "@spatika/react";

<FloatingPageChromeBar
  identity={<FloatingPageChromeIdentity title="Leads" count={128} />}
  search={
    <FloatingPageChromeSearchField
      value={query}
      onChange={setQuery}
      placeholder="Search leads…"
    />
  }
  actions={<Button size="sm">New</Button>}
>
  <main className="app-tabbar-clearance px-4 py-6">{/* list */}</main>
</FloatingPageChromeBar>`,

  "page-sticky-header": `import { PageStickyHeader } from "@spatika/react";

<PageStickyHeader title="Settings" subtitle="Account preferences" />`,

  "mobile-tab-bar": `import { MobileTabBar } from "@spatika/react";
import { Home, Inbox, Search, User } from "lucide-react";

<MobileTabBar
  items={[
    { id: "home", label: "Home", icon: Home, active: true, onClick: () => setTab("home") },
    { id: "search", label: "Search", icon: Search, onClick: () => setTab("search") },
    { id: "inbox", label: "Inbox", icon: Inbox, onClick: () => setTab("inbox") },
    { id: "you", label: "You", icon: User, onClick: () => setTab("you") },
  ]}
/>`,

  "filter-sheet": `import { Button, ChipGroup, FilterSheet, toggleOptionValue } from "@spatika/react";
import { useState } from "react";

export function Filters() {
  const [open, setOpen] = useState(false);
  const [chips, setChips] = useState<string[]>(["all"]);
  return (
    <FilterSheet
      open={open}
      onOpenChange={setOpen}
      title="View & filters"
      description="Status, owner, and source."
      trigger={<Button variant="secondary">Open filters</Button>}
    >
      <ChipGroup
        title="Status"
        options={[
          { value: "all", label: "All" },
          { value: "open", label: "Open" },
        ]}
        selected={chips}
        onToggle={(value) => setChips(toggleOptionValue(chips, value))}
        variant="filter"
      />
    </FilterSheet>
  );
}`,

  "header-icon-button": `import { HeaderIconButton } from "@spatika/react";
import { Bell } from "lucide-react";

<HeaderIconButton aria-label="Notifications" badge={3}>
  <Bell className="size-4" />
</HeaderIconButton>`,

  "cover-hero": `import { Badge, CoverHero } from "@spatika/react";

<CoverHero
  title="Coastal Drive"
  kicker={<Badge variant="secondary">Album</Badge>}
  coverSeed="coast"
  facts={[
    { key: "photos", label: "Photos", value: "24" },
    { key: "places", label: "Places", value: "6" },
  ]}
/>`,

  "profile-hero": `import { ProfileHero, useCoverChromeBleed } from "@spatika/react";

function ProfilePage() {
  useCoverChromeBleed("dark");
  return <ProfileHero name="Alex Chen" alias="Product designer" coverSeed="alex" />;
}`,

  "entity-media-card": `import { EntityMediaCard } from "@spatika/react";

<EntityMediaCard title="Alex Chen" subtitle="Product designer" statusLine="Active" />`,

  "image-list": `import { CoverPattern, ImageList, ImageListItem, ImageListItemBar } from "@spatika/react";

<ImageList cols={3} rowHeight={148} gap={10}>
  <ImageListItem>
    <CoverPattern seed="coast" hue={205} />
    <ImageListItemBar title="Coast" />
  </ImageListItem>
</ImageList>`,

  progress: `import { Progress } from "@spatika/react";

<Progress value={62} />
<Progress variant="indeterminate" />`,

  "circular-progress": `import { CircularProgress } from "@spatika/react";

<CircularProgress />
<CircularProgress variant="determinate" value={62} />`,

  skeleton: `import { Skeleton } from "@spatika/react";

<Skeleton className="h-4 w-full" />
<Skeleton className="h-10 w-full rounded-xl" />`,

  alert: `import { Alert, AlertDescription, AlertTitle } from "@spatika/react";

<Alert>
  <AlertTitle>Heads up</AlertTitle>
  <AlertDescription>Your session will expire in 5 minutes.</AlertDescription>
</Alert>`,

  "empty-state": `import { EmptyState } from "@spatika/react";

<EmptyState
  title="Nothing here"
  description="Try adjusting your filters."
  actionLabel="Reset filters"
  onAction={() => reset()}
/>`,

  toast: `import { Button, Toaster, useToast } from "@spatika/react";

function SaveButton() {
  const { toast } = useToast();
  return (
    <Button onClick={() => toast({ title: "Saved", tone: "success" })}>
      Save
    </Button>
  );
}

<Toaster>
  <SaveButton />
</Toaster>`,

  snackbar: `import { Button, Snackbar } from "@spatika/react";
import { useState } from "react";

export function ArchiveNote() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Archive</Button>
      <Snackbar
        open={open}
        onClose={() => setOpen(false)}
        message="Note archived"
        action={<Button size="sm" variant="ghost">Undo</Button>}
      />
    </>
  );
}`,

  dialog: `import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@spatika/react";

<Dialog>
  <DialogTrigger asChild>
    <Button size="sm">Open dialog</Button>
  </DialogTrigger>
  <DialogContent className="max-w-sm">
    <DialogHeader>
      <DialogTitle>Invite teammate</DialogTitle>
      <DialogDescription>They’ll get an email with a join link.</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>`,

  modal: `import { Button, Modal, Paper, Typography } from "@spatika/react";
import { useState } from "react";

export function CustomSurface() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open</Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Paper className="w-[min(320px,90vw)] p-5">
          <Typography variant="h6">Custom surface</Typography>
          <Button className="mt-4" size="sm" onClick={() => setOpen(false)}>Close</Button>
        </Paper>
      </Modal>
    </>
  );
}`,

  tooltip: `import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@spatika/react";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button size="sm" variant="outline">Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>Add to library</TooltipContent>
  </Tooltip>
</TooltipProvider>`,

  table: `import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@spatika/react";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Role</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Alex Chen</TableCell>
      <TableCell>Designer</TableCell>
    </TableRow>
  </TableBody>
</Table>`,

  "table-pagination": `import { TablePagination } from "@spatika/react";

<TablePagination
  count={42}
  page={page}
  onPageChange={setPage}
  rowsPerPage={rowsPerPage}
  onRowsPerPageChange={setRowsPerPage}
/>`,

  "chart-data-grid": `import { ChartDataGrid } from "@spatika/charts";

<ChartDataGrid
  height={180}
  categoryField="name"
  valueField="views"
  rows={[
    { id: "web", name: "Web", views: 420, share: 0.42, trend: [12, 18, 16, 24] },
    { id: "ios", name: "iOS", views: 280, share: 0.28, trend: [8, 9, 11, 14] },
  ]}
  columns={[
    { field: "name", headerName: "Channel" },
    { field: "views", headerName: "Views", type: "number" },
    { field: "share", headerName: "Share", type: "bar" },
    { field: "trend", headerName: "Trend", type: "sparkline" },
  ]}
/>`,

  "event-calendar": `import { EventCalendar } from "@spatika/react";

<EventCalendar
  events={events}
  resources={[
    { id: "work", title: "Work", color: "violet" },
    { id: "health", title: "Health", color: "teal" },
  ]}
  onEventChange={(event, next) => updateEvent(event.id, next)}
  showEventEditor={false}
  onEventClick={(event) => openHostEditor(event)}
  onSlotClick={(slot) => openHostCreate(slot.start)}
  renderEvent={(event) => event.title}
  toolbarDensity="compact"
  showDateJump
  onVisibleRangeChange={(range) => fetchRange(range.start, range.end)}
/>`,

  "event-timeline": `import { EventTimeline } from "@spatika/react";

<EventTimeline
  events={events}
  resources={[{ id: "eng", title: "Engineering", color: "violet" }]}
/>`,

  "chart-container": `import {
  BarPlot,
  ChartContainer,
  ChartSurface,
  ChartsBrush,
  ChartsGrid,
  ChartsReferenceLine,
  ChartsXAxis,
  ChartsYAxis,
  LinePlot,
} from "@spatika/charts";

<ChartContainer
  height={280}
  zoom
  showToolbar
  dataset={[
    { month: "Jan", views: 420, conv: 12 },
    { month: "Feb", views: 380, conv: 18 },
  ]}
  xAxis={[{ dataKey: "month" }]}
  series={[
    { type: "bar", dataKey: "views", label: "Views" },
    { type: "line", dataKey: "conv", label: "Conversion" },
  ]}
>
  <ChartSurface>
    <ChartsGrid />
    <BarPlot />
    <LinePlot />
    <ChartsXAxis />
    <ChartsYAxis />
    <ChartsReferenceLine />
    <ChartsBrush />
  </ChartSurface>
</ChartContainer>`,

  "bar-chart": `import { BarChart } from "@spatika/charts";

<BarChart
  height={240}
  showBarBackground
  xAxis={[{ data: ["Jan", "Feb", "Mar"], tickAngle: -32 }]}
  series={[
    { label: "Views", data: [420, 380, 510] },
    { label: "Signups", data: [120, 150, 140] },
  ]}
  onItemClick={(item) => openMonth(item.category)}
/>`,

  "line-chart": `import { LineChart } from "@spatika/charts";

<LineChart
  height={240}
  xAxis={[{ data: ["Jan", "Feb", "Mar"] }]}
  series={[
    { label: "Revenue", data: [12, 18, 16] },
    { label: "Cost", data: [8, 9, 11] },
  ]}
/>`,

  "area-chart": `import { AreaChart } from "@spatika/charts";

<AreaChart
  height={240}
  stacked
  xAxis={[{ data: ["Jan", "Feb", "Mar"] }]}
  series={[
    { label: "v1", data: [20, 28, 32] },
    { label: "v2", data: [48, 62, 70] },
  ]}
  referenceLines={[{ y: 50, label: "Capacity" }]}
/>`,

  "pie-chart": `import { PieChart } from "@spatika/charts";

<PieChart
  height={240}
  labelLine
  series={[
    {
      innerRadius: "42%",
      outerRadius: "80%",
      paddingAngle: 2,
      data: [
        { id: "web", value: 42, label: "Web" },
        { id: "ios", value: 28, label: "iOS" },
        { id: "and", value: 18, label: "Android" },
      ],
    },
  ]}
  onItemClick={(item) => filterByChannel(item.seriesId)}
/>`,

  "scatter-chart": `import { ScatterChart } from "@spatika/charts";

<ScatterChart
  height={240}
  series={[
    {
      label: "Cohort A",
      data: [
        { x: 12, y: 28, id: 1 },
        { x: 22, y: 36, id: 2 },
        { x: 44, y: 48, id: 4 },
      ],
    },
  ]}
/>`,

  "scatter-webgl": `import { ScatterChart } from "@spatika/charts";

<ScatterChart
  height={240}
  renderer="webgl"
  series={[
    {
      label: "Cohort A",
      data: [
        { x: 12, y: 28, id: 1 },
        { x: 44, y: 48, id: 2 },
      ],
    },
  ]}
/>`,

  sparkline: `import { SparkLineChart } from "@spatika/charts";

<SparkLineChart data={[8, 12, 9, 16, 14, 22, 18]} labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]} height={64} />`,

  gauge: `import { Gauge } from "@spatika/charts";

<Gauge
  height={240}
  startAngle={-90}
  endAngle={90}
  sections={[
    { value: 40, label: "v5" },
    { value: 35, label: "v6" },
    { value: 25, label: "v7" },
  ]}
/>`,

  "radar-chart": `import { RadarChart } from "@spatika/charts";

<RadarChart
  height={280}
  radar={{ metrics: ["Speed", "Reliability", "UX", "A11y"] }}
  series={[{ label: "Spatika", data: [90, 86, 92, 88] }]}
/>`,

  heatmap: `import { Heatmap } from "@spatika/charts";

<Heatmap
  height={240}
  xAxis={[{ data: ["Mon", "Tue", "Wed"] }]}
  yAxis={[{ data: ["AM", "PM"] }]}
  series={[{ data: [{ x: 0, y: 0, value: 4 }, { x: 1, y: 1, value: 8 }] }]}
  showCellLabels
  onItemClick={(item) => openCell(item.category)}
/>`,

  "funnel-chart": `import { FunnelChart } from "@spatika/charts";

<FunnelChart
  height={240}
  valueFormatter={(value) => \`\${value}%\`}
  series={[
    {
      label: "2000",
      data: [
        { label: "Primary", value: 85 },
        { label: "Secondary", value: 50 },
      ],
    },
    {
      label: "2020",
      data: [
        { label: "Primary", value: 90 },
        { label: "Secondary", value: 67 },
      ],
    },
  ]}
/>`,

  "pyramid-chart": `import { PyramidChart } from "@spatika/charts";

<PyramidChart
  height={240}
  series={[
    {
      data: [
        { id: "exec", value: 8, label: "Exec" },
        { id: "lead", value: 24, label: "Lead" },
        { id: "ic", value: 72, label: "IC" },
      ],
    },
  ]}
/>`,

  "sankey-chart": `import { SankeyChart } from "@spatika/charts";

<SankeyChart
  height={240}
  series={{
    data: [{ id: "docs" }, { id: "trial" }, { id: "paid" }],
    links: [
      { source: "docs", target: "trial", value: 40 },
      { source: "trial", target: "paid", value: 18 },
    ],
  }}
/>`,

  "range-bar-chart": `import { RangeBarChart } from "@spatika/charts";

<RangeBarChart
  height={240}
  xAxis={[{ data: ["Jan", "Feb", "Mar"] }]}
  series={[{ label: "Range", data: [[12, 28], [18, 36], [16, 40]] }]}
/>`,

  "candlestick-chart": `import { CandlestickChart } from "@spatika/charts";

<CandlestickChart
  height={240}
  xAxis={[{ data: ["Mon", "Tue", "Wed"] }]}
  series={[{ data: [{ open: 20, high: 28, low: 18, close: 24 }] }]}
/>`,

  "radial-bar-chart": `import { RadialBarChart } from "@spatika/charts";

<RadialBarChart
  height={240}
  series={[
    {
      data: [
        { label: "Mukta", value: 92 },
        { label: "Neelam", value: 74 },
      ],
    },
  ]}
/>`,

  "radial-line-chart": `import { RadialLineChart } from "@spatika/charts";

<RadialLineChart
  height={240}
  metrics={["Q1", "Q2", "Q3", "Q4"]}
  series={[{ label: "Latency", data: [40, 62, 55, 80] }]}
/>`,

  "linear-gauge": `import { LinearGauge } from "@spatika/charts";

<LinearGauge value={62} />`,

  "bubble-chart": `import { BubbleChart } from "@spatika/charts";

<BubbleChart
  height={240}
  series={[
    {
      label: "Markets",
      data: [
        { x: 10, y: 20, z: 12, id: 1 },
        { x: 25, y: 35, z: 28, id: 2 },
      ],
    },
  ]}
/>`,

  "range-area-chart": `import { RangeAreaChart } from "@spatika/charts";

<RangeAreaChart
  height={240}
  xAxis={[{ data: ["Jan", "Feb", "Mar"] }]}
  series={[{ label: "Band", data: [[10, 20], [12, 24], [14, 28]] }]}
/>`,

  treemap: `import { Treemap } from "@spatika/charts";

<Treemap
  height={240}
  series={[
    {
      data: [
        { label: "Chrome", value: 48 },
        { label: "Safari", value: 22 },
        { label: "Firefox", value: 16 },
      ],
    },
  ]}
/>`,

  "polar-line-chart": `import { PolarLineChart } from "@spatika/charts";

<PolarLineChart
  height={240}
  radar={{ metrics: ["CPU", "RAM", "Disk", "Net"] }}
  series={[{ label: "Load", data: [70, 55, 40, 80] }]}
/>`,

  "chord-chart": `import { ChordChart } from "@spatika/charts";

<ChordChart
  height={240}
  series={{
    data: ["Docs", "App", "API"],
    matrix: [
      [0, 8, 4],
      [6, 0, 7],
      [3, 5, 0],
    ],
  }}
/>`,

  "waterfall-chart": `import { WaterfallChart } from "@spatika/charts";

<WaterfallChart
  height={240}
  xAxis={[{ data: ["Start", "New", "Churn", "End"] }]}
  series={[{ data: [120, 40, -18, null] }]}
/>`,

  "boxplot-chart": `import { BoxPlotChart } from "@spatika/charts";

<BoxPlotChart
  height={240}
  xAxis={[{ data: ["A", "B"] }]}
  series={[{ data: [[2, 4, 5, 7, 9], [1, 3, 4, 6, 8]] }]}
/>`,

  "ohlc-chart": `import { OhlcChart } from "@spatika/charts";

<OhlcChart
  height={240}
  xAxis={[{ data: ["Mon", "Tue"] }]}
  series={[{ data: [{ open: 20, high: 28, low: 18, close: 24 }] }]}
/>`,

  "sunburst-chart": `import { SunburstChart } from "@spatika/charts";

<SunburstChart
  height={240}
  series={[
    {
      data: [
        {
          label: "Product",
          children: [
            { label: "App", value: 40 },
            { label: "Docs", value: 22 },
          ],
        },
      ],
    },
  ]}
/>`,

  "map-chart": `import { MapChart, type GeoJsonFeatureCollection } from "@spatika/charts";

const geoData: GeoJsonFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "north",
      properties: { name: "North" },
      geometry: { type: "Polygon", coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]] },
    },
  ],
};

<MapChart
  height={240}
  geoData={geoData}
  series={[{ data: [{ id: "north", value: 64, label: "North" }] }]}
/>`,

  "bar-chart-3d": `import { BarChart3D } from "@spatika/charts";

<BarChart3D
  height={240}
  xAxis={[{ data: ["Jan", "Feb", "Mar"] }]}
  series={[{ label: "Views", data: [42, 38, 51] }]}
/>`,

  "pie-chart-3d": `import { PieChart3D } from "@spatika/charts";

<PieChart3D
  height={240}
  series={[
    {
      data: [
        { id: "web", value: 42, label: "Web" },
        { id: "ios", value: 28, label: "iOS" },
      ],
    },
  ]}
/>`,
};
