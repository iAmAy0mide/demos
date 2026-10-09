import { spawn, type ChildProcess } from "node:child_process";
import { access } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { launchBrowser } = require("./lib/browser.ts") as {
  launchBrowser: () => Promise<Browser>;
};

import type { Browser, Locator, Page } from "playwright";

const port = Number(process.env.E2E_PORT ?? "3100");
const baseUrl = `http://127.0.0.1:${port}`;
const boardUrl = `${baseUrl}/work/fieldhand`;
const defaultTimeout = 15_000;
const navigationTimeout = 30_000;
const testTimeout = 60_000;
const overallTimeout = 8 * 60_000;
const desktop = { name: "desktop", width: 1440, height: 900, isMobile: false };
const phone = { name: "phone", width: 390, height: 844, isMobile: true };
type Viewport = { name: string; width: number; height: number; isMobile: boolean };
type Test = { id: string; viewport: Viewport; run: (page: Page) => Promise<void> };
let server: ChildProcess | undefined;

const protectedTests: Test[] = [
  {
    id: "P1",
    viewport: desktop,
    run: async (page) => {
      await board(page);
      for (const id of ["stat-jobs-today", "stat-unassigned", "stat-revenue", "stat-on-time"]) {
        await visible(page.getByTestId(id), id);
      }
      for (const status of ["unassigned", "scheduled", "en_route", "on_site", "done"]) {
        await visible(page.getByTestId(`board-column-${status}`), status);
        await visible(page.getByTestId(`board-column-count-${status}`), `${status} count`);
      }
    },
  },
  {
    id: "P2",
    viewport: desktop,
    run: async (page) => {
      await board(page);
      const assign = page.getByTestId(/job-card-assign-/).first();
      await visible(assign, "assign control");
      await assign.click();
    },
  },
  {
    id: "P3",
    viewport: desktop,
    run: async (page) => {
      await board(page);
      const target = page.getByTestId("board-column-on_site");
      await drag(
        page,
        page
          .getByTestId("board-column-scheduled")
          .getByTestId(/job-card-/)
          .first(),
        target,
      );
      await visible(target.getByTestId(/job-card-/).first(), "moved assigned job");
      await drag(
        page,
        page
          .getByTestId("board-column-unassigned")
          .getByTestId(/job-card-/)
          .first(),
        target,
      );
      console.log("INFO P3 unassigned drag attempted; assignment guard determines its result.");
    },
  },
  {
    id: "P4",
    viewport: desktop,
    run: async (page) => {
      await board(page);
      const card = page.getByTestId(/job-card-/).first();
      await card.getByTestId(/job-card-menu-/).click();
      const menu = page.getByTestId("job-menu");
      await visible(menu, "menu");
      await visible(menu.getByTestId("job-menu-item-open"), "Open");
      await visible(menu.getByTestId(/job-menu-item-move-to-/).first(), "move action");
    },
  },
  {
    id: "P5",
    viewport: phone,
    run: async (page) => {
      await board(page);
      await page.getByTestId("status-tab-scheduled").click();
      await page.getByTestId("filters-button").click();
      await visible(page.getByTestId("filters-sheet"), "filters sheet");
    },
  },
  {
    id: "P6",
    viewport: desktop,
    run: async (page) => {
      await board(page);
      await page.getByTestId("search-trigger").click();
      await visible(page.getByTestId("command-palette"), "palette");
      await page.keyboard.press("Escape");
      await hidden(page.getByTestId("command-palette"), "palette");
    },
  },
  {
    id: "P7",
    viewport: phone,
    run: async (page) => {
      await board(page);
      await page.getByTestId("axmion-pill").getByRole("button", { name: "Axmion" }).click();
      await page.getByTestId("bottom-tab-schedule").click();
      await visible(page.getByTestId("schedule-timeline"), "schedule");
    },
  },
  {
    id: "P8",
    viewport: phone,
    run: async (page) => {
      await page.goto(`${boardUrl}/schedule`, { waitUntil: "domcontentloaded" });
      await visible(page.getByTestId("schedule-timeline"), "timeline");
      await visible(page.getByTestId(/technician-chip-/).first(), "technician");
      await visible(page.getByTestId(/schedule-block-/).first(), "job block");
    },
  },
];
const bugs: Test[] = [
  {
    id: "B1",
    viewport: desktop,
    run: async (p) => {
      await board(p);
      await p
        .getByTestId(/job-card-assign-/)
        .first()
        .click();
      await visible(p.getByTestId("assign-picker"), "assignment picker");
    },
  },
  {
    id: "B2",
    viewport: desktop,
    run: async (p) => {
      await board(p);
      const c = p
        .getByTestId(/job-card-/)
        .filter({ has: p.getByTestId(/job-card-assign-/) })
        .first();
      await c.getByTestId(/job-card-menu-/).click();
      await visible(p.getByTestId("job-menu-item-assign"), "menu assignment");
    },
  },
  {
    id: "B3",
    viewport: desktop,
    run: async (p) => {
      await board(p);
      await drag(
        p,
        p
          .getByTestId("board-column-unassigned")
          .getByTestId(/job-card-/)
          .first(),
        p.getByTestId("board-column-en_route"),
      );
      await visible(p.getByTestId("assign-picker"), "active-status assignment picker");
    },
  },
  {
    id: "B4",
    viewport: desktop,
    run: async (p) => {
      for (const route of ["", "/schedule", "/quotes"]) {
        await p.goto(`${boardUrl}${route}`, { waitUntil: "domcontentloaded" });
        await p.getByTestId("bottom-tab-new-job").click();
        await visible(p.getByTestId("create-job-dialog"), `new job on ${route || "board"}`);
      }
    },
  },
  {
    id: "B5",
    viewport: phone,
    run: async (p) => {
      await p.goto(`${boardUrl}/schedule`, { waitUntil: "domcontentloaded" });
      const width = await p.evaluate(() => document.scrollingElement?.scrollWidth ?? 0);
      if (width > phone.width) {
        throw new Error(`Schedule scroll width is ${width}px.`);
      }
    },
  },
  {
    id: "B6",
    viewport: phone,
    run: async (p) => {
      await p.goto(`${boardUrl}/schedule`, { waitUntil: "domcontentloaded" });
      await p
        .getByTestId(/schedule-block-/)
        .first()
        .click();
      await visible(p.getByTestId("job-drawer"), "job drawer");
    },
  },
  {
    id: "B7",
    viewport: desktop,
    run: async (p) => {
      await board(p);
      const cards = p.getByTestId(/job-card-/);
      await cards
        .first()
        .getByTestId(/job-card-menu-/)
        .click();
      await p.mouse.click(5, 5);
      await hidden(p.getByTestId("job-menu"), "outside dismissal");
      await cards
        .first()
        .getByTestId(/job-card-menu-/)
        .click();
      await p.keyboard.press("Escape");
      await hidden(p.getByTestId("job-menu"), "Escape dismissal");
      await cards
        .nth(1)
        .getByTestId(/job-card-menu-/)
        .click();
      if ((await p.getByTestId("job-menu").count()) > 1) {
        throw new Error("More than one menu is open.");
      }
    },
  },
];

