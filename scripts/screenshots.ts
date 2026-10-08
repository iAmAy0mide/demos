import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";

import { chromium } from "playwright";

const OUTPUT_DIRECTORY = ".screenshots";
const DEVELOPMENT_PORT = 3100;
const DEFAULT_BASE_URL = `http://127.0.0.1:${DEVELOPMENT_PORT}`;
const EXISTING_SERVER_URL = "http://127.0.0.1:3000";
const DEFAULT_ROUTES = [
  "/",
  "/work/rentbook",
  "/work/rentbook/rent-roll",
  "/work/rentbook/tenants",
  "/work/rentbook/properties",
  "/work/rentbook/payments",
  "/work/rentbook/reports",
  "/work/rentbook/maintenance",
];
const ROUTES = process.env.SCREENSHOT_ROUTES?.split(",").filter(Boolean) ?? DEFAULT_ROUTES;
const VIEWPORTS = [
  { name: "desktop", width: 1296, height: 640 },
  { name: "wide", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 360, height: 740 },
];

function routeFileName(route: string) {
  return route.replace(/^\//, "").replaceAll("/", "-");
}

async function waitForServer(baseUrl: string) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) {
        return;
      }
    } catch {
      // The development server has not started listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`The development server did not respond at ${baseUrl}.`);
}

async function serverIsAvailable(baseUrl: string) {
  try {
    return (await fetch(baseUrl)).ok;
  } catch {
    return false;
  }
}

function startDevelopmentServer() {
  return spawn("npm", ["run", "dev", "--", "--port", String(DEVELOPMENT_PORT)], {
    stdio: "inherit",
  });
}

async function captureScreenshots(baseUrl: string) {
  await mkdir(OUTPUT_DIRECTORY, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const viewport of VIEWPORTS) {
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
      });
      for (const route of ROUTES) {
        await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
        const filePrefix = `${routeFileName(route)}-${viewport.name}`;
        await page.screenshot({ path: `${OUTPUT_DIRECTORY}/${filePrefix}-viewport.png` });
        await page.screenshot({
          path: `${OUTPUT_DIRECTORY}/${filePrefix}-full.png`,
          fullPage: true,
        });
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

async function main() {
  const externalBaseUrl = process.env.SCREENSHOT_BASE_URL;
  const existingServer = externalBaseUrl ? false : await serverIsAvailable(EXISTING_SERVER_URL);
  const baseUrl = externalBaseUrl ?? (existingServer ? EXISTING_SERVER_URL : DEFAULT_BASE_URL);
  const server = externalBaseUrl || existingServer ? undefined : startDevelopmentServer();

  try {
    await waitForServer(baseUrl);
    await captureScreenshots(baseUrl);
    console.log(`Saved screenshots to ${OUTPUT_DIRECTORY}.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown screenshot failure.";
    if (message.includes("Executable doesn't exist")) {
      console.warn(
        "Playwright is installed but Chromium is unavailable. Run `npx playwright install chromium` when browser downloads are permitted.",
      );
      return;
    }
    throw error;
  } finally {
    server?.kill("SIGTERM");
  }
}

await main();
