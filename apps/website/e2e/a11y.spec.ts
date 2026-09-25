/**
 * Automated accessibility checks (axe-core, WCAG 2.2 A/AA rules) on representative pages in
 * a light and a dark theme. Serious and critical violations fail the test. Automated rules
 * catch a subset of problems — keyboard and screen-reader testing is still manual.
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, gotoThemed, test, type Theme } from "./fixtures";

const PAGES = [
  "/",
  "/components",
  "/components/button",
  "/components/form-field",
  "/components/data-table",
  "/components/date-picker",
  "/components/tree-view",
  "/components/dropdown-menu",
  "/components/tabs",
  "/showcase/admin",
  "/showcase/finance",
  "/versions",
];

const THEMES: Theme[] = ["mukta", "neelam"];

test.describe("axe", () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.skip(testInfo.project.name === "tablet", "Desktop and phone cover the layouts axe checks.");
  });

  for (const theme of THEMES) {
    for (const route of PAGES) {
      test(`${route} in ${theme}`, async ({ page }) => {
        await gotoThemed(page, route, theme);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        const blocking = results.violations
          .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
          .map(
            (violation) =>
              `${violation.id} (${violation.impact}): ${violation.help} — ${violation.nodes
                .slice(0, 3)
                .map((node) => node.target.join(" "))
                .join(" | ")}`,
          );
        expect(blocking).toEqual([]);
      });
    }
  }
});
