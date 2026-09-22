import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionSummary,
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Chip,
  Fab,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Progress,
  Rating,
  Skeleton,
  Slider,
  Stack,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tag,
  TextField,
  Typography,
  EventCalendar,
} from "@spatika/react";
import { Bell, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";

function ButtonSizes() {
  return (
    <div className="demo-row">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="touch">Touch</Button>
    </div>
  );
}

function ButtonDisabled() {
  return (
    <div className="demo-row">
      <Button disabled>Primary</Button>
      <Button variant="outline" disabled>
        Outline
      </Button>
      <Button variant="glass" disabled>
        Glass
      </Button>
    </div>
  );
}

function BadgeColors() {
  return (
    <div className="demo-row">
      <Badge>Default</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="warm">Warm</Badge>
      <Badge variant="highlight">Highlight</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </div>
  );
}

function AlertTones() {
  return (
    <div className="demo-stack" style={{ width: "min(420px, 100%)" }}>
      <Alert variant="info">
        <AlertTitle>Synced</AlertTitle>
        <AlertDescription>Contacts updated a minute ago.</AlertDescription>
      </Alert>
      <Alert variant="danger">
        <AlertTitle>Couldn&apos;t save</AlertTitle>
        <AlertDescription>Check your connection and try again.</AlertDescription>
      </Alert>
    </div>
  );
}

function TextFieldError() {
  return (
    <TextField
      label="Email"
      defaultValue="not-an-email"
      error
      helperText="Enter a valid address."
      fullWidth
      style={{ maxWidth: 320 }}
    />
  );
}

function TextFieldMultiline() {
  return (
    <TextField
      label="Notes"
      multiline
      rows={4}
      placeholder="Add context for the team…"
      fullWidth
      style={{ maxWidth: 320 }}
    />
  );
}

function TypographyScale() {
  return (
    <div className="demo-stack">
      <Typography variant="h3">Display</Typography>
      <Typography variant="subtitle1">Subtitle</Typography>
      <Typography variant="body1">Body copy uses the theme foreground.</Typography>
      <Typography variant="caption" color="muted">
        Caption
      </Typography>
    </div>
  );
}

function PaperVariants() {
  return (
    <div className="demo-row" style={{ alignItems: "stretch" }}>
      <Paper className="p-4" elevation={2}>
        Elevated
      </Paper>
      <Paper className="p-4" variant="outlined">
        Outlined
      </Paper>
      <Paper className="p-4" variant="glass">
        Glass
      </Paper>
    </div>
  );
}

function ChipVariants() {
  return (
    <div className="demo-row">
      <Chip variant="filter" active>
        Filter
      </Chip>
      <Chip variant="preference" active>
        Preference
      </Chip>
      <Chip variant="layout" active>
        Layout
      </Chip>
    </div>
  );
}

function TagColors() {
  return (
    <div className="demo-row">
      <Tag variant="primary">AWS</Tag>
      <Tag variant="green">Healthy</Tag>
      <Tag variant="orange">Kubernetes</Tag>
      <Tag variant="cyan" size="lg">
        React
      </Tag>
    </div>
  );
}

function IconButtonSizes() {
  return (
    <div className="demo-row">
      <IconButton aria-label="Notify" size="sm">
        <Bell />
      </IconButton>
      <IconButton aria-label="Notify" size="md" variant="outline">
        <Bell />
      </IconButton>
      <IconButton aria-label="Notify" size="touch" variant="glass" shape="circular">
        <Bell />
      </IconButton>
    </div>
  );
}

function FabColors() {
  return (
    <div className="demo-row">
      <Fab aria-label="Add" color="primary">
        <Plus />
      </Fab>
      <Fab aria-label="Add" color="glass">
        <Plus />
      </Fab>
      <Fab variant="extended" color="default">
        <Plus />
        Compose
      </Fab>
    </div>
  );
}

function ProgressValues() {
  return (
    <div className="demo-stack" style={{ width: "min(280px, 100%)" }}>
      <Progress value={25} />
      <Progress value={62} />
      <Progress value={100} />
    </div>
  );
}

function SwitchLabeled() {
  const [on, setOn] = useState(true);
  return (
    <FormControlLabel
      control={<Switch checked={on} onCheckedChange={setOn} />}
      label="Push notifications"
    />
  );
}

function SkeletonShapes() {
  return (
    <Stack direction="row" spacing={2} align="center" style={{ width: "min(280px, 100%)" }}>
      <Skeleton className="size-10 rounded-full" />
      <Stack spacing={1} className="flex-1">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </Stack>
    </Stack>
  );
}

function StackDirection() {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1}>
        <Button size="sm">Save</Button>
        <Button size="sm" variant="ghost">
          Cancel
        </Button>
      </Stack>
      <Button variant="outline">Full width action</Button>
    </Stack>
  );
}

