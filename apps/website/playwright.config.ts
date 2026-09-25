import { defineConfig, devices } from "@playwright/test";

/**
 * Browser tests for the documentation site and the components it renders.
 *
 *   npm run test:e2e -w @spatika/website                      # Chromium: desktop, tablet, phone
 *   PW_BROWSERS=chromium,firefox,webkit npm run test:e2e -w …  # + Firefox and WebKit (desktop, phone)
 *   npm run test:e2e -w … -- --update-snapshots                # refresh visual baselines
 *
 * Specs branch on `layout(testInfo)` (desktop / tablet / phone), never on project names, so the
 * same suite runs in every engine. Visual baselines are Chromium-only.
 *
 * Images with a preinstalled Chromium set PLAYWRIGHT_CHROMIUM_EXECUTABLE instead of
 * downloading browsers. CI sets VISUAL_BASELINES=ci so its images (rendered on the CI runner's
 * fonts) live apart from the ones rendered locally.
 */
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined;
const port = Number(process.env.E2E_PORT ?? 5191);
const browsers = new Set((process.env.PW_BROWSERS ?? "chromium").split(",").map((name) => name.trim()));

type Layout = "desktop" | "tablet" | "phone";

const desktop = { viewport: { width: 1280, height: 800 } };
const tablet = { viewport: { width: 768, height: 1024 }, hasTouch: true, isMobile: false };

function project(name: string, layout: Layout, use: Record<string, unknown>, options: { visual?: boolean } = {}) {
  return {
    name,
    metadata: { layout },
    use,
    ...(options.visual ? {} : { testIgnore: /visual\.spec\.ts/ }),
  };
}

const projects = [
  ...(browsers.has("chromium")
    ? [
        project("desktop", "desktop", { ...devices["Desktop Chrome"], ...desktop, launchOptions: { executablePath } }, { visual: true }),
        project("tablet", "tablet", { browserName: "chromium", ...tablet, launchOptions: { executablePath } }, { visual: true }),
        project("phone", "phone", { ...devices["Pixel 5"], viewport: { width: 375, height: 667 }, launchOptions: { executablePath } }, { visual: true }),
      ]
    : []),
  ...(browsers.has("firefox")
    ? [
        project("firefox-desktop", "desktop", { ...devices["Desktop Firefox"], ...desktop }),
        // Firefox has no mobile emulation; a phone-sized window still exercises the phone layout.
        project("firefox-phone", "phone", { browserName: "firefox", viewport: { width: 375, height: 667 } }),
      ]
    : []),
  ...(browsers.has("webkit")
    ? [
        project("webkit-desktop", "desktop", { ...devices["Desktop Safari"], ...desktop }),
        project("webkit-phone", "phone", { ...devices["iPhone 13"], viewport: { width: 390, height: 664 } }),
      ]
    : []),
];

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results/e2e",
  // Baselines are per platform: font rasterisation differs between Linux, macOS and Windows.
  snapshotPathTemplate: `{testDir}/__screenshots__/${process.env.VISUAL_BASELINES ?? "{platform}"}/{projectName}/{arg}{ext}`,
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  timeout: 45_000,
  expect: {
    // Full reloads through the unbundled dev server can take several seconds under load.
    timeout: 15_000,
    // Baselines are deterministic on one platform, so allow only stray anti-aliasing pixels —
    // a ratio would let a changed radius or border on a small control slip through.
    toHaveScreenshot: { maxDiffPixels: 12, animations: "disabled", caret: "hide" },
  },
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  projects,
  webServer: {
    command: `npx vite --port ${port} --strictPort --host 127.0.0.1`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
