import { chromium, type Browser, type Page } from "playwright";

import { appAuditRoutes, routesFromEnvironment } from "./lib/routes.ts";

const baseUrl = process.env.CHECK_BASE_URL ?? "http://127.0.0.1:3000";
const routes = routesFromEnvironment(process.env.CHECK_ROUTES, appAuditRoutes);
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

async function inspect(page: Page) {
  return page.evaluate(() => {
    const shell = document.querySelector<HTMLElement>(".axm-shell");
    if (!shell) {
      return [];
    }
    const shellRect = shell.getBoundingClientRect();
    return [
      ...document.querySelectorAll<HTMLElement>(
        "a,button,input,select,textarea,summary,[role=button],[role=tab]",
      ),
    ]
      .filter((element) => element.offsetParent !== null && !shell.contains(element))
      .flatMap((element) => {
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) {
          return [];
        }
        const overlap =
          rect.left < shellRect.right &&
          rect.right > shellRect.left &&
          rect.top < shellRect.bottom &&
          rect.bottom > shellRect.top;
        const top = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        );
        const blocked = top instanceof Element && shell.contains(top);
        return overlap || blocked
          ? [
              `${element.tagName.toLowerCase()} ${element.getAttribute("aria-label") ?? element.textContent?.trim().slice(0, 36) ?? ""}`,
            ]
          : [];
      });
  });
}

const browser = await chromium.launch();
let failed = false;
try {
  for (const [width, height] of viewports) {
    const page = await createPage(browser, width, height);
    for (const route of routes) {
      const hasOverlap = await checkRoute(page, route.path, width, height);
      failed ||= hasOverlap;
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
  const covered = await Promise.all(
    (["top", "bottom"] as const).map((position) =>
      checkPosition({ page, route, width, height, position }),
    ),
  );
  return covered.some(Boolean);
}

async function checkPosition({
  page,
  route,
  width,
  height,
  position,
}: {
  page: Page;
  route: string;
  width: number;
  height: number;
  position: "top" | "bottom";
}) {
  await page.evaluate(
    (target) => window.scrollTo(0, target === "bottom" ? document.body.scrollHeight : 0),
    position,
  );
  const covered = await inspect(page);
  console.log(
    `pill ${route} ${width}x${height} ${position}: ${covered.length ? covered.join(" | ") : "clear"}`,
  );
  return covered.length > 0;
}
