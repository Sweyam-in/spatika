import {
  AppHeader,
  Button,
  EntityCard,
  EntityCardChip,
  EntityCardMeta,
  EntityCardTitle,
  FloatingPageChromeBar,
  FloatingPageChromeIdentity,
  InitialsAvatar,
} from "@spatika/react";
import { SpatikaLogo } from "./SpatikaLogo";

/** Live mini shell — journalD-style chrome tray inside the hero card. */
export function HeroShellPreview() {
  return (
    <div className="hero-shell-preview">
      <div className="hero-shell-device demo-chrome-scope">
        <AppHeader
          variant="chrome"
          brand={<SpatikaLogo size={22} />}
          title="Spatika"
          actions={
            <Button size="sm" className="rounded-full">
              New
            </Button>
          }
        />
        <FloatingPageChromeBar
          identity={<FloatingPageChromeIdentity title="Leads" count={128} />}
        >
          <main className="hero-shell-main">
            <EntityCard density="compact" interactive>
              <InitialsAvatar name="Alex Chen" className="size-9 shrink-0 text-xs font-bold" />
              <div className="min-w-0 flex-1">
                <EntityCardTitle>Alex Chen</EntityCardTitle>
                <EntityCardMeta>Warm lead · Design studio</EntityCardMeta>
              </div>
              <EntityCardChip>Active</EntityCardChip>
            </EntityCard>
          </main>
        </FloatingPageChromeBar>
      </div>
    </div>
  );
}
