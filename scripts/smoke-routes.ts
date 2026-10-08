import { spawn } from "node:child_process";

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

async function main() {
  const baseUrl = process.env.SMOKE_BASE_URL ?? DEFAULT_BASE_URL;
  const server = process.env.SMOKE_BASE_URL ? undefined : startProductionServer();

  try {
    await waitForServer(baseUrl);
    for (const route of ROUTES) {
      await checkRoute(baseUrl, route);
    }
    console.log(`Smoke test passed: ${ROUTES.length} routes at ${baseUrl}.`);
  } finally {
    server?.kill("SIGTERM");
  }
}

await main();
