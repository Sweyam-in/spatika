export type ManifestEntry = {
  version: string;
  channel: "stable" | "prerelease" | "development";
  status: "current" | "supported" | "archived" | "prerelease" | "development";
  path: string;
  docs: "full" | "archive";
  released?: string;
};
export type Manifest = { latest: string; generated: string; versions: ManifestEntry[] };
export function parseVersion(version: string): { major: number; minor: number; patch: number; pre: string | null };
export function compareVersions(a: string, b: string): number;
export function buildManifest(input: {
  published: string[];
  dates: Record<string, string>;
  fullDocs: string[];
  development?: string;
  now?: Date;
}): Manifest;