process.on("SIGINT", () => void shutdown(130));
process.on("SIGTERM", () => void shutdown(143));
try {
  await ensureBrowser();
  if (process.argv.includes("--build") || !(await exists(".next/BUILD_ID"))) {
    await command("npm", ["run", "build"]);
  } else {
    console.log("build: using existing .next/BUILD_ID");
  }
  await available();
  server = spawn("npm", ["run", "start", "--", "--hostname", "127.0.0.1", "--port", String(port)], {
    detached: true,
    stdio: "inherit",
  });
  await ready();
  const browser = await launchBrowser();
  try {
    await run(browser, protectedTests, true);
    await run(browser, bugs, false);
  } finally {
    await browser.close();
  }
} finally {
  await stop();
}

async function board(page: Page) {
  await page.goto(boardUrl, { waitUntil: "domcontentloaded" });
  await visible(page.getByTestId("board"), "board");
}
async function ensureBrowser() {
  const browser = await launchBrowser();
  await browser.close();
}
async function run(browser: Browser, tests: Test[], protectedTest: boolean) {
  const deadline = Date.now() + overallTimeout;
  for (const test of tests) {
    if (Date.now() > deadline) {
      throw new Error("Overall timeout exceeded.");
    }
    const start = performance.now();
    const context = await browser.newContext({
      viewport: test.viewport,
      isMobile: test.viewport.isMobile,
      hasTouch: test.viewport.isMobile,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(defaultTimeout);
    page.setDefaultNavigationTimeout(navigationTimeout);
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    try {
      await timeout(test.run(page), testTimeout);
      console.log(
        `${protectedTest ? "PASS" : "UNEXPECTED PASS"} ${test.id} ${test.viewport.name} ${Math.round(performance.now() - start)}ms`,
      );
      if (!protectedTest) {
        process.exitCode = 1;
      }
    } catch (error) {
      const shot = `.screenshots/e2e/${test.id.toLowerCase()}-${Date.now()}.png`;
      await page.screenshot({ path: shot, fullPage: true }).catch(() => undefined);
      console.log(
        `${protectedTest ? "FAIL" : "EXPECTED FAIL"} ${test.id} ${test.viewport.name} ${Math.round(performance.now() - start)}ms: ${error instanceof Error ? error.message : String(error)} (${shot})`,
      );
      if (protectedTest) {
        process.exitCode = 1;
      }
    } finally {
      await context.close();
    }
  }
}
async function drag(page: Page, source: Locator, target: Locator) {
  const until = Date.now() + 3_000;
  let failure: unknown;
  while (Date.now() < until) {
    try {
      const a = await source.boundingBox(),
        b = await target.boundingBox();
      if (!a || !b) {
        throw new Error("Drag endpoint is not visible.");
      }
      const x = a.x + a.width / 2,
        y = a.y + a.height / 2;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + 16, y + 16, { steps: 10 });
      await page.mouse.move(b.x + b.width / 2, b.y + Math.min(80, b.height / 2), { steps: 10 });
      await page.mouse.up();
      return;
    } catch (error) {
      failure = error;
      await wait(100);
    }
  }
  throw failure instanceof Error ? failure : new Error("Drag retry timed out.");
}
async function visible(locator: Locator, what: string) {
  await locator.waitFor({ state: "visible" }).catch(() => {
    throw new Error(`Missing ${what}.`);
  });
}
async function hidden(locator: Locator, what: string) {
  await locator.waitFor({ state: "hidden" }).catch(() => {
    throw new Error(`${what} stayed open.`);
  });
}
async function ready() {
  const until = Date.now() + navigationTimeout;
  while (Date.now() < until) {
    try {
      const result = await fetch(boardUrl, { signal: AbortSignal.timeout(1_000) });
      if (result.ok) {
        return console.log(`ready: ${boardUrl}`);
      }
      console.log(`ready: waiting (${result.status})`);
    } catch {
      console.log("ready: waiting");
    }
    await wait(500);
  }
  throw new Error("Server readiness timed out.");
}
async function available() {
  const result = await command("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN"], true);
  if (result.output.trim()) {
    throw new Error(`Refusing to start: port ${port} is in use by:\n${result.output.trim()}`);
  }
}
async function command(commandName: string, args: string[], allowFailure = false) {
  return new Promise<{ output: string }>((resolve, reject) => {
    const child = spawn(commandName, args);
    let output = "";
    child.stdout.on("data", (data: Buffer) => {
      output += data;
      process.stdout.write(data);
    });
    child.stderr.on("data", (data: Buffer) => {
      output += data;
      process.stderr.write(data);
    });
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 || allowFailure
        ? resolve({ output })
        : reject(new Error(`${commandName} failed with ${code}.`)),
    );
  });
}
async function stop() {
  if (!server?.pid) {
    return;
  }
  process.kill(-server.pid, "SIGTERM");
  await new Promise((resolve) => server?.once("close", resolve));
  server = undefined;
}
async function shutdown(code: number) {
  await stop();
  process.exit(code);
}
function exists(path: string) {
  return access(path)
    .then(() => true)
    .catch(() => false);
}
function timeout<T>(promise: Promise<T>, milliseconds: number) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Test exceeded 60 seconds.")), milliseconds),
    ),
  ]);
}
function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
