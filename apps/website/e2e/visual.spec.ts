/**
 * Visual regression for representative component states. Each baseline is the live preview of
 * one component — not a whole page — so an unrelated layout change does not invalidate every
 * image. Refresh intentionally with `--update-snapshots` and review the diff before committing.
 */
import { expect, gotoThemed, layout, test, type Theme } from "./fixtures";

const COMPONENTS = [
  "button",
  "badge",
  "alert",
  "form-field",
  "number-input",
  "tag-input",
  "tabs",
  "data-table",
  "description-list",
  "tree-view",
];

const THEMES: Theme[] = ["mukta", "neelam"];

test.describe("component previews", () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.skip(layout(testInfo) === "tablet", "Desktop and phone baselines bracket the layouts.");
  });

  for (const theme of THEMES) {
    for (const slug of COMPONENTS) {
      test(`${slug} · ${theme}`, async ({ page }) => {
        await gotoThemed(page, `/components/${slug}`, theme);
        const preview = page.locator(".demo-block-preview").first();
        await preview.scrollIntoViewIfNeeded();
        await expect(preview).toHaveScreenshot(`${slug}-${theme}.png`);
      });
    }
  }

  test("open dropdown menu", async ({ page }) => {
    await gotoThemed(page, "/components/dropdown-menu");
    await page.locator(".demo-block").first().getByRole("button", { name: "Actions" }).click();
    const menu = page.getByRole("menu").first();
    await expect(menu).toBeVisible();
    await expect(menu).toHaveScreenshot("dropdown-menu-open.png");
  });

  test("focused and invalid fields", async ({ page }) => {
    await gotoThemed(page, "/components/form-field");
    const preview = page.locator(".demo-block-preview").first();
    await preview.getByRole("textbox", { name: /Work email/ }).focus();
    await expect(preview).toHaveScreenshot("form-field-focus.png");
  });
});
