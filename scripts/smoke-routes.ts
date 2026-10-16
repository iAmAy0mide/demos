import { spawn } from "node:child_process";

import { chromium } from "playwright";

import { auditRoutes, type AuditRoute } from "./lib/routes.ts";

const DEFAULT_PORT = 3101;
const DEFAULT_BASE_URL = `http://127.0.0.1:${DEFAULT_PORT}`;
const FAILURE_MARKERS = ["Build Error", "Module not found", "Application error"];
type StyleExpectation = { token: string; font: string; selector: string };

const STYLE_EXPECTATIONS: Record<(typeof auditRoutes)[number]["demo"], StyleExpectation> = {
  hub: { token: "--axm-ink", font: "Schibsted Grotesk", selector: ".axmion-hub" },
  fieldhand: { token: "--fld-canvas", font: "Geist", selector: ".fieldhand-demo" },
  sunreach: { token: "--sun-navy", font: "DM Sans", selector: ".sunreach-demo" },
  meridian: { token: "--mrd-carbon", font: "Archivo", selector: ".meridian-demo" },
  harmattan: { token: "--hrm-espresso", font: "Fraunces", selector: ".harmattan-demo" },
  rentbook: { token: "--rbk-ink", font: "Hanken Grotesk", selector: ".rentbook-demo" },
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

async function checkRoute(baseUrl: string, route: AuditRoute) {
  const response = await fetch(`${baseUrl}${route.path}`);
  const body = await response.text();
  const marker = FAILURE_MARKERS.find((failureMarker) => body.includes(failureMarker));

  if (response.status !== (route.expectedStatus ?? 200) || marker) {
    const reason = marker
      ? `response contains \"${marker}\"`
      : `returned ${response.status}, expected ${route.expectedStatus ?? 200}`;
    throw new Error(`${route.path} ${reason}.`);
  }
  console.log(`PASS ${response.status} ${route.path}`);
}

async function checkStyles(baseUrl: string) {
  const browser = await chromium.launch();
  try {
    for (const route of auditRoutes) {
      const page = await browser.newPage();
      const errors: string[] = [];
      const failed: string[] = [];
      page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
      page.on("requestfailed", (request) => failed.push(request.url()));
      await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
      const expectation = STYLE_EXPECTATIONS[route.demo];
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
          `Style failure ${route.path}: ${JSON.stringify({ brokenSheet, result, errors, failed })}`,
        );
      }
      console.log(`STYLE PASS ${route.path}`);
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
    for (const route of auditRoutes) {
      await checkRoute(baseUrl, route);
    }
    await checkStyles(baseUrl);
    console.log(`Smoke test passed: ${auditRoutes.length} routes at ${baseUrl}.`);
  } finally {
    server?.kill("SIGTERM");
  }
}

await main();
