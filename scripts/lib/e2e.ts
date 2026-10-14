import { spawn, type ChildProcess } from "node:child_process";
import { access, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";

import type { Browser, Page } from "playwright";

const require = createRequire(import.meta.url);
const { launchBrowser } = require("./browser.ts") as {
  launchBrowser: () => Promise<Browser>;
};

const defaultTimeout = 15_000;
const navigationTimeout = 30_000;
const testTimeout = 60_000;
const overallTimeout = 8 * 60_000;
const assertionTimeout = 3_000;
const retryDelay = 100;

export type E2EViewport = { name: string; width: number; height: number; isMobile: boolean };

export type E2ETest = {
  id: string;
  viewport: E2EViewport;
  run: (page: Page) => Promise<void>;
};

export type E2ESuite = {
  tests: E2ETest[];
  shouldPass: boolean;
};

type E2ERunnerOptions = {
  readinessUrl: string;
  suites: E2ESuite[];
};

let server: ChildProcess | undefined;

export async function runE2E({ readinessUrl, suites }: E2ERunnerOptions) {
  const port = e2ePort();
  const shutdown = (code: number) => {
    void stopServer().finally(() => process.exit(code));
  };
  const onInterrupt = () => shutdown(130);
  const onTerminate = () => shutdown(143);
  process.once("SIGINT", onInterrupt);
  process.once("SIGTERM", onTerminate);

  try {
    await ensureBrowser();
    if (process.argv.includes("--build") || !(await exists(".next/BUILD_ID"))) {
      await command("npm", ["run", "build"]);
    } else {
      console.log("build: using existing .next/BUILD_ID");
    }
    await assertPortAvailable(port);
    server = spawn(
      "npm",
      ["run", "start", "--", "--hostname", "127.0.0.1", "--port", String(port)],
      { detached: true, stdio: "inherit" },
    );
    await waitForReadiness(readinessUrl);
    await runSuites(suites);
  } finally {
    process.removeListener("SIGINT", onInterrupt);
    process.removeListener("SIGTERM", onTerminate);
    await stopServer();
  }
}

export async function retryAssert(assertion: () => Promise<void>, description: string) {
  const deadline = Date.now() + assertionTimeout;
  let failure: unknown;
  while (Date.now() < deadline) {
    try {
      await assertion();
      return;
    } catch (error) {
      failure = error;
      await wait(retryDelay);
    }
  }
  throw failure instanceof Error
    ? failure
    : new Error(`${description} did not succeed within 3 seconds.`);
}

async function runSuites(suites: E2ESuite[]) {
  const browser = await launchBrowser();
  const deadline = Date.now() + overallTimeout;
  try {
    for (const suite of suites) {
      await runSuite(browser, suite, deadline);
    }
  } finally {
    await browser.close();
  }
}

async function runSuite(browser: Browser, suite: E2ESuite, deadline: number) {
  for (const test of suite.tests) {
    if (Date.now() > deadline) {
      throw new Error("Overall timeout exceeded.");
    }
    await runTest(browser, test, suite.shouldPass);
  }
}

async function runTest(browser: Browser, test: E2ETest, shouldPass: boolean) {
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
    await withTimeout(test.run(page), testTimeout);
    console.log(
      `${shouldPass ? "PASS" : "UNEXPECTED PASS"} ${test.id} ${test.viewport.name} ${Math.round(performance.now() - start)}ms`,
    );
    if (!shouldPass) {
      process.exitCode = 1;
    }
  } catch (error) {
    const screenshot = `.screenshots/e2e/${test.id.toLowerCase()}-${Date.now()}.png`;
    await mkdir(".screenshots/e2e", { recursive: true });
    await page.screenshot({ path: screenshot, fullPage: true }).catch(() => undefined);
    console.log(
      `${shouldPass ? "FAIL" : "EXPECTED FAIL"} ${test.id} ${test.viewport.name} ${Math.round(performance.now() - start)}ms: ${errorMessage(error)} (${screenshot})`,
    );
    if (shouldPass) {
      process.exitCode = 1;
    }
  } finally {
    await context.close();
  }
}

function e2ePort() {
  return Number(process.env.E2E_PORT ?? "3100");
}

async function ensureBrowser() {
  const browser = await launchBrowser();
  await browser.close();
}

async function waitForReadiness(url: string) {
  const deadline = Date.now() + navigationTimeout;
  while (Date.now() < deadline) {
    try {
      const result = await fetch(url, { signal: AbortSignal.timeout(1_000) });
      if (result.ok) {
        console.log(`ready: ${url}`);
        return;
      }
      console.log(`ready: waiting (${result.status})`);
    } catch {
      console.log("ready: waiting");
    }
    await wait(500);
  }
  throw new Error("Server readiness timed out.");
}

async function assertPortAvailable(port: number) {
  const result = await command("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN"], true);
  if (result.output.trim()) {
    throw new Error(`Refusing to start: port ${port} is in use by:\n${result.output.trim()}`);
  }
}

function command(commandName: string, args: string[], allowFailure = false) {
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
    child.on("close", (code) => {
      if (code === 0 || allowFailure) {
        resolve({ output });
        return;
      }
      reject(new Error(`${commandName} failed with ${code}.`));
    });
  });
}

async function stopServer() {
  if (!server?.pid) {
    return;
  }
  process.kill(-server.pid, "SIGTERM");
  await Promise.race([new Promise((resolve) => server?.once("close", resolve)), wait(3_000)]);
  server = undefined;
}

function exists(path: string) {
  return access(path)
    .then(() => true)
    .catch(() => false);
}

function withTimeout<T>(promise: Promise<T>, milliseconds: number) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Test exceeded 60 seconds.")), milliseconds);
    }),
  ]);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
