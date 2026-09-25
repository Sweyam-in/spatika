import { defineConfig, devices } from "@playwright/test";

/**
 * Browser tests for the documentation site and the components it renders.
 *
 *   npm run test:e2e -w @spatika/website            # Chromium (desktop, tablet, phone)
 *   PW_ALL_BROWSERS=1 npm run test:e2e -w …           # + Firefox and WebKit, where installed
 *   npm run test:e2e -w … -- --update-snapshots       # refresh visual baselines
 *
 * Images with a preinstalled Chromium set PLAYWRIGHT_CHROMIUM_EXECUTABLE instead of
 * downloading browsers.
 */
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined;
const port = Number(process.env.E2E_PORT ?? 5191);

const chromium = (name: string, device: object) => ({
  name,
  use: { ...device, browserName: "chromium" as const, launchOptions: { executablePath } },
});

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results/e2e",
  // Baselines are per platform: font rasterisation differs between Linux, macOS and Windows.
  snapshotPathTemplate: "{testDir}/__screenshots__/{platform}/{projectName}/{arg}{ext}",
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
  projects: [
    chromium("desktop", { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } }),
    chromium("tablet", { viewport: { width: 768, height: 1024 }, hasTouch: true, isMobile: false }),
    chromium("phone", { ...devices["Pixel 5"], viewport: { width: 375, height: 667 } }),
    ...(process.env.PW_ALL_BROWSERS
      ? [
          { name: "firefox", use: { ...devices["Desktop Firefox"] } },
          { name: "webkit", use: { ...devices["Desktop Safari"] } },
        ]
      : []),
  ],
  webServer: {
    command: `npx vite --port ${port} --strictPort --host 127.0.0.1`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
