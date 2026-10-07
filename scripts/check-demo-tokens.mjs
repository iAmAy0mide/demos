import { readdir, readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const demos = [["fieldhand", "fld"], ["rentbook", "rbk"], ["sunreach", "sun"], ["meridian", "mrd"], ["harmattan", "hrm"], ["hub", "axm"]];
async function collectFiles(directory) { const entries = await readdir(directory, { withFileTypes: true }); return (await Promise.all(entries.map((entry) => entry.isDirectory() ? collectFiles(new URL(`${entry.name}/`, directory)) : [new URL(entry.name, directory)]))).flat(); }

async function verifyScopedClasses(name, directory, prefix) {
  const files = await collectFiles(directory);
  const sources = await Promise.all(files.map(async (file) => [file, await readFile(file, "utf8")]));
  const referenced = new Set();
  const defined = new Set();
  const classPattern = new RegExp(`(?<!-)\\b${prefix}-[a-z0-9-]+\\b`, "g");

  for (const [file, source] of sources) {
    if (file.pathname.endsWith(".css")) {
      for (const match of source.matchAll(classPattern)) defined.add(match[0]);
      continue;
    }
    for (const match of source.matchAll(classPattern)) referenced.add(match[0]);
  }

  const missing = [...referenced].filter((className) => !defined.has(className));
  if (missing.length) {
    console.error(`Undefined ${name} CSS classes: ${missing.join(", ")}`);
    process.exitCode = 1;
  }
}

for (const [demo, prefix] of demos) {
  const demoRoot = new URL(`src/demos/${demo}/`, root);
  const css = await readFile(new URL("styles/tokens.css", demoRoot), "utf8");
  const defined = [...css.matchAll(new RegExp(`--${prefix}-([a-z-]+):`, "g"))].map((match) => match[1]);
  const source = (await Promise.all((await collectFiles(demoRoot)).map((file) => readFile(file, "utf8")))).join("\n");
  const refs = [...source.matchAll(new RegExp(`var\\(--${prefix}-([a-z-]+)`, "g"))].map((match) => match[1]);
  const missing = [...new Set(refs.filter((token) => !defined.includes(token) && token !== "font-sans" && token !== "font-display"))];
  if (missing.length) { console.error(`Undefined ${demo} tokens: ${missing.join(", ")}`); process.exitCode = 1; }
}

await verifyScopedClasses("Rentbook", new URL("src/demos/rentbook/", root), "rbk");
await verifyScopedClasses("Axmion shell", new URL("src/shared/demo-shell/", root), "axm-shell");
