import { lazy, Suspense, type ComponentType } from "react";
import { Route, Routes } from "react-router-dom";
import { Skeleton } from "@spatika/react";
import { DocsLayout } from "@/components/DocsLayout";
import { componentNavGroups, customizeNav, designNav, guideNav, resourcesNav } from "@/data/navigation";
import { HomePage } from "@/pages/HomePage";

/**
 * Every route except the home page loads on demand, so a visitor downloads the editor, the
 * chart demos and the showcase screens only when they open them.
 */
function lazyPage<M extends Record<string, unknown>>(load: () => Promise<M>, name: keyof M & string) {
  return lazy(() => load().then((module) => ({ default: module[name] as ComponentType })));
}

const DesignPage = lazyPage(() => import("@/pages/DesignPage"), "DesignPage");
const ComponentsPage = lazyPage(() => import("@/pages/ComponentsPage"), "ComponentsPage");
const ComponentDetailPage = lazyPage(() => import("@/pages/ComponentDetailPage"), "ComponentDetailPage");
const GuidesPage = lazyPage(() => import("@/pages/GuidesPage"), "GuidesPage");
const CustomizePage = lazyPage(() => import("@/pages/CustomizePage"), "CustomizePage");
const ShowcaseLayout = lazyPage(() => import("@/showcase/ShowcaseLayout"), "ShowcaseLayout");
const ShowcaseHomePage = lazyPage(() => import("@/showcase/ShowcaseHomePage"), "ShowcaseHomePage");
const ShowcaseLeadsPage = lazyPage(() => import("@/showcase/ShowcaseLeadsPage"), "ShowcaseLeadsPage");
const ShowcaseLeadPage = lazyPage(() => import("@/showcase/ShowcaseLeadPage"), "ShowcaseLeadPage");
const ShowcaseCampaignsPage = lazyPage(() => import("@/showcase/ShowcaseCampaignsPage"), "ShowcaseCampaignsPage");
const ShowcaseInsightsPage = lazyPage(() => import("@/showcase/ShowcaseInsightsPage"), "ShowcaseInsightsPage");
const ShowcaseIndexPage = lazyPage(() => import("@/showcase/screens/ShowcaseIndexPage"), "ShowcaseIndexPage");
const FinanceDashboard = lazyPage(() => import("@/showcase/screens/FinanceDashboard"), "FinanceDashboard");
const AdminConsole = lazyPage(() => import("@/showcase/screens/AdminConsole"), "AdminConsole");
const WorkspaceApp = lazyPage(() => import("@/showcase/screens/WorkspaceApp"), "WorkspaceApp");
const LandingPage = lazyPage(() => import("@/showcase/screens/LandingPage"), "LandingPage");
const EditorPlaygroundPage = lazyPage(() => import("@/pages/EditorPlaygroundPage"), "EditorPlaygroundPage");
const ArchivePage = lazyPage(() => import("@/pages/ArchivePage"), "ArchivePage");
const AccessibilityPage = lazyPage(() => import("@/pages/ResourcePages"), "AccessibilityPage");
const ChangelogPage = lazyPage(() => import("@/pages/ResourcePages"), "ChangelogPage");
const MigrationPage = lazyPage(() => import("@/pages/ResourcePages"), "MigrationPage");
const VersionsPage = lazyPage(() => import("@/pages/ResourcePages"), "VersionsPage");

function RouteFallback() {
  return (
    <div className="route-fallback" aria-busy="true" aria-label="Loading page">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-full max-w-sm" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
    <Routes>
      <Route element={<DocsLayout wide />}>
        <Route index element={<HomePage />} />
        <Route path="showcase" element={<ShowcaseIndexPage />} />
        <Route path="demos/editor" element={<EditorPlaygroundPage />} />
      </Route>
      <Route path="showcase/finance" element={<FinanceDashboard />} />
      <Route path="showcase/admin" element={<AdminConsole />} />
      <Route path="showcase/workspace" element={<WorkspaceApp />} />
      <Route path="showcase/landing" element={<LandingPage />} />
      <Route path="showcase/relay" element={<ShowcaseLayout />}>
        <Route index element={<ShowcaseHomePage />} />
        <Route path="leads" element={<ShowcaseLeadsPage />} />
        <Route path="leads/:id" element={<ShowcaseLeadPage />} />
        <Route path="campaigns" element={<ShowcaseCampaignsPage />} />
        <Route path="insights" element={<ShowcaseInsightsPage />} />
      </Route>
      <Route element={<DocsLayout sidebar={{ title: "Design", items: designNav }} />}>
        <Route path="design" element={<DesignPage />} />
      </Route>
      <Route element={<DocsLayout sidebar={{ title: "Customize", items: customizeNav }} />}>
        <Route path="customize" element={<CustomizePage />} />
      </Route>
      <Route element={<DocsLayout sidebar={{ title: "Guides", items: guideNav }} />}>
        <Route path="guides" element={<GuidesPage />} />
      </Route>
      <Route element={<DocsLayout sidebar={{ title: "Resources", items: resourcesNav }} />}>
        <Route path="changelog" element={<ChangelogPage />} />
        <Route path="versions" element={<VersionsPage />} />
        <Route path="migration" element={<MigrationPage />} />
        <Route path="accessibility" element={<AccessibilityPage />} />
        <Route path="docs/:version/*" element={<ArchivePage />} />
      </Route>
      <Route
        element={<DocsLayout sidebar={{ title: "Components", groups: componentNavGroups }} />}
      >
        <Route path="components" element={<ComponentsPage />} />
        <Route path="components/:slug" element={<ComponentDetailPage />} />
      </Route>
    </Routes>
    </Suspense>
  );
}
