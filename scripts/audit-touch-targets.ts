import { chromium, type Page } from "playwright";

import { withProductionServer } from "./lib/e2e.ts";
import { auditRoutes } from "./lib/routes.ts";

type Offender = { selector: string; width: number; height: number; text: string };

await withProductionServer(async (baseUrl) => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    for (const route of auditRoutes) {
      await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
      const offenders = await inspect(page);
      console.log(`touch ${route.path}: ${offenders.length}`);
      if (offenders.length) {
        console.table(offenders);
      }
    }
    await page.close();
  } finally {
    await browser.close();
  }
});

function inspect(page: Page): Promise<Offender[]> {
  return page.evaluate(() =>
    [
      ...document.querySelectorAll<HTMLElement>(
        'a,button,input,select,textarea,summary,[role="button"],[role="tab"]',
      ),
    ]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const isInlineParagraphLink =
          element.tagName === "A" &&
          element.parentElement?.tagName === "P" &&
          getComputedStyle(element).display === "inline";
        return (
          element.offsetParent !== null &&
          !isInlineParagraphLink &&
          (rect.width < 44 || rect.height < 44)
        );
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const id = element.id ? `#${element.id}` : "";
        const classes = [...element.classList]
          .slice(0, 2)
          .map((name) => `.${name}`)
          .join("");
        return {
          selector: `${element.tagName.toLowerCase()}${id}${classes}`,
          width: Math.round(rect.width * 10) / 10,
          height: Math.round(rect.height * 10) / 10,
          text: (element.getAttribute("aria-label") ?? element.textContent ?? "")
            .trim()
            .slice(0, 60),
        };
      }),
  );
}
