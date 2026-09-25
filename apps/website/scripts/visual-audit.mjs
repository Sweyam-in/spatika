import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const sourceRoot = path.join(appRoot, "src");
const outputRoot = path.join(appRoot, "test-results", "visual-audit");

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    return [key, value];
  }),
);

const baseUrl = args.get("base-url") ?? process.env.SPATIKA_AUDIT_URL ?? "http://127.0.0.1:5190";
const saveScreenshots = args.get("screenshots") === "true";
const maxComponents = Number(args.get("max-components") ?? "Infinity");
const settleMs = Number(args.get("settle-ms") ?? "250");
const routeFilter = args
  .get("routes")
  ?.split(",")
  .map((route) => route.trim())
  .filter(Boolean);

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 900 },
];

const fixedRoutes = [
  "/",
  "/design",
  "/components",
  "/customize",
  "/guides",
  "/demos/editor",
  "/showcase",
  "/showcase/finance",
  "/showcase/admin",
  "/showcase/workspace",
  "/showcase/landing",
  "/showcase/relay",
  "/showcase/relay/leads",
  "/showcase/relay/campaigns",
  "/showcase/relay/insights",
];

async function readComponentSlugs() {
  const navigation = await readFile(path.join(sourceRoot, "data", "navigation.ts"), "utf8");
  return [...navigation.matchAll(/\{\s*slug:\s*"([^"]+)"/g)]
    .map((match) => match[1])
    .filter(Boolean)
    .slice(0, maxComponents);
}

function routeName(route) {
  return route === "/" ? "home" : route.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "-");
}

async function inspectPage(page) {
  return page.evaluate(() => {
    const documentElement = document.documentElement;
    const body = document.body;
    const viewportWidth = window.innerWidth;
    const scrollWidth = Math.max(documentElement.scrollWidth, body.scrollWidth);
    const bodyOverflow = scrollWidth - viewportWidth;

    const offenders = Array.from(document.querySelectorAll("body *"))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          className:
            typeof element.className === "string"
              ? element.className
              : element.getAttribute("class") ?? "",
          slot: element.getAttribute("data-slot") ?? "",
          aria: element.getAttribute("aria-label") ?? "",
          text: (element.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 80),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      })
      .filter((item) => item.width > 0 && (item.left < -2 || item.right > viewportWidth + 2))
      .slice(0, 8);

    return {
      title: document.title,
      bodyOverflow,
      offenders,
      h1: document.querySelector("h1")?.textContent?.trim() ?? null,
    };
  });
}

async function main() {
  await mkdir(outputRoot, { recursive: true });

  const componentRoutes = (await readComponentSlugs()).map((slug) => `/components/${slug}`);
  const routes = routeFilter?.length ? routeFilter : [...fixedRoutes, ...componentRoutes];
  // PLAYWRIGHT_CHROMIUM_EXECUTABLE lets CI images with a preinstalled Chromium skip the download.
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
  });
  const failures = [];
  const report = [];
  const totalChecks = routes.length * viewports.length;
  let completedChecks = 0;

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    // Only the site under test matters: stub third-party requests (fonts, analytics) so an
    // offline or sandboxed runner doesn't report their network failures as page errors.
    const origin = new URL(baseUrl).origin;
    await page.route("**/*", (route) =>
      new URL(route.request().url()).origin === origin || route.request().url().startsWith("data:")
        ? route.continue()
        : route.fulfill({ status: 204, body: "" }),
    );

    for (const route of routes) {
      const url = new URL(route, baseUrl).toString();
      const errors = [];
      const warnings = [];

      page.removeAllListeners("console");
      page.removeAllListeners("pageerror");
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(`console: ${message.text()}`);
        if (message.type() === "warning") warnings.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));

      try {
        const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15_000 });
        if (!response || response.status() >= 400) {
          errors.push(`http ${response?.status() ?? "no-response"}`);
        }

        await page.locator("body").waitFor({ state: "visible", timeout: 10_000 });
        await page.waitForTimeout(settleMs);
        const inspection = await inspectPage(page);
        const entry = { viewport: viewport.name, route, ...inspection, errors, warnings };
        report.push(entry);

        if (saveScreenshots) {
          await page.screenshot({
            path: path.join(outputRoot, `${viewport.name}-${routeName(route)}.png`),
            fullPage: true,
          });
        }

        if (errors.length || inspection.bodyOverflow > 2) {
          failures.push(entry);
        }
      } catch (error) {
        failures.push({
          viewport: viewport.name,
          route,
          title: null,
          h1: null,
          bodyOverflow: null,
          offenders: [],
          warnings,
          errors: [error instanceof Error ? error.message : String(error)],
        });
      } finally {
        completedChecks += 1;
        if (completedChecks % 25 === 0 || completedChecks === totalChecks) {
          console.log(`Checked ${completedChecks}/${totalChecks}`);
        }
      }
    }

    await context.close();
  }

  await browser.close();
  await writeFile(path.join(outputRoot, "report.json"), `${JSON.stringify(report, null, 2)}\n`);

  if (failures.length) {
    console.error(`Visual audit found ${failures.length} issue(s):`);
    for (const failure of failures.slice(0, 30)) {
      console.error(
        `- ${failure.viewport} ${failure.route}: overflow=${failure.bodyOverflow ?? "n/a"} errors=${failure.errors.length}`,
      );
      for (const error of failure.errors.slice(0, 3)) console.error(`  ${error}`);
      for (const warning of (failure.warnings ?? []).slice(0, 2)) {
        console.error(`  warning: ${warning}`);
      }
      for (const offender of failure.offenders ?? []) {
        console.error(
          `  overflow: <${offender.tag}>.${offender.className || offender.slot || offender.aria} right=${offender.right} width=${offender.width} text="${offender.text}"`,
        );
      }
    }
    console.error(`Full report: ${path.join(outputRoot, "report.json")}`);
    process.exit(1);
  }

  console.log(
    `Visual audit passed ${routes.length} routes across ${viewports.length} breakpoints. Report: ${path.join(
      outputRoot,
      "report.json",
    )}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
