import { runE2E, type E2ETest } from "./lib/e2e.ts";

import type { Page } from "playwright";

const port = Number(process.env.E2E_PORT ?? "3100");
const overviewUrl = `http://127.0.0.1:${port}/work/rentbook`;
const rentRollUrl = `${overviewUrl}/rent-roll`;

const tests: E2ETest[] = [
  {
    id: "R1",
    viewport: { name: "desktop", width: 1296, height: 640, isMobile: false },
    run: loadOverview,
  },
  {
    id: "R2",
    viewport: { name: "desktop", width: 1296, height: 640, isMobile: false },
    run: exerciseRentRoll,
  },
  {
    id: "R3",
    viewport: { name: "phone", width: 390, height: 844, isMobile: true },
    run: checkPhoneRoll,
  },
];

await runE2E({ readinessUrl: overviewUrl, suites: [{ tests, shouldPass: true }] });

async function loadOverview(page: Page) {
  await page.goto(overviewUrl, { waitUntil: "domcontentloaded" });
  await page.getByTestId("rentbook-nav").waitFor({ state: "visible" });
  await page.getByTestId("rentbook-overview").waitFor({ state: "visible" });
}

async function exerciseRentRoll(page: Page) {
  await page.goto(rentRollUrl, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "Rent roll" }).waitFor();
  const tenantHeader = page.getByRole("button", { name: /tenant/i });
  await tenantHeader.click();
  if ((await tenantHeader.getAttribute("aria-sort")) !== null) {
    throw new Error("aria-sort belongs on the table header, not the button.");
  }
  const row = page
    .locator("tbody tr")
    .filter({ has: page.getByRole("checkbox") })
    .first();
  await row.focus();
  await page.keyboard.press("p");
  await page.getByTestId("payment-drawer").waitFor({ state: "visible" });
  await page.getByLabel("Close record payment").click();
  await page.getByText("Discard this payment entry?").waitFor({ state: "visible" });
  await page.getByRole("button", { name: "Discard" }).click();
}

async function checkPhoneRoll(page: Page) {
  await page.goto(rentRollUrl, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "Rent roll" }).waitFor();
  const row = page
    .locator("tbody tr")
    .filter({ has: page.getByRole("checkbox") })
    .first();
  const display = await row.evaluate((element) => getComputedStyle(element).display);
  if (display !== "block") {
    throw new Error("Rent roll does not stack its rows on phone.");
  }
}
