import { chromium, type Page } from "playwright";

const baseUrl = process.env.CHECK_BASE_URL ?? "http://127.0.0.1:3000";
const viewports = [320, 360, 390, 412, 480, 600, 768, 1024, 1440] as const;
const VIEWPORT_HEIGHT = 900;
const REGION_TOLERANCE = 2;

type Rect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};
type AnatomySnapshot = {
  svg: Rect;
  panel: Rect;
  hotspots: { region: string; box: Rect; center: { x: number; y: number }; regions: Rect[] }[];
};

const browser = await chromium.launch();
let hasFailure = false;
try {
  for (const width of viewports) {
    const page = await browser.newPage({ viewport: { width, height: VIEWPORT_HEIGHT } });
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    const snapshot = await inspectAnatomy(page);
    const failures = validateSnapshot(snapshot);
    console.log(
      `anatomy ${width}x${VIEWPORT_HEIGHT}: ${failures.length ? failures.join(" | ") : "pass"}`,
    );
    for (const hotspot of snapshot.hotspots) {
      console.log(
        `  ${hotspot.region}: center=${hotspot.center.x.toFixed(1)},${hotspot.center.y.toFixed(1)} box=${formatRect(hotspot.box)} svg=${formatRect(snapshot.svg)} regions=${hotspot.regions.map(formatRect).join(",")}`,
      );
    }
    hasFailure ||= failures.length > 0;
    await page.close();
  }
} finally {
  await browser.close();
}
if (hasFailure) {
  process.exitCode = 1;
}

async function inspectAnatomy(page: Page): Promise<AnatomySnapshot> {
  await page.locator("#principles").scrollIntoViewIfNeeded();
  return page.evaluate(() => {
    const toRect = (element: Element) => {
      const { left, top, right, bottom, width, height } = element.getBoundingClientRect();
      return { left, top, right, bottom, width, height };
    };
    const svg = document.querySelector(".axm-anatomy-frame svg");
    const panel = document.querySelector(".axm-principle-panel");
    if (!svg || !panel) {
      throw new Error("Anatomy drawing or panel is missing.");
    }
    const hotspots = [...document.querySelectorAll<HTMLElement>("[data-hotspot]")].map(
      (hotspot) => {
        const box = toRect(hotspot);
        const region = hotspot.dataset.hotspot ?? "unknown";
        return {
          region,
          box,
          center: { x: box.left + box.width / 2, y: box.top + box.height / 2 },
          regions: [...document.querySelectorAll(`[data-region="${region}"]`)].map(toRect),
        };
      },
    );
    return { svg: toRect(svg), panel: toRect(panel), hotspots };
  });
}

function validateSnapshot(snapshot: AnatomySnapshot) {
  const failures: string[] = [];
  for (const hotspot of snapshot.hotspots) {
    if (!contains(snapshot.svg, hotspot.center)) {
      failures.push(`${hotspot.region} outside svg`);
    }
    if (hotspot.box.width < 44 || hotspot.box.height < 44) {
      failures.push(`${hotspot.region} hit area <44`);
    }
    if (!hotspot.regions.some((region) => containsWithTolerance(region, hotspot.center))) {
      failures.push(`${hotspot.region} misses region`);
    }
    if (overlaps(hotspot.box, snapshot.panel)) {
      failures.push(`${hotspot.region} overlaps panel`);
    }
  }
  for (let index = 0; index < snapshot.hotspots.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < snapshot.hotspots.length; otherIndex += 1) {
      if (overlaps(snapshot.hotspots[index].box, snapshot.hotspots[otherIndex].box)) {
        failures.push(
          `${snapshot.hotspots[index].region}/${snapshot.hotspots[otherIndex].region} hit overlap`,
        );
      }
    }
  }
  return failures;
}

function contains(rect: Rect, point: { x: number; y: number }) {
  return (
    point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom
  );
}

function containsWithTolerance(rect: Rect, point: { x: number; y: number }) {
  return (
    point.x >= rect.left - REGION_TOLERANCE &&
    point.x <= rect.right + REGION_TOLERANCE &&
    point.y >= rect.top - REGION_TOLERANCE &&
    point.y <= rect.bottom + REGION_TOLERANCE
  );
}

function overlaps(first: Rect, second: Rect) {
  return (
    first.left < second.right &&
    first.right > second.left &&
    first.top < second.bottom &&
    first.bottom > second.top
  );
}

function formatRect(rect: Rect) {
  return `${rect.left.toFixed(1)},${rect.top.toFixed(1)} ${rect.width.toFixed(1)}x${rect.height.toFixed(1)}`;
}
