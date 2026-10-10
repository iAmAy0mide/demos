import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const port = 3103;
const baseUrl = `http://127.0.0.1:${port}`;
const pages = [
  "/",
  "/work/fieldhand",
  "/work/rentbook",
  "/work/sunreach",
  "/work/meridian",
  "/work/harmattan",
];
const server = spawn("npm", ["run", "start", "--", "--port", String(port)], { stdio: "inherit" });
function metaContent(html: string, marker: string) {
  const tag = html.match(/<meta\b[^>]*>/g)?.find((candidate) => candidate.includes(marker)) ?? "";
  return tag.match(/content="([^"]+)/)?.[1] ?? "";
}
async function wait() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      if ((await fetch(baseUrl)).ok) {
        return;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("SEO server did not respond.");
}
try {
  await wait();
  const titles = new Set<string>();
  for (const route of pages) {
    const html = await (await fetch(`${baseUrl}${route}`)).text();
    const title = html.match(/<title>([^<]+)/)?.[1] ?? "";
    const description = metaContent(html, 'name="description"');
    const image = metaContent(html, 'property="og:image"');
    assert.ok(title && description && image, `Metadata missing for ${route}`);
    assert.ok(!titles.has(title), `Duplicate title ${title}`);
    titles.add(title);
    const imageResponse = await fetch(new URL(image, baseUrl));
    assert.equal(imageResponse.status, 200, `Image missing for ${route}`);
    assert.match(imageResponse.headers.get("content-type") ?? "", /image/);
    if (route === "/") {
      assert.ok(!html.includes("noindex"));
    } else {
      assert.match(html, /noindex/);
    }
  }
  console.log("SEO check passed for hub and five demo routes.");
} finally {
  server.kill("SIGTERM");
}
