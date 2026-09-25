import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge, EmptyState, Skeleton } from "@spatika/react";
import { ApiTable } from "@/components/ApiTable";
import { Markdown } from "@/components/Markdown";
import { components } from "@/data/navigation";
import type { ApiSection } from "@/docs/types";

type ArchiveProp = { name: string; type: string; optional: boolean; description: string; default?: string; deprecated?: string };
type ArchiveComponent = { description?: string; extends?: string[]; props: ArchiveProp[] };

export type DocsArchive = {
  version: string;
  package: string;
  source: string;
  generated: string;
  releaseNotes: string;
  components: Record<string, ArchiveComponent>;
};

function toSection(name: string, component: ArchiveComponent): ApiSection {
  return {
    name,
    ...(component.extends?.length ? { extends: component.extends.join(", ") } : {}),
    props: component.props.map((prop) => ({
      name: prop.name,
      type: prop.type,
      ...(prop.default !== undefined ? { default: prop.default } : {}),
      description:
        [prop.deprecated !== undefined ? "Deprecated." : "", prop.optional ? "" : "Required.", prop.description]
          .filter(Boolean)
          .join(" ") || "—",
    })),
  };
}

/**
 * Documentation for releases published before per-release docs existed. Rebuilt from the
 * published npm package — its type definitions and changelog — so it is exact about the API of
 * that release, but has no live examples (the site that shipped with it cannot be rebuilt).
 */
export function ArchivePage() {
  const { version = "", "*": rest = "" } = useParams();
  const [archive, setArchive] = useState<DocsArchive | null | "missing">(null);
  const clean = version.replace(/^v/, "");

  useEffect(() => {
    let alive = true;
    fetch(`/docs/v${clean}/archive.json`)
      .then((response) => (response.ok ? response.json() : "missing"))
      .then((data) => alive && setArchive(data))
      .catch(() => alive && setArchive("missing"));
    return () => {
      alive = false;
    };
  }, [clean]);

  if (archive === null) {
    return (
      <div className="grid gap-3" aria-busy="true">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-sm" />
      </div>
    );
  }

  if (archive === "missing") {
    return (
      <EmptyState
        title={`No documentation for v${clean}`}
        description="This version was never published, or its archive is not available on this server."
        actions={<Link to="/versions">See all versions</Link>}
      />
    );
  }

  const slug = rest.match(/^components\/([^/]+)/)?.[1];
  const entry = slug ? components.find((item) => item.slug === slug) : undefined;
  const names = entry ? entry.importName.split(/\s*,\s*/) : [];
  const present = names.filter((name) => archive.components[name]);
  const componentNames = Object.keys(archive.components).sort();

  return (
    <article className="resource-page">
      <p className="component-kicker">
        Archived documentation <Badge variant="outline">API only</Badge>
      </p>
      <h1 className="page-title">
        {entry ? `${entry.name} in v${archive.version}` : `Spatika v${archive.version}`}
      </h1>
      <p className="page-lead">
        Reconstructed from the published <code>{archive.package}@{archive.version}</code> package: the API below comes
        from its type definitions and the notes from its changelog. Live examples are not available for releases made
        before per-release documentation existed.
      </p>

      {slug ? (
        present.length ? (
          <>
            <h2 className="section-title" id="props">
              Props in v{archive.version}
            </h2>
            <ApiTable sections={present.map((name) => toSection(name, archive.components[name]))} />
          </>
        ) : (
          <EmptyState
            title={`${entry?.name ?? slug} is not in v${archive.version}`}
            description="It was added in a later release. The component index below lists what this version shipped."
          />
        )
      ) : (
        <>
          <h2 className="section-title" id="release-notes">
            Release notes
          </h2>
          <Markdown source={archive.releaseNotes || "_No notes were published for this release._"} headingOffset={1} />
        </>
      )}

      <h2 className="section-title" id="components">
        Components in v{archive.version} ({componentNames.length})
      </h2>
      <div className="related-chips">
        {componentNames.map((name) => {
          const match = components.find((item) => item.importName.split(/\s*,\s*/)[0] === name);
          return match ? (
            <Link key={name} className="related-chip" to={`/docs/v${archive.version}/components/${match.slug}`}>
              {name}
            </Link>
          ) : (
            <span key={name} className="related-chip">
              {name}
            </span>
          );
        })}
      </div>
    </article>
  );
}
