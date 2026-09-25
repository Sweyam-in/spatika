import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@spatika/react";
import {
  DOCS_CHANNEL,
  DOCS_VERSION,
  FALLBACK_MANIFEST,
  channelLabel,
  currentRoute,
  loadVersionManifest,
  versionHref,
  type VersionEntry,
  type VersionManifest,
} from "@/data/version";

export function useVersionManifest() {
  const [manifest, setManifest] = useState<VersionManifest>(FALLBACK_MANIFEST);
  useEffect(() => {
    let alive = true;
    loadVersionManifest().then((next) => alive && setManifest(next));
    return () => {
      alive = false;
    };
  }, []);
  return manifest;
}

/** The manifest entry describing this build. */
export function currentEntry(manifest: VersionManifest): VersionEntry {
  const byChannel =
    DOCS_CHANNEL === "development"
      ? manifest.versions.find((entry) => entry.status === "development")
      : manifest.versions.find((entry) => entry.version === DOCS_VERSION && entry.docs === "full");
  return byChannel ?? FALLBACK_MANIFEST.versions[0];
}

/**
 * Keeps the reader on the same page in the other version when it exists there; otherwise
 * lands on that version's home rather than a 404. Archive versions are always reachable —
 * their viewer explains what existed in that release.
 */
export async function resolveVersionTarget(entry: VersionEntry, route: string) {
  const target = versionHref(entry, route);
  if (entry.docs === "archive" || route === "/") return target;
  try {
    const response = await fetch(target, { method: "HEAD" });
    return response.ok ? target : versionHref(entry, "/");
  } catch {
    return versionHref(entry, "/");
  }
}

export function VersionSelector() {
  const manifest = useVersionManifest();
  const location = useLocation();
  const current = currentEntry(manifest);
  const route = currentRoute(location.pathname);
  const label = DOCS_CHANNEL === "development" ? "Next" : `v${DOCS_VERSION}`;

  const groups: { title: string; entries: VersionEntry[] }[] = [
    { title: "Releases", entries: manifest.versions.filter((v) => v.status === "current" || v.status === "supported") },
    { title: "Upcoming", entries: manifest.versions.filter((v) => v.status === "prerelease" || v.status === "development") },
    { title: "Archived", entries: manifest.versions.filter((v) => v.status === "archived") },
  ].filter((group) => group.entries.length > 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="docs-version-trigger"
          aria-label={`Documentation version: ${label} (${channelLabel(current)})`}
          trailingIcon={<ChevronDown className="size-3.5" aria-hidden />}
        >
          <span className="spk-numeric">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" aria-label="Documentation versions" className="docs-version-menu">
        {groups.map((group, index) => (
          <div key={group.title}>
            {index > 0 ? <DropdownMenuSeparator /> : null}
            <DropdownMenuLabel>{group.title}</DropdownMenuLabel>
            {group.entries.map((entry) => {
              const isCurrent = entry === current || (entry.version === current.version && entry.status === current.status);
              return (
                <DropdownMenuItem
                  key={`${entry.version}-${entry.status}`}
                  aria-current={isCurrent ? "page" : undefined}
                  onSelect={async () => {
                    if (isCurrent) return;
                    window.location.assign(await resolveVersionTarget(entry, route));
                  }}
                >
                  <span className="spk-numeric">{entry.status === "development" ? "Next" : `v${entry.version}`}</span>
                  <span className="ml-auto flex items-center gap-1.5">
                    {entry.docs === "archive" ? <span className="text-caption text-fg-tertiary">API only</span> : null}
                    <Badge variant={entry.status === "current" ? "success" : entry.status === "archived" ? "outline" : "secondary"}>
                      {channelLabel(entry)}
                    </Badge>
                  </span>
                </DropdownMenuItem>
              );
            })}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Tells readers when they are not on the latest stable docs, with a way back. */
export function VersionBanner() {
  const manifest = useVersionManifest();
  const location = useLocation();
  const latest = manifest.versions.find((entry) => entry.status === "current");
  const current = currentEntry(manifest);
  if (!latest || current.status === "current") return null;
  const message =
    current.status === "development"
      ? "Development docs — they describe unreleased changes that may not be in a published package yet."
      : current.status === "prerelease"
        ? `Pre-release docs for v${current.version}.`
        : `You are reading the docs for v${current.version}.`;
  return (
    <div className="docs-version-banner" role="note">
      <span>{message}</span>
      <a
        href={versionHref(latest, "/")}
        onClick={async (event) => {
          event.preventDefault();
          window.location.assign(await resolveVersionTarget(latest, currentRoute(location.pathname)));
        }}
      >
        Go to the latest release (v{latest.version})
      </a>
    </div>
  );
}
