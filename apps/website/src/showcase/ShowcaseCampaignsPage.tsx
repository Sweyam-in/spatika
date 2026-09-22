import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  EmptyState,
  FloatingPageChromeBar,
  FloatingPageChromeIdentity,
  Progress,
  QuickFilterRail,
  floatingPageChromePrimaryClass,
  useToast,
} from "@spatika/react";
import { Megaphone, Plus } from "lucide-react";
import { CAMPAIGN_BADGE, CAMPAIGNS, type CampaignStatus } from "./data";

const FILTERS: { id: "all" | CampaignStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "paused", label: "Paused" },
  { id: "draft", label: "Draft" },
];

export function ShowcaseCampaignsPage() {
  const { toast } = useToast();
  const [status, setStatus] = useState<"all" | CampaignStatus>("all");

  const filtered = useMemo(
    () => CAMPAIGNS.filter((campaign) => (status === "all" ? true : campaign.status === status)),
    [status],
  );

  return (
    <>
      <FloatingPageChromeBar
        identity={
          <FloatingPageChromeIdentity
            title="Campaigns"
            count={filtered.length}
            countLabel={`${filtered.length} campaigns`}
          />
        }
        actions={
          <Button
            size="sm"
            className={floatingPageChromePrimaryClass}
            onClick={() =>
              toast({
                title: "Sequences are a demo",
                description: "Connect this to your outreach provider.",
              })
            }
          >
            <Plus size={14} />
            New sequence
          </Button>
        }
        below={
          <div className="relay-filters">
            <QuickFilterRail
              activeStyle="solid"
              value={status}
              onChange={(id) => setStatus(id as "all" | CampaignStatus)}
              groups={[
                {
                  items: FILTERS.map((item) => ({
                    id: item.id,
                    label: item.label,
                    count:
                      item.id === "all"
                        ? CAMPAIGNS.length
                        : CAMPAIGNS.filter((campaign) => campaign.status === item.id).length,
                  })),
                },
              ]}
            />
          </div>
        }
      />

      <div className="app-frame-pad">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No campaigns in this view"
            description="Draft a sequence or switch back to All."
            actionLabel="Show all"
            onAction={() => setStatus("all")}
          />
        ) : (
          <div className="relay-leads">
            {filtered.map((campaign) => (
              <Card key={campaign.id}>
                <CardContent>
                  <div className="relay-campaign-card">
                    <div className="relay-campaign-body">
                      <div>
                        <strong className="relay-campaign-name">{campaign.name}</strong>
                        <p className="relay-campaign-meta">{campaign.description}</p>
                        <div className="relay-chip-row">
                          <Badge variant={CAMPAIGN_BADGE[campaign.status]}>{campaign.status}</Badge>
                          <Badge variant="outline">{campaign.nextSend}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="relay-row-aside">
                      <span className="relay-money">{campaign.replyRate}%</span>
                      <span className="relay-muted">reply rate</span>
                    </div>
                  </div>
                  <div className="relay-funnel-row">
                    <div className="relay-funnel-label">
                      Enrolled
                      <span>
                        {campaign.replies} replies · {campaign.enrolled} in sequence
                      </span>
                    </div>
                    <Progress value={campaign.replyRate} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
