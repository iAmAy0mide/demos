import { mkdir, writeFile } from "node:fs/promises";

import { launch } from "chrome-launcher";
import lighthouse, { type Result as LighthouseResult } from "lighthouse";
import { chromium } from "playwright";

import { withProductionServer } from "./lib/e2e";
import { auditRoutes, type AuditRoute } from "./lib/routes";

const OUTPUT_DIRECTORY = ".audit/lighthouse";
const DESKTOP_PATHS = new Set([
  "/",
  "/work/fieldhand?job=VL-1042",
  "/work/sunreach",
  "/work/meridian",
  "/work/harmattan",
  "/work/rentbook",
  "/work/harmattan/subscribe",
  "/work/meridian/track",
  "/work/meridian/quote",
]);
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"] as const;

type FormFactor = "mobile" | "desktop";
type Summary = {
  route: string;
  formFactor: FormFactor;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  lcp: number;
  cls: number;
  tbt: number;
  javascriptBytes: number;
};

await mkdir(OUTPUT_DIRECTORY, { recursive: true });
await withProductionServer(async (baseUrl) => {
  const summaries: Summary[] = [];
  for (const route of auditRoutes) {
    summaries.push(await auditWithRetries(baseUrl, route, "mobile"));
    if (DESKTOP_PATHS.has(route.path)) {
      summaries.push(await auditWithRetries(baseUrl, route, "desktop"));
    }
  }
  console.table(summaries);
});

async function auditWithRetries(baseUrl: string, route: AuditRoute, formFactor: FormFactor) {
  const first = await runLighthouse(baseUrl, route, formFactor, 1);
  if (
    CATEGORIES.every(
      (category) => first[category === "best-practices" ? "bestPractices" : category] >= 90,
    )
  ) {
    return first;
  }
  const results = [first];
  results.push(await runLighthouse(baseUrl, route, formFactor, 2));
  results.push(await runLighthouse(baseUrl, route, formFactor, 3));
  return medianSummary(results);
}

async function runLighthouse(
  baseUrl: string,
  route: AuditRoute,
  formFactor: FormFactor,
  attempt: number,
) {
  const chrome = await launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ["--headless", "--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const result = await lighthouse(`${baseUrl}${route.path}`, {
      port: chrome.port,
      output: "json",
      logLevel: "error",
      formFactor,
      screenEmulation:
        formFactor === "desktop"
          ? { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false }
          : undefined,
    });
    if (!result) {
      throw new Error(`Lighthouse returned no result for ${route.path}.`);
    }
    const file = `${OUTPUT_DIRECTORY}/${fileName(route.path)}-${formFactor}-${attempt}.json`;
    await writeFile(file, JSON.stringify(result.lhr));
    return summarize(route.path, formFactor, result.lhr);
  } finally {
    await chrome.kill();
  }
}

function summarize(route: string, formFactor: FormFactor, result: LighthouseResult): Summary {
  const score = (category: string) => Math.round((result.categories[category]?.score ?? 0) * 100);
  const value = (audit: string) => result.audits[audit]?.numericValue ?? 0;
  return {
    route,
    formFactor,
    performance: score("performance"),
    accessibility: score("accessibility"),
    bestPractices: score("best-practices"),
    seo: score("seo"),
    lcp: Math.round(value("largest-contentful-paint")),
    cls: Number(value("cumulative-layout-shift").toFixed(3)),
    tbt: Math.round(value("total-blocking-time")),
    javascriptBytes: Math.round(value("total-byte-weight")),
  };
}

function medianSummary(results: Summary[]) {
  const median = (key: keyof Omit<Summary, "route" | "formFactor">) =>
    [...results].sort((left, right) => left[key] - right[key])[1][key];
  return {
    route: results[0].route,
    formFactor: results[0].formFactor,
    performance: median("performance"),
    accessibility: median("accessibility"),
    bestPractices: median("bestPractices"),
    seo: median("seo"),
    lcp: median("lcp"),
    cls: median("cls"),
    tbt: median("tbt"),
    javascriptBytes: median("javascriptBytes"),
  };
}

function fileName(path: string) {
  return path === "/" ? "hub" : path.replace(/^\//, "").replaceAll(/[^a-z0-9]+/gi, "-");
}
