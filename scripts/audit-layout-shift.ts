import { chromium, type Page } from "playwright";

import { withProductionServer } from "./lib/e2e.ts";
import { auditRoutes } from "./lib/routes.ts";

type Shift = { value: number; selectors: string[] };

await withProductionServer(async (baseUrl) => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await installObserver(page);
    for (const route of auditRoutes) {
      await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
      await page.evaluate(async () => {
        const step = Math.max(1, innerHeight * 0.8);
        for (let top = 0; top < document.body.scrollHeight; top += step) {
          window.scrollTo(0, top);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      });
      await page.waitForTimeout(3_000);
      const shifts = await page.evaluate(
        () => (window as Window & { __auditShifts?: Shift[] }).__auditShifts ?? [],
      );
      console.log(
        `cls ${route.path}: ${shifts.reduce((sum, shift) => sum + shift.value, 0).toFixed(4)} ${JSON.stringify(shifts)}`,
      );
    }
    await page.close();
  } finally {
    await browser.close();
  }
});

function installObserver(page: Page) {
  return page.addInitScript(() => {
    const auditWindow = window as Window & { __auditShifts?: Shift[] };
    auditWindow.__auditShifts = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & {
        value: number;
        hadRecentInput: boolean;
        sources?: { node?: Node }[];
      })[]) {
        if (entry.hadRecentInput) {
          continue;
        }
        const selectors = (entry.sources ?? []).map(({ node }) =>
          node instanceof Element
            ? `${node.tagName.toLowerCase()}${node.id ? `#${node.id}` : ""}`
            : "unknown",
        );
        auditWindow.__auditShifts?.push({
          value: entry.value,
          selectors,
        });
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
}
