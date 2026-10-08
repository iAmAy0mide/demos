import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";

import { chromium } from "playwright";

import { publishedWorks } from "../src/shared/works";

const PORT = 3102;
const BASE_URL = process.env.PREVIEW_BASE_URL ?? `http://127.0.0.1:${PORT}`;
const OUTPUT_DIRECTORY = "public/previews";
const devices = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
] as const;

function startServer() {
  return spawn("npm", ["run", "start", "--", "--port", String(PORT)], { stdio: "inherit" });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      if ((await fetch(BASE_URL)).ok) {
        return;
      }
    } catch {
      // The production server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Preview server did not respond at ${BASE_URL}.`);
}

async function capturePreviews() {
  await mkdir(OUTPUT_DIRECTORY, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const device of devices) {
      const page = await browser.newPage({
        viewport: { width: device.width, height: device.height },
      });
      for (const work of publishedWorks) {
        await page.goto(`${BASE_URL}${work.route}?embed=1`, { waitUntil: "networkidle" });
        await page.screenshot({
          path: `${OUTPUT_DIRECTORY}/${work.id}-${device.name}.webp`,
          type: "webp",
        });
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

const shouldStartServer = !process.env.PREVIEW_BASE_URL;
const server = shouldStartServer ? startServer() : undefined;
try {
  await waitForServer();
  await capturePreviews();
  console.log(`Generated ${publishedWorks.length * devices.length} WebP previews.`);
} finally {
  server?.kill("SIGTERM");
}
