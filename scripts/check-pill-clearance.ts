import { chromium, type Page } from "playwright";

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
    const page = await browser.newPage({
      viewport: { width, height },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    });
    for (const route of routes) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
      for (const position of ["top", "bottom"] as const) {
        await page.evaluate(
          (target) => window.scrollTo(0, target === "bottom" ? document.body.scrollHeight : 0),
          position,
        );
        const covered = await inspect(page);
        console.log(
          `pill ${route} ${width}x${height} ${position}: ${covered.length ? covered.join(" | ") : "clear"}`,
        );
        if (covered.length) {
          failed = true;
        }
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
}
if (failed) {
  process.exitCode = 1;
}
