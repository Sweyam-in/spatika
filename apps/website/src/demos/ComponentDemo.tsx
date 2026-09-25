import { appDemos } from "./AppDemos";
import { systemDemos } from "./SystemDemos";
import { marketingDemos } from "./MarketingDemos";
import {
  Accordion,
  AccordionActions,
  AccordionContent,
  AccordionItem,
  AccordionSummary,
  Alert,
  AlertDescription,
  AlertTitle,
  AppBar,
  AppHeader,
  Autocomplete,
  Avatar,
  AvatarFallback,
  AvatarGroup,
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Breadcrumb,
  Button,
  ButtonBase,
  ButtonGroup,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Chip,
  ChipGroup,
  CircularProgress,
  Container,
  CoverHero,
  CoverPattern,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  EmptyState,
  EntityCard,
  EntityCardChip,
  EntityCardMeta,
  EntityCardTitle,
  EntityMediaCard,
  Fab,
  FilterSheet,
  FloatingPageChromeBar,
  FloatingPageChromeIdentity,
  FloatingPageChromeSearchField,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  GlassCard,
  Grid,
  HeaderIconButton,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  InitialsAvatar,
  Input,
  InputAdornment,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListRow,
  Masonry,
  Menu,
  MenuItem,
  MobileStepper,
  MobileTabBar,
  Modal,
  OutlinedInput,
  PageStickyHeader,
  Pagination,
  Paper,
  ProfileHero,
  Progress,
  Rating,
  SearchField,
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Slider,
  Snackbar,
  SpeedDial,
  SpeedDialAction,
  Stack,
  StatCard,
  SparkLineChart,
  Step,
  StepLabel,
  Stepper,
  Switch,
  SiteFooter,
  SiteNav,
  SectionHeading,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TablePagination,
  TableRow,
  Tag,
  TextareaAutosize,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TransferList,
  Typography,
  Wordmark,
  GradientText,
  AvailabilityBadge,
  FloatChip,
  MetaChip,
  IconTile,
  ContactLink,
  CareerCard,
  CareerTimeline,
  ProjectCard,
  EventCalendar,
  EventTimeline,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toaster,
  appChromeActionClusterClass,
  floatingPageChromePillClass,
  floatingPageChromePrimaryClass,
  toggleOptionValue,
  useToast,
  type SchedulerEvent,
  type SchedulerResource,
} from "@spatika/react";
import { SpatikaLogo } from "@/components/SpatikaLogo";
import { chartDemos } from "@/demos/ChartDemos";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bell,
  Copy,
  Home,
  Inbox,
  Mail,
  Plus,
  Search,
  Settings,
  Share2,
  SlidersHorizontal,
  User,
} from "lucide-react";
import { lazy, Suspense, useState, type ReactNode } from "react";

// Tiptap is the largest dependency on the site; only the editor pages load it. Keep in step with
// editorDemo() (ComponentDemo.test checks).
const EditorDemo = lazy(() => import("@/demos/EditorDemo"));
export const EDITOR_SLUGS = ["spatika-editor", "use-spatika-editor", "rich-text-editor"];

type ComponentDemoProps = {
  slug: string;
  compact?: boolean;
  /** Skip the demo-panel chrome so a parent can frame the preview. */
  bare?: boolean;
};

function ToastDemo() {
  const { toast } = useToast();
  return (
    <Button
      onClick={() =>
        toast({ title: "Saved", description: "Your changes were stored.", tone: "success" })
      }
    >
      Show toast
    </Button>
  );
}

const tabItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "search", label: "Search", icon: Search },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "profile", label: "You", icon: User },
] as const;

const calendarResources: SchedulerResource[] = [
  { id: "work", title: "Work", color: "violet" },
  { id: "health", title: "Health", color: "teal" },
  { id: "social", title: "Social", color: "orange" },
  { id: "personal", title: "Personal", color: "blue" },
];

const timelineResources: SchedulerResource[] = [
  { id: "success", title: "Customer Success", color: "blue" },
  { id: "design", title: "Design", color: "rose" },
  { id: "devops", title: "DevOps", color: "teal" },
  { id: "eng", title: "Engineering", color: "violet" },
  { id: "finance", title: "Finance", color: "slate" },
  { id: "hr", title: "HR", color: "orange" },
];

function at(year: number, month: number, day: number, hour = 0, minute = 0) {
  return new Date(year, month, day, hour, minute);
}

