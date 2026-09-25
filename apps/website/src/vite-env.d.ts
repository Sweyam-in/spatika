/// <reference types="vite/client" />

interface Window {
  dataLayer: unknown[];
  gtag?: (...args: unknown[]) => void;
}

interface ImportMetaEnv {
  /** Package version this documentation build describes (set by scripts/release-docs.mjs). */
  readonly VITE_DOCS_VERSION?: string;
  /** `stable` | `prerelease` | `development` — unset builds are development docs. */
  readonly VITE_DOCS_CHANNEL?: string;
}
