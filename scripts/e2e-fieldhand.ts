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
const desktop = { name: "desktop", width: 1296, height: 640, isMobile: false };
const phone = { name: "phone", width: 390, height: 844, isMobile: true };
const schedulePhones = [
  { name: "phone-320", width: 320, height: 568, isMobile: true },
  { name: "phone-360", width: 360, height: 740, isMobile: true },
  phone,
  { name: "phone-412", width: 412, height: 915, isMobile: true },
];
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
      const assign = page.locator('[data-testid^="job-card-assign-"]:visible').first();
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
      await visibleMenuTrigger(page).click();
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
      await page.getByTestId("search-trigger").filter({ hasText: "Search jobs" }).click();
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
      await visibleAssignControl(p).click();
      await visible(p.getByTestId("assign-picker"), "assignment picker");
    },
  },
  {
    id: "B2",
    viewport: desktop,
    run: async (p) => {
      await board(p);
      await visibleAssignControl(p)
        .locator("xpath=ancestor::article")
        .getByTestId(/job-card-menu-/)
        .click();
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
      await createJobFromButton(p);
      await createJobFromShortcut(p);
      await createJobFromPalette(p);
    },
  },
  {
    id: "B4",
    viewport: phone,
    run: async (p) => {
      for (const route of ["", "/schedule", "/quotes"]) {
        await board(p);
        const unassignedBefore = await count(p.getByTestId("stat-unassigned"));
        const columnBefore = await count(p.getByTestId("board-column-count-unassigned"));
        await p.goto(`${boardUrl}${route}`, { waitUntil: "domcontentloaded" });
        await p.getByTestId("bottom-tab-new-job").click();
        await submitAndViewBoard(p, `phone ${route || "board"}`, unassignedBefore, columnBefore);
      }
    },
  },
  {
    id: "B5",
    viewport: phone,
    run: async (p) => {
      for (const viewport of schedulePhones) {
        await p.setViewportSize(viewport);
        await p.goto(`${boardUrl}/schedule`, { waitUntil: "domcontentloaded" });
        const overflow = await p.evaluate(() => {
          const isInsideIntentionalScroller = (element: Element | null) => {
            for (let current = element; current; current = current.parentElement) {
              if (current.getAttribute("data-scroll-x") === "intentional") {
                return true;
              }
            }
            return false;
          };
          return [...document.querySelectorAll<HTMLElement>("body *")]
            .filter((element) => {
              const rect = element.getBoundingClientRect();
              return (
                rect.width > 0 &&
                rect.height > 0 &&
                !isInsideIntentionalScroller(element) &&
                rect.right > innerWidth + 1
              );
            })
            .map((element) => element.getAttribute("data-testid") ?? element.tagName);
        });
        if (overflow.length) {
          throw new Error(`Schedule overflow at ${viewport.width}px: ${overflow.join(", ")}.`);
        }
        const rightEdges = await p
          .getByTestId(/schedule-block-/)
          .evaluateAll((blocks) => blocks.map((block) => block.getBoundingClientRect().right));
        if (rightEdges.some((right) => right > viewport.width - 4)) {
          throw new Error(`Schedule block lacks a 4px right margin at ${viewport.width}px.`);
        }
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
      await p.getByTestId("job-drawer").waitFor({ state: "visible", timeout: 1_000 });
    },
  },
  {
    id: "B7",
    viewport: desktop,
    run: async (p) => {
      await board(p);
      await visibleMenuTrigger(p).click();
      await p.mouse.click(5, 5);
      await hidden(p.getByTestId("job-menu"), "outside dismissal");
      await visibleMenuTrigger(p).click();
      await p.getByTestId("filters-button").focus();
      await hidden(p.getByTestId("job-menu"), "focus-leave dismissal");
      await visibleMenuTrigger(p).click();
      await p.keyboard.press("Escape");
      await hidden(p.getByTestId("job-menu"), "Escape dismissal");
      await p.locator('[data-testid^="job-card-menu-"]:visible').nth(1).click();
      if ((await p.getByTestId("job-menu").count()) > 1) {
        throw new Error("More than one menu is open.");
      }
    },
  },
];

