import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const APP_DIRECTORY = join(process.cwd(), "app");
const PAGE_FILE_NAME = "page.tsx";
const METADATA_EXPORT_PATTERN = /export\s+(?:const\s+metadata|async\s+function\s+generateMetadata)/;

async function findPageFiles(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = join(directoryPath, entry.name);

      if (entry.isDirectory()) {
        return findPageFiles(entryPath);
      }

      return entry.name === PAGE_FILE_NAME ? [entryPath] : [];
    }),
  );

  return nestedFiles.flat();
}

const pageFiles = await findPageFiles(APP_DIRECTORY);
const missingMetadata = [];

for (const pageFile of pageFiles) {
  const pageSource = await readFile(pageFile, "utf8");

  if (!METADATA_EXPORT_PATTERN.test(pageSource)) {
    missingMetadata.push(pageFile.replace(`${process.cwd()}/`, ""));
  }
}

if (missingMetadata.length > 0) {
  process.stderr.write(`Missing metadata exports:\n${missingMetadata.join("\n")}\n`);
  process.exit(1);
}

process.stdout.write(`Metadata check passed for ${pageFiles.length} route pages.\n`);
