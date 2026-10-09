import { spawn } from "node:child_process";

import { chromium } from "playwright";

const DEFAULT_PORT = 3101;
const DEFAULT_BASE_URL = `http://127.0.0.1:${DEFAULT_PORT}`;
const FAILURE_MARKERS = ["Build Error", "Module not found", "Application error"];
const ROUTES = [
  "/",
  "/work/fieldhand",
  "/work/fieldhand/quotes",
  "/work/fieldhand/schedule",
  "/work/sunreach",
  "/work/meridian",
  "/work/meridian/about",
  "/work/meridian/contact",
  "/work/meridian/quote",
  "/work/meridian/services",
  "/work/meridian/services/sea-freight",
  "/work/meridian/track",
  "/work/harmattan",
  "/work/harmattan/cafes",
  "/work/harmattan/coffees",
  "/work/harmattan/coffees/mambilla-morning",
  "/work/harmattan/journal",
  "/work/harmattan/journal/a-lagos-pour-over",
  "/work/harmattan/roast-lab",
  "/work/harmattan/story",
  "/work/harmattan/subscribe",
  "/work/harmattan/wholesale",
  "/work/rentbook",
  "/work/rentbook/maintenance",
  "/work/rentbook/payments",
  "/work/rentbook/properties",
  "/work/rentbook/rent-roll",
  "/work/rentbook/reports",
  "/work/rentbook/tenants",
];

type StyleExpectation = { token: string; font: string; selector: string };

const STYLE_EXPECTATIONS: Record<string, StyleExpectation> = {
  "/": { token: "--axm-ink", font: "Schibsted Grotesk", selector: ".axmion-hub" },
  "/work/fieldhand": { token: "--fld-canvas", font: "Geist", selector: ".fieldhand-demo" },
  "/work/sunreach": { token: "--sun-navy", font: "DM Sans", selector: ".sunreach-demo" },
  "/work/meridian": { token: "--mrd-carbon", font: "Archivo", selector: ".meridian-demo" },
  "/work/harmattan": { token: "--hrm-espresso", font: "Fraunces", selector: ".harmattan-demo" },
  "/work/rentbook": { token: "--rbk-ink", font: "Hanken Grotesk", selector: ".rentbook-demo" },
};

function startProductionServer() {
  return spawn("npm", ["run", "start", "--", "--port", String(DEFAULT_PORT)], {
    stdio: "inherit",
  });
}

async function waitForServer(baseUrl: string) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      if ((await fetch(baseUrl)).ok) {
        return;
      }
    } catch {
      // The production server has not started listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`The production server did not respond at ${baseUrl}.`);
}

async function checkRoute(baseUrl: string, route: string) {
  const response = await fetch(`${baseUrl}${route}`);
  const body = await response.text();
  const marker = FAILURE_MARKERS.find((failureMarker) => body.includes(failureMarker));

  if (!response.ok || marker) {
    const reason = marker ? `response contains \"${marker}\"` : `returned ${response.status}`;
    throw new Error(`${route} ${reason}.`);
  }
  console.log(`PASS ${response.status} ${route}`);
}

function getStyleExpectation(route: string) {
  const matchingRoute = Object.keys(STYLE_EXPECTATIONS).find(
    (candidate) => candidate !== "/" && route.startsWith(candidate),
  );
  return STYLE_EXPECTATIONS[matchingRoute ?? "/"];
}

async function checkStyles(baseUrl: string) {
  const browser = await chromium.launch();
  try {
    for (const route of ROUTES) {
      const page = await browser.newPage();
      const errors: string[] = [];
      const failed: string[] = [];
      page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
      page.on("requestfailed", (request) => failed.push(request.url()));
      await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
      const expectation = getStyleExpectation(route);
      const result = await page.evaluate(async (expected) => {
        const stylesheets = [
          ...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
        ];
        const results = await Promise.all(
          stylesheets.map(async ({ href }) => {
            const response = await fetch(href);
            return { href, ok: response.ok, length: (await response.text()).length };
          }),
        );
        const element = document.querySelector(expected.selector);
        return {
          stylesheets: results,
          token: element ? getComputedStyle(element).getPropertyValue(expected.token).trim() : "",
          font: element ? getComputedStyle(element).fontFamily : "",
        };
      }, expectation);
      const brokenSheet = result.stylesheets.find((sheet) => !sheet.ok || sheet.length === 0);
      if (
        brokenSheet ||
        !result.token ||
        !result.font.includes(expectation.font) ||
        errors.length ||
        failed.length
      ) {
        throw new Error(
          `Style failure ${route}: ${JSON.stringify({ brokenSheet, result, errors, failed })}`,
        );
      }
      console.log(`STYLE PASS ${route}`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

async function main() {
  const baseUrl = process.env.SMOKE_BASE_URL ?? DEFAULT_BASE_URL;
  const server = process.env.SMOKE_BASE_URL ? undefined : startProductionServer();

  try {
    await waitForServer(baseUrl);
    for (const route of ROUTES) {
      await checkRoute(baseUrl, route);
    }
    await checkStyles(baseUrl);
    console.log(`Smoke test passed: ${ROUTES.length} routes at ${baseUrl}.`);
  } finally {
    server?.kill("SIGTERM");
  }
}

await main();
