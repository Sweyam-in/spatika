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
  Checkbox,
  CommandPalette,
  EventCalendar,
  IconButton,
  NavItem,
  NavSection,
  PageHeader,
  Progress,
  SearchTrigger,
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
  const { toast } = useToast();
  const shared = useSharedCommands();

  const done = taskList.filter((t) => t.status === "done").length;

  const toggleTask = (id: string) =>
    setTaskList((list) =>
      list.map((t) => (t.id === id ? { ...t, status: t.status === "done" ? "progress" : "done" } : t)),
    );

  const commands = useMemo(
    () => [
      {
        heading: "Atlas",
        items: [
          { id: "new-task", label: "New task", icon: <Plus />, shortcut: ["C"], onSelect: () => toast({ title: "Task created", tone: "success" }) },
          { id: "tab-doc", label: "Open launch plan", icon: <FileText />, onSelect: () => setTab("doc") },
          { id: "tab-tasks", label: "Show tasks", icon: <ListChecks />, onSelect: () => setTab("tasks") },
          { id: "tab-cal", label: "Show calendar", icon: <CalendarDays />, onSelect: () => setTab("calendar") },
        ],
      },
      ...shared,
    ],
    [shared, toast],
  );

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
              <NavItem icon={<Inbox />} label="Inbox" meta="4" active={nav === "inbox"} onClick={() => setNav("inbox")} />
              <NavItem icon={<CheckCircle2 />} label="My tasks" meta={taskList.length - done} active={nav === "tasks"} onClick={() => setNav("tasks")} />
              <NavItem icon={<CalendarDays />} label="Calendar" active={nav === "calendar"} onClick={() => setNav("calendar")} />
              <NavItem icon={<FileText />} label="Docs" active={nav === "docs"} onClick={() => setNav("docs")} />
            </NavSection>
            <NavSection title="Projects" action={<IconButton size="xs" aria-label="New project"><Plus /></IconButton>}>
              {PROJECTS.map((project) => (
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
            title={<Breadcrumb items={[{ label: "Projects", href: "#" }, { label: "Q4 launch" }]} />}
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
                  <Button variant="ghost" size="sm" leadingIcon={<Plus />} onClick={() => toast({ title: "Task created", tone: "success" })}>
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
      </AppShell>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} groups={commands} />
    </>
  );
}
