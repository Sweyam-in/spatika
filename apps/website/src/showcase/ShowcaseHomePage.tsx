import { Link, useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  InitialsAvatar,
  PageHeader,
  StatCard,
  StatusDot,
} from "@spatika/react";
import { Plus, Sparkles, Users } from "lucide-react";
import {
  CAMPAIGNS,
  LEADS,
  PIPELINE_STAGES,
  SOURCES,
  STAGE_BADGE,
  STAGE_LABEL,
  countByStage,
  formatMoney,
  greetingForHour,
  pipelineValue,
  winRate,
} from "./data";

export function ShowcaseHomePage() {
  const navigate = useNavigate();
  const followUps = LEADS.filter((lead) => lead.stage !== "won" && lead.stage !== "lost").slice(0, 4);
  const recent = LEADS.slice(0, 4);
  const openLeads = LEADS.filter((lead) => lead.stage !== "lost" && lead.stage !== "won").length;

  return (
    <div className="app-frame-pad relay-page">
      <div className="relay-stack">
        <PageHeader
          kicker="Pipeline"
          title={`${greetingForHour()}.`}
          description={`${followUps.length} follow-ups are waiting — ${openLeads} open leads in the workspace.`}
          actions={
            <>
              <Button variant="outline" size="sm" onClick={() => navigate("/showcase/relay/leads")}>
                View leads
              </Button>
              <Button size="sm" onClick={() => navigate("/showcase/relay/leads")}>
                <Plus size={14} />
                New lead
              </Button>
            </>
          }
        />

        <div className="relay-stats">
          <StatCard
            label="New this week"
            value={countByStage("new")}
            hint="Website + LinkedIn"
            icon={<Sparkles size={16} />}
          />
          <StatCard
            label="Qualified"
            value={countByStage("qualified")}
            hint="Ready for a demo"
            icon={<Users size={16} />}
          />
          <StatCard label="Open pipeline" value={formatMoney(pipelineValue())} hint="Excludes won / lost" />
          <StatCard label="Win rate" value={`${winRate()}%`} hint="Closed-won vs closed-lost" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relay-pipeline">
              {PIPELINE_STAGES.map((stage) => (
                <button
                  key={stage.id}
                  type="button"
                  className="relay-stage"
                  onClick={() => navigate(`/showcase/relay/leads?stage=${stage.id}`)}
                >
                  <span className="app-section-kicker">{stage.label}</span>
                  <strong>{countByStage(stage.id)}</strong>
                  <small>{stage.hint}</small>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="relay-split">
          <Card>
            <CardHeader>
              <CardTitle>Follow-ups due</CardTitle>
            </CardHeader>
            <CardContent>
              {followUps.map((lead) => (
                <button
                  key={lead.id}
                  type="button"
                  className="relay-row"
                  onClick={() => navigate(`/showcase/relay/leads/${lead.id}`)}
                >
                  <div className="relay-row-main">
                    <StatusDot tone={lead.stage === "proposal" ? "warning" : "primary"} pulse={lead.stage === "new"} />
                    <div className="relay-row-copy">
                      <strong>{lead.name}</strong>
                      <p>
                        {lead.company} · {lead.nextAction}
                      </p>
                    </div>
                  </div>
                  <Badge variant={STAGE_BADGE[lead.stage]}>{STAGE_LABEL[lead.stage]}</Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recent.map((lead) => (
                <button
                  key={lead.id}
                  type="button"
                  className="relay-row"
                  onClick={() => navigate(`/showcase/relay/leads/${lead.id}`)}
                >
                  <div className="relay-row-main">
                    <InitialsAvatar name={lead.name} className="relay-avatar" />
                    <div className="relay-row-copy">
                      <strong>{lead.name}</strong>
                      <p>
                        {lead.activity[0]?.title ?? "Updated"} · {lead.lastTouch}
                      </p>
                    </div>
                  </div>
                  <span className="relay-money">{formatMoney(lead.value)}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="relay-split">
          <Card>
            <CardHeader>
              <CardTitle>Lead sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relay-bar-list">
                {SOURCES.map((source) => (
                  <div key={source.name} className="relay-bar-row">
                    <div className="relay-bar-label">
                      {source.name}
                      <span>
                        {source.leads} · {source.pct}%
                      </span>
                    </div>
                    <div className="relay-bar-track">
                      <div className="relay-bar-fill" style={{ width: `${source.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              {CAMPAIGNS.filter((campaign) => campaign.status === "active").map((campaign) => (
                <Link key={campaign.id} to="/showcase/relay/campaigns" className="relay-row">
                  <div className="relay-row-copy">
                    <strong>{campaign.name}</strong>
                    <p>
                      {campaign.enrolled} enrolled · {campaign.replyRate}% reply
                    </p>
                  </div>
                  <Badge variant="info">Active</Badge>
                </Link>
              ))}
              <div className="relay-callout-space">
                <Callout title="Demo workspace" variant="info">
                  Relay is a generic lead-generation shell — the same chrome journalD and FinPro use,
                  without product-specific domain.
                </Callout>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
