import { mkdir, readFile, writeFile } from "node:fs/promises";

import pixelmatch from "pixelmatch";
import { chromium, type Page } from "playwright";
import { PNG } from "pngjs";

import { withProductionServer } from "./lib/e2e.ts";
import { auditRoutes } from "./lib/routes.ts";

const ROOT = ".audit/visual";
const VIEWPORTS = [
  { name: "phone", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
] as const;
const mode = selectedMode();

if (!mode) {
  throw new Error("Use --capture or --compare.");
}

await withProductionServer(async (baseUrl) => {
  const browser = await chromium.launch();
  const comparisons: {
    route: string;
    viewport: string;
    differingPixels: number;
    percent: number;
  }[] = [];
  try {
    for (const viewport of VIEWPORTS) {
      comparisons.push(...(await captureViewport(browser, baseUrl, viewport, mode)));
    }
  } finally {
    await browser.close();
  }
  if (mode === "compare") {
    console.table(comparisons.sort((left, right) => right.percent - left.percent));
  }
});

function selectedMode() {
  if (process.argv.includes("--capture")) {
    return "capture" as const;
  }
  if (process.argv.includes("--compare")) {
    return "compare" as const;
  }
  return undefined;
}

async function captureViewport(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  baseUrl: string,
  viewport: (typeof VIEWPORTS)[number],
  selected: "capture" | "compare",
) {
  const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
  const comparisons = [];
  await prepareDeterminism(page);
  for (const route of auditRoutes) {
    const name = `${fileName(route.path)}-${viewport.name}.png`;
    const directory = selected === "capture" ? `${ROOT}/baseline` : `${ROOT}/current`;
    await mkdir(directory, { recursive: true });
    await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
    await page.addStyleTag({
      content:
        "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}",
    });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `${directory}/${name}`,
      fullPage: true,
      animations: "disabled",
      mask: [page.locator("canvas"), page.locator("iframe")],
      maskColor: "#777777",
    });
    if (selected === "compare") {
      comparisons.push(await compare(name, route.path, viewport.name));
    }
  }
  await page.close();
  return comparisons;
}

async function prepareDeterminism(page: Page) {
  await page.clock.install({ time: new Date("2026-10-15T09:00:00+01:00") });
  await page.addInitScript(() => {
    let seed = 2_026_101_5;
    Math.random = () => {
      seed = (seed * 1_664_525 + 1_013_904_223) % 4_294_967_296;
      return seed / 4_294_967_296;
    };
  });
}

async function compare(name: string, route: string, viewport: string) {
  const baseline = PNG.sync.read(await readFile(`${ROOT}/baseline/${name}`));
  const current = PNG.sync.read(await readFile(`${ROOT}/current/${name}`));
  if (baseline.width !== current.width || baseline.height !== current.height) {
    throw new Error(
      `${name} dimensions changed from ${baseline.width}x${baseline.height} to ${current.width}x${current.height}.`,
    );
  }
  const diff = new PNG({ width: baseline.width, height: baseline.height });
  const differingPixels = pixelmatch(
    baseline.data,
    current.data,
    diff.data,
    baseline.width,
    baseline.height,
    { threshold: 0.1 },
  );
  await mkdir(`${ROOT}/diff`, { recursive: true });
  await writeFile(`${ROOT}/diff/${name}`, PNG.sync.write(diff));
  return {
    route,
    viewport,
    differingPixels,
    percent: Number(((differingPixels / (baseline.width * baseline.height)) * 100).toFixed(3)),
  };
}

function fileName(path: string) {
  return path === "/" ? "hub" : path.replace(/^\//, "").replaceAll(/[^a-z0-9]+/gi, "-");
}
