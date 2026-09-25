import { test as base, expect, type Page, type TestInfo } from "@playwright/test";

export type Theme = "mukta" | "neelam" | "usha" | "sandhya";

/**
 * Every test: third-party requests (fonts, analytics) are stubbed so runs are deterministic
 * offline, and page errors or console errors fail the test.
 */
export const test = base.extend<{ pageErrors: string[] }>({
  pageErrors: [
    async ({ page }, use) => {
    const errors: string[] = [];
    const origin = new URL(test.info().project.use.baseURL ?? "http://127.0.0.1").origin;
    await page.route("**/*", (route) => {
      const request = route.request();
      const url = request.url();
      if (url.startsWith(origin) || url.startsWith("data:") || url.startsWith("blob:")) return route.continue();
      // Empty bodies with the type the page asked for: WebKit refuses (and logs) a stylesheet
      // or script served without a matching MIME type.
      const type = request.resourceType();
      if (type === "stylesheet") return route.fulfill({ status: 200, contentType: "text/css", body: "" });
      if (type === "script") return route.fulfill({ status: 200, contentType: "text/javascript", body: "" });
      return route.fulfill({ status: 204, body: "" });
    });
    page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`console: ${message.text()}`);
    });
    await use(errors);
    expect(errors, "page and console errors").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** The layout a project emulates. Specs branch on this, not on project names, so every engine runs them. */
export function layout(testInfo: TestInfo): "desktop" | "tablet" | "phone" {
  return (testInfo.project.metadata as { layout?: "desktop" | "tablet" | "phone" }).layout ?? "desktop";
}

/** Load a route in a given theme (the site persists the theme in localStorage). */
export async function gotoThemed(page: Page, route: string, theme: Theme = "mukta") {
  await page.addInitScript((value) => {
    try {
      window.localStorage.setItem("spk-theme", value);
    } catch {
      /* storage unavailable */
    }
  }, theme);
  await page.goto(route);
  await page.waitForLoadState("networkidle");
  // Pages are code-split: wait until the route's own content has replaced the loading state.
  await expect(page.locator('[data-slot="route-fallback"]')).toHaveCount(0);
}

/** Horizontal overflow of the document in CSS pixels (0 = none). */
export function documentOverflow(page: Page) {
  return page.evaluate(() => {
    const width = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    return width - window.innerWidth;
  });
}
