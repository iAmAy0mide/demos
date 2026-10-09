import { launchBrowser } from "./lib/browser";

try {
  const browser = await launchBrowser();
  await browser.close();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("Executable doesn't exist")) {
    console.error(
      "Chromium for Playwright is not installed. Run once: npx playwright install chromium",
    );
    process.exitCode = 1;
  } else {
    throw error;
  }
}