function GridBreakpoints() {
  return (
    <Grid container spacing={2} className="w-full">
      <Grid xs={12} md={8}>
        <Paper className="p-3 text-center text-xs font-bold">8</Paper>
      </Grid>
      <Grid xs={12} md={4}>
        <Paper className="p-3 text-center text-xs font-bold">4</Paper>
      </Grid>
    </Grid>
  );
}

function CardSlots() {
  return (
    <Card className="max-w-[360px]">
      <CardHeader>
        <CardTitle>Invite teammate</CardTitle>
      </CardHeader>
      <CardContent>They&apos;ll get an email with a join link.</CardContent>
      <CardFooter>
        <Button size="sm">Send invite</Button>
      </CardFooter>
    </Card>
  );
}

function TabsControlled() {
  const [tab, setTab] = useState("overview");
  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-muted" style={{ margin: "0.75rem 0 0", fontSize: "0.875rem" }}>
          Selected: {tab}
        </p>
      </TabsContent>
      <TabsContent value="notes">
        <p className="text-muted" style={{ margin: "0.75rem 0 0", fontSize: "0.875rem" }}>
          Notes panel
        </p>
      </TabsContent>
    </Tabs>
  );
}

function SliderBounds() {
  const [volume, setVolume] = useState([8]);
  return (
    <div style={{ width: "min(280px, 100%)" }}>
      <Slider min={0} max={20} step={2} value={volume} onValueChange={setVolume} />
    </div>
  );
}

function RatingHalf() {
  return <Rating defaultValue={3.5} precision={0.5} />;
}

function AccordionMultiple() {
  return (
    <Accordion type="multiple" defaultValue={["a", "b"]} className="w-full max-w-[420px]">
      <AccordionItem value="a">
        <AccordionSummary>Tokens</AccordionSummary>
        <AccordionContent>Import @spatika/tokens/styles.css first.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionSummary>Themes</AccordionSummary>
        <AccordionContent>Mukta, Neelam, Usha, and Sandhya.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function EventCalendarCustom() {
  return (
    <EventCalendar
      className="w-full"
      defaultDate={new Date(2026, 7, 15)}
      showEventEditor={false}
      showPreferences={false}
      events={[
        {
          id: "run",
          title: "Morning Run",
          start: "2026-08-03T07:00:00",
          end: "2026-08-03T07:45:00",
          color: "teal",
          data: { kind: "run" },
        },
      ]}
      renderEvent={(event) => <span>★ {event.title}</span>}
      renderToolbar={({ title, onPrev, onNext, onToday }) => (
        <div className="flex flex-wrap items-center gap-2 px-3 py-3">
          <Button size="sm" variant="outline" onClick={onToday}>
            Today
          </Button>
          <Button size="sm" variant="ghost" onClick={onPrev}>
            Prev
          </Button>
          <p className="text-sm font-black">{title}</p>
          <Button size="sm" variant="ghost" onClick={onNext}>
            Next
          </Button>
        </div>
      )}
    />
  );
}

function EventCalendarCompact() {
  return (
    <EventCalendar
      className="w-full"
      defaultDate={new Date(2026, 7, 15)}
      toolbarDensity="compact"
      showDateJump
      showPreferences={false}
    />
  );
}

const extras: Record<string, Record<string, ReactNode>> = {
  button: { sizes: <ButtonSizes />, disabled: <ButtonDisabled /> },
  badge: { colors: <BadgeColors /> },
  alert: { tones: <AlertTones /> },
  "text-field": { error: <TextFieldError />, multiline: <TextFieldMultiline /> },
  typography: { scale: <TypographyScale /> },
  paper: { variants: <PaperVariants /> },
  chip: { variants: <ChipVariants /> },
  tag: { colors: <TagColors /> },
  "icon-button": { sizes: <IconButtonSizes /> },
  fab: { colors: <FabColors /> },
  progress: { values: <ProgressValues /> },
  switch: { labeled: <SwitchLabeled /> },
  skeleton: { shapes: <SkeletonShapes /> },
  stack: { direction: <StackDirection /> },
  grid: { breakpoints: <GridBreakpoints /> },
  card: { slots: <CardSlots /> },
  tabs: { controlled: <TabsControlled /> },
  slider: { bounds: <SliderBounds /> },
  rating: { half: <RatingHalf /> },
  accordion: { multiple: <AccordionMultiple /> },
  "event-calendar": { custom: <EventCalendarCustom />, compact: <EventCalendarCompact /> },
};

export function ExtraExample({ slug, id }: { slug: string; id: string }) {
  return extras[slug]?.[id] ?? null;
}
