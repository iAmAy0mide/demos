import { chromium, type Browser, type Page } from "playwright";

const baseUrl = process.env.CHECK_BASE_URL ?? "http://127.0.0.1:3000";
const routes = [
  "/",
  "/work/fieldhand",
  "/work/fieldhand/schedule",
  "/work/fieldhand/quotes",
  "/work/rentbook",
  "/work/sunreach",
  "/work/meridian",
  "/work/harmattan",
];
const phones = [
  [320, 568],
  [360, 740],
  [390, 844],
  [412, 915],
] as const;

type Offender = { selector: string; left: number; right: number; width: number };

async function visibleOverflow(page: Page): Promise<Offender[]> {
  return page.evaluate(() => {
    const isScrollable = (element: Element | null) => {
      for (let current = element; current; current = current.parentElement) {
        const style = getComputedStyle(current);
        if (["auto", "scroll"].includes(style.overflowX)) {
          return true;
        }
      }
      return false;
    };
    return [...document.querySelectorAll<HTMLElement>("body *")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          !isScrollable(element.parentElement) &&
          (rect.left < -0.5 || rect.right > innerWidth + 0.5)
        );
      })
      .slice(0, 30)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const selector = `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${element.className && typeof element.className === "string" ? `.${element.className.split(/\\s+/).filter(Boolean).slice(0, 2).join(".")}` : ""}`;
        return {
          selector,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      });
  });
}

const browser = await chromium.launch();
let failed = false;
try {
  for (const [width, height] of phones) {
    const page = await createPhonePage(browser, width, height);
    const results = await Promise.all(
      routes.map((route) => checkRoute(page, route, width, height)),
    );
    failed ||= results.some(Boolean);
    await page.close();
  }
} finally {
  await browser.close();
}
if (failed) {
  process.exitCode = 1;
}

async function createPhonePage(browser: Browser, width: number, height: number) {
  return browser.newPage({
    viewport: { width, height },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
}

async function checkRoute(page: Page, route: string, width: number, height: number) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  const [scrollWidth, offenders] = await Promise.all([
    page.evaluate(() => document.scrollingElement?.scrollWidth ?? 0),
    visibleOverflow(page),
  ]);
  console.log(
    `overflow ${route} ${width}x${height}: scrollWidth=${scrollWidth} viewport=${width} offenders=${offenders.length}`,
  );
  if (scrollWidth <= width && !offenders.length) {
    return false;
  }
  console.log(JSON.stringify(offenders));
  return true;
}
