import { readFile } from "node:fs/promises";

import { runE2E, type E2ETest } from "./lib/e2e.ts";

import type { Page } from "playwright";

const port = Number(process.env.E2E_PORT ?? "3100");
const overviewUrl = `http://127.0.0.1:${port}/work/rentbook`;
const rentRollUrl = `${overviewUrl}/rent-roll`;
const paymentsUrl = `${overviewUrl}/payments`;
const tenantsUrl = `${overviewUrl}/tenants`;
const propertiesUrl = `${overviewUrl}/properties`;
const reportsUrl = `${overviewUrl}/reports`;
const maintenanceUrl = `${overviewUrl}/maintenance`;

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
  {
    id: "R4",
    viewport: { name: "desktop", width: 1296, height: 640, isMobile: false },
    run: exerciseReceipt,
  },
  {
    id: "R5",
    viewport: { name: "phone", width: 390, height: 844, isMobile: true },
    run: exerciseReminders,
  },
  {
    id: "R6",
    viewport: { name: "desktop", width: 1296, height: 640, isMobile: false },
    run: exerciseTenantRegister,
  },
  {
    id: "R7",
    viewport: { name: "desktop", width: 1296, height: 640, isMobile: false },
    run: exerciseTenantLedger,
  },
  {
    id: "R8",
    viewport: { name: "phone", width: 390, height: 844, isMobile: true },
    run: exerciseBuilding,
  },
  {
    id: "R9",
    viewport: { name: "desktop", width: 1296, height: 640, isMobile: false },
    run: exercisePaletteAndShortcuts,
  },
  {
    id: "R10",
    viewport: { name: "desktop", width: 1296, height: 640, isMobile: false },
    run: exerciseReportsAndMaintenance,
  },
  {
    id: "R11",
    viewport: { name: "desktop", width: 1296, height: 640, isMobile: false },
    run: verifyEmbedDoesNotPersist,
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
  if (!(await page.getByTestId("rentbook-mobile-nav").isVisible())) {
    throw new Error("Rentbook phone navigation is not visible.");
  }
  await page.goto(maintenanceUrl, { waitUntil: "domcontentloaded" });
  await page.getByTestId("maintenance-page").waitFor();
  await page.locator(".rbk-maintenance-row").first().click();
  const sheet = page.locator(".rbk-maintenance-sheet");
  const height = await sheet.evaluate((element) => element.getBoundingClientRect().height);
  if (height < 700) {
    throw new Error("Maintenance detail is not a full-height phone sheet.");
  }
}

async function exerciseReceipt(page: Page) {
  await page.goto(paymentsUrl, { waitUntil: "domcontentloaded" });
  const total = page.locator(".rbk-payment-total strong");
  const before = await total.textContent();
  await page.getByLabel("Payment method").selectOption("cash");
  if ((await total.textContent()) === before) {
    throw new Error("Payment filters did not update the collection total.");
  }
  await page.getByRole("button", { name: /RC-/ }).first().click();
  await page.getByTestId("receipt").waitFor();
  const receiptUrl = page.url();
  if (!receiptUrl.includes("receipt=")) {
    throw new Error("Receipt did not create a deep link.");
  }
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByTestId("receipt").waitFor();
  await page.emulateMedia({ media: "print" });
  const visible = await page
    .locator("main")
    .evaluate((element) => getComputedStyle(element).visibility);
  if (visible !== "hidden") {
    throw new Error("Non-receipt content is visible in print media.");
  }
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  if (overflow) {
    throw new Error("Receipt print media overflows horizontally.");
  }
  await page.emulateMedia({ media: "screen" });
  const whatsapp = page.getByRole("link", { name: "Share on WhatsApp" });
  const href = await whatsapp.getAttribute("href");
  if (!href?.startsWith("https://wa.me/234") || !href.includes("RC-")) {
    throw new Error("Receipt WhatsApp link is not a normalised, encoded tenant link.");
  }
  const words = await page.locator(".rbk-receipt-words").textContent();
  if (!words?.includes("naira")) {
    throw new Error("Receipt does not show the payment amount in words.");
  }
}

