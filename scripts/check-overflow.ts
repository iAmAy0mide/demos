import { chromium, type Browser, type Page } from "playwright";

import { auditRoutes, routesFromEnvironment } from "./lib/routes.ts";

const baseUrl = process.env.CHECK_BASE_URL ?? "http://127.0.0.1:3000";
const routes = routesFromEnvironment(process.env.CHECK_ROUTES, auditRoutes);
const viewports = [
  [320, 568],
  [360, 740],
  [390, 844],
  [412, 915],
  [768, 1024],
  [1024, 900],
  [1296, 640],
  [1440, 900],
  [1920, 1080],
] as const;

type Offender = { selector: string; left: number; right: number; width: number; reason: string };

async function visibleOverflow(page: Page): Promise<Offender[]> {
  return page.evaluate(() => {
    const isInsideIntentionalScroller = (element: Element | null) => {
      for (let current = element; current; current = current.parentElement) {
        if (current.getAttribute("data-scroll-x") === "intentional") {
          return true;
        }
      }
      return false;
    };
    const elements = [...document.querySelectorAll<HTMLElement>("body *")];
    const unmarkedScrollers = elements.filter((element) => {
      const style = getComputedStyle(element);
      return (
        ["auto", "scroll"].includes(style.overflowX) &&
        element.scrollWidth > element.clientWidth &&
        element.getAttribute("data-scroll-x") !== "intentional"
      );
    });
    const overflowingElements = elements.filter((element) => {
      const rect = element.getBoundingClientRect();
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        !isInsideIntentionalScroller(element) &&
        (rect.left < -0.5 || rect.right > innerWidth + 0.5)
      );
    });
    return [...unmarkedScrollers, ...overflowingElements].slice(0, 30).map((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const isUnmarkedScroller =
        ["auto", "scroll"].includes(style.overflowX) &&
        element.scrollWidth > element.clientWidth &&
        element.getAttribute("data-scroll-x") !== "intentional";
      const selector = `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${element.className && typeof element.className === "string" ? `.${element.className.split(/\\s+/).filter(Boolean).slice(0, 2).join(".")}` : ""}`;
      return {
        selector,
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        reason: isUnmarkedScroller ? "unmarked horizontal scroller" : "rect exceeds viewport",
      };
    });
  });
}

const browser = await chromium.launch();
let failed = false;
try {
  for (const [width, height] of viewports) {
    const page = await createPage(browser, width, height);
    for (const route of routes) {
      const hasOverflow = await checkRoute(page, route.path, width, height);
      failed ||= hasOverflow;
    }
    await page.close();
  }
} finally {
  await browser.close();
}
if (failed) {
  process.exitCode = 1;
}

async function createPage(browser: Browser, width: number, height: number) {
  const isMobile = width <= 412;
  return browser.newPage({
    viewport: { width, height },
    isMobile,
    hasTouch: isMobile,
    deviceScaleFactor: isMobile ? 2 : 1,
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
