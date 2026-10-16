import { launchBrowser } from "./lib/browser.ts";
import { publishedWorks } from "../src/shared/works.ts";

const baseUrl = process.env.CHECK_BASE_URL ?? "http://127.0.0.1:3000";
const viewports = [
  { width: 320, height: 900 },
  { width: 390, height: 900 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
] as const;
const expectedWorkNames = publishedWorks.map((work) => work.name);

type FooterSnapshot = {
  overflow: string;
  paddingBottom: number;
  clearance: number;
  gridColumns: number;
  cta: { color: string; background: string; height: number };
  workNames: string[];
  workHeights: number[];
  workWhiteSpace: string[];
  kindCount: number;
  watermarkWidthDelta: number;
  svgWidthDelta: number;
  watermarkClearance: number;
  watermarkPointerEvents: string;
  watermarkUserSelect: string;
  bottomIsStacked: boolean;
};

const browser = await launchBrowser();
try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    const snapshot = await page.locator(".axm-footer").evaluate((footer) => {
      const grid = footer.querySelector<HTMLElement>(".axm-footer-grid");
      const cta = footer.querySelector<HTMLElement>(".axm-footer-cta");
      const bottom = footer.querySelector<HTMLElement>(".axm-footer-bottom");
      const attribution = footer.querySelector<HTMLElement>(".axm-attr");
      const backToTop = bottom?.querySelector<HTMLElement>("a[href='#content']");
      const watermark = footer.querySelector<HTMLElement>(".axm-footer-watermark");
      const watermarkSvg = watermark?.querySelector<SVGElement>("svg");
      if (!grid || !cta || !bottom || !attribution || !backToTop || !watermark || !watermarkSvg) {
        throw new Error("Footer structure is incomplete.");
      }
      const ctaStyle = getComputedStyle(cta);
      const footerStyle = getComputedStyle(footer);
      const watermarkStyle = getComputedStyle(watermark);
      const gridBox = grid.getBoundingClientRect();
      const bottomBox = bottom.getBoundingClientRect();
      const attributionBox = attribution.getBoundingClientRect();
      const backToTopBox = backToTop.getBoundingClientRect();
      const watermarkBox = watermark.getBoundingClientRect();
      const svgBox = watermarkSvg.getBoundingClientRect();
      const workLinks = [...footer.querySelectorAll<HTMLElement>(".axm-footer-work a")];
      return {
        overflow: footerStyle.overflow,
        paddingBottom: Number.parseFloat(footerStyle.paddingBottom),
        clearance: Number.parseFloat(footerStyle.getPropertyValue("--axm-footer-shell-clearance")),
        gridColumns: getComputedStyle(grid).gridTemplateColumns.split(" ").length,
        cta: {
          color: ctaStyle.color,
          background: ctaStyle.backgroundColor,
          height: cta.getBoundingClientRect().height,
        },
        workNames: workLinks.map((link) => link.childNodes[0]?.textContent?.trim() ?? ""),
        workHeights: workLinks.map((link) => link.getBoundingClientRect().height),
        workWhiteSpace: workLinks.map((link) => getComputedStyle(link).whiteSpace),
        kindCount: footer.querySelectorAll(".axm-footer-work small").length,
        watermarkWidthDelta: Math.abs(watermarkBox.width - gridBox.width),
        svgWidthDelta: Math.abs(svgBox.width - watermarkBox.width),
        watermarkClearance: watermarkBox.top - bottomBox.bottom,
        watermarkPointerEvents: watermarkStyle.pointerEvents,
        watermarkUserSelect: watermarkStyle.userSelect,
        bottomIsStacked: backToTopBox.top >= attributionBox.bottom,
      };
    });
    const failures = validateFooter(snapshot, viewport.width);
    if (failures.length) {
      throw new Error(`Footer failures at ${viewport.width}px: ${failures.join(" | ")}`);
    }
    console.log(`footer ${viewport.width}x${viewport.height}: pass`);
    await page.close();
  }
} finally {
  await browser.close();
}

function validateFooter(snapshot: FooterSnapshot, width: number) {
  return [
    ...validateFooterStructure(snapshot, width),
    ...validateFooterCta(snapshot),
    ...validateFooterWork(snapshot),
    ...validateFooterWatermark(snapshot),
    ...validatePhoneFooter(snapshot, width),
  ];
}

function validateFooterStructure(snapshot: FooterSnapshot, width: number) {
  const failures: string[] = [];
  if (snapshot.overflow !== "hidden") {
    failures.push("footer overflow is not hidden");
  }
  if (snapshot.gridColumns !== getExpectedColumnCount(width)) {
    failures.push("footer grid columns regressed");
  }
  return failures;
}

function validateFooterCta(snapshot: FooterSnapshot) {
  const failures: string[] = [];
  if (snapshot.cta.color !== "rgb(4, 19, 28)") {
    failures.push("CTA ink color is overridden");
  }
  if (snapshot.cta.background !== "rgb(0, 179, 235)") {
    failures.push("CTA background regressed");
  }
  if (snapshot.cta.height < 48) {
    failures.push("CTA is under 48px");
  }
  return failures;
}

function validateFooterWork(snapshot: FooterSnapshot) {
  const failures: string[] = [];
  if (snapshot.workNames.join("|") !== expectedWorkNames.join("|")) {
    failures.push("published work names do not match the registry");
  }
  if (snapshot.kindCount) {
    failures.push("work kind tags returned");
  }
  if (snapshot.workHeights.some((height) => height < 44)) {
    failures.push("work row is under 44px");
  }
  if (snapshot.workWhiteSpace.some((value) => value !== "nowrap")) {
    failures.push("work name wraps");
  }
  return failures;
}

function validateFooterWatermark(snapshot: FooterSnapshot) {
  const failures: string[] = [];
  if (snapshot.watermarkWidthDelta > 1 || snapshot.svgWidthDelta > 1) {
    failures.push("watermark does not span the container");
  }
  if (snapshot.watermarkClearance < 23.5) {
    failures.push("watermark lacks 24px clearance");
  }
  if (snapshot.watermarkPointerEvents !== "none") {
    failures.push("watermark captures pointers");
  }
  if (snapshot.watermarkUserSelect !== "none") {
    failures.push("watermark is selectable");
  }
  return failures;
}

function validatePhoneFooter(snapshot: FooterSnapshot, width: number) {
  if (width >= 480) {
    return [];
  }
  const failures: string[] = [];
  if (!snapshot.bottomIsStacked) {
    failures.push("phone bottom bar is not stacked");
  }
  if (snapshot.paddingBottom < snapshot.clearance) {
    failures.push("phone footer lacks shell clearance");
  }
  return failures;
}

function getExpectedColumnCount(width: number) {
  if (width < 480) {
    return 1;
  }
  if (width < 1024) {
    return 2;
  }
  return 4;
}
