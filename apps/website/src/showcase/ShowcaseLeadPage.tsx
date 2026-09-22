import { useNavigate, useParams } from "react-router-dom";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CoverHero,
  EmptyState,
  Timeline,
  TimelineItem,
  useToast,
} from "@spatika/react";
import { Mail, Phone, StickyNote, Users, Video } from "lucide-react";
import { STAGE_BADGE, STAGE_LABEL, formatMoney, getLead } from "./data";

const ACTIVITY_ICON = {
  email: Mail,
  call: Phone,
  meeting: Video,
  note: StickyNote,
} as const;

export function ShowcaseLeadPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const lead = getLead(id);

  if (!lead) {
    return (
      <div className="app-frame-pad relay-page">
        <EmptyState
          icon={Users}
          title="Lead not found"
          description="That record is not in this demo workspace."
          actionLabel="Back to leads"
          onAction={() => navigate("/showcase/relay/leads")}
        />
      </div>
    );
  }

  return (
    <div className="relay-lead-detail">
      <CoverHero
        variant="profile"
        title={lead.name}
        kicker={`${lead.title} · ${lead.company}`}
        coverSeed={lead.company}
        coverHue={200 + (lead.score % 40)}
        onBack={() => navigate("/showcase/relay/leads")}
        avatars={[{ name: lead.name }]}
        facts={[
          { key: "stage", label: "Stage", value: STAGE_LABEL[lead.stage] },
          { key: "value", label: "Value", value: formatMoney(lead.value) },
          { key: "score", label: "Score", value: String(lead.score) },
          { key: "owner", label: "Owner", value: lead.owner },
        ]}
        floatingActions={
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              toast({
                title: "Logged a follow-up",
                description: "Demo only — connect this to your activity API.",
                tone: "success",
              })
            }
          >
            Log activity
          </Button>
        }
      />

      <div className="relay-profile">
        <div className="relay-profile-facts">
          <div className="relay-fact">
            <span>Source</span>
            <strong>{lead.source}</strong>
          </div>
          <div className="relay-fact">
            <span>Location</span>
            <strong>{lead.location}</strong>
          </div>
          <div className="relay-fact">
            <span>Last touch</span>
            <strong>{lead.lastTouch}</strong>
          </div>
          <div className="relay-fact">
            <span>Email</span>
            <strong>{lead.email}</strong>
          </div>
        </div>

        <Callout title="Next action" variant="highlight">
          {lead.nextAction}. Owner {lead.owner}.
        </Callout>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="relay-muted">{lead.notes}</p>
            <div className="relay-chip-row">
              <Badge variant={STAGE_BADGE[lead.stage]}>{STAGE_LABEL[lead.stage]}</Badge>
              <Badge variant="outline">{lead.source}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline>
              {lead.activity.map((item, index) => {
                const Icon = ACTIVITY_ICON[item.kind];
                return (
                  <TimelineItem
                    key={item.id}
                    title={item.title}
                    meta={item.meta}
                    description={item.description}
                    icon={<Icon size={14} />}
                    active={index === 0}
                  />
                );
              })}
            </Timeline>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
