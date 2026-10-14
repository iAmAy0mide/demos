import { runE2E, type E2ETest } from "./lib/e2e.ts";

import type { Page } from "playwright";

const port = Number(process.env.E2E_PORT ?? "3100");
const overviewUrl = `http://127.0.0.1:${port}/work/rentbook`;
const rentRollUrl = `${overviewUrl}/rent-roll`;
const paymentsUrl = `${overviewUrl}/payments`;

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
