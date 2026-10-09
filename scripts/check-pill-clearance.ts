import { chromium, type Browser, type Page } from "playwright";

const baseUrl = process.env.CHECK_BASE_URL ?? "http://127.0.0.1:3000";
const routes = [
  "/work/fieldhand",
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
  const covered = await Promise.all(
    (["top", "bottom"] as const).map((position) =>
      checkPosition(page, route, width, height, position),
    ),
  );
  return covered.some(Boolean);
}

async function checkPosition(
  page: Page,
  route: string,
  width: number,
  height: number,
  position: "top" | "bottom",
) {
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
