import { launchBrowser } from "./lib/browser.ts";

import type { Page } from "playwright";

const baseUrl = process.env.CHECK_BASE_URL ?? "http://127.0.0.1:3000";
const viewports = [390, 1440] as const;
const VIEWPORT_HEIGHT = 900;
const MAX_HIDDEN_SIZE = 2;
const NEW_TAB_TEXT = "opens in a new tab";

const browser = await launchBrowser();
try {
  for (const width of viewports) {
    const page = await browser.newPage({ viewport: { width, height: VIEWPORT_HEIGHT } });
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await assertHiddenNewTabText(page, width);
    await page.close();
  }
} finally {
  await browser.close();
}

async function assertHiddenNewTabText(page: Page, width: number) {
  const result = await page.evaluate(
    ({ maxHiddenSize, newTabText }) => {
      const hiddenText = [...document.querySelectorAll<HTMLElement>(".axm-visually-hidden")].filter(
        (element) => element.textContent?.includes(newTabText),
      );
      const oversized = hiddenText.flatMap((element) => {
        const box = element.getBoundingClientRect();
        return box.width > maxHiddenSize || box.height > maxHiddenSize
          ? [{ text: element.textContent?.trim(), width: box.width, height: box.height }]
          : [];
      });
      const visiblePhrases = [
        ...document.querySelectorAll<HTMLAnchorElement>("a:has(.axm-visually-hidden)"),
      ].flatMap((anchor) => {
        const hiddenInnerText = [...anchor.querySelectorAll<HTMLElement>(".axm-visually-hidden")]
          .map((element) => element.innerText)
          .join("");
        const visibleInnerText = anchor.innerText.replace(hiddenInnerText, "");
        return visibleInnerText.includes(newTabText)
          ? [{ href: anchor.getAttribute("href"), innerText: visibleInnerText }]
          : [];
      });
      return { hiddenCount: hiddenText.length, oversized, visiblePhrases };
    },
    { maxHiddenSize: MAX_HIDDEN_SIZE, newTabText: NEW_TAB_TEXT },
  );

  if (!result.hiddenCount) {
    throw new Error(`No new-tab text found at ${width}px.`);
  }
  if (result.oversized.length) {
    throw new Error(`Visible hidden text at ${width}px: ${JSON.stringify(result.oversized)}`);
  }
  if (result.visiblePhrases.length) {
    throw new Error(
      `DemoLink exposes hidden text at ${width}px: ${JSON.stringify(result.visiblePhrases)}`,
    );
  }
  console.log(`visually hidden ${width}x${VIEWPORT_HEIGHT}: ${result.hiddenCount} links pass`);
}