async function exerciseReminders(page: Page) {
  await page.goto(rentRollUrl, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /overdue/i }).click();
  const rows = page.locator("tbody tr").filter({ has: page.getByRole("checkbox") });
  await rows.nth(0).getByRole("checkbox").check();
  await rows.nth(1).getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send reminders" }).click();
  await page.getByTestId("reminder-dialog").waitFor();
  await page.getByText("1 of 2").waitFor();
  await page.getByLabel("Reminder tone").selectOption("firm");
  await page.getByLabel("Reminder message").fill("Please settle your rent today.");
  const link = page.getByRole("link", { name: "Open in WhatsApp" });
  const href = await link.getAttribute("href");
  if (!href?.includes("Please%20settle")) {
    throw new Error("Reminder link did not encode edited text.");
  }
  await page.getByRole("button", { name: "Copy text" }).click();
  await page.getByRole("button", { name: "Skip" }).click();
  await page.getByText("2 of 2").waitFor();
}

async function exerciseTenantRegister(page: Page) {
  await page.goto(tenantsUrl, { waitUntil: "domcontentloaded" });
  await page.getByTestId("tenant-list").waitFor();
  const accounts = page.getByRole("link").filter({ hasText: "Flat" });
  const count = await accounts.count();
  await page.getByLabel("Search tenants").fill("Adaeze Okoro");
  if ((await accounts.count()) !== 1) {
    throw new Error("Tenant search did not narrow the register.");
  }
  await page.getByLabel("Search tenants").fill("");
  await page.getByRole("button", { name: "overdue" }).click();
  if ((await accounts.count()) >= count) {
    throw new Error("Tenant status filter did not narrow the register.");
  }
}

async function exerciseTenantLedger(page: Page) {
  await page.goto(`${tenantsUrl}/tenant-1`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("tenant-ledger").waitFor();
  const before = await page.locator(".rbk-ledger-table tfoot td").textContent();
  await page.getByRole("button", { name: "Record payment" }).click();
  await page.getByTestId("payment-drawer").waitFor();
  await page.getByLabel(/Amount/i).fill("100000");
  await page.getByLabel(/Reference/i).fill("LEDGER-R7");
  await page
    .getByRole("button", { name: /record payment/i })
    .last()
    .click();
  await page.getByTestId("tenant-ledger").waitFor();
  if ((await page.locator(".rbk-ledger-table tfoot td").textContent()) === before) {
    throw new Error("Ledger payment did not update the closing balance.");
  }
  await page.emulateMedia({ media: "print" });
  if (
    (await page
      .getByTestId("tenant-statement")
      .evaluate((element) => getComputedStyle(element).visibility)) !== "visible"
  ) {
    throw new Error("Ledger statement is not visible in print media.");
  }
  if (
    (await page
      .locator(".rbk-ledger-actions")
      .evaluate((element) => getComputedStyle(element).visibility)) !== "hidden"
  ) {
    throw new Error("Ledger actions are visible in print media.");
  }
  await page.emulateMedia({ media: "screen" });
  await page.goto(`${tenantsUrl}/missing`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: /not in this book/i }).waitFor();
}

async function exerciseBuilding(page: Page) {
  await page.goto(`${propertiesUrl}/property-1`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("building-view").waitFor();
  const units = page.locator(".rbk-svg-unit");
  if ((await units.count()) !== 8) {
    throw new Error("Building view unit count differs from property seed.");
  }
  await units.first().click();
  await page.getByText("Selected unit").waitFor();
  await units.first().focus();
  await page.keyboard.press("ArrowRight");
  if ((await page.locator(".rbk-svg-unit[tabindex='0']").count()) !== 1) {
    throw new Error("Roving tabindex did not retain a single active unit.");
  }
  await page.getByRole("button", { name: /Flat 2A/i }).click();
  if ((await page.locator(".rbk-unit-panel h2").textContent()) !== "Flat 2A") {
    throw new Error("Alternative unit list did not select its unit.");
  }
  await page.goto(propertiesUrl, { waitUntil: "domcontentloaded" });
  await page.getByLabel("Property").selectOption("property-1");
  if ((await page.getByTestId("property-grid").locator(".rbk-property-card").count()) !== 1) {
    throw new Error("Property switcher did not filter building cards.");
  }
  await page.goto(`${propertiesUrl}/missing`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: /not in this book/i }).waitFor();
}