function buildCalendarEvents(anchor: Date): SchedulerEvent[] {
  const y = anchor.getFullYear();
  const m = anchor.getMonth();
  return [
    { id: "run-1", title: "Morning Run", start: at(y, m, 1, 7, 0), end: at(y, m, 1, 7, 45), resourceId: "health" },
    { id: "team", title: "Team Meeting", start: at(y, m, 1, 9, 30), end: at(y, m, 1, 10, 30), resourceId: "work" },
    { id: "gym", title: "Gym Class", start: at(y, m, 2, 18, 0), end: at(y, m, 2, 19, 0), resourceId: "health" },
    { id: "birthday", title: "Alice's Birthday", start: at(y, m, 3), end: at(y, m, 5), allDay: true, resourceId: "social", color: "rose" },
    { id: "review", title: "Code Review", start: at(y, m, 4, 14, 0), end: at(y, m, 4, 15, 30), resourceId: "work" },
    { id: "bbq", title: "Team BBQ", start: at(y, m, 5, 12, 0), end: at(y, m, 5, 17, 0), resourceId: "social" },
    { id: "long-run", title: "Long Run", start: at(y, m, 7, 9, 0), end: at(y, m, 7, 10, 30), resourceId: "health" },
    { id: "sprint", title: "Sprint Planning", start: at(y, m, 8, 10, 0), end: at(y, m, 8, 11, 30), resourceId: "work" },
    { id: "client", title: "Client Call", start: at(y, m, 9, 15, 0), end: at(y, m, 9, 16, 0), resourceId: "work" },
    { id: "design", title: "Design Review", start: at(y, m, 10, 14, 0), end: at(y, m, 10, 16, 0), resourceId: "work" },
    { id: "dentist", title: "Dentist", start: at(y, m, 17, 15, 0), end: at(y, m, 17, 16, 0), resourceId: "personal" },
    { id: "dinner", title: "Dinner with Friends", start: at(y, m, 19, 19, 30), end: at(y, m, 19, 22, 0), resourceId: "social" },
    { id: "all-hands", title: "All-hands Meeting", start: at(y, m, 21, 15, 0), end: at(y, m, 21, 16, 0), resourceId: "work" },
    { id: "roadmap", title: "Roadmap Planning", start: at(y, m, 23, 10, 0), end: at(y, m, 23, 12, 0), resourceId: "work" },
    { id: "offsite", title: "Design Offsite", start: at(y, m, 24), end: at(y, m, 27), allDay: true, resourceId: "work", color: "violet" },
    {
      id: "standup",
      title: "Standup",
      start: at(y, m, 3, 10, 0),
      end: at(y, m, 3, 10, 15),
      resourceId: "work",
      rrule: "FREQ=WEEKLY;BYDAY=MO,WE,FR",
    },
  ];
}

function buildTimelineEvents(anchor: Date): SchedulerEvent[] {
  const y = anchor.getFullYear();
  const m = anchor.getMonth();
  return [
    { id: "onboard", title: "Onboarding Sprint", start: at(y, m - 1, 4), end: at(y, m, 12), allDay: true, resourceId: "success" },
    { id: "mobile", title: "Mobile App UI/UX", start: at(y, m - 1, 20), end: at(y, m + 1, 8), allDay: true, resourceId: "design" },
    { id: "brand", title: "Brand Refresh", start: at(y, m + 1, 1), end: at(y, m + 2, 10), allDay: true, resourceId: "design" },
    { id: "infra", title: "Cluster Upgrade", start: at(y, m, 2), end: at(y, m, 22), allDay: true, resourceId: "devops" },
    { id: "api", title: "API V3 Development", start: at(y, m - 1, 8), end: at(y, m + 2, 18), allDay: true, resourceId: "eng" },
    { id: "analytics", title: "Analytics Dashboard", start: at(y, m, 6), end: at(y, m + 1, 28), allDay: true, resourceId: "eng" },
    { id: "close", title: "Quarter Close", start: at(y, m + 1, 20), end: at(y, m + 2, 5), allDay: true, resourceId: "finance" },
    { id: "hiring", title: "Hiring Loop", start: at(y, m, 10), end: at(y, m + 1, 4), allDay: true, resourceId: "hr" },
  ];
}

