/**
 * Documentation version manifest — the support policy as code.
 *
 * Policy (documented on /versions):
 * - current     the newest stable release
 * - supported   the newest patch of each earlier minor in the current major, until six months
 *               after the minor that replaced it shipped; and the newest release of the
 *               previous major
 * - archived    everything else (docs stay online, never updated)
 * - prerelease  versions with a pre-release tag (2.5.0-rc.1) that are newer than the latest stable
 * - development the unreleased main branch, served at /next/
 */

const SUPPORT_WINDOW_DAYS = 183;

export function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/.exec(version);
  if (!match) throw new Error(`Not a semantic version: ${version}`);
  return { major: +match[1], minor: +match[2], patch: +match[3], pre: match[4] ?? null };
}

export function compareVersions(a, b) {
  const x = parseVersion(a);
  const y = parseVersion(b);
  if (x.major !== y.major) return x.major - y.major;
  if (x.minor !== y.minor) return x.minor - y.minor;
  if (x.patch !== y.patch) return x.patch - y.patch;
  if (x.pre === y.pre) return 0;
  if (x.pre === null) return 1; // 2.4.0 > 2.4.0-rc.1
  if (y.pre === null) return -1;
  return x.pre.localeCompare(y.pre, undefined, { numeric: true });
}

/**
 * @param {object} input
 * @param {string[]} input.published   every version on npm
 * @param {Record<string, string>} input.dates  version → ISO date
 * @param {string[]} input.fullDocs    versions that have a full /docs/vX.Y.Z/ snapshot
 * @param {string} [input.development] version string of the main branch (package.json)
 * @param {Date} [input.now]
 */
export function buildManifest({ published, dates, fullDocs, development, now = new Date() }) {
  const sorted = [...new Set(published)].sort(compareVersions).reverse();
  const stable = sorted.filter((version) => parseVersion(version).pre === null);
  const latest = stable[0];
  if (!latest) throw new Error("No stable release published yet");
  const latestParsed = parseVersion(latest);

  const newestOfMinor = new Map(); // "2.1" → "2.1.3"
  for (const version of stable) {
    const { major, minor } = parseVersion(version);
    const key = `${major}.${minor}`;
    if (!newestOfMinor.has(key)) newestOfMinor.set(key, version);
  }
  const previousMajorLatest = stable.find((version) => parseVersion(version).major === latestParsed.major - 1);

  const days = (from, to) => (to.getTime() - from.getTime()) / 86_400_000;

  const status = (version) => {
    const parsed = parseVersion(version);
    if (parsed.pre !== null) return compareVersions(version, latest) > 0 ? "prerelease" : "archived";
    if (version === latest) return "current";
    if (version === previousMajorLatest) return "supported";
    if (parsed.major === latestParsed.major && newestOfMinor.get(`${parsed.major}.${parsed.minor}`) === version) {
      // Supported until six months after the next minor's first release.
      const replacement = stable
        .filter((other) => {
          const o = parseVersion(other);
          return o.major === parsed.major && o.minor === parsed.minor + 1;
        })
        .sort(compareVersions)[0];
      const shipped = replacement && dates[replacement] ? new Date(dates[replacement]) : null;
      return !shipped || days(shipped, now) <= SUPPORT_WINDOW_DAYS ? "supported" : "archived";
    }
    return "archived";
  };

  const full = new Set(fullDocs);
  const versions = sorted.map((version) => ({
    version,
    channel: parseVersion(version).pre === null ? "stable" : "prerelease",
    status: status(version),
    path: `/docs/v${version}/`,
    docs: full.has(version) ? "full" : "archive",
    ...(dates[version] ? { released: dates[version].slice(0, 10) } : {}),
  }));

  // The latest release with a full build is also served at the site root.
  const current = versions.find((entry) => entry.status === "current");
  if (current?.docs === "full") current.path = "/";

  if (development && !published.includes(development)) {
    versions.unshift({ version: development, channel: "development", status: "development", path: "/next/", docs: "full" });
  } else if (development) {
    versions.unshift({ version: `${development}+next`, channel: "development", status: "development", path: "/next/", docs: "full" });
  }

  return { latest, generated: now.toISOString().slice(0, 10), versions };
}