async function exercisePaletteAndShortcuts(page: Page) {
  await page.goto(overviewUrl, { waitUntil: "domcontentloaded" });
  await page.keyboard.press("Control+K");
  await page.getByTestId("command-palette").waitFor();
  await page.getByLabel("Find a command").fill("Adaeze");
  await page.getByRole("link", { name: "Adaeze Okoro" }).click();
  await page.getByTestId("tenant-ledger").waitFor();
  await page.keyboard.press("?");
  await page.getByRole("heading", { name: "Keyboard shortcuts" }).waitFor();
  await page.keyboard.press("Escape");
  await page.keyboard.press("g");
  await page.keyboard.press("r");
  await page.getByRole("heading", { name: "Rent roll" }).waitFor();
  await page.keyboard.press("p");
  await page.getByTestId("payment-drawer").waitFor();
  await page.getByLabel("Close record payment").click();
  await page.getByRole("button", { name: "Discard" }).click();
  await page.getByLabel(/Search tenants/i).focus();
  await page.keyboard.press("p");
  if (await page.getByTestId("payment-drawer").isVisible()) {
    throw new Error("Payment shortcut fired while a text input had focus.");
  }
  await page.keyboard.press("n");
  await page.getByRole("heading", { name: "New request" }).waitFor();
}

async function exerciseReportsAndMaintenance(page: Page) {
  await page.goto(reportsUrl, { waitUntil: "domcontentloaded" });
  await page.getByTestId("reports-page").waitFor();
  const before = await page.locator(".rbk-report-table tbody tr").count();
  const beforeIncome = await page.locator(".rbk-report-table tbody").textContent();
  await page.getByLabel("Property").selectOption("property-1");
  if ((await page.locator(".rbk-report-table tbody tr").count()) !== before) {
    throw new Error(
      "Reports table row count should remain a six-month series after property scope.",
    );
  }
  if ((await page.locator(".rbk-report-table tbody").textContent()) === beforeIncome) {
    throw new Error("Reports did not recalculate when the property scope changed.");
  }
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  const download = await downloadPromise;
  const csv = await readFile((await download.path()) ?? "", "utf8");
  if (!csv.startsWith("\ufeffDate,Property,Tenant,Unit,Amount")) {
    throw new Error("Rentbook CSV did not have the expected UTF-8 BOM and header.");
  }
  if (csv.trim().split("\r\n").length < 2) {
    throw new Error("Rentbook CSV did not include data rows.");
  }
  await page.goto(maintenanceUrl, { waitUntil: "domcontentloaded" });
  await page.getByTestId("maintenance-page").waitFor();
  await page.getByRole("button", { name: "New request" }).click();
  await page.getByLabel("Unit").selectOption({ index: 1 });
  await page.getByLabel("Request").fill("Test gate repair");
  await page.getByRole("button", { name: "Create request" }).click();
  await page.getByText("Test gate repair").waitFor();
  await page.getByText("Test gate repair").click();
  await page.getByRole("button", { name: "Next status" }).click();
  await page.getByRole("button", { name: "Save update" }).click();
  await page.getByText("assigned").waitFor();
}

async function verifyEmbedDoesNotPersist(page: Page) {
  await page.goto(`${overviewUrl}?embed=1`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("rentbook-overview").waitFor();
  const storageSize = await page.evaluate(() => localStorage.length);
  if (storageSize !== 0) {
    throw new Error("Embed mode wrote Rentbook state to localStorage.");
  }
}
