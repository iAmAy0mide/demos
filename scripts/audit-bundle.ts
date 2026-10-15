import { readFile, stat } from "node:fs/promises";

import { auditRoutes } from "./lib/routes.ts";

const LIBRARY_SIGNATURES = {
  motion: "visualElement",
  gsap: "ScrollTrigger",
  "dnd-kit": "DndContext",
  recharts: "recharts",
  three: "WebGLRenderer",
} as const;
const rootManifest = JSON.parse(await readFile(".next/build-manifest.json", "utf8")) as {
  rootMainFiles: string[];
};

for (const route of auditRoutes) {
  const manifestPath = manifestFor(route.path);
  const source = await readFile(manifestPath, "utf8").catch(() => "");
  const chunks = new Set(
    [...rootManifest.rootMainFiles, ...source.matchAll(/static\/chunks\/[^"]+\.js/g)].map(
      (match) => (typeof match === "string" ? match : match[0]),
    ),
  );
  const sources = await Promise.all(
    [...chunks].map((chunk) => readFile(`.next/${chunk}`, "utf8").catch(() => "")),
  );
  const bytes = await Promise.all(
    [...chunks].map((chunk) =>
      stat(`.next/${chunk}`)
        .then((file) => file.size)
        .catch(() => 0),
    ),
  );
  const libraries = Object.entries(LIBRARY_SIGNATURES)
    .filter(([, signature]) => sources.some((chunk) => chunk.includes(signature)))
    .map(([library]) => library);
  const unexpected = libraries.filter(
    (library) => library === "motion" && !["hub", "meridian"].includes(route.demo),
  );
  console.log(
    `${route.path}\t${bytes.reduce((sum, value) => sum + value, 0)}\t${libraries.join(",") || "none"}\t${unexpected.length ? `UNUSED:${unexpected.join(",")}` : "ok"}`,
  );
}

function manifestFor(route: string) {
  const pathname = route.split("?")[0];
  if (pathname === "/") {
    return ".next/server/app/(hub)/page_client-reference-manifest.js";
  }
  if (pathname === "/audit-route-not-found") {
    return ".next/server/app/_not-found/page_client-reference-manifest.js";
  }
  const dynamic = pathname
    .replace(/\/services\/[^/]+$/, "/services/[slug]")
    .replace(/\/coffees\/[^/]+$/, "/coffees/[slug]")
    .replace(/\/journal\/[^/]+$/, "/journal/[slug]")
    .replace(/\/tenants\/[^/]+$/, "/tenants/[id]")
    .replace(/\/properties\/[^/]+$/, "/properties/[id]");
  return `.next/server/app${dynamic}/page_client-reference-manifest.js`;
}
