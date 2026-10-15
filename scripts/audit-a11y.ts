import AxeBuilder from "@axe-core/playwright";
import { chromium, type Page } from "playwright";

import { withProductionServer } from "./lib/e2e.ts";
import { auditRoutes } from "./lib/routes.ts";

import type { AxeResults, Result } from "axe-core";

const VIEWPORTS = [
  { name: "desktop", width: 1296, height: 640 },
  { name: "phone", width: 390, height: 844 },
] as const;
const TAGS = ["wcag2a", "wcag2aa", "wcag21aa", "best-practice"];
type Finding = {
  impact: Result["impact"];
  rule: string;
  route: string;
  state: string;
  selector: string;
  help: string;
};

await withProductionServer(async (baseUrl) => {
  const browser = await chromium.launch();
  const findings: Finding[] = [];
  try {
    for (const viewport of VIEWPORTS) {
      findings.push(...(await scanViewport(browser, baseUrl, viewport)));
    }
  } finally {
    await browser.close();
  }
  printFindings(findings);
});

async function scanViewport(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  baseUrl: string,
  viewport: (typeof VIEWPORTS)[number],
) {
  const context = await browser.newContext({ viewport, colorScheme: "light" });
  const page = await context.newPage();
  const findings: Finding[] = [];
  for (const route of auditRoutes) {
    findings.push(...(await scanRoute(page, baseUrl, route, viewport.name)));
  }
  await context.close();
  return findings;
}

async function scanRoute(
  page: Page,
  baseUrl: string,
  route: (typeof auditRoutes)[number],
  viewportName: string,
) {
  await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
  const findings = flatten(await scan(page), route.path, `${viewportName}:default`);
  for (const interaction of route.interactions) {
    await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
    if (await openInteraction(page, interaction)) {
      findings.push(...flatten(await scan(page), route.path, `${viewportName}:${interaction}`));
    }
  }
  if (route.demo === "fieldhand") {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
    findings.push(...flatten(await scan(page), route.path, `${viewportName}:other-theme`));
    await page.emulateMedia({ colorScheme: "light" });
  }
  return findings;
}

function scan(page: Page) {
  return new AxeBuilder({ page }).withTags(TAGS).analyze();
}

function flatten(results: AxeResults, route: string, state: string): Finding[] {
  return results.violations.flatMap((violation) =>
    violation.nodes.map((node) => ({
      impact: violation.impact,
      rule: violation.id,
      route,
      state,
      selector: node.target.join(" "),
      help: violation.help,
    })),
  );
}

async function openInteraction(page: Page, interaction: string) {
  const drawerClose = page.getByRole("button", { name: "Close job details" });
  if (await drawerClose.isVisible().catch(() => false)) {
    await drawerClose.click({ timeout: 3_000 });
  }
  const actions: Record<string, () => Promise<void>> = {
    "command palette": () => page.keyboard.press("Control+KeyK"),
    "assign picker": () => page.getByTestId("job-card-assign-VL-1042").click({ timeout: 3_000 }),
    "create job": () => page.getByTestId("new-job-button").click({ timeout: 3_000 }),
    "payment drawer": () =>
      page.getByRole("button", { name: "Record payment" }).click({ timeout: 3_000 }),
    receipt: () =>
      page
        .getByRole("button", { name: /receipt/i })
        .first()
        .click({ timeout: 3_000 }),
    "mobile menu": () => page.getByRole("button", { name: "Open menu" }).click({ timeout: 3_000 }),
    "bag drawer": () => page.getByRole("button", { name: /Open bag/ }).click({ timeout: 3_000 }),
  };
  const action = actions[interaction];
  if (!action) {
    return false;
  }
  try {
    await action();
    await page.locator('[role="dialog"]').first().waitFor({ state: "visible", timeout: 3_000 });
    return true;
  } catch {
    console.warn(`OVERLAY UNAVAILABLE ${page.url()} ${interaction}`);
    return false;
  }
}

function printFindings(findings: Finding[]) {
  const impactOrder: Result["impact"][] = ["critical", "serious", "moderate", "minor", null];
  for (const impact of impactOrder) {
    const group = findings.filter((finding) => finding.impact === impact);
    if (!group.length) {
      continue;
    }
    console.log(`\n${impact ?? "unknown"}: ${group.length}`);
    console.table(group);
  }
  console.log(`Axe violations: ${findings.length} affected nodes.`);
}
