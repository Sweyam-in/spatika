import { Route, Routes } from "react-router-dom";
import { DocsLayout } from "@/components/DocsLayout";
import { componentNavGroups, customizeNav, designNav, guideNav } from "@/data/navigation";
import { HomePage } from "@/pages/HomePage";
import { DesignPage } from "@/pages/DesignPage";
import { ComponentsPage } from "@/pages/ComponentsPage";
import { ComponentDetailPage } from "@/pages/ComponentDetailPage";
import { GuidesPage } from "@/pages/GuidesPage";
import { CustomizePage } from "@/pages/CustomizePage";
import { ShowcaseLayout } from "@/showcase/ShowcaseLayout";
import { ShowcaseHomePage } from "@/showcase/ShowcaseHomePage";
import { ShowcaseLeadsPage } from "@/showcase/ShowcaseLeadsPage";
import { ShowcaseLeadPage } from "@/showcase/ShowcaseLeadPage";
import { ShowcaseCampaignsPage } from "@/showcase/ShowcaseCampaignsPage";
import { ShowcaseInsightsPage } from "@/showcase/ShowcaseInsightsPage";
import { ShowcaseIndexPage } from "@/showcase/screens/ShowcaseIndexPage";
import { FinanceDashboard } from "@/showcase/screens/FinanceDashboard";
import { AdminConsole } from "@/showcase/screens/AdminConsole";
import { WorkspaceApp } from "@/showcase/screens/WorkspaceApp";
import { LandingPage } from "@/showcase/screens/LandingPage";
import { EditorPlaygroundPage } from "@/pages/EditorPlaygroundPage";

export default function App() {
  return (
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
      <Route
        element={<DocsLayout sidebar={{ title: "Components", groups: componentNavGroups }} />}
      >
        <Route path="components" element={<ComponentsPage />} />
        <Route path="components/:slug" element={<ComponentDetailPage />} />
      </Route>
    </Routes>
  );
}
