import { chromium } from "playwright";

export function launchBrowser() {
  return chromium.launch();
}
