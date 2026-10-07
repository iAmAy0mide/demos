import { readdir, readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const demos = [["fieldhand", "fld"], ["sunreach", "sun"], ["meridian", "mrd"], ["harmattan", "hrm"], ["hub", "axm"]];
async function collectFiles(directory) { const entries = await readdir(directory, { withFileTypes: true }); return (await Promise.all(entries.map((entry) => entry.isDirectory() ? collectFiles(new URL(`${entry.name}/`, directory)) : [new URL(entry.name, directory)]))).flat(); }
for (const [demo, prefix] of demos) {
  const demoRoot = new URL(`src/demos/${demo}/`, root);
  const css = await readFile(new URL("styles/tokens.css", demoRoot), "utf8");
  const defined = [...css.matchAll(new RegExp(`--${prefix}-([a-z-]+):`, "g"))].map((match) => match[1]);
  const source = (await Promise.all((await collectFiles(demoRoot)).map((file) => readFile(file, "utf8")))).join("\n");
  const refs = [...source.matchAll(new RegExp(`var\\(--${prefix}-([a-z-]+)`, "g"))].map((match) => match[1]);
  const missing = [...new Set(refs.filter((token) => !defined.includes(token) && token !== "font-sans" && token !== "font-display"))];
  if (missing.length) { console.error(`Undefined ${demo} tokens: ${missing.join(", ")}`); process.exitCode = 1; }
}
