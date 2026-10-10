import { chromium } from "playwright";

const baseUrl = process.env.CHECK_BASE_URL ?? "http://127.0.0.1:3000";

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const invalidLinks = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLAnchorElement>('a[href^="/work/"]')]
      .filter((link) => link.target !== "_blank" || !link.rel.split(/\s+/).includes("noopener"))
      .map((link) => link.href),
  );
  if (invalidLinks.length) {
    throw new Error(`Demo links missing new-tab safety: ${invalidLinks.join(", ")}`);
  }
  console.log("Demo link new-tab contract passed.");
} finally {
  await browser.close();
}
