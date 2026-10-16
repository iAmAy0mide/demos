import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const sourceRoot = join(process.cwd(), "src");
const allowedPlainTextFiles = new Set([
  join(sourceRoot, "shared", "components", "AxmionAttribution", "AxmionAttribution.tsx"),
  join(sourceRoot, "shared", "demo-shell", "DemoShell.tsx"),
  join(sourceRoot, "demos", "hub", "components", "HubHeader.tsx"),
  join(sourceRoot, "demos", "hub", "components", "HubFooter.tsx"),
]);

async function filesIn(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory() ? filesIn(join(directory, entry.name)) : [join(directory, entry.name)],
    ),
  );
  return nested.flat();
}

const tsxFiles = (await filesIn(sourceRoot)).filter((file) => file.endsWith(".tsx"));
const violations: string[] = [];
for (const file of tsxFiles) {
  if (allowedPlainTextFiles.has(file)) {
    continue;
  }
  const source = await readFile(file, "utf8");
  if (/>(?:[^<\n]*\bAxmion\b[^<\n]*)</.test(source)) {
    violations.push(file);
  }
}

if (violations.length) {
  console.error(
    `Plain Axmion user-facing text found outside approved components:\n${violations.join("\n")}`,
  );
  process.exit(1);
}

console.log("Attribution check passed.");
