import type { ComponentEntry } from "../data/navigation";

const SOURCE: Record<string, string> = {
  "lead-form": `import { LeadForm } from "@spatika/react";

export default function Demo() {
  return (
    <LeadForm
      action="Join the waitlist"
      note="One email a month. Unsubscribe any time."
      onSubmit={async (email) => {
        await fetch("/api/subscribe", {
          method: "POST",
          body: JSON.stringify({ email }),
        });
      }}
    />
  );
}`,
  "split-feature": `import { Button, ShowcaseFrame, SplitFeature, SplitFeatureGroup } from "@spatika/react";

export default function Demo() {
  return (
    <SplitFeatureGroup>
      <SplitFeature
        eyebrow="Tables"
        title="Data tables that hold up"
        description="Sorting, filters, pinned columns and bulk actions."
        bullets={["Virtualised rows", "A mobile layout that still works"]}
        actions={<Button variant="secondary">See the docs</Button>}
        media={<ShowcaseFrame url="app.sweyam.com"><img src="/table.png" alt="" /></ShowcaseFrame>}
      />
      <SplitFeature
        eyebrow="Charts"
        title="Charts on the same tokens"
        description="No second design language to maintain."
        media={<ShowcaseFrame chrome="window"><img src="/charts.png" alt="" /></ShowcaseFrame>}
      />
    </SplitFeatureGroup>
  );
}`,
  "comparison-table": `import { Button, ComparisonTable } from "@spatika/react";

export default function Demo() {
  return (
    <ComparisonTable
      caption="Plan comparison"
      columns={[
        { id: "free", label: "Free", description: "For side projects" },
        { id: "team", label: "Team", description: "For product teams", featured: true, badge: "Popular", action: <Button size="sm">Start trial</Button> },
        { id: "ent", label: "Enterprise", description: "For platform teams" },
      ]}
      groups={[
        {
          label: "Collaboration",
          rows: [
            { label: "Projects", values: { free: "3", team: "Unlimited", ent: "Unlimited" } },
            { label: "Shared design tokens", values: { free: false, team: true, ent: true } },
          ],
        },
        {
          label: "Security",
          rows: [
            { label: "SAML and SCIM", hint: "Okta, Entra, Google", values: { free: false, team: false, ent: true } },
          ],
        },
      ]}
    />
  );
}`,
  "article-card": `import { ArticleCard, InitialsAvatar, Tag } from "@spatika/react";

export default function Demo() {
  return (
    <ArticleCard
      href="/blog/spatika-2-1"
      title="Spatika 2.1 adds a marketing layer"
      excerpt="Landing pages now run on the same tokens as your product screens — heroes, pricing, testimonials and CTAs."
      tags={<Tag>Release</Tag>}
      author="Sreelal Chalil"
      authorAvatar={<InitialsAvatar name="Sreelal Chalil" className="size-6" />}
      date="21 Sep 2026"
      readingTime="6 min read"
    />
  );
}`,
  "marketing-section": `import { Button, MarketingSection, SectionHeading } from "@spatika/react";

export default function Demo() {
  return (
    <MarketingSection tone="wash" backdrop="aurora" edge="both">
      <SectionHeading
        align="center"
        eyebrow="Platform"
        title="Everything in one system"
        subtitle="Tokens, components and patterns that follow the theme you pick."
      />
      <div className="flex justify-center">
        <Button>Explore components</Button>
      </div>
    </MarketingSection>
  );
}`,
  "section-backdrop": `import { SectionBackdrop } from "@spatika/react";

export default function Demo() {
  return (
    <div className="relative isolate overflow-hidden rounded-[var(--spk-radius-md)] border border-line-subtle p-10">
      <SectionBackdrop kind="aurora" animated />
      <p className="relative z-[1] text-title-2">Content sits above the wash.</p>
    </div>
  );
}`,
  "marketing-hero": `import { AnnouncementPill, Button, MarketingHero } from "@spatika/react";

export default function Demo() {
  return (
    <MarketingHero
      announcement={<AnnouncementPill href="/changelog" tag="New">Marketing blocks ship with 2.1</AnnouncementPill>}
      title="Ship the interface, not the CSS"
      lede="A React design system for product teams — four themes, density control and an application shell."
      actions={
        <>
          <Button size="lg">Get started</Button>
          <Button size="lg" variant="secondary">Read the docs</Button>
        </>
      }
      note="MIT licensed · No build step required"
    />
  );
}`,
  "announcement-pill": `import { AnnouncementPill } from "@spatika/react";

export default function Demo() {
  return (
    <AnnouncementPill href="/changelog" tag="New">
      Spatika 2.1 — marketing blocks
    </AnnouncementPill>
  );
}`,
  "feature-grid": `import { FeatureCard, FeatureGrid } from "@spatika/react";
import { Layers, Rows3, Type } from "lucide-react";

export default function Demo() {
  return (
    <FeatureGrid columns={3}>
      <FeatureCard variant="card" icon={<Layers />} title="Calm surfaces" description="Solid material, hairline borders, restrained elevation." />
      <FeatureCard variant="card" icon={<Type />} title="Hierarchy from type" description="Size, weight and spacing carry structure." />
      <FeatureCard variant="card" icon={<Rows3 />} title="Professional density" description="One attribute retunes a whole region." />
    </FeatureGrid>
  );
}`,
  "bento-grid": `import { BentoCard, BentoGrid } from "@spatika/react";

export default function Demo() {
  return (
    <BentoGrid columns={3}>
      <BentoCard span={2} emphasis shine title="One system, four themes" description="Every component reads its colour from semantic tokens." />
      <BentoCard title="Charts included" description="SVG charts that follow the theme." />
      <BentoCard title="Data tables" description="Sorting, filters, pinned columns." />
      <BentoCard span={2} title="Application shell" description="Sidebar, top bar, command palette, mobile tab bar." />
    </BentoGrid>
  );
}`,
  "pricing-table": `import { Button, PricingCard, PricingTable } from "@spatika/react";

export default function Demo() {
  return (
    <PricingTable columns={3}>
      <PricingCard
        name="Free"
        price="$0"
        period="/month"
        description="For side projects."
        features={["Unlimited projects", "Community support"]}
        action={<Button variant="secondary" className="w-full">Start free</Button>}
      />
      <PricingCard
        featured
        badge="Most popular"
        name="Team"
        price="$19"
        period="/seat / month"
        description="For product teams."
        features={["Everything in Free", "Shared design tokens", { label: "SAML", excluded: true }]}
        action={<Button className="w-full">Start trial</Button>}
        note="14 days, no card"
      />
      <PricingCard
        name="Enterprise"
        price="Custom"
        description="For platform teams."
        features={["SAML and SCIM", "Priority support"]}
        action={<Button variant="secondary" className="w-full">Talk to us</Button>}
      />
    </PricingTable>
  );
}`,
  "testimonial-card": `import { InitialsAvatar, TestimonialCard } from "@spatika/react";

export default function Demo() {
  return (
    <TestimonialCard
      quote="We replaced three component libraries with one and shipped the dashboard in a week."
      author="Priya Nair"
      role="Head of Product, Sweyam"
      avatar={<InitialsAvatar name="Priya Nair" className="size-9" />}
    />
  );
}`,
  "logo-cloud": `import { LogoCloud } from "@spatika/react";

export default function Demo() {
  return (
    <LogoCloud label="Trusted by teams at">
      <span className="text-title-3">Sweyam</span>
      <span className="text-title-3">Lumen Labs</span>
      <span className="text-title-3">Parallel</span>
      <span className="text-title-3">Northwind</span>
    </LogoCloud>
  );
}`,
  "stat-band": `import { StatBand } from "@spatika/react";

export default function Demo() {
  return (
    <StatBand
      stats={[
        { value: "99.98%", label: "Uptime" },
        { value: "2.4M", label: "Requests / day", hint: "p99 under 40ms" },
        { value: "180+", label: "Components" },
        { value: "4", label: "Themes" },
      ]}
    />
  );
}`,
  "step-flow": `import { StepFlow } from "@spatika/react";

export default function Demo() {
  return (
    <StepFlow
      steps={[
        { title: "Install", description: "One package and one stylesheet." },
        { title: "Pick a theme", description: "Mukta, Neelam, Usha or Sandhya — or your brand." },
        { title: "Ship", description: "Compose screens from primitives and patterns." },
      ]}
    />
  );
}`,
  "cta-band": `import { Button, CtaBand } from "@spatika/react";

export default function Demo() {
  return (
    <CtaBand
      tone="accent"
      title="Start building today"
      description="Install the package and have a themed screen running in minutes."
      actions={<Button variant="secondary" size="lg">npm install @spatika/react</Button>}
      note="MIT licensed"
    />
  );
}`,
  "faq-section": `import { FaqSection } from "@spatika/react";

export default function Demo() {
  return (
    <FaqSection
      structuredData
      items={[
        { question: "Is Spatika free?", answer: "Yes — MIT licensed, and the source is on GitHub." },
        { question: "Does it support dark mode?", answer: "Two dark themes ship in the box: Neelam and Sandhya." },
        { question: "Can I use my own brand colour?", answer: "Pass createTheme({ id, extends, palette }) to SpatikaThemeProvider." },
      ]}
    />
  );
}`,
  marquee: `import { Marquee } from "@spatika/react";

export default function Demo() {
  return (
    <Marquee duration={30} pauseOnHover>
      <span className="text-title-3">Sweyam</span>
      <span className="text-title-3">Lumen Labs</span>
      <span className="text-title-3">Parallel</span>
      <span className="text-title-3">Northwind</span>
    </Marquee>
  );
}`,
  reveal: `import { FeatureCard, FeatureGrid, Reveal } from "@spatika/react";

const features = [
  { title: "Tokens", body: "Semantic CSS variables, four themes." },
  { title: "Components", body: "Primitives, composites and patterns." },
  { title: "Charts", body: "SVG charts that follow the theme." },
];

export default function Demo() {
  return (
    <FeatureGrid>
      {features.map((feature, index) => (
        <Reveal key={feature.title} delay={index * 80}>
          <FeatureCard variant="card" title={feature.title} description={feature.body} />
        </Reveal>
      ))}
    </FeatureGrid>
  );
}`,
  "showcase-frame": `import { ShowcaseFrame } from "@spatika/react";

export default function Demo() {
  return (
    <ShowcaseFrame url="app.sweyam.com" tilt shine>
      <img src="/dashboard.png" alt="Sweyam dashboard" />
    </ShowcaseFrame>
  );
}`,
  prose: `import { Prose } from "@spatika/react";

export default function Demo() {
  return (
    <Prose lead>
      <p>Spatika 2.1 adds a marketing layer to the system.</p>
      <h2>What changed</h2>
      <p>
        Landing pages are now built from the same tokens as your product screens, so a
        theme change carries all the way through. See the <a href="/components">catalog</a>.
      </p>
      <ul>
        <li>Hero, feature, bento, pricing and CTA blocks</li>
        <li>Opt-in decoration that respects user preferences</li>
      </ul>
    </Prose>
  );
}`,
  button: `import { Button } from "@spatika/react";

export default function Demo() {
  return (
    <>
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="glass">Glass</Button>
      <Button variant="gradient" size="xl">Get in touch</Button>
    </>
  );
}`,
  "button-group": `import { Button, ButtonGroup } from "@spatika/react";

export default function Demo() {
  return (
    <ButtonGroup>
      <Button variant="outline">Left</Button>
      <Button variant="outline">Center</Button>
      <Button variant="outline">Right</Button>
    </ButtonGroup>
  );
}`,
  "icon-button": `import { IconButton } from "@spatika/react";
import { Bell, Search, Settings } from "lucide-react";

export default function Demo() {
  return (
    <>
      <IconButton aria-label="Search" variant="ghost"><Search /></IconButton>
      <IconButton aria-label="Settings" variant="outline"><Settings /></IconButton>
      <IconButton aria-label="Notifications" variant="glass" shape="circular">
        <Bell />
      </IconButton>
    </>
  );
}`,
  fab: `import { Fab } from "@spatika/react";
import { Plus } from "lucide-react";

export default function Demo() {
  return (
    <>
      <Fab aria-label="Add"><Plus /></Fab>
      <Fab variant="extended" size="md"><Plus />Compose</Fab>
    </>
  );
}`,
  link: `import { Link } from "@spatika/react";

export default function Demo() {
  return (
    <p>
      Read the <Link href="#docs">component API</Link> or browse{" "}
      <Link href="#guides" color="muted">guides</Link>.
    </p>
  );
}`,
  typography: `import { Typography } from "@spatika/react";

export default function Demo() {
  return (
    <>
      <Typography variant="h4">Pipeline health</Typography>
      <Typography variant="body2" color="muted">
        Theme type scale — captions, body, and display.
      </Typography>
      <Typography variant="overline">Overline</Typography>
    </>
  );
}`,
  badge: `import { Badge } from "@spatika/react";

export default function Demo() {
  return (
    <>
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
    </>
  );
}`,
  avatar: `import { Avatar, AvatarFallback, InitialsAvatar } from "@spatika/react";

export default function Demo() {
  return (
    <>
      <Avatar><AvatarFallback>AC</AvatarFallback></Avatar>
      <InitialsAvatar name="Jordan Lee" className="size-10 text-sm font-bold" />
    </>
  );
}`,
  "avatar-group": `import { AvatarGroup, InitialsAvatar } from "@spatika/react";

export default function Demo() {
  return (
    <AvatarGroup max={3}>
      <InitialsAvatar name="Alex Chen" className="size-10 text-sm font-bold" />
      <InitialsAvatar name="Jordan Lee" className="size-10 text-sm font-bold" />
      <InitialsAvatar name="Sam Rivera" className="size-10 text-sm font-bold" />
      <InitialsAvatar name="Riley Park" className="size-10 text-sm font-bold" />
    </AvatarGroup>
  );
}`,
  accordion: `import {
  Accordion, AccordionActions, AccordionContent,
  AccordionItem, AccordionSummary, Button,
} from "@spatika/react";

export default function Demo() {
  return (
    <Accordion type="single" defaultValue="faq-1">
      <AccordionItem value="faq-1">
        <AccordionSummary>What is Spatika?</AccordionSummary>
        <AccordionContent>
          A React design system with shared tokens, four themes, and app chrome.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-2">
        <AccordionSummary>How do I theme it?</AccordionSummary>
        <AccordionContent>
          Wrap the app in SpatikaThemeProvider and pick a theme.
        </AccordionContent>
        <AccordionActions>
          <Button size="sm">Install</Button>
        </AccordionActions>
      </AccordionItem>
    </Accordion>
  );
}`,
  "button-base": `import { ButtonBase } from "@spatika/react";

export default function Demo() {
  return (
    <ButtonBase className="rounded-xl border border-border/50 px-4 py-2 text-sm font-bold">
      Pressable
    </ButtonBase>
  );
}`,
  rating: `import { Rating } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [value, setValue] = useState(3);
  return <Rating value={value} onChange={setValue} />;
}`,
  box: `import { Box } from "@spatika/react";

export default function Demo() {
  return (
    <Box className="rounded-xl border border-border/40 bg-card/40 px-4 py-3">
      Generic box
    </Box>
  );
}`,
  chip: `import { Chip } from "@spatika/react";

export default function Demo() {
  return (
    <>
      <Chip active>Active</Chip>
      <Chip>Favorites</Chip>
      <Chip>Archived</Chip>
    </>
  );
}`,
  tag: `import { Tag } from "@spatika/react";

export default function Demo() {
  return (
    <>
      <Tag>Java</Tag>
      <Tag variant="primary">AWS</Tag>
      <Tag variant="orange">Kubernetes</Tag>
    </>
  );
}`,
  wordmark: `import { Wordmark } from "@spatika/react";

export default function Demo() {
  return <Wordmark name="Sweyam" accent=".io" />;
}`,
  "gradient-text": `import { GradientText } from "@spatika/react";

export default function Demo() {
  return (
    <p className="text-2xl font-black">
      Hello <GradientText>Spatika</GradientText>
    </p>
  );
}`,
  "availability-badge": `import { AvailabilityBadge } from "@spatika/react";

export default function Demo() {
  return (
    <AvailabilityBadge tone="success">Live</AvailabilityBadge>
  );
}`,
  tabs: `import { Tabs, TabsContent, TabsList, TabsTrigger } from "@spatika/react";

export default function Demo() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Pipeline health and recent leads.</TabsContent>
      <TabsContent value="activity">Calls and emails from this week.</TabsContent>
    </Tabs>
  );
}`,
  switch: `import { Switch } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [on, setOn] = useState(true);
  return <Switch checked={on} onCheckedChange={setOn} aria-label="Notifications" />;
}`,
  input: `import { Input } from "@spatika/react";

export default function Demo() {
  return <Input placeholder="Search contacts…" />;
}`,
  "text-field": `import { TextField } from "@spatika/react";

export default function Demo() {
  return (
    <TextField
      label="Email"
      placeholder="alex@sweyam.com"
      helperText="We'll never share this."
      fullWidth
    />
  );
}`,
  autocomplete: `import { Autocomplete } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [movie, setMovie] = useState<string | null>(null);
  return (
    <Autocomplete
      label="Movie"
      options={["Inception", "Heat", "Her"]}
      value={movie}
      onChange={setMovie}
      placeholder="Search films…"
    />
  );
}`,
  "outlined-input": `import { InputAdornment, OutlinedInput } from "@spatika/react";

export default function Demo() {
  return (
    <OutlinedInput
      placeholder="Amount"
      startAdornment={<InputAdornment>$</InputAdornment>}
      endAdornment={<InputAdornment position="end">USD</InputAdornment>}
    />
  );
}`,
  "form-control": `import { FormControl, FormHelperText, FormLabel, Input } from "@spatika/react";

export default function Demo() {
  return (
    <FormControl required>
      <FormLabel>Workspace</FormLabel>
      <Input placeholder="sweyam" />
      <FormHelperText>Lowercase, no spaces.</FormHelperText>
    </FormControl>
  );
}`,
  select: `import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@spatika/react";

export default function Demo() {
  return (
    <Select defaultValue="neelam">
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="mukta">Mukta</SelectItem>
        <SelectItem value="neelam">Neelam</SelectItem>
        <SelectItem value="usha">Usha</SelectItem>
      </SelectContent>
    </Select>
  );
}`,
  "textarea-autosize": `import { TextareaAutosize } from "@spatika/react";

export default function Demo() {
  return <TextareaAutosize placeholder="Write a note…" minRows={2} />;
}`,
  "spatika-editor": `import "@spatika/editor/styles.css";
import { SpatikaEditor } from "@spatika/editor";
import { useState } from "react";

export default function Demo() {
  const [html, setHtml] = useState("<p>Hello Spatika Editor</p>");
  return (
    <SpatikaEditor
      value={html}
      onChange={setHtml}
      placeholder="Start writing…"
      mentions={[{ id: "1", label: "Asha Verma" }]}
    />
  );
}`,
  "use-spatika-editor": `import "@spatika/editor/styles.css";
import { EditorContent } from "@tiptap/react";
import { EditorToolbar, useSpatikaEditor } from "@spatika/editor";
import { useState } from "react";

export default function Demo() {
  const [html, setHtml] = useState("<p>Headless editor</p>");
  const { editor, isReady } = useSpatikaEditor({ value: html, onChange: setHtml });
  if (!isReady || !editor) return null;
  return (
    <div className="spk-editor-shell">
      <EditorToolbar editor={editor} config={{ layout: "compact", ai: false }} />
      <EditorContent editor={editor} className="min-h-40 px-3 py-2" />
    </div>
  );
}`,
  "rich-text-editor": `import "@spatika/editor/styles.css";
import { RichTextEditor } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [html, setHtml] = useState("<p>Legacy shim</p>");
  return <RichTextEditor value={html} onChange={setHtml} />;
}`,
  "transfer-list": `import { TransferList } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [left, setLeft] = useState(["Java", "Go", "Rust"]);
  const [right, setRight] = useState(["TypeScript"]);
  return (
    <TransferList
      left={left}
      right={right}
      onChange={(next) => {
        setLeft(next.left);
        setRight(next.right);
      }}
    />
  );
}`,
  checkbox: `import { Checkbox, FormControlLabel } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [agree, setAgree] = useState(true);
  return (
    <FormControlLabel
      control={<Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} />}
      label="I agree to the terms"
    />
  );
}`,
  "form-control-label": `import { Checkbox, FormControlLabel, Switch } from "@spatika/react";

export default function Demo() {
  return (
    <>
      <FormControlLabel control={<Checkbox defaultChecked />} label="Marketing emails" />
      <FormControlLabel control={<Switch defaultChecked />} label="Push notifications" />
    </>
  );
}`,
  slider: `import { Slider } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [volume, setVolume] = useState([40]);
  return <Slider value={volume} onValueChange={setVolume} />;
}`,
  "toggle-button": `import { ToggleButton, ToggleButtonGroup } from "@spatika/react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { useState } from "react";

export default function Demo() {
  const [align, setAlign] = useState<string | null>("left");
  return (
    <ToggleButtonGroup exclusive value={align} onValueChange={setAlign} aria-label="Alignment">
      <ToggleButton value="left" aria-label="Align left"><AlignLeft /></ToggleButton>
      <ToggleButton value="center" aria-label="Align center"><AlignCenter /></ToggleButton>
      <ToggleButton value="right" aria-label="Align right"><AlignRight /></ToggleButton>
    </ToggleButtonGroup>
  );
}`,
  "search-field": `import { SearchField } from "@spatika/react";

export default function Demo() {
  return <SearchField placeholder="Search people, lists, notes…" />;
}`,
  "chip-group": `import { ChipGroup, toggleOptionValue } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [chips, setChips] = useState(["all"]);
  return (
    <ChipGroup
      options={[
        { value: "all", label: "All" },
        { value: "fav", label: "Favorites" },
        { value: "archived", label: "Archived" },
      ]}
      selected={chips}
      onToggle={(value) => setChips(toggleOptionValue(chips, value))}
      variant="filter"
    />
  );
}`,
  "segmented-control": `import { SegmentedControl } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [period, setPeriod] = useState("week");
  return (
    <SegmentedControl
      aria-label="Period"
      value={period}
      onChange={setPeriod}
      options={[
        { value: "week", label: "Week" },
        { value: "month", label: "Month" },
        { value: "year", label: "Year" },
      ]}
    />
  );
}`,
  paper: `import { Paper, Typography } from "@spatika/react";

export default function Demo() {
  return (
    <Paper className="max-w-[320px] p-4" variant="glass">
      <Typography variant="subtitle2">Glass paper</Typography>
      <Typography variant="body2" color="muted">
        Elevation, outline, or calm surface.
      </Typography>
    </Paper>
  );
}`,
  grid: `import { Grid, Paper } from "@spatika/react";

export default function Demo() {
  return (
    <Grid container spacing={2}>
      <Grid xs={6}><Paper className="p-3 text-center">6</Paper></Grid>
      <Grid xs={6}><Paper className="p-3 text-center">6</Paper></Grid>
    </Grid>
  );
}`,
  masonry: `import { Masonry, Paper } from "@spatika/react";

export default function Demo() {
  return (
    <Masonry columns={3} spacing={8}>
      <Paper className="h-16 bg-primary/10" />
      <Paper className="h-10 bg-primary/10" />
      <Paper className="h-20 bg-primary/10" />
    </Masonry>
  );
}`,
  stack: `import { Badge, Button, Stack, Typography } from "@spatika/react";

export default function Demo() {
  return (
    <Stack direction="row" spacing={2} align="center">
      <Badge>New</Badge>
      <Typography variant="body2">Stacked with gap</Typography>
      <Button size="sm">Action</Button>
    </Stack>
  );
}`,
  container: `import { Container, Typography } from "@spatika/react";

export default function Demo() {
  return (
    <Container maxWidth="sm">
      <Typography variant="caption">max-width container</Typography>
    </Container>
  );
}`,
  list: `import {
  InitialsAvatar, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Paper,
} from "@spatika/react";

export default function Demo() {
  return (
    <Paper variant="outlined">
      <List disablePadding>
        <ListItem disablePadding>
          <ListItemButton selected>
            <ListItemIcon>
              <InitialsAvatar name="Alex Chen" className="size-8 text-[10px] font-bold" />
            </ListItemIcon>
            <ListItemText primary="Alex Chen" secondary="Product designer" />
          </ListItemButton>
        </ListItem>
      </List>
    </Paper>
  );
}`,
  card: `import { Card, CardContent, CardHeader, CardTitle } from "@spatika/react";

export default function Demo() {
  return (
    <Card className="max-w-[360px]">
      <CardHeader>
        <CardTitle>Surface card</CardTitle>
      </CardHeader>
      <CardContent>Structured content with header and body regions.</CardContent>
    </Card>
  );
}`,
  "glass-card": `// Deprecated in 2.0 — prefer <Card surface="raised">. GlassCard maps onto the same surfaces.
import { CardContent, CardHeader, CardTitle, GlassCard } from "@spatika/react";

export default function Demo() {
  return (
    <GlassCard className="max-w-[360px]">
      <CardHeader>
        <CardTitle>Frosted panel</CardTitle>
      </CardHeader>
      <CardContent>Elevated calm surface from the token system.</CardContent>
    </GlassCard>
  );
}`,
  "stat-card": `import { SparkLineChart, StatCard } from "@spatika/react";

export default function Demo() {
  return (
    <>
      <StatCard
        label="Users"
        value="144k"
        hint="+12 this week"
        chart={<SparkLineChart data={[8, 12, 9, 16, 14, 22]} height={40} />}
      />
      <StatCard variant="metric" label="Uptime" value="99.9%" />
    </>
  );
}`,
  "section-heading": `import { SectionHeading } from "@spatika/react";

export default function Demo() {
  return (
    <SectionHeading
      eyebrow="Product"
      title="What's shipping"
      subtitle="Glass composites for app chrome, charts, and marketing."
    />
  );
}`,
  "icon-tile": `import { IconTile } from "@spatika/react";

export default function Demo() {
  return (
    <IconTile icon="⌘" title="Design systems" description="Tokens, themes, and chrome." />
  );
}`,
  "career-card": `import { CareerCard, CareerTimeline } from "@spatika/react";

export default function Demo() {
  return (
    <CareerTimeline>
      <CareerCard
        role="Staff engineer"
        company="Sweyam"
        location="Remote"
        period="2022 — now"
        current
        bullets={["Shipped the glass design system."]}
        tags={["React", "TypeScript"]}
      />
    </CareerTimeline>
  );
}`,
  "project-card": `import { ProjectCard } from "@spatika/react";

export default function Demo() {
  return (
    <ProjectCard
      title="Spatika UI"
      company="Open source"
      outcome="Shipped"
      description="Glass React design system with tokens and four themes."
      tags={["React", "Tokens"]}
    />
  );
}`,
  "float-chip": `import { FloatChip } from "@spatika/react";

export default function Demo() {
  return (
    <>
      <FloatChip icon="✨" title="Glass" subtitle="UI" />
      <FloatChip live>In production</FloatChip>
    </>
  );
}`,
  "meta-chip": `import { MetaChip } from "@spatika/react";

export default function Demo() {
  return (
    <>
      <MetaChip>Next.js</MetaChip>
      <MetaChip>Spatika</MetaChip>
    </>
  );
}`,
  "entity-card": `import {
  EntityCard, EntityCardChip, EntityCardMeta, EntityCardTitle, InitialsAvatar,
} from "@spatika/react";

export default function Demo() {
  return (
    <EntityCard interactive>
      <InitialsAvatar name="Alex Chen" className="size-10 shrink-0 text-sm font-bold" />
      <div className="min-w-0 flex-1">
        <EntityCardTitle>Alex Chen</EntityCardTitle>
        <EntityCardMeta>Product designer · San Francisco</EntityCardMeta>
      </div>
      <EntityCardChip>Active</EntityCardChip>
    </EntityCard>
  );
}`,
  "list-row": `import { Badge, ListRow } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [row, setRow] = useState("alex");
  return (
    <ListRow
      active={row === "alex"}
      onClick={() => setRow("alex")}
      trailing={<Badge variant="secondary">Active</Badge>}
    >
      <strong>Alex Chen</strong>
    </ListRow>
  );
}`,
  stepper: `import { Button, Step, StepLabel, Stepper } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [step, setStep] = useState(1);
  return (
    <>
      <Stepper activeStep={step}>
        <Step><StepLabel>Account</StepLabel></Step>
        <Step><StepLabel>Details</StepLabel></Step>
        <Step><StepLabel>Done</StepLabel></Step>
      </Stepper>
      <Button size="sm" onClick={() => setStep((s) => Math.min(2, s + 1))}>Next</Button>
    </>
  );
}`,
  "mobile-stepper": `import { Button, MobileStepper } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [step, setStep] = useState(1);
  return (
    <MobileStepper
      steps={4}
      activeStep={step}
      variant="dots"
      backButton={<Button size="sm" variant="ghost" onClick={() => setStep((s) => s - 1)}>Back</Button>}
      nextButton={<Button size="sm" variant="ghost" onClick={() => setStep((s) => s + 1)}>Next</Button>}
    />
  );
}`,
  "app-bar": `import { AppBar, Toolbar, Typography } from "@spatika/react";

export default function Demo() {
  return (
    <AppBar>
      <Toolbar>
        <Typography variant="subtitle2">Inbox</Typography>
      </Toolbar>
    </AppBar>
  );
}`,
  "bottom-navigation": `import { BottomNavigation, BottomNavigationAction } from "@spatika/react";
import { Home, Search, User } from "lucide-react";
import { useState } from "react";

export default function Demo() {
  const [nav, setNav] = useState("home");
  return (
    <BottomNavigation value={nav} onChange={(_e, value) => setNav(value)}>
      <BottomNavigationAction value="home" label="Home" icon={<Home />} />
      <BottomNavigationAction value="search" label="Search" icon={<Search />} />
      <BottomNavigationAction value="you" label="You" icon={<User />} />
    </BottomNavigation>
  );
}`,
  menu: `import { Button, Menu, MenuItem } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <Button variant="outline" onClick={(e) => setAnchor(e.currentTarget)}>
        Open menu
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onOpenChange={(open) => !open && setAnchor(null)}>
        <MenuItem onClick={() => setAnchor(null)}>Profile</MenuItem>
        <MenuItem onClick={() => setAnchor(null)}>Settings</MenuItem>
      </Menu>
    </>
  );
}`,
  breadcrumb: `import { Breadcrumb } from "@spatika/react";

export default function Demo() {
  return (
    <Breadcrumb
      items={[
        { label: "Home", href: "/" },
        { label: "Components", href: "/components" },
        { label: "Accordion" },
      ]}
    />
  );
}`,
  pagination: `import { Pagination } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [page, setPage] = useState(2);
  return <Pagination page={page} pageCount={8} onPageChange={setPage} />;
}`,
  "speed-dial": `import { SpeedDial, SpeedDialAction } from "@spatika/react";
import { Copy, Mail, Share2 } from "lucide-react";

export default function Demo() {
  return (
    <SpeedDial ariaLabel="Create" hideBackdrop>
      <SpeedDialAction icon={<Mail className="size-4" />} tooltipTitle="Email" />
      <SpeedDialAction icon={<Copy className="size-4" />} tooltipTitle="Copy" />
      <SpeedDialAction icon={<Share2 className="size-4" />} tooltipTitle="Share" />
    </SpeedDial>
  );
}`,
  "app-header": `import { AppHeader, HeaderIconButton } from "@spatika/react";
import { Bell, Settings } from "lucide-react";

export default function Demo() {
  return (
    <AppHeader
      variant="chrome"
      title="Spatika"
      actions={
        <>
          <HeaderIconButton aria-label="Notifications" size="sm"><Bell className="size-4" /></HeaderIconButton>
          <HeaderIconButton aria-label="Settings" size="sm"><Settings className="size-4" /></HeaderIconButton>
        </>
      }
    />
  );
}`,
  "site-nav": `import { SiteNav, Wordmark } from "@spatika/react";

export default function Demo() {
  return (
    <SiteNav
      contained
      brand={<Wordmark name="Sweyam" accent=".io" />}
      links={[
        { href: "#about", label: "About" },
        { href: "#work", label: "Work" },
      ]}
    />
  );
}`,
  "site-footer": `import { MetaChip, SiteFooter, Wordmark } from "@spatika/react";

export default function Demo() {
  return (
    <SiteFooter
      brand={<Wordmark name="Sweyam" mark="." rest="io" size="sm" />}
      copyright="© 2026"
      links={[{ href: "#about", label: "About" }]}
      meta={<MetaChip>Spatika</MetaChip>}
    />
  );
}`,
  "contact-link": `import { ContactLink } from "@spatika/react";

export default function Demo() {
  return (
    <ContactLink
      href="mailto:hello@sweyam.io"
      name="Email"
      label="hello@sweyam.io"
      icon="@"
      iconBg="#FEF3EE"
      iconColor="#E85D3A"
    />
  );
}`,
  "floating-page-chrome": `import {
  FloatingPageChromeBar, FloatingPageChromeIdentity, Button,
  floatingPageChromePrimaryClass,
} from "@spatika/react";
import { Plus } from "lucide-react";

export default function Demo() {
  return (
    <FloatingPageChromeBar
      identity={<FloatingPageChromeIdentity title="People" count={42} />}
      actions={
        <Button size="sm" className={floatingPageChromePrimaryClass}>
          <Plus className="size-3.5" /> Add
        </Button>
      }
    />
  );
}`,
  "page-sticky-header": `import { PageStickyHeader } from "@spatika/react";

export default function Demo() {
  return <PageStickyHeader title="Settings" subtitle="Account preferences" />;
}`,
  "mobile-tab-bar": `import { MobileTabBar } from "@spatika/react";
import { Home, Inbox, Search, User } from "lucide-react";
import { useState } from "react";

export default function Demo() {
  const [tab, setTab] = useState("home");
  return (
    <MobileTabBar
      contained
      items={[
        { id: "home", label: "Home", icon: Home, active: tab === "home", onClick: () => setTab("home") },
        { id: "search", label: "Search", icon: Search, active: tab === "search", onClick: () => setTab("search") },
        { id: "inbox", label: "Inbox", icon: Inbox, active: tab === "inbox", onClick: () => setTab("inbox") },
        { id: "profile", label: "You", icon: User, active: tab === "profile", onClick: () => setTab("profile") },
      ]}
    />
  );
}`,
  "filter-sheet": `import { Button, ChipGroup, FilterSheet, toggleOptionValue } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [open, setOpen] = useState(false);
  const [chips, setChips] = useState(["all"]);
  return (
    <FilterSheet
      open={open}
      onOpenChange={setOpen}
      title="View & filters"
      trigger={<Button variant="secondary">Open filters</Button>}
    >
      <ChipGroup
        options={[
          { value: "all", label: "All" },
          { value: "open", label: "Open" },
        ]}
        selected={chips}
        onToggle={(value) => setChips(toggleOptionValue(chips, value))}
      />
    </FilterSheet>
  );
}`,
  "header-icon-button": `import { HeaderIconButton, appChromeActionClusterClass } from "@spatika/react";
import { Bell, Search, Settings } from "lucide-react";

export default function Demo() {
  return (
    <div className={appChromeActionClusterClass}>
      <HeaderIconButton aria-label="Search" size="sm"><Search className="size-4" /></HeaderIconButton>
      <HeaderIconButton aria-label="Notifications" badge={3} size="sm">
        <Bell className="size-4" />
      </HeaderIconButton>
      <HeaderIconButton aria-label="Settings" active size="sm">
        <Settings className="size-4" />
      </HeaderIconButton>
    </div>
  );
}`,
  "cover-hero": `import { Badge, CoverHero } from "@spatika/react";

export default function Demo() {
  return (
    <CoverHero
      title="Coastal Drive"
      kicker={<Badge variant="secondary">Album</Badge>}
      coverSeed="coast"
      bleed={false}
      facts={[
        { key: "photos", label: "Photos", value: "24" },
        { key: "places", label: "Places", value: "6" },
      ]}
    />
  );
}`,
  "profile-hero": `import { ProfileHero } from "@spatika/react";

export default function Demo() {
  return (
    <ProfileHero
      name="Alex Chen"
      alias="Product designer"
      coverSeed="alex"
      bleed={false}
    />
  );
}`,
  "entity-media-card": `import { EntityMediaCard } from "@spatika/react";

export default function Demo() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <EntityMediaCard title="Alex Chen" subtitle="Product designer" statusLine="Active" />
      <EntityMediaCard title="Jordan Lee" subtitle="Account lead" statusLine="Away" />
    </div>
  );
}`,
  "image-list": `import { CoverPattern, ImageList, ImageListItem, ImageListItemBar } from "@spatika/react";

export default function Demo() {
  return (
    <ImageList cols={3} rowHeight={148} gap={10}>
      <ImageListItem>
        <CoverPattern seed="coast" hue={205} />
        <ImageListItemBar title="Coast" />
      </ImageListItem>
    </ImageList>
  );
}`,
  progress: `import { Progress } from "@spatika/react";

export default function Demo() {
  return (
    <>
      <Progress value={62} />
      <Progress variant="indeterminate" />
    </>
  );
}`,
  "circular-progress": `import { CircularProgress } from "@spatika/react";

export default function Demo() {
  return (
    <>
      <CircularProgress />
      <CircularProgress variant="determinate" value={62} />
    </>
  );
}`,
  skeleton: `import { Skeleton } from "@spatika/react";

export default function Demo() {
  return (
    <>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </>
  );
}`,
  alert: `import { Alert, AlertDescription, AlertTitle } from "@spatika/react";

export default function Demo() {
  return (
    <Alert>
      <AlertTitle>Heads up</AlertTitle>
      <AlertDescription>Your session will expire in 5 minutes.</AlertDescription>
    </Alert>
  );
}`,
  "empty-state": `import { EmptyState } from "@spatika/react";

export default function Demo() {
  return (
    <EmptyState
      title="Nothing here"
      description="Try adjusting your filters."
      actionLabel="Reset filters"
      onAction={() => undefined}
    />
  );
}`,
  toast: `import { Button, Toaster, useToast } from "@spatika/react";

function Trigger() {
  const { toast } = useToast();
  return (
    <Button onClick={() => toast({ title: "Saved", description: "Stored.", tone: "success" })}>
      Show toast
    </Button>
  );
}

export default function Demo() {
  return <Toaster><Trigger /></Toaster>;
}`,
  snackbar: `import { Button, Snackbar } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>Show snackbar</Button>
      <Snackbar
        open={open}
        onClose={() => setOpen(false)}
        message="Note archived"
        action={<Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Undo</Button>}
      />
    </>
  );
}`,
  dialog: `import {
  Button, Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@spatika/react";

export default function Demo() {
  return (
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
    </Dialog>
  );
}`,
  modal: `import { Button, Modal, Paper, Typography } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>Open modal</Button>
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

export default function Demo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>Add to library</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}`,
  table: `import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@spatika/react";

export default function Demo() {
  return (
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
          <TableCell>Active</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}`,
  "table-pagination": `import { TablePagination } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(5);
  return (
    <TablePagination
      count={42}
      page={page}
      onPageChange={setPage}
      rowsPerPage={rows}
      onRowsPerPageChange={setRows}
    />
  );
}`,
  "event-calendar": `import { EventCalendar } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [events, setEvents] = useState([
    {
      id: "team",
      title: "Team Meeting",
      start: new Date(2026, 7, 1, 9, 30),
      end: new Date(2026, 7, 1, 10, 30),
      resourceId: "work",
    },
  ]);
  return (
    <EventCalendar
      events={events}
      resources={[{ id: "work", title: "Work", color: "violet" }]}
      onEventChange={(event, next) =>
        setEvents((current) => current.map((item) => (item.id === event.id ? { ...item, ...next } : item)))
      }
      onEventCreate={(event) => setEvents((current) => [...current, event])}
      onEventDelete={(event) => setEvents((current) => current.filter((item) => item.id !== event.id))}
    />
  );
}`,
  "event-timeline": `import { EventTimeline } from "@spatika/react";

export default function Demo() {
  return (
    <EventTimeline
      events={[
        {
          id: "api",
          title: "API V3",
          start: new Date(2026, 6, 8),
          end: new Date(2026, 9, 18),
          allDay: true,
          resourceId: "eng",
        },
      ]}
      resources={[{ id: "eng", title: "Engineering", color: "violet" }]}
    />
  );
}`,
  "chart-container": `import {
  BarPlot, ChartContainer, ChartSurface, ChartsGrid, ChartsXAxis, ChartsYAxis,
} from "@spatika/charts";

export default function Demo() {
  return (
    <ChartContainer
      height={240}
      showToolbar
      dataset={[{ month: "Jan", a: 12 }, { month: "Feb", a: 18 }]}
      xAxis={[{ dataKey: "month" }]}
      series={[{ type: "bar", dataKey: "a", label: "Leads" }]}
    >
      <ChartSurface>
        <ChartsGrid />
        <ChartsXAxis />
        <ChartsYAxis />
        <BarPlot />
      </ChartSurface>
    </ChartContainer>
  );
}`,
  "bar-chart": `import { BarChart } from "@spatika/charts";

export default function Demo() {
  return (
    <BarChart
      height={240}
      xAxis={[{ data: ["Jan", "Feb", "Mar", "Apr"] }]}
      series={[{ label: "Leads", data: [12, 18, 9, 22] }]}
      onItemClick={(item) => filterMonth(item.category)}
    />
  );
}`,
  "line-chart": `import { LineChart } from "@spatika/charts";

export default function Demo() {
  return (
    <LineChart
      height={240}
      xAxis={[{ data: ["Jan", "Feb", "Mar", "Apr"] }]}
      series={[{ label: "Revenue", data: [8, 14, 11, 19] }]}
    />
  );
}`,
  "area-chart": `import { AreaChart } from "@spatika/charts";

export default function Demo() {
  return (
    <AreaChart
      height={240}
      stacked
      xAxis={[{ data: ["Jan", "Feb", "Mar", "Apr"] }]}
      series={[
        { label: "v1", data: [20, 28, 32, 30] },
        { label: "v2", data: [40, 55, 48, 72] },
      ]}
    />
  );
}`,
  "pie-chart": `import { PieChart } from "@spatika/charts";

export default function Demo() {
  return (
    <PieChart
      height={240}
      series={[{ data: [
        { id: "won", value: 42, label: "Won" },
        { id: "open", value: 28, label: "Open" },
        { id: "lost", value: 12, label: "Lost" },
      ] }]}
    />
  );
}`,
  "scatter-chart": `import { ScatterChart } from "@spatika/charts";

export default function Demo() {
  return (
    <ScatterChart
      height={240}
      series={[{ label: "A", data: [{ x: 12, y: 20 }, { x: 30, y: 44 }, { x: 48, y: 28 }] }]}
    />
  );
}`,
  sparkline: `import { SparkLineChart } from "@spatika/charts";

export default function Demo() {
  return <SparkLineChart data={[8, 12, 9, 16, 14, 22, 18]} height={48} />;
}`,
  gauge: `import { Gauge } from "@spatika/charts";

export default function Demo() {
  return (
    <Gauge
      startAngle={-90}
      endAngle={90}
      sections={[
        { value: 40, label: "v5" },
        { value: 35, label: "v6" },
        { value: 25, label: "v7" },
      ]}
    />
  );
}`,
  "radar-chart": `import { RadarChart } from "@spatika/charts";

export default function Demo() {
  return (
    <RadarChart
      height={280}
      radar={{ metrics: [{ name: "Speed" }, { name: "UX" }, { name: "Scale" }] }}
      series={[{ label: "Spatika", data: [8, 9, 7] }]}
    />
  );
}`,
  heatmap: `import { Heatmap } from "@spatika/charts";

export default function Demo() {
  return (
    <Heatmap
      height={220}
      xAxis={[{ data: ["Mon", "Tue", "Wed"] }]}
      yAxis={[{ data: ["AM", "PM"] }]}
      series={[
        {
          data: [
            { x: 0, y: 0, value: 4 },
            { x: 1, y: 0, value: 8 },
            { x: 2, y: 1, value: 9 },
          ],
        },
      ]}
    />
  );
}`,
  "funnel-chart": `import { FunnelChart } from "@spatika/charts";

export default function Demo() {
  return (
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
    />
  );
}`,
  "pyramid-chart": `import { PyramidChart } from "@spatika/charts";

export default function Demo() {
  return (
    <PyramidChart
      height={240}
      data={[
        { label: "Awareness", value: 100 },
        { label: "Consideration", value: 55 },
        { label: "Purchase", value: 18 },
      ]}
    />
  );
}`,
  "sankey-chart": `import { SankeyChart } from "@spatika/charts";

export default function Demo() {
  return (
    <SankeyChart
      height={240}
      nodes={[{ id: "a", label: "Ads" }, { id: "b", label: "Site" }, { id: "c", label: "Paid" }]}
      links={[{ source: "a", target: "b", value: 80 }, { source: "b", target: "c", value: 20 }]}
    />
  );
}`,
  "range-bar-chart": `import { RangeBarChart } from "@spatika/charts";

export default function Demo() {
  return (
    <RangeBarChart
      height={240}
      xAxis={[{ data: ["Q1", "Q2", "Q3"] }]}
      series={[{ label: "Range", data: [{ low: 12, high: 28 }, { low: 18, high: 36 }, { low: 10, high: 22 }] }]}
    />
  );
}`,
  "candlestick-chart": `import { CandlestickChart } from "@spatika/charts";

export default function Demo() {
  return (
    <CandlestickChart
      height={240}
      xAxis={[{ data: ["Mon", "Tue", "Wed"] }]}
      series={[{ data: [
        { open: 20, high: 28, low: 18, close: 26 },
        { open: 26, high: 30, low: 22, close: 23 },
      ] }]}
    />
  );
}`,
  "radial-bar-chart": `import { RadialBarChart } from "@spatika/charts";

export default function Demo() {
  return <RadialBarChart height={240} series={[{ data: [70, 55, 40] }]} />;
}`,
  "radial-line-chart": `import { RadialLineChart } from "@spatika/charts";

export default function Demo() {
  return <RadialLineChart height={240} series={[{ data: [8, 12, 9, 14, 11] }]} />;
}`,
  "linear-gauge": `import { LinearGauge } from "@spatika/charts";

export default function Demo() {
  return <LinearGauge value={64} valueMax={100} />;
}`,
  "bubble-chart": `import { BubbleChart } from "@spatika/charts";

export default function Demo() {
  return (
    <BubbleChart
      height={240}
      series={[{ data: [{ x: 10, y: 20, z: 8 }, { x: 30, y: 40, z: 16 }] }]}
    />
  );
}`,
  "range-area-chart": `import { RangeAreaChart } from "@spatika/charts";

export default function Demo() {
  return (
    <RangeAreaChart
      height={240}
      xAxis={[{ data: ["Jan", "Feb", "Mar"] }]}
      series={[{ data: [{ low: 8, high: 18 }, { low: 10, high: 22 }, { low: 6, high: 16 }] }]}
    />
  );
}`,
  treemap: `import { Treemap } from "@spatika/charts";

export default function Demo() {
  return (
    <Treemap
      height={240}
      data={{
        name: "root",
        children: [
          { name: "Product", value: 40 },
          { name: "Marketing", value: 24 },
          { name: "Ops", value: 16 },
        ],
      }}
    />
  );
}`,
  "polar-line-chart": `import { PolarLineChart } from "@spatika/charts";

export default function Demo() {
  return <PolarLineChart height={240} series={[{ data: [6, 9, 7, 11, 8] }]} />;
}`,
  "chord-chart": `import { ChordChart } from "@spatika/charts";

export default function Demo() {
  return (
    <ChordChart
      height={280}
      labels={["A", "B", "C"]}
      data={[[0, 8, 3], [4, 0, 6], [2, 5, 0]]}
    />
  );
}`,
  "waterfall-chart": `import { WaterfallChart } from "@spatika/charts";

export default function Demo() {
  return (
    <WaterfallChart
      height={240}
      xAxis={[{ data: ["Start", "Sales", "Costs", "End"] }]}
      series={[{ data: [40, 18, -12, null] }]}
    />
  );
}`,
  "boxplot-chart": `import { BoxPlotChart } from "@spatika/charts";

export default function Demo() {
  return (
    <BoxPlotChart
      height={240}
      xAxis={[{ data: ["A", "B"] }]}
      series={[{ data: [
        { min: 4, q1: 8, median: 12, q3: 16, max: 22 },
        { min: 6, q1: 10, median: 14, q3: 18, max: 24 },
      ] }]}
    />
  );
}`,
  "ohlc-chart": `import { OhlcChart } from "@spatika/charts";

export default function Demo() {
  return (
    <OhlcChart
      height={240}
      xAxis={[{ data: ["Mon", "Tue"] }]}
      series={[{ data: [
        { open: 20, high: 28, low: 18, close: 26 },
        { open: 26, high: 30, low: 22, close: 23 },
      ] }]}
    />
  );
}`,
  "sunburst-chart": `import { SunburstChart } from "@spatika/charts";

export default function Demo() {
  return (
    <SunburstChart
      height={280}
      data={{
        name: "Org",
        children: [
          { name: "Eng", value: 40, children: [{ name: "FE", value: 18 }, { name: "BE", value: 22 }] },
          { name: "Design", value: 16 },
        ],
      }}
    />
  );
}`,
};

export function basicSource(entry: ComponentEntry): string {
  return (
    SOURCE[entry.slug] ??
    `import { ${entry.importName} } from "@spatika/react";\n\nexport default function Demo() {\n  return <${entry.importName} />;\n}\n`
  );
}
