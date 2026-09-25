/**
 * Layout sweep across the representative viewports from the design brief. Every route must
 * render without errors and without horizontal page scrolling (tables and code blocks scroll
 * inside their own containers).
 */
import { documentOverflow, expect, gotoThemed, test } from "./fixtures";

const VIEWPORTS = [
  { name: "small-mobile", width: 320, height: 568 },
  { name: "mobile", width: 375, height: 667 },
  { name: "large-mobile", width: 430, height: 932 },
  { name: "small-tablet", width: 600, height: 960 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "laptop", width: 1280, height: 800 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "large-desktop", width: 1920, height: 1080 },
  { name: "ultrawide", width: 2560, height: 1440 },
];

const ROUTES = [
  "/",
  "/components",
  "/components/data-table",
  "/components/date-range-picker",
  "/components/app-shell",
  "/components/resizable-panels",
  "/showcase/finance",
  "/showcase/admin",
  "/showcase/workspace",
  "/showcase/landing",
  "/versions",
];

// The sweep sets its own viewport, so it only runs once (in the desktop project).
test.describe("responsive sweep", () => {
  // Eleven routes per viewport against an unbundled dev server.
  test.describe.configure({ timeout: 240_000 });

  test.beforeEach(({}, testInfo) => {
    testInfo.skip(testInfo.project.name !== "desktop", "The viewport sweep runs once, in the desktop project.");
  });

  for (const viewport of VIEWPORTS) {
    test(`${viewport.name} ${viewport.width}×${viewport.height}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      for (const route of ROUTES) {
        await gotoThemed(page, route);
        expect(await documentOverflow(page), `${route} overflows at ${viewport.width}px`).toBeLessThanOrEqual(1);
      }
    });
  }

  test("text reflows at 200% zoom (640px viewport at 2× scale)", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 640, height: 800 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    for (const route of ["/components/button", "/components/form-field", "/showcase/admin"]) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      expect(await documentOverflow(page), route).toBeLessThanOrEqual(1);
    }
    await context.close();
  });
});
