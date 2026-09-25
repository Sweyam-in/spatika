/**
 * End-to-end flows through composed components, run in real Chromium on desktop, tablet and
 * phone viewports.
 */
import { expect, gotoThemed, test } from "./fixtures";

test("a form lists its errors, links to each field and clears once fixed", async ({ page }) => {
  await gotoThemed(page, "/components/form-error-summary");
  const preview = page.locator(".demo-block").first();
  await preview.getByRole("button", { name: "Create account" }).click();

  const summary = preview.getByRole("alert");
  await expect(summary).toBeFocused();
  await expect(summary.getByRole("link")).toHaveCount(2);
  await expect(preview.getByRole("textbox", { name: "Name" })).toHaveAttribute("aria-invalid", "true");

  await summary.getByRole("link", { name: "Enter your name" }).click();
  await expect(preview.getByRole("textbox", { name: "Name" })).toBeFocused();
  await page.keyboard.type("Maya Okafor");
  await preview.getByRole("textbox", { name: "Email" }).fill("maya@kasho.app");
  await preview.getByRole("button", { name: "Create account" }).click();
  await expect(preview.getByRole("alert")).toHaveCount(0);
});

test("a confirmation dialog traps focus and returns it to its trigger", async ({ page }) => {
  await gotoThemed(page, "/components/alert-dialog");
  const trigger = page.locator(".demo-block").first().getByRole("button", { name: "Delete workspace" });
  await trigger.click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAccessibleName(/Delete “Acme Studio”/);

  for (let i = 0; i < 4; i += 1) {
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("the docs navigation works from the menu on small screens", async ({ page }, testInfo) => {
  testInfo.skip(testInfo.project.name === "desktop", "The menu button only shows below 1180px.");
  await gotoThemed(page, "/components/button");
  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.getByRole("navigation", { name: "Mobile" });
  await expect(menu).toBeVisible();
  await menu.getByRole("link", { name: "Guides" }).click();
  await expect(page).toHaveURL(/\/guides$/);
  await expect(menu).toBeHidden();
});

test("the admin customers table filters as you type", async ({ page }) => {
  await gotoThemed(page, "/showcase/admin");
  const filter = page.getByRole("textbox", { name: "Filter customers" });
  await filter.scrollIntoViewIfNeeded();
  // Tables on wide screens, a record list on phones — count whichever layout is showing.
  const records = () =>
    page.locator('[data-slot="data-table"] tbody tr:visible, [data-slot="data-table-list-row"]:visible').count();
  const before = await records();
  expect(before).toBeGreaterThan(1);
  await filter.fill("zzzz-no-such-customer");
  await expect.poll(records).toBeLessThan(before);
  await filter.fill("");
  await expect.poll(records).toBe(before);
});

test("a date is picked from the keyboard and shown in the field", async ({ page }) => {
  await gotoThemed(page, "/components/date-picker");
  const trigger = page.locator(".demo-block").first().getByRole("button", { name: "Due date" });
  await trigger.click();
  const grid = page.getByRole("grid");
  await expect(grid).toBeVisible();
  // Tomorrow is always selectable (the demo disallows past dates).
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(grid).toHaveCount(0);
  await expect(trigger).toBeFocused();
  const tomorrow = new Date(Date.now() + 86_400_000);
  const expected = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(tomorrow);
  await expect(trigger).toHaveText(expected);
});

test("autocomplete filters options and selects one", async ({ page }) => {
  await gotoThemed(page, "/components/autocomplete");
  const input = page.locator(".demo-block").first().getByRole("combobox");
  await input.click();
  await input.fill("inc");
  const option = page.getByRole("option", { name: "Inception" });
  await expect(option).toBeVisible();
  await expect(page.getByRole("option", { name: "Heat" })).toHaveCount(0);
  await option.click();
  await expect(input).toHaveValue("Inception");
});

test("docs search finds a component by a word it is not named after", async ({ page }) => {
  await gotoThemed(page, "/components/button");
  await page.keyboard.press("/");
  const dialog = page.getByRole("dialog", { name: "Command palette" });
  await expect(dialog).toBeVisible();
  await page.keyboard.type("file browser");
  await expect(dialog.getByRole("option").first()).toContainText("TreeView");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/components\/tree-view$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("TreeView");
});

test("the version menu opens the same page in an archived release", async ({ page }, testInfo) => {
  testInfo.skip(testInfo.project.name === "phone", "On phones the version menu lives in the menu panel.");
  await gotoThemed(page, "/components/button");
  await page.getByRole("button", { name: /Documentation version/ }).click();
  await page.getByRole("menuitem", { name: /v2\.3\.0/ }).click();
  await expect(page).toHaveURL(/\/docs\/v2\.3\.0\/components\/button$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Button in v2.3.0");
  await expect(page.getByRole("table").first()).toContainText("loading");

  // A component that did not exist yet says so instead of 404ing.
  await page.goto("/docs/v2.3.0/components/date-picker");
  await expect(page.getByText("DatePicker is not in v2.3.0")).toBeVisible();
});

test("the playground updates the live component and its code, and resets", async ({ page }) => {
  await gotoThemed(page, "/components/button");
  const playground = page.locator('[data-slot="playground"]');
  await playground.scrollIntoViewIfNeeded();
  const preview = playground.locator(".playground-frame").getByRole("button").first();
  await expect(preview).toHaveText("Save changes");

  await playground.getByRole("textbox", { name: "children" }).fill("Delete");
  // Labelled by the field label and its own value: "variant primary".
  await playground.getByRole("button", { name: "variant primary" }).click();
  await page.getByRole("option", { name: "destructive", exact: true }).click();
  await playground.getByRole("switch", { name: "loading" }).click();

  await expect(preview).toHaveText("Delete");
  await expect(preview).toHaveAttribute("aria-busy", "true");
  await expect(playground.locator("pre")).toContainText('<Button variant="destructive" loading>Delete</Button>');

  await playground.getByRole("button", { name: "Preview theme" }).click();
  await page.getByRole("option", { name: "Neelam" }).click();
  await expect(playground.locator(".playground-frame")).toHaveClass(/neelam/);

  await playground.getByRole("button", { name: "Reset" }).click();
  await expect(preview).toHaveText("Save changes");
  await expect(playground.locator(".playground-frame")).toHaveClass(/mukta/);
});