const resolvedBugs = new Set(["B1", "B2", "B3", "B4", "B5", "B7"]);

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
    await run(
      browser,
      bugs.filter((test) => resolvedBugs.has(test.id)),
      true,
    );
    await run(
      browser,
      bugs.filter((test) => !resolvedBugs.has(test.id)),
      false,
    );
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
async function createJobFromButton(page: Page) {
  await board(page);
  const unassignedBefore = await count(page.getByTestId("stat-unassigned"));
  const columnBefore = await count(page.getByTestId("board-column-count-unassigned"));
  await page.getByTestId("new-job-button").click();
  await submitAndViewBoard(page, "desktop button", unassignedBefore, columnBefore);
}
async function createJobFromShortcut(page: Page) {
  await board(page);
  const unassignedBefore = await count(page.getByTestId("stat-unassigned"));
  const columnBefore = await count(page.getByTestId("board-column-count-unassigned"));
  await page.goto(`${boardUrl}/schedule`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(150);
  await page.keyboard.press("c");
  await submitAndViewBoard(page, "desktop shortcut", unassignedBefore, columnBefore);
}
async function createJobFromPalette(page: Page) {
  await board(page);
  const unassignedBefore = await count(page.getByTestId("stat-unassigned"));
  const columnBefore = await count(page.getByTestId("board-column-count-unassigned"));
  await page.goto(`${boardUrl}/quotes`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("search-trigger").filter({ hasText: "Search jobs" }).click();
  await visible(page.getByTestId("command-palette"), "command palette");
  await page.getByRole("button", { name: "Create job" }).click();
  await submitAndViewBoard(page, "command palette", unassignedBefore, columnBefore);
}
async function submitAndViewBoard(
  page: Page,
  source: string,
  unassignedBefore: number,
  columnBefore: number,
) {
  await visible(page.getByTestId("create-job-dialog"), `new job from ${source}`);
  await visible(page.getByTestId("create-job-title"), "create job title");
  if (source === "desktop shortcut" || source === "phone /quotes") {
    await page.screenshot({
      path: `.screenshots/e2e/create-job-${source.replaceAll(" ", "-").replaceAll("/", "")}.png`,
    });
  }
  const title = `E2E ${source} ${Date.now()}`;
  await page.locator("#job-title").fill(title);
  await page.getByTestId("create-job-submit").click();
  await hidden(page.getByTestId("create-job-dialog"), "create job dialog");
  const toast = page.getByTestId("toast").filter({ hasText: /Job VL-\d+ created/ });
  await visible(toast, "job created toast");
  await toast.getByRole("link", { name: "View on board" }).click();
  await visible(page.getByTestId("board"), "board after job creation");
  const unassignedAfter = await count(page.getByTestId("stat-unassigned"));
  if (unassignedAfter !== unassignedBefore + 1) {
    throw new Error(
      `Unassigned stat did not rise from ${unassignedBefore} to ${unassignedBefore + 1}.`,
    );
  }
  const columnAfter = await count(page.getByTestId("board-column-count-unassigned"));
  if (columnAfter !== columnBefore + 1) {
    throw new Error(`Unassigned column did not rise from ${columnBefore} to ${columnBefore + 1}.`);
  }
  const job = page.locator('[data-testid^="job-card-"]:visible').filter({ hasText: title });
  await visible(job, "created unassigned card");
}
async function count(locator: Locator) {
  const value = await locator.textContent();
  const match = value?.match(/\d+/);
  if (!match) {
    throw new Error("Count was not available.");
  }
  return Number(match[0]);
}
function visibleAssignControl(page: Page) {
  return page.locator('[data-testid^="job-card-assign-"]:visible').first();
}
function visibleMenuTrigger(page: Page) {
  return page.locator('[data-testid^="job-card-menu-"]:visible').first();
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
  void page;
  const until = Date.now() + 3_000;
  let failure: unknown;
  while (Date.now() < until) {
    try {
      await source.dragTo(target, { timeout: 3_000 });
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