export function ComponentDemo({ slug, compact = false, bare = false }: ComponentDemoProps) {
  const [chips, setChips] = useState<string[]>(["all"]);
  const [tab, setTab] = useState("home");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("week");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [notify, setNotify] = useState(true);
  const [row, setRow] = useState("alex");
  const [align, setAlign] = useState<string | string[] | null>("left");
  const [step, setStep] = useState(1);
  const [page, setPage] = useState(2);
  const [volume, setVolume] = useState([40]);
  const [agree, setAgree] = useState(true);
  const [movie, setMovie] = useState<string | string[] | null>(null);
  const [rating, setRating] = useState(3);
  const [nav, setNav] = useState("home");
  const [snackOpen, setSnackOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [tablePage, setTablePage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [leftItems, setLeftItems] = useState(["Java", "Go", "Rust"]);
  const [rightItems, setRightItems] = useState(["TypeScript"]);
  const [mobileStep, setMobileStep] = useState(1);
  const [calendarEvents, setCalendarEvents] = useState<SchedulerEvent[]>(() =>
    buildCalendarEvents(new Date()),
  );
  const [timelineEvents, setTimelineEvents] = useState<SchedulerEvent[]>(() =>
    buildTimelineEvents(new Date()),
  );

  const people = [
    { name: "Alex Chen", meta: "Product designer · San Francisco", chip: "Active" },
    { name: "Jordan Lee", meta: "Account lead · London", chip: "New" },
    { name: "Sam Rivera", meta: "Last seen today", chip: "Follow-up" },
    { name: "Priya Shah", meta: "Ops · Singapore", chip: "Active" },
    { name: "Chris Park", meta: "Partner · Seoul", chip: "New" },
  ];

  const demos: Record<string, ReactNode> = {
    button: (
      <div className="demo-row">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="glass">Glass</Button>
        <Button variant="gradient" size="xl">Get in touch</Button>
      </div>
    ),
    "button-group": (
      <ButtonGroup>
        <Button variant="outline">Left</Button>
        <Button variant="outline">Center</Button>
        <Button variant="outline">Right</Button>
      </ButtonGroup>
    ),
    "icon-button": (
      <div className="demo-row">
        <IconButton aria-label="Search" variant="ghost">
          <Search />
        </IconButton>
        <IconButton aria-label="Settings" variant="outline">
          <Settings />
        </IconButton>
        <IconButton aria-label="Notifications" variant="glass" shape="circular">
          <Bell />
        </IconButton>
      </div>
    ),
    fab: (
      <div className="demo-row">
        <Fab aria-label="Add">
          <Plus />
        </Fab>
        <Fab variant="extended" size="md">
          <Plus />
          Compose
        </Fab>
      </div>
    ),
    link: (
      <p className="text-sm">
        Read the <Link href="#docs">component API</Link> or browse{" "}
        <Link href="#guides" color="muted">
          guides
        </Link>
        .
      </p>
    ),
    typography: compact ? (
      <Typography variant="h5">Display heading</Typography>
    ) : (
      <div className="demo-stack">
        <Typography variant="h4">Pipeline health</Typography>
        <Typography variant="body2" color="muted">
          Theme type scale — captions, body, and display.
        </Typography>
        <Typography variant="overline">Overline</Typography>
      </div>
    ),
    badge: (
      <div className="demo-row">
        <Badge variant="success" dot>
          Live
        </Badge>
        <Badge variant="info">24 new</Badge>
        <Badge variant="warning">Beta</Badge>
        <Badge variant="outline">Draft</Badge>
      </div>
    ),
    avatar: (
      <div className="demo-row">
        <Avatar>
          <AvatarFallback>AC</AvatarFallback>
        </Avatar>
        <InitialsAvatar name="Jordan Lee" className="size-10 text-sm font-bold" />
        <InitialsAvatar name="Sam Rivera" className="size-10 text-sm font-bold" />
      </div>
    ),
    "avatar-group": (
      <AvatarGroup max={3}>
        <InitialsAvatar name="Alex Chen" className="size-10 text-sm font-bold" />
        <InitialsAvatar name="Jordan Lee" className="size-10 text-sm font-bold" />
        <InitialsAvatar name="Sam Rivera" className="size-10 text-sm font-bold" />
        <InitialsAvatar name="Riley Park" className="size-10 text-sm font-bold" />
        <InitialsAvatar name="Casey Wu" className="size-10 text-sm font-bold" />
      </AvatarGroup>
    ),
    accordion: (
      <Accordion type="single" defaultValue="faq-1" className="w-full max-w-[420px]">
        <AccordionItem value="faq-1">
          <AccordionSummary>What is Spatika?</AccordionSummary>
          <AccordionContent>
            A React design system with shared tokens, four themes, and glass chrome.
          </AccordionContent>
        </AccordionItem>
        {compact ? null : (
          <AccordionItem value="faq-2">
            <AccordionSummary>How do I theme it?</AccordionSummary>
            <AccordionContent>
              Wrap the app in SpatikaThemeProvider and pick Mukta, Neelam, Usha, or Sandhya.
            </AccordionContent>
            <AccordionActions>
              <Button size="sm" variant="ghost">
                Docs
              </Button>
              <Button size="sm">Install</Button>
            </AccordionActions>
          </AccordionItem>
        )}
      </Accordion>
    ),
    "button-base": (
      <ButtonBase className="rounded-xl border border-border/50 px-4 py-2 text-sm font-bold">
        Pressable
      </ButtonBase>
    ),
    rating: (
      <Rating value={rating} onChange={setRating} />
    ),
    box: (
      <Box className="rounded-xl border border-border/40 bg-card/40 px-4 py-3 text-sm font-medium">
        Generic box
      </Box>
    ),
    input: (
      <div style={{ maxWidth: 320 }}>
        <Input placeholder="Search contacts…" />
      </div>
    ),
    "text-field": (
      <TextField
        label="Email"
        placeholder="alex@sweyam.com"
        helperText="We'll never share this."
        style={{ maxWidth: 320 }}
        fullWidth
      />
    ),
    autocomplete: (
      <Autocomplete
        label="Movie"
        options={["Inception", "Heat", "Her", "Moonlight"]}
        value={movie}
        onChange={setMovie}
        placeholder="Search films…"
        className="w-full max-w-[320px]"
      />
    ),
    "outlined-input": (
      <OutlinedInput
        placeholder="Amount"
        startAdornment={<InputAdornment>$</InputAdornment>}
        endAdornment={<InputAdornment position="end">USD</InputAdornment>}
        className="max-w-[240px]"
      />
    ),
    "form-control": (
      <FormControl className="max-w-[280px]" required>
        <FormLabel>Workspace</FormLabel>
        <Input placeholder="sweyam" />
        <FormHelperText>Lowercase, no spaces.</FormHelperText>
      </FormControl>
    ),
    select: (
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
    ),
    "textarea-autosize": (
      <TextareaAutosize placeholder="Write a note…" minRows={2} className="max-w-[320px]" />
    ),
    "transfer-list": compact ? (
      <Typography variant="caption">Java → TypeScript</Typography>
    ) : (
      <TransferList
        left={leftItems}
        right={rightItems}
        onChange={(next) => {
          setLeftItems(next.left);
          setRightItems(next.right);
        }}
      />
    ),
    checkbox: (
      <FormControlLabel
        control={<Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} />}
        label="I agree to the terms"
      />
    ),
    "form-control-label": (
      <div className="demo-stack">
        <FormControlLabel
          control={<Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} />}
          label="Marketing emails"
        />
        <FormControlLabel
          control={<Switch checked={notify} onCheckedChange={setNotify} />}
          label="Push notifications"
        />
      </div>
    ),
    slider: (
      <div style={{ width: "min(280px, 100%)" }}>
        <Slider value={volume} onValueChange={setVolume} />
      </div>
    ),
    "toggle-button": (
      <ToggleButtonGroup exclusive value={align} onValueChange={setAlign} aria-label="Alignment">
        <ToggleButton value="left" aria-label="Align left">
          <AlignLeft />
        </ToggleButton>
        <ToggleButton value="center" aria-label="Align center">
          <AlignCenter />
        </ToggleButton>
        <ToggleButton value="right" aria-label="Align right">
          <AlignRight />
        </ToggleButton>
      </ToggleButtonGroup>
    ),
    "search-field": (
      <SearchField placeholder="Search people, lists, notes…" style={{ maxWidth: 360 }} />
    ),
    chip: (
      <div className="demo-row">
        <Chip active>Active</Chip>
        <Chip>Favorites</Chip>
        <Chip>Archived</Chip>
      </div>
    ),
    tag: (
      <div className="demo-row">
        <Tag>Java</Tag>
        <Tag variant="primary">AWS</Tag>
        <Tag variant="orange">Kubernetes</Tag>
        <Tag variant="cyan" size="lg">React</Tag>
      </div>
    ),
    wordmark: (
      <div className="demo-stack">
        <Wordmark name="Sweyam" accent=".io" />
        <Wordmark name="Sweyam" mark="." rest="io" size="sm" />
      </div>
    ),
    "gradient-text": (
      <p className="text-2xl font-black">
        Spatika <GradientText>UI</GradientText>
        <span className="text-primary">.</span>
      </p>
    ),
    "availability-badge": (
      <div className="demo-row">
        <AvailabilityBadge>Live preview</AvailabilityBadge>
        <AvailabilityBadge tone="success">In office</AvailabilityBadge>
      </div>
    ),
    "chip-group": (
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
    ),
    "segmented-control": (
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
    ),
    tabs: (
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <p className="text-muted" style={{ margin: "0.75rem 0 0", fontSize: "0.875rem" }}>
            Pipeline health and recent leads.
          </p>
        </TabsContent>
        <TabsContent value="activity">
          <p className="text-muted" style={{ margin: "0.75rem 0 0", fontSize: "0.875rem" }}>
            Calls and emails from this week.
          </p>
        </TabsContent>
        <TabsContent value="notes">
          <p className="text-muted" style={{ margin: "0.75rem 0 0", fontSize: "0.875rem" }}>
            Shared notes for the account.
          </p>
        </TabsContent>
      </Tabs>
    ),
    switch: (
      <div className="demo-row">
        <Switch checked={notify} onCheckedChange={setNotify} aria-label="Notifications" />
        <span className="text-muted" style={{ fontSize: "0.875rem" }}>
          Notifications {notify ? "on" : "off"}
        </span>
      </div>
    ),
    card: (
      <Card className="max-w-[360px]">
        <CardHeader>
          <CardTitle>Surface card</CardTitle>
        </CardHeader>
        <CardContent>Structured content with header and body regions.</CardContent>
      </Card>
    ),
    paper: (
      <Paper className="max-w-[320px] p-4" variant="glass">
        <Typography variant="subtitle2">Glass paper</Typography>
        <Typography variant="body2" color="muted">
          Elevation, outline, or glass surface.
        </Typography>
      </Paper>
    ),
    grid: (
      <Grid container spacing={2} className="w-full max-w-[360px]">
        <Grid xs={3}>
          <Paper className="grid-demo-cell p-3 text-center text-xs font-bold">3</Paper>
        </Grid>
        <Grid xs={6}>
          <Paper className="grid-demo-cell grid-demo-cell--accent p-3 text-center text-xs font-bold">6</Paper>
        </Grid>
        <Grid xs={3}>
          <Paper className="grid-demo-cell p-3 text-center text-xs font-bold">3</Paper>
        </Grid>
        <Grid xs={12}>
          <Paper className="grid-demo-cell grid-demo-cell--wide p-2 text-center text-xs font-bold">12 columns</Paper>
        </Grid>
      </Grid>
    ),
    masonry: (
      <Masonry columns={compact ? 2 : 3} spacing={8} className="w-full max-w-[360px]">
        {["h-16", "h-10", "h-20", "h-12"].map((h) => (
          <Paper key={h} className={`${h} masonry-demo-tile`} />
        ))}
      </Masonry>
    ),
    stack: (
      <Stack direction="row" spacing={2} align="center">
        <Badge>New</Badge>
        <Typography variant="body2">Stacked with gap</Typography>
        <Button size="sm">Action</Button>
      </Stack>
    ),
    container: (
      <Container maxWidth="sm" className="rounded-xl border border-border/40 bg-card/40 py-3 text-center">
        <Typography variant="caption">max-width container</Typography>
      </Container>
    ),
    list: (
      <Paper variant="outlined" className="w-full max-w-[360px] overflow-hidden">
        <List disablePadding>
          {people.map((person) => (
            <ListItem key={person.name} disablePadding>
              <ListItemButton selected={row === person.name} onClick={() => setRow(person.name)}>
                <ListItemIcon>
                  <InitialsAvatar name={person.name} className="size-8 text-[10px] font-bold" />
                </ListItemIcon>
                <ListItemText primary={person.name} secondary={person.meta} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>
    ),
    "glass-card": (
      <GlassCard className="max-w-[360px]">
        <CardHeader>
          <CardTitle>Frosted panel</CardTitle>
        </CardHeader>
        <CardContent>Elevated glass surface from the token system.</CardContent>
      </GlassCard>
    ),
    "stat-card": (
      <div className="demo-stat-grid">
        <StatCard
          label="Users"
          value="144k"
          hint="+12 this week"
          chart={<SparkLineChart data={[8, 12, 9, 16, 14, 22, 18, 26]} height={compact ? 28 : 40} />}
        />
        <StatCard variant="metric" label="Uptime" value="99.9%" />
      </div>
    ),
    "section-heading": (
      <SectionHeading
        eyebrow="Product"
        title="What's shipping"
        subtitle="Glass composites for app chrome, charts, and marketing."
      />
    ),
    "entity-card": (
      <div className="demo-stack">
        {people.map((person) => (
          <EntityCard key={person.name} interactive>
            <InitialsAvatar name={person.name} className="size-10 shrink-0 text-sm font-bold" />
            <div className="min-w-0 flex-1">
              <EntityCardTitle>{person.name}</EntityCardTitle>
              <EntityCardMeta>{person.meta}</EntityCardMeta>
            </div>
            <EntityCardChip>{person.chip}</EntityCardChip>
          </EntityCard>
        ))}
      </div>
    ),
    "list-row": (
      <div className="demo-stack">
        {people.map((person) => (
          <ListRow
            key={person.name}
            active={row === person.name}
            onClick={() => setRow(person.name)}
            trailing={<Badge variant="secondary">{person.chip}</Badge>}
          >
            <strong>{person.name}</strong>
            <p className="text-muted" style={{ margin: 0, fontSize: "0.8rem" }}>
              {person.meta}
            </p>
          </ListRow>
        ))}
      </div>
    ),
    stepper: compact ? (
      <Stepper activeStep={step}>
        <Step>
          <StepLabel>Account</StepLabel>
        </Step>
        <Step>
          <StepLabel>Details</StepLabel>
        </Step>
        <Step>
          <StepLabel>Done</StepLabel>
        </Step>
      </Stepper>
    ) : (
      <div className="demo-stack w-full">
        <Stepper activeStep={step}>
          <Step>
            <StepLabel>Account</StepLabel>
          </Step>
          <Step>
            <StepLabel>Details</StepLabel>
          </Step>
          <Step>
            <StepLabel>Done</StepLabel>
          </Step>
        </Stepper>
        <div className="demo-row">
          <Button size="sm" variant="outline" disabled={step <= 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
          <Button size="sm" disabled={step >= 2} onClick={() => setStep((s) => s + 1)}>
            Next
          </Button>
        </div>
      </div>
    ),
    "mobile-stepper": (
      <MobileStepper
        steps={4}
        activeStep={mobileStep}
        variant="dots"
        className="w-full max-w-[360px]"
        backButton={
          <Button size="sm" variant="ghost" disabled={mobileStep === 0} onClick={() => setMobileStep((s) => s - 1)}>
            Back
          </Button>
        }
        nextButton={
          <Button size="sm" variant="ghost" disabled={mobileStep === 3} onClick={() => setMobileStep((s) => s + 1)}>
            Next
          </Button>
        }
      />
    ),
    "app-bar": (
      <AppBar position="relative" className="w-full max-w-[360px] overflow-hidden rounded-xl border">
        <Toolbar>
          <div className="flex min-w-0 items-center gap-2">
            <Inbox className="size-4 text-primary" />
            <Typography variant="subtitle2">Inbox</Typography>
          </div>
          <div className="flex items-center gap-1">
            <IconButton size="sm" aria-label="Search inbox" variant="ghost">
              <Search className="size-4" />
            </IconButton>
            <IconButton size="sm" aria-label="Notifications" variant="ghost">
              <Bell className="size-4" />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
    ),
    "bottom-navigation": (
      <BottomNavigation value={nav} onChange={(_event, value) => setNav(value)} className="w-full max-w-[360px]">
        <BottomNavigationAction value="home" label="Home" icon={<Home />} />
        <BottomNavigationAction value="search" label="Search" icon={<Search />} />
        <BottomNavigationAction value="you" label="You" icon={<User />} />
      </BottomNavigation>
    ),
    menu: (
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={(event) => setMenuAnchor(event.currentTarget)}
        >
          Open menu
        </Button>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setMenuAnchor(null);
          }}
        >
          <MenuItem onClick={() => setMenuAnchor(null)}>Profile</MenuItem>
          <MenuItem onClick={() => setMenuAnchor(null)}>Settings</MenuItem>
        </Menu>
      </div>
    ),
    breadcrumb: (
      <Breadcrumb
        items={[
          { label: "Home", href: "#" },
          { label: "Components", href: "#" },
          { label: "Accordion" },
        ]}
      />
    ),
    pagination: (
      <Pagination page={page} pageCount={8} onPageChange={setPage} />
    ),
    "speed-dial": (
      <SpeedDial ariaLabel="Create" hideBackdrop>
        <SpeedDialAction icon={<Mail className="size-4" />} tooltipTitle="Email" />
        <SpeedDialAction icon={<Copy className="size-4" />} tooltipTitle="Copy" />
        <SpeedDialAction icon={<Share2 className="size-4" />} tooltipTitle="Share" />
      </SpeedDial>
    ),
    "app-header": (
      <div className="showcase-frame demo-chrome-scope" style={{ minHeight: compact ? undefined : 140 }}>
        <AppHeader
          variant="chrome"
          brand={<SpatikaLogo size={22} />}
          title="Spatika"
          actions={
            <div className={appChromeActionClusterClass}>
              <HeaderIconButton aria-label="Notifications" size="sm">
                <Bell className="size-4" />
              </HeaderIconButton>
              <HeaderIconButton aria-label="Settings" size="sm">
                <Settings className="size-4" />
              </HeaderIconButton>
            </div>
          }
        />
        {!compact ? (
          <div className="px-4 py-6 text-sm text-muted-foreground">
            Fixed safe-area chrome — contained preview below the header.
          </div>
        ) : null}
      </div>
    ),
    "site-nav": (
      <div className="showcase-frame" style={{ minHeight: compact ? 72 : 180, position: "relative" }}>
        <SiteNav
          contained
          brand={<Wordmark name="Sweyam" accent=".io" />}
          links={[
            { href: "#about", label: "About" },
            { href: "#work", label: "Work" },
            { href: "#contact", label: "Contact" },
          ]}
        />
      </div>
    ),
    "site-footer": (
      <SiteFooter
        brand={<Wordmark name="Sweyam" mark="." rest="io" size="sm" />}
        copyright="© 2026"
        links={[
          { href: "#about", label: "About" },
          { href: "#contact", label: "Contact" },
        ]}
        meta={
          <div className="flex flex-col items-center gap-2 sm:items-end">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Powered by
            </span>
            <div className="flex gap-2">
              <MetaChip>Next.js</MetaChip>
              <MetaChip>Spatika</MetaChip>
            </div>
          </div>
        }
      />
    ),
    "icon-tile": (
      <div className="demo-row" style={{ alignItems: "stretch" }}>
        <IconTile icon="⌘" title="Design systems" description="Tokens, themes, and chrome." />
        <IconTile icon="📱" title="App chrome" description="Headers, tab bars, and sheets." />
      </div>
    ),
    "career-card": (
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
    ),
    "project-card": (
      <ProjectCard
        title="Spatika UI"
        company="Open source"
        outcome="Shipped"
        description="Glass React design system with tokens and four themes."
        tags={["React", "Tokens"]}
      />
    ),
    "float-chip": (
      <div className="float-chip-demo">
        <FloatChip icon="✨" title="Glass UI" subtitle="Design system" />
        <FloatChip icon="📍" title="Remote" subtitle="Global team" />
        <FloatChip live>In production</FloatChip>
      </div>
    ),
    "meta-chip": (
      <div className="demo-row">
        <MetaChip icon="N">Next.js</MetaChip>
        <MetaChip icon="R">React</MetaChip>
        <MetaChip icon={<SpatikaLogo size={12} />}>Spatika</MetaChip>
      </div>
    ),
    "contact-link": (
      <div className="demo-stack" style={{ maxWidth: 420 }}>
        <ContactLink
          href="mailto:hello@sweyam.io"
          name="Email"
          label="hello@sweyam.io"
          icon="@"
          iconBg="#FEF3EE"
          iconColor="#E85D3A"
        />
        <ContactLink
          href="https://github.com/sweyam"
          name="GitHub"
          label="github.com/sweyam"
          icon="GH"
          iconBg="#F6F6F6"
          iconColor="#1A1A1A"
        />
      </div>
    ),
    "floating-page-chrome": compact ? (
      <FloatingPageChromeBar
        identity={<FloatingPageChromeIdentity title="People" count={42} />}
        actions={
          <Button size="sm" className={floatingPageChromePrimaryClass}>
            <Plus className="size-3.5" />
            Add
          </Button>
        }
      />
    ) : (
      <div className="showcase-frame demo-chrome-scope" style={{ minHeight: 280 }}>
        <AppHeader variant="chrome" brand={<SpatikaLogo size={20} />} title="Spatika" />
        <FloatingPageChromeBar
          identity={
            <FloatingPageChromeIdentity title="People" count={42} countLabel="42 contacts" />
          }
          search={
            <FloatingPageChromeSearchField
              value={query}
              onChange={setQuery}
              onClear={() => setQuery("")}
              placeholder="Search people…"
            />
          }
          actions={
            <>
              <FilterSheet
                open={filtersOpen}
                onOpenChange={setFiltersOpen}
                title="View & filters"
                description="Narrow the directory."
                trigger={
                  <Button type="button" variant="ghost" className={floatingPageChromePillClass}>
                    <SlidersHorizontal className="size-3.5" />
                    Filters
                  </Button>
                }
              >
                <ChipGroup
                  options={[
                    { value: "all", label: "All" },
                    { value: "fav", label: "Favorites" },
                    { value: "new", label: "New" },
                  ]}
                  selected={chips}
                  onToggle={(value) => setChips(toggleOptionValue(chips, value))}
                  variant="filter"
                />
              </FilterSheet>
              <Button size="sm" className={floatingPageChromePrimaryClass}>
                <Plus className="size-3.5" />
                Add
              </Button>
            </>
          }
        >
          <div className="demo-stack" style={{ padding: "0.85rem 1rem 1.1rem" }}>
            {people.map((person) => (
              <EntityCard key={person.name} density="compact" interactive>
                <InitialsAvatar name={person.name} className="size-9 shrink-0 text-xs font-bold" />
                <div className="min-w-0 flex-1">
                  <EntityCardTitle>{person.name}</EntityCardTitle>
                  <EntityCardMeta>{person.meta}</EntityCardMeta>
                </div>
                <EntityCardChip>{person.chip}</EntityCardChip>
              </EntityCard>
            ))}
          </div>
        </FloatingPageChromeBar>
      </div>
    ),
    "page-sticky-header": (
      <PageStickyHeader title="Settings" subtitle="Account preferences" />
    ),
    "mobile-tab-bar": (
      <div className="showcase-frame demo-tabbar-scope" style={{ minHeight: compact ? undefined : 120 }}>
        <MobileTabBar
          contained
          items={tabItems.map((item) => ({
            ...item,
            active: tab === item.id,
            onClick: () => setTab(item.id),
          }))}
        />
      </div>
    ),
    "filter-sheet": (
      <FilterSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        title="View & filters"
        description="Status, owner, and source."
        trigger={<Button variant="secondary">Open filters</Button>}
      >
        <ChipGroup
          title="Status"
          options={[
            { value: "all", label: "All" },
            { value: "open", label: "Open" },
            { value: "won", label: "Won" },
          ]}
          selected={chips}
          onToggle={(value) => setChips(toggleOptionValue(chips, value))}
          variant="filter"
        />
      </FilterSheet>
    ),
    "header-icon-button": (
      <div className={appChromeActionClusterClass}>
        <HeaderIconButton aria-label="Search" size="sm">
          <Search className="size-4" />
        </HeaderIconButton>
        <HeaderIconButton aria-label="Notifications" badge={3} size="sm">
          <Bell className="size-4" />
        </HeaderIconButton>
        <HeaderIconButton aria-label="Settings" active size="sm">
          <Settings className="size-4" />
        </HeaderIconButton>
      </div>
    ),
    "cover-hero": (
      <CoverHero
        title="Coastal Drive"
        kicker={<Badge variant="secondary">Album</Badge>}
        coverSeed="coast"
        bleed={false}
        className={compact ? "preview-hero" : undefined}
        facts={
          compact
            ? undefined
            : [
                { key: "photos", label: "Photos", value: "24" },
                { key: "places", label: "Places", value: "6" },
              ]
        }
      />
    ),
    "profile-hero": (
      <ProfileHero
        name="Alex Chen"
        alias="Product designer"
        coverSeed="alex"
        bleed={false}
        className={compact ? "preview-hero" : undefined}
      />
    ),
    "entity-media-card": compact ? (
      <EntityMediaCard title="Alex Chen" subtitle="Product designer" statusLine="Active" />
    ) : (
      <div className="demo-media-grid">
        <EntityMediaCard title="Alex Chen" subtitle="Product designer" statusLine="Active" />
        <EntityMediaCard title="Jordan Lee" subtitle="Account lead" statusLine="Away" />
      </div>
    ),
    "image-list": (
      <ImageList cols={3} rowHeight={compact ? 72 : 148} gap={10} className="w-full">
        {[
          { title: "Coast", seed: "coast", hue: 205 },
          { title: "Dawn", seed: "dawn", hue: 32 },
          { title: "Dusk", seed: "dusk", hue: 258 },
        ].map((item) => (
          <ImageListItem key={item.title}>
            <CoverPattern seed={item.seed} hue={item.hue} />
            {compact ? null : <ImageListItemBar title={item.title} />}
          </ImageListItem>
        ))}
      </ImageList>
    ),
    progress: (
      <div className="demo-stack" style={{ width: "min(280px, 100%)" }}>
        <Progress value={62} />
        <Progress variant="indeterminate" />
      </div>
    ),
    "circular-progress": (
      <div className="demo-row">
        <CircularProgress />
        <CircularProgress variant="determinate" value={62} />
      </div>
    ),
    skeleton: (
      <div className="demo-stack" style={{ width: "min(240px, 100%)" }}>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    ),
    alert: (
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Your session will expire in 5 minutes.</AlertDescription>
      </Alert>
    ),
    "empty-state": (
      <EmptyState
        title="Nothing here"
        description="Try adjusting your filters."
        actionLabel="Reset filters"
        onAction={() => undefined}
      />
    ),
    toast: compact ? (
      <Button size="sm">Show toast</Button>
    ) : (
      <Toaster>
        <ToastDemo />
      </Toaster>
    ),
    snackbar: (
      <>
        <Button size="sm" onClick={() => setSnackOpen(true)}>
          Show snackbar
        </Button>
        <Snackbar
          open={snackOpen}
          onClose={() => setSnackOpen(false)}
          message="Note archived"
          action={
            <Button size="sm" variant="ghost" onClick={() => setSnackOpen(false)}>
              Undo
            </Button>
          }
        />
      </>
    ),
    dialog: (
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
    ),
    modal: (
      <>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          Open modal
        </Button>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <Paper className="w-[min(320px,90vw)] p-5">
            <Typography variant="h6">Custom surface</Typography>
            <Typography variant="body2" color="muted">
              Modal is the low-level overlay. Prefer Dialog for titles.
            </Typography>
            <Button className="mt-4" size="sm" onClick={() => setModalOpen(false)}>
              Close
            </Button>
          </Paper>
        </Modal>
      </>
    ),
    tooltip: (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline">
              Hover me
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add to library</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    table: (
      <Table className="max-w-[420px]">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {people.slice(0, compact ? 1 : 3).map((person) => (
            <TableRow key={person.name}>
              <TableCell>{person.name}</TableCell>
              <TableCell>{person.chip}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    ),
    "table-pagination": (
      <TablePagination
        count={42}
        page={tablePage}
        onPageChange={setTablePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={setRowsPerPage}
      />
    ),
    "event-calendar": (
      <EventCalendar
        className="w-full"
        defaultView={compact ? "agenda" : "month"}
        toolbarDensity="compact"
        showDateJump={!compact}
        events={calendarEvents}
        resources={calendarResources}
        onEventChange={(event, next) =>
          setCalendarEvents((current) =>
            current.map((item) => (item.id === event.id ? { ...item, ...next } : item)),
          )
        }
        onEventCreate={(event) => setCalendarEvents((current) => [...current, event])}
        onEventDelete={(event) =>
          setCalendarEvents((current) => current.filter((item) => item.id !== event.id))
        }
      />
    ),
    "event-timeline": (
      <EventTimeline
        className="w-full"
        events={timelineEvents}
        resources={timelineResources}
        onEventChange={(event, next) =>
          setTimelineEvents((current) =>
            current.map((item) => (item.id === event.id ? { ...item, ...next } : item)),
          )
        }
        onEventCreate={(event) => setTimelineEvents((current) => [...current, event])}
        onEventDelete={(event) =>
          setTimelineEvents((current) => current.filter((item) => item.id !== event.id))
        }
      />
    ),
    ...systemDemos(compact),
    ...marketingDemos(compact),
    ...chartDemos(compact),
    ...Object.fromEntries(
      EDITOR_SLUGS.map((editorSlug) => [
        editorSlug,
        <Suspense key={editorSlug} fallback={<div className="demo-loading" role="status" aria-label="Loading editor" />}>
          <EditorDemo slug={editorSlug} compact={compact} />
        </Suspense>,
      ]),
    ),
    ...appDemos,
  };

  const preview = demos[slug] ?? <p>Preview coming soon.</p>;
  if (bare) return preview;
  return (
    <div className={compact ? "demo-panel demo-panel--compact" : "demo-panel"}>
      {preview}
    </div>
  );
}
