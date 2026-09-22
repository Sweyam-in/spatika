import { Button } from "@spatika/react";
import { GitBranch, GitPullRequest, Github, Star } from "lucide-react";
import { SITE } from "@/data/site";

const steps = [
  {
    icon: Star,
    title: "Star the repo",
    body: "Follow releases on GitHub and show support for the project.",
  },
  {
    icon: GitBranch,
    title: "Fork & branch",
    body: "Clone the monorepo, run npm install, and create a feature branch from main.",
  },
  {
    icon: GitPullRequest,
    title: "Open a pull request",
    body: "Add tests for behavior changes, run npm test, and tell us what you built.",
  },
] as const;

export function ContributeSection() {
  return (
    <section className="contribute-section" id="contribute">
      <div className="contribute-inner">
        <div className="contribute-copy">
          <p className="contribute-eyebrow">
            <Github size={14} />
            Open source
          </p>
          <h2 className="contribute-title">Contribute on GitHub</h2>
          <p className="contribute-lead">
            Spatika UI is MIT-licensed and built in the open. Report bugs, propose components, improve
            docs, or refine tokens — every contribution helps the design system grow.
          </p>
          <div className="contribute-actions">
            <Button asChild>
              <a href={SITE.github} target="_blank" rel="noreferrer">
                <Github size={16} />
                View repository
              </a>
            </Button>
            <Button variant="secondary" asChild>
              <a href={SITE.githubNewIssue} target="_blank" rel="noreferrer">
                Open an issue
              </a>
            </Button>
          </div>
          <p className="contribute-hint">
            Docs site lives in <code>apps/website</code> · components in{" "}
            <code>packages/react</code> · tokens in <code>packages/tokens</code>
          </p>
        </div>

        <div className="contribute-steps">
          {steps.map(({ icon: Icon, title, body }) => (
            <article key={title} className="contribute-step">
              <span className="contribute-step-icon" aria-hidden>
                <Icon size={16} />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
