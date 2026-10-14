import { chromium, type Page } from "playwright";

const baseUrl = process.env.CHECK_BASE_URL ?? "http://127.0.0.1:3000";
const phones = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
] as const;

const menuButton = (page: Page) => page.getByRole("button", { name: "Open menu" });
const closeButton = (page: Page) => page.getByRole("button", { name: "Close menu" });

async function openMenu(page: Page) {
  await menuButton(page).click();
  await closeButton(page).waitFor();
}

async function assertInViewport(page: Page, label: string) {
  const box = await page.getByRole("button", { name: label }).boundingBox();
  const viewport = page.viewportSize();
  if (
    !box ||
    !viewport ||
    box.x < 0 ||
    box.y < 0 ||
    box.x + box.width > viewport.width ||
    box.y + box.height > viewport.height
  ) {
    throw new Error(`${label} is not visible in the viewport.`);
  }
}

async function checkPhone(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await menuButton(page).waitFor();
  await openMenu(page);
  await assertInViewport(page, "Close menu");
  await closeButton(page).click();
  await menuButton(page).waitFor();
  await openMenu(page);
  await page.keyboard.press("Escape");
  await menuButton(page).waitFor();
  if (!(await menuButton(page).evaluate((element) => document.activeElement === element))) {
    throw new Error("Focus did not return to the menu toggle after Escape.");
  }
  await openMenu(page);
  await page.getByRole("link", { name: "Contact" }).click();
  await page.locator("#contact").waitFor();
  const scrolledToContact = await page.evaluate(() => window.scrollY > 0);
  if (!scrolledToContact) {
    throw new Error("A mobile navigation anchor did not scroll to its section.");
  }
  await openMenu(page);
  await page.getByRole("link", { name: "Start a project" }).scrollIntoViewIfNeeded();
  const cta = page.getByRole("link", { name: "Start a project" });
  if (!(await cta.isVisible())) {
    throw new Error("The mobile menu CTA is unreachable.");
  }
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  if (overflow) {
    throw new Error("The mobile menu causes horizontal overflow.");
  }
  console.log(`menu ${width}x${height}: pass`);
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  page.setDefaultTimeout(15_000);
  for (const phone of phones) {
    await checkPhone(page, phone.width, phone.height);
  }
  await page.close();
} finally {
  await browser.close();
}
