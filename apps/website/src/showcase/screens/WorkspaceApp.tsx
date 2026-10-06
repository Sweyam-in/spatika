import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  Flag,
  Inbox,
  ListChecks,
  Plus,
  Search,
  Share2,
} from "lucide-react";
import {
  AppShell,
  Avatar,
  AvatarFallback,
  AvatarGroup,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  CommandPalette,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  EventCalendar,
  FormField,
  IconButton,
  Input,
  NavItem,
  NavSection,
  PageHeader,
  Progress,
  SearchTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sidebar,
  SpatikaEditor,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tag,
  Timeline,
  TimelineItem,
  Toaster,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TopBar,
  WorkspaceSwitcher,
  getInitials,
  useAppShell,
  useToast,
  type SchedulerEvent,
} from "@spatika/react";
import { atlasEvents, launchDoc, tasks as seedTasks, type Task } from "./data";
import { ScreenUserMenu, useSharedCommands } from "./shared";

const PROJECTS = [
  { id: "launch", label: "Q4 launch", color: "var(--spk-viz-1)" },
  { id: "ds", label: "Design system", color: "var(--spk-viz-2)" },
  { id: "mobile", label: "Mobile app", color: "var(--spk-viz-3)" },
];

const GROUPS: { id: Task["status"]; label: string }[] = [
  { id: "progress", label: "In progress" },
  { id: "next", label: "Up next" },
  { id: "done", label: "Done" },
];

const TEAM = ["Hana Sato", "Diego Alvarez", "Priya Nair", "Marcus Webb"];

export function WorkspaceApp() {
  return (
    <Toaster position="bottom-right">
      <WorkspaceScreen />
    </Toaster>
  );
}

/** Search field in the sidebar that becomes an icon on the collapsed rail. */
function SidebarSearch({ onOpen }: { onOpen: () => void }) {
  const shell = useAppShell();
  if (shell?.collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <IconButton size="sm" aria-label="Search" onClick={onOpen}>
            <Search />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent side="right">Search ⌘K</TooltipContent>
      </Tooltip>
    );
  }
  return <SearchTrigger placeholder="Search Atlas" onOpen={onOpen} />;
}

