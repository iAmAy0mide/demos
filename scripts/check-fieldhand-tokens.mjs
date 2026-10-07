import { readdir, readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const fieldhandRoot = new URL("src/demos/fieldhand/", root);
const css = await readFile(new URL("styles/tokens.css", fieldhandRoot), "utf8");
const tokens = [...css.matchAll(/--fld-([a-z-]+):/g)].map((match) => match[1]);
const layoutProvidedTokens = ["font-sans"];
async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory() ? collectFiles(new URL(`${entry.name}/`, directory)) : [new URL(entry.name, directory)]));
  return nested.flat();
}
const source = (await Promise.all((await collectFiles(fieldhandRoot)).map((file) => readFile(file, "utf8")))).join("\n");
const references = [...source.matchAll(/var\(--fld-([a-z-]+)/g)].map((match) => match[1]);
const missing = [...new Set(references.filter((token) => !tokens.includes(token) && !layoutProvidedTokens.includes(token)))];

if (missing.length) {
  console.error(`Undefined Fieldhand tokens: ${missing.join(", ")}`);
  process.exit(1);
}
