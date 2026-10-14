import { runE2E, type E2ETest } from "./lib/e2e.ts";

import type { Page } from "playwright";

const port = Number(process.env.E2E_PORT ?? "3100");
const overviewUrl = `http://127.0.0.1:${port}/work/rentbook`;

const tests: E2ETest[] = [
  {
    id: "R1",
    viewport: { name: "desktop", width: 1296, height: 640, isMobile: false },
    run: loadOverview,
  },
];

await runE2E({ readinessUrl: overviewUrl, suites: [{ tests, shouldPass: true }] });

async function loadOverview(page: Page) {
  await page.goto(overviewUrl, { waitUntil: "domcontentloaded" });
  await page.getByTestId("rentbook-nav").waitFor({ state: "visible" });
  await page.getByTestId("rentbook-overview").waitFor({ state: "visible" });
}