function WorkspaceScreen() {
  const [nav, setNav] = useState("launch");
  const [tab, setTab] = useState("doc");
  const [doc, setDoc] = useState(launchDoc);
  const [taskList, setTaskList] = useState(seedTasks);
  const [events, setEvents] = useState<SchedulerEvent[]>(() => atlasEvents());
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [projects, setProjects] = useState(PROJECTS);
  const [projectOpen, setProjectOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const { toast } = useToast();
  const shared = useSharedCommands();

  const done = taskList.filter((t) => t.status === "done").length;
  const mineOpen = taskList.filter((t) => t.assignee === "Hana Sato" && t.status !== "done").length;
  const [inbox, setInbox] = useState(INBOX);

  const toggleTask = (id: string) =>
    setTaskList((list) =>
      list.map((t) => (t.id === id ? { ...t, status: t.status === "done" ? "progress" : "done" } : t)),
    );

  const commands = useMemo(
    () => [
      {
        heading: "Atlas",
        items: [
          { id: "new-task", label: "New task", icon: <Plus />, shortcut: ["C"], onSelect: () => setTaskOpen(true) },
          { id: "tab-doc", label: "Open launch plan", icon: <FileText />, onSelect: () => { setNav("launch"); setTab("doc"); } },
          { id: "tab-tasks", label: "Show tasks", icon: <ListChecks />, onSelect: () => { setNav("launch"); setTab("tasks"); } },
          { id: "tab-cal", label: "Show calendar", icon: <CalendarDays />, onSelect: () => { setNav("launch"); setTab("calendar"); } },
        ],
      },
      ...shared,
    ],
    [shared, toast],
  );

  const activeProject = projects.find((project) => project.id === nav);
  const crumb = activeProject?.label ?? (nav === "inbox" ? "Inbox" : nav === "tasks" ? "My tasks" : nav === "calendar" ? "Calendar" : "Docs");

  return (
    <>
      <AppShell
        sidebar={
          <Sidebar
            header={
              <>
                <WorkspaceSwitcher
                  value="atlas"
                  onValueChange={() => undefined}
                  workspaces={[{ id: "atlas", name: "Atlas Labs", description: "12 members" }]}
                />
                <SidebarSearch onOpen={() => setPaletteOpen(true)} />
              </>
            }
            footer={<ScreenUserMenu name="Hana Sato" email="hana@atlas.team" />}
          >
            <NavSection>
              <NavItem icon={<Inbox />} label="Inbox" meta={inbox.length} active={nav === "inbox"} onClick={() => setNav("inbox")} />
              <NavItem icon={<CheckCircle2 />} label="My tasks" meta={mineOpen} active={nav === "tasks"} onClick={() => setNav("tasks")} />
              <NavItem icon={<CalendarDays />} label="Calendar" active={nav === "calendar"} onClick={() => setNav("calendar")} />
              <NavItem icon={<FileText />} label="Docs" active={nav === "docs"} onClick={() => setNav("docs")} />
            </NavSection>
            <NavSection title="Projects" action={<IconButton size="xs" aria-label="New project" onClick={() => setProjectOpen(true)}><Plus /></IconButton>}>
              {projects.map((project) => (
                <NavItem
                  key={project.id}
                  icon={<span className="screen-dot" style={{ background: project.color }} aria-hidden />}
                  label={project.label}
                  active={nav === project.id}
                  onClick={() => setNav(project.id)}
                />
              ))}
            </NavSection>
          </Sidebar>
        }
        topbar={
          <TopBar
            title={<Breadcrumb items={[{ label: activeProject ? "Projects" : "Atlas", href: "#" }, { label: crumb }]} />}
            actions={
              <>
                <AvatarGroup max={3} total={TEAM.length} spacing="sm" className="max-sm:hidden">
                  {TEAM.map((name) => (
                    <Avatar key={name} size="sm">
                      <AvatarFallback>{getInitials(name)}</AvatarFallback>
                    </Avatar>
                  ))}
                </AvatarGroup>
                <Button size="sm" variant="secondary" leadingIcon={<Share2 />} onClick={() => toast({ title: "Link copied", tone: "success" })}>
                  Share
                </Button>
              </>
            }
          />
        }
      >
        {nav === "launch" ? (
        <div className="screen screen-with-rail">
          <div className="screen-main">
            <PageHeader
              kicker="Project"
              title="Q4 launch"
              meta={
                <Badge variant="success" dot>
                  On track
                </Badge>
              }
              description="Atlas 4.0 ships on the second Tuesday of next month."
            >
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList aria-label="Project views">
                  <TabsTrigger value="doc">
                    <FileText /> Plan
                  </TabsTrigger>
                  <TabsTrigger value="tasks">
                    <ListChecks /> Tasks
                    <span className="screen-tab-count spk-numeric">{taskList.length - done}</span>
                  </TabsTrigger>
                  <TabsTrigger value="calendar">
                    <CalendarDays /> Calendar
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="doc" className="screen-editor">
                  <SpatikaEditor
                    value={doc}
                    onChange={setDoc}
                    placeholder="Type / for commands"
                    toolbar={{ layout: "compact" }}
                  />
                </TabsContent>
                <TabsContent value="tasks">
                  {GROUPS.map((group) => {
                    const items = taskList.filter((t) => t.status === group.id);
                    return (
                      <section key={group.id} className="screen-task-group" aria-label={group.label}>
                        <h3 className="screen-task-group-title">
                          {group.label}
                          <span className="screen-muted spk-numeric">{items.length}</span>
                        </h3>
                        <div className="screen-tasks">
                          {items.map((task) => (
                            <div key={task.id} className="screen-task" data-done={task.status === "done" ? "true" : undefined}>
                              <Checkbox
                                checked={task.status === "done"}
                                onCheckedChange={() => toggleTask(task.id)}
                                aria-label={`Mark "${task.title}" ${task.status === "done" ? "not done" : "done"}`}
                              />
                              <div className="screen-list-main">
                                <div className="screen-list-title">{task.title}</div>
                              </div>
                              {task.priority === "high" ? <Flag className="screen-flag" aria-label="High priority" /> : null}
                              <Tag variant={task.tag.tone} className="max-sm:hidden">
                                {task.tag.label}
                              </Tag>
                              <span className="screen-muted screen-task-due">{task.due}</span>
                              <Avatar size="xs" title={task.assignee}>
                                <AvatarFallback>{getInitials(task.assignee)}</AvatarFallback>
                              </Avatar>
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  })}
                  <Button variant="ghost" size="sm" leadingIcon={<Plus />} onClick={() => setTaskOpen(true)}>
                    Add task
                  </Button>
                </TabsContent>
                <TabsContent value="calendar">
                  <EventCalendar
                    defaultView="week"
                    toolbarDensity="compact"
                    hourStart={8}
                    hourEnd={19}
                    weekStartsOn={1}
                    events={events}
                    onEventCreate={(event) => setEvents((list) => [...list, event])}
                    onEventChange={(event, next) => setEvents((list) => list.map((e) => (e.id === event.id ? { ...e, ...next } : e)))}
                    onEventDelete={(event) => setEvents((list) => list.filter((e) => e.id !== event.id))}
                  />
                </TabsContent>
              </Tabs>
            </PageHeader>
          </div>

          <aside className="screen-rail" aria-label="Project details">
            <div>
              <h2 className="spk-text-title-3" style={{ margin: "0 0 0.875rem" }}>
                Details
              </h2>
              <dl className="screen-props">
                <dt>Status</dt>
                <dd>
                  <Badge variant="success" dot>
                    On track
                  </Badge>
                </dd>
                <dt>Lead</dt>
                <dd>
                  <Avatar size="xs">
                    <AvatarFallback>HS</AvatarFallback>
                  </Avatar>
                  Hana Sato
                </dd>
                <dt>Target</dt>
                <dd className="spk-numeric">Oct 14</dd>
                <dt>Progress</dt>
                <dd>
                  <Progress value={done} max={taskList.length} size="xs" style={{ flex: 1 }} />
                  <span className="screen-muted spk-numeric">
                    {done}/{taskList.length}
                  </span>
                </dd>
              </dl>
            </div>
            <div>
              <h2 className="spk-text-title-3" style={{ margin: "0 0 0.875rem" }}>
                Activity
              </h2>
              <Timeline>
                <TimelineItem tone="success" title="Hana approved the launch email" meta="2h" />
                <TimelineItem tone="accent" title="Diego moved QA to In progress" meta="4h" />
                <TimelineItem title="Priya commented on Plan" meta="1d" description="“Can we add the rollback owner?”" />
              </Timeline>
            </div>
          </aside>
        </div>
        ) : (
          <AlternateView
            nav={nav}
            project={activeProject}
            tasks={taskList}
            onToggle={toggleTask}
            onAddTask={() => setTaskOpen(true)}
            events={events}
            onEvents={setEvents}
            doc={doc}
            onDoc={setDoc}
            onOpenLaunch={() => setNav("launch")}
            inbox={inbox}
            onInbox={setInbox}
          />
        )}
      </AppShell>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} groups={commands} />
      <TaskDialog
        open={taskOpen}
        onOpenChange={setTaskOpen}
        onCreate={(task) => {
          setTaskList((list) => [task, ...list]);
          setTab("tasks");
          if (!activeProject) setNav("tasks");
          toast({ title: "Task created", description: task.title, tone: "success" });
        }}
      />
      <ProjectDialog
        open={projectOpen}
        onOpenChange={setProjectOpen}
        onCreate={(project) => {
          setProjects((list) => [...list, project]);
          setNav(project.id);
        }}
      />
    </>
  );
}

const INBOX = [
  { id: "n1", title: "Priya asked for a rollback owner on the launch plan", meta: "1d" },
  { id: "n2", title: "Diego moved QA to In progress", meta: "4h" },
  { id: "n3", title: "Launch email is waiting on your approval", meta: "2h" },
  { id: "n4", title: "Support training is on the calendar tomorrow", meta: "Today" },
];

function AlternateView({
  nav,
  project,
  tasks,
  onToggle,
  onAddTask,
  events,
  onEvents,
  doc,
  onDoc,
  onOpenLaunch,
  inbox,
  onInbox,
}: {
  nav: string;
  project: { id: string; label: string } | undefined;
  tasks: Task[];
  onToggle: (id: string) => void;
  onAddTask: () => void;
  events: SchedulerEvent[];
  onEvents: (events: SchedulerEvent[]) => void;
  doc: string;
  onDoc: (doc: string) => void;
  onOpenLaunch: () => void;
  inbox: { id: string; title: string; meta: string }[];
  onInbox: (next: { id: string; title: string; meta: string }[]) => void;
}) {
  const mine = tasks.filter((task) => task.assignee === "Hana Sato");

  if (project && project.id !== "launch") {
    return (
      <div className="screen">
        <PageHeader kicker="Project" title={project.label} description="This project does not have a plan yet." />
        <EmptyState
          title="No plan in this project"
          description="Q4 launch is the only project with a doc, tasks and a calendar in this preview."
          actionLabel="Open Q4 launch"
          onAction={onOpenLaunch}
        />
      </div>
    );
  }

  if (nav === "inbox") {
    return (
      <div className="screen">
        <PageHeader title="Inbox" description="Mentions and decisions waiting on you." />
        {inbox.length === 0 ? (
          <EmptyState title="Inbox zero" description="New comments and approvals will land here." />
        ) : (
          <Card padding="none">
            <ul className="screen-list">
              {inbox.map((item) => (
                <li key={item.id}>
                  <div className="screen-list-main">
                    <div className="screen-list-title">{item.title}</div>
                    <div className="screen-list-meta">{item.meta}</div>
                  </div>
                  <Button size="xs" variant="ghost" onClick={() => onInbox(inbox.filter((row) => row.id !== item.id))}>
                    Done
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    );
  }

  if (nav === "tasks") {
    return (
      <div className="screen">
        <PageHeader
          title="My tasks"
          description="Assigned to Hana Sato."
          actions={<Button size="sm" leadingIcon={<Plus />} onClick={onAddTask}>Add task</Button>}
        />
        {mine.length === 0 ? (
          <EmptyState title="Nothing assigned to you" description="New tasks you own will show up here." actionLabel="Add task" onAction={onAddTask} />
        ) : (
          <div className="screen-tasks">
            {mine.map((task) => (
              <div key={task.id} className="screen-task" data-done={task.status === "done" ? "true" : undefined}>
                <Checkbox
                  checked={task.status === "done"}
                  onCheckedChange={() => onToggle(task.id)}
                  aria-label={`Mark "${task.title}" ${task.status === "done" ? "not done" : "done"}`}
                />
                <div className="screen-list-main">
                  <div className="screen-list-title">{task.title}</div>
                </div>
                <span className="screen-muted">{task.due}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (nav === "calendar") {
    return (
      <div className="screen">
        <PageHeader title="Calendar" description="The team’s week. Drag an event to reschedule it." />
        <EventCalendar
          defaultView="week"
          toolbarDensity="compact"
          hourStart={8}
          hourEnd={19}
          weekStartsOn={1}
          events={events}
          onEventCreate={(event) => onEvents([...events, event])}
          onEventChange={(event, next) => onEvents(events.map((item) => (item.id === event.id ? { ...item, ...next } : item)))}
          onEventDelete={(event) => onEvents(events.filter((item) => item.id !== event.id))}
        />
      </div>
    );
  }

  return (
    <div className="screen">
      <PageHeader title="Docs" description="The launch plan is the working document for Atlas 4.0." />
      <SpatikaEditor value={doc} onChange={onDoc} placeholder="Type / for commands" toolbar={{ layout: "compact" }} />
    </div>
  );
}

function TaskDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (task: Task) => void;
}) {
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState(TEAM[0]!);
  const [error, setError] = useState<string | null>(null);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>Adds the task to Q4 launch and to the assignee’s list.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="grid gap-4">
            <FormField label="Title" required error={error ?? undefined}>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Write the rollback note" />
            </FormField>
            <FormField label="Assignee">
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger aria-label="Assignee"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TEAM.map((name) => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
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
              if (!title.trim()) {
                setError("Enter a title.");
                return;
              }
              onCreate({
                id: `a-${Date.now()}`,
                title: title.trim(),
                status: "next",
                assignee,
                due: "Today",
                tag: { label: "Launch", tone: "blue" },
                priority: "medium",
              });
              setTitle("");
              setError(null);
              onOpenChange(false);
            }}
          >
            Add task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProjectDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (project: { id: string; label: string; color: string }) => void;
}) {
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>Creates an empty project. Plans, tasks and events stay on Q4 launch until you add them.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <FormField label="Name" required error={error ?? undefined}>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Billing follow-ups" />
          </FormField>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (!label.trim()) {
                setError("Enter a name.");
                return;
              }
              onCreate({ id: `p-${Date.now()}`, label: label.trim(), color: "var(--spk-viz-5)" });
              setLabel("");
              setError(null);
              onOpenChange(false);
            }}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
