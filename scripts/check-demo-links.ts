import { chromium, type Page } from "playwright";

const baseUrl = process.env.CHECK_BASE_URL ?? "http://127.0.0.1:3000";
const viewports = [320, 360, 390, 412, 768, 1440] as const;
const VIEWPORT_HEIGHT = 900;

type ElementMeasurement = {
  label: string;
  height: number;
  width: number;
  parentWidth: number;
  whiteSpace: string;
};

const browser = await chromium.launch();
try {
  for (const width of viewports) {
    const page = await browser.newPage({ viewport: { width, height: VIEWPORT_HEIGHT } });
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    const failures = await inspectDemoLinks(page, width < 640);
    if (failures.length) {
      throw new Error(`Demo link failures at ${width}px: ${failures.join(" | ")}`);
    }
    console.log(`demo links ${width}x${VIEWPORT_HEIGHT}: pass`);
    await page.close();
  }
} finally {
  await browser.close();
}

async function inspectDemoLinks(page: Page, isPhone: boolean) {
  const [unsafeLinks, caseActions, supportingLinks, previewControls] = await Promise.all([
    findUnsafeLinks(page),
    measureElements(page, ".axm-case-primary, .axm-case-secondary"),
    measureElements(page, ".axm-service-work-link, .axm-principle-panel .axm-button"),
    isPhone ? measureElements(page, ".axm-device-toggle button, .axm-interact-button") : [],
  ]);
  return [
    ...unsafeLinks.map((href) => `${href} missing new-tab safety`),
    ...validateCaseActions(caseActions, isPhone),
    ...validateSupportingLinks(supportingLinks),
    ...validatePreviewControls(previewControls),
  ];
}

function findUnsafeLinks(page: Page) {
  return page.locator('a[href^="/work/"]').evaluateAll((links) =>
    links.flatMap((element) => {
      const link = element as HTMLAnchorElement;
      return link.target !== "_blank" || !link.rel.split(/\s+/).includes("noopener")
        ? [link.getAttribute("href") ?? "unknown link"]
        : [];
    }),
  );
}

function measureElements(page: Page, selector: string) {
  return page.locator(selector).evaluateAll((elements): ElementMeasurement[] =>
    elements.map((element) => {
      const item = element as HTMLElement;
      const box = item.getBoundingClientRect();
      return {
        label: item.textContent?.trim() ?? "unnamed element",
        height: box.height,
        width: box.width,
        parentWidth: item.parentElement?.getBoundingClientRect().width ?? 0,
        whiteSpace: getComputedStyle(item).whiteSpace,
      };
    }),
  );
}

function validateCaseActions(actions: ElementMeasurement[], isPhone: boolean) {
  const failures: string[] = [];
  for (const action of actions) {
    if (action.height < 48) {
      failures.push(`${action.label} is ${action.height}px tall`);
    }
    if (action.whiteSpace !== "nowrap") {
      failures.push(`${action.label} can wrap`);
    }
    if (isPhone && Math.abs(action.width - action.parentWidth) > 1) {
      failures.push(`${action.label} is not full width`);
    }
  }
  return failures;
}

function validateSupportingLinks(links: ElementMeasurement[]) {
  const failures: string[] = [];
  for (const link of links) {
    if (link.height < 44) {
      failures.push(`${link.label} is under 44px`);
    }
    if (link.whiteSpace !== "nowrap") {
      failures.push(`${link.label} can wrap`);
    }
  }
  return failures;
}

function validatePreviewControls(controls: ElementMeasurement[]) {
  return controls.flatMap((control) =>
    control.height < 44 ? [`${control.label} preview control is under 44px`] : [],
  );
}
