import { chromium } from "playwright";

import { withProductionServer } from "./lib/e2e.ts";
import { auditRoutes } from "./lib/routes.ts";

type WindowWithAuditFrames = Window & { __auditFrameCount?: number };

await withProductionServer(async (baseUrl) => {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      viewport: { width: 1296, height: 640 },
      reducedMotion: "reduce",
    });
    await context.addInitScript(() => {
      const auditWindow = window as WindowWithAuditFrames;
      auditWindow.__auditFrameCount = 0;
      const nativeRequest = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (callback) =>
        nativeRequest((time) => {
          auditWindow.__auditFrameCount = (auditWindow.__auditFrameCount ?? 0) + 1;
          callback(time);
        });
    });
    const page = await context.newPage();
    for (const route of auditRoutes) {
      await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2_000);
      const result = await page.evaluate(() => {
        const animations = document.getAnimations().filter((animation) => {
          const timing = animation.effect?.getComputedTiming();
          const duration = typeof timing?.duration === "number" ? timing.duration : 0;
          return (
            animation.playState === "running" && (duration > 100 || timing?.iterations === Infinity)
          );
        });
        const auditWindow = window as WindowWithAuditFrames;
        return {
          animations: animations.map((animation) => ({
            playState: animation.playState,
            timing: animation.effect?.getComputedTiming(),
          })),
          rafCallbacks: auditWindow.__auditFrameCount ?? 0,
          canvases: document.querySelectorAll("canvas").length,
          scrollTimelineAnimations: animations.filter(
            (animation) => animation.timeline?.constructor.name === "ScrollTimeline",
          ).length,
        };
      });
      console.log(`motion ${route.path}: ${JSON.stringify(result)}`);
    }
    await context.close();
  } finally {
    await browser.close();
  }
});
