import reactPackage from "../../../../packages/react/package.json";

export type DocsChannel = "stable" | "prerelease" | "development";

/** The package version this build documents. */
export const DOCS_VERSION: string = import.meta.env.VITE_DOCS_VERSION || reactPackage.version;

/**
 * Release channel. Builds made outside the release script are development docs: they can
 * describe unreleased work, so they never present themselves as the stable release.
 */
export const DOCS_CHANNEL: DocsChannel = (() => {
  const channel = import.meta.env.VITE_DOCS_CHANNEL;
  if (channel === "stable" || channel === "prerelease") return channel;
  return "development";
})();

/** Base path of this build (`/`, `/docs/v2.4.0/`, `/next/`). */
export const DOCS_BASE = import.meta.env.BASE_URL;

export type VersionStatus = "current" | "supported" | "archived" | "prerelease" | "development";

export type VersionEntry = {
  version: string;
  channel: DocsChannel;
  status: VersionStatus;
  /** Where this version's docs live. */
  path: string;
  /** `full` — a complete site built from the release; `archive` — API and notes reconstructed from npm. */
  docs: "full" | "archive";
  released?: string;
};

export type VersionManifest = {
  latest: string;
  generated?: string;
  versions: VersionEntry[];
};

/** Used when /versions.json cannot be loaded (offline, local dev). */
export const FALLBACK_MANIFEST: VersionManifest = {
  latest: DOCS_VERSION,
  versions: [
    {
      version: DOCS_VERSION,
      channel: DOCS_CHANNEL,
      status: DOCS_CHANNEL === "stable" ? "current" : DOCS_CHANNEL,
      path: DOCS_BASE,
      docs: "full",
    },
  ],
};

let manifestPromise: Promise<VersionManifest> | null = null;

/**
 * The manifest always comes from the site root, so an old snapshot at /docs/v2.3.0/ still
 * learns about newer releases.
 */
export function loadVersionManifest(): Promise<VersionManifest> {
  manifestPromise ??= fetch("/versions.json", { cache: "no-cache" })
    .then((response) => (response.ok ? (response.json() as Promise<VersionManifest>) : FALLBACK_MANIFEST))
    .catch(() => FALLBACK_MANIFEST);
  return manifestPromise;
}

/** Route inside this build, without the base path — `/components/button`. */
export function currentRoute(pathname: string) {
  const base = DOCS_BASE.replace(/\/$/, "");
  const route = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  return route || "/";
}

/** Same page in another version's docs. */
export function versionHref(entry: VersionEntry, route: string) {
  const base = entry.path.replace(/\/$/, "");
  return `${base}${route.startsWith("/") ? route : `/${route}`}` || "/";
}

export function channelLabel(entry: Pick<VersionEntry, "status" | "channel">) {
  if (entry.status === "current") return "Latest";
  if (entry.status === "development") return "Development";
  if (entry.status === "prerelease") return "Pre-release";
  if (entry.status === "supported") return "Supported";
  return "Archived";
}
