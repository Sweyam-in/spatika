import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  CardContent,
  EmptyState,
  FloatingPageChromeBar,
  FloatingPageChromeIdentity,
  FloatingPageChromeSearchField,
  InitialsAvatar,
  QuickFilterRail,
  floatingPageChromePrimaryClass,
  useToast,
} from "@spatika/react";
import { Plus, Users } from "lucide-react";
import {
  LEADS,
  STAGE_BADGE,
  STAGE_LABEL,
  type LeadStage,
  countByStage,
  formatMoney,
} from "./data";

const FILTERS: { id: "all" | LeadStage; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "qualified", label: "Qualified" },
  { id: "proposal", label: "Proposal" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
];

export function ShowcaseLeadsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const stage = (params.get("stage") as LeadStage | "all" | null) ?? "all";

  useEffect(() => {
    setQuery(params.get("q") ?? "");
  }, [params]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return LEADS.filter((lead) => {
      if (stage !== "all" && lead.stage !== stage) return false;
      if (!needle) return true;
      return [lead.name, lead.company, lead.title, lead.email, lead.source]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [query, stage]);

  function setStage(next: string) {
    const copy = new URLSearchParams(params);
    if (next === "all") copy.delete("stage");
    else copy.set("stage", next);
    setParams(copy, { replace: true });
  }

  return (
    <>
      <FloatingPageChromeBar
        identity={
          <FloatingPageChromeIdentity
            title="Leads"
            count={filtered.length}
            countLabel={`${filtered.length} leads`}
          />
        }
        search={
          <FloatingPageChromeSearchField
            value={query}
            onChange={setQuery}
            onClear={() => setQuery("")}
            placeholder="Filter by name or company"
          />
        }
        actions={
          <Button
            size="sm"
            className={floatingPageChromePrimaryClass}
            onClick={() =>
              toast({
                title: "Capture is a demo",
                description: "Wire this button to your lead intake API.",
                tone: "default",
              })
            }
          >
            <Plus size={14} />
            Add lead
          </Button>
        }
        below={
          <div className="relay-filters">
            <QuickFilterRail
              activeStyle="solid"
              value={stage}
              onChange={setStage}
              groups={[
                {
                  items: FILTERS.map((item) => ({
                    id: item.id,
                    label: item.label,
                    count: item.id === "all" ? LEADS.length : countByStage(item.id),
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
            icon={Users}
            title="No leads match"
            description="Try another stage or clear the search."
            actionLabel="Clear filters"
            onAction={() => {
              setQuery("");
              setStage("all");
            }}
          />
        ) : (
          <div className="relay-leads">
            {filtered.map((lead) => (
              <Card key={lead.id}>
                <CardContent>
                  <button
                    type="button"
                    className="relay-lead-card"
                    onClick={() => navigate(`/showcase/relay/leads/${lead.id}`)}
                  >
                    <div className="relay-lead-body">
                      <InitialsAvatar name={lead.name} className="relay-avatar-lg" />
                      <div>
                        <strong className="relay-lead-name">{lead.name}</strong>
                        <p className="relay-lead-meta">
                          {lead.title} · {lead.company}
                        </p>
                        <div className="relay-chip-row">
                          <Badge variant={STAGE_BADGE[lead.stage]}>{STAGE_LABEL[lead.stage]}</Badge>
                          <Badge variant="outline">{lead.source}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="relay-row-aside">
                      <span className="relay-money">{formatMoney(lead.value)}</span>
                      <span className="relay-muted">Score {lead.score}</span>
                    </div>
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
