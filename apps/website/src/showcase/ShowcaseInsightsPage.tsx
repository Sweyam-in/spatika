import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Button,
  Callout,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FunnelChart,
  PageHeader,
  SegmentedControl,
  StatCard,
} from "@spatika/react";
import { FUNNEL, INSIGHT_TIPS, SOURCES, countByStage, formatMoney, pipelineValue, winRate } from "./data";

const PERIODS = [
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "quarter", label: "Quarter" },
] as const;

export function ShowcaseInsightsPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["value"]>("month");
  const captured = FUNNEL[1]?.value ?? 0;
  const won = FUNNEL[3]?.value ?? 0;

  return (
    <div className="app-frame-pad relay-page">
      <div className="relay-stack">
        <PageHeader
          kicker="Insights"
          title="Where pipeline is converting"
          description="Capture, qualify, and close — a generic SaaS funnel you can restyle with Spatika themes."
          actions={
            <div className="relay-period">
              <SegmentedControl
                aria-label="Period"
                size="sm"
                value={period}
                onChange={setPeriod}
                options={[...PERIODS]}
              />
            </div>
          }
        />

        <div className="relay-stats">
          <StatCard label="Captured" value={captured} hint={period === "week" ? "Last 7 days" : "Period total"} />
          <StatCard label="Qualified" value={countByStage("qualified")} hint="Open qualified" />
          <StatCard label="Won" value={won} hint={formatMoney(pipelineValue() / 4)} />
          <StatCard label="Win rate" value={`${winRate()}%`} hint="Closed records" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Conversion funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelChart
              height={280}
              hideLegend
              series={[
                {
                  data: FUNNEL.map((step) => ({
                    label: step.label,
                    value: step.value,
                  })),
                },
              ]}
            />
          </CardContent>
        </Card>

        <div className="relay-split">
          <Card>
            <CardHeader>
              <CardTitle>By source</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                height={240}
                layout="horizontal"
                hideLegend
                xAxis={[{ data: SOURCES.map((source) => source.name) }]}
                series={[{ label: "Share", data: SOURCES.map((source) => source.pct) }]}
              />
            </CardContent>
          </Card>

          <div className="relay-tips">
            {INSIGHT_TIPS.map((tip) => (
              <Callout key={tip.id} title={tip.title} variant="info">
                {tip.body}
              </Callout>
            ))}
            <Button variant="outline" onClick={() => navigate("/showcase/relay/leads?stage=new")}>
              Review new leads
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
