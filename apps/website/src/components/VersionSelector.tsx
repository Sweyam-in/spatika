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
  DOCS_BASE,
  DOCS_CHANNEL,
  DOCS_VERSION,
  FALLBACK_MANIFEST,
  channelLabel,
  currentRoute,
  isNewerThanPublished,
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
  // This checkout is ahead of the published snapshot, so it is the latest docs.
  if (DOCS_CHANNEL === "development" && isNewerThanPublished(manifest.latest)) {
    return {
      version: DOCS_VERSION,
      channel: "stable",
      status: "current",
      path: DOCS_BASE,
      docs: "full",
    };
  }
  const byChannel =
    DOCS_CHANNEL === "development"
      ? manifest.versions.find((entry) => entry.status === "development")
      : manifest.versions.find((entry) => entry.version === DOCS_VERSION && entry.docs === "full");
  return byChannel ?? FALLBACK_MANIFEST.versions[0];
}

/** Header label. "Next" is only the unreleased channel; the newest docs say Latest. */
export function versionTriggerLabel(entry: VersionEntry): string {
  if (entry.status === "current" && DOCS_CHANNEL === "development") return "Latest";
  if (entry.status === "development") return "Next";
  return `v${entry.version.split("+")[0]}`;
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
  const label = versionTriggerLabel(current);
  const ahead = isNewerThanPublished(manifest.latest);

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
          aria-label={
            label === "Latest" || label === "Next"
              ? `Documentation version: ${label} (v${current.version.split("+")[0]})`
              : `Documentation version: ${label}`
          }
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
              const shown = ahead && entry.status === "current" ? { ...entry, status: "supported" as const } : entry;
              const isCurrent = !ahead && (entry === current || (entry.version === current.version && entry.status === current.status));
              return (
                <DropdownMenuItem
                  key={`${entry.version}-${entry.status}`}
                  aria-current={isCurrent ? "page" : undefined}
                  onSelect={async () => {
                    if (isCurrent) return;
                    window.location.assign(await resolveVersionTarget(entry, route));
                  }}
                >
                  <span className="spk-numeric">{shown.status === "development" ? "Next" : `v${shown.version.split("+")[0]}`}</span>
                  <span className="ml-auto flex items-center gap-1.5">
                    {shown.docs === "archive" ? <span className="text-caption text-fg-tertiary">API only</span> : null}
                    <Badge variant={shown.status === "current" ? "success" : shown.status === "archived" ? "outline" : "secondary"}>
                      {channelLabel(shown)}
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
