import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const SOURCE_ROOTS = ["app", "src", "scripts"];
const SOURCE_FILE_PATTERN = /\.(?:[cm]?[jt]sx?)$/;
const FUNCTION_START_PATTERN =
  /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+([A-Za-z][\w]*)|^\s*(?:export\s+)?const\s+([A-Za-z][\w]*)[^=]*=\s*(?:async\s+)?(?:\([^)]*\)|[A-Za-z][\w]*)\s*=>/;

type FunctionEstimate = {
  name: string;
  startLine: number;
  lineCount: number;
};

async function findSourceFiles(directoryPath: string): Promise<string[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = join(directoryPath, entry.name);

      if (entry.isDirectory()) {
        return findSourceFiles(entryPath);
      }

      return SOURCE_FILE_PATTERN.test(entry.name) ? [entryPath] : [];
    }),
  );

  return nestedFiles.flat();
}

function countBraces(line: string): number {
  return [...line].reduce((balance, character) => {
    if (character === "{") {
      return balance + 1;
    }

    return character === "}" ? balance - 1 : balance;
  }, 0);
}

function estimateFunctionLengths(lines: string[]): FunctionEstimate[] {
  return lines.flatMap((line, lineIndex) => {
    const match = line.match(FUNCTION_START_PATTERN);

    if (!match) {
      return [];
    }

    let braceBalance = countBraces(line);
    let endLine = lineIndex;

    while (braceBalance > 0 && endLine < lines.length - 1) {
      endLine += 1;
      braceBalance += countBraces(lines[endLine]);
    }

    return [
      {
        name: match[1] ?? match[2],
        startLine: lineIndex + 1,
        lineCount: endLine - lineIndex + 1,
      },
    ];
  });
}

const sourceFiles = (await Promise.all(SOURCE_ROOTS.map(findSourceFiles))).flat().sort();
const largeFiles: Array<{ path: string; lineCount: number }> = [];
const largeFunctions: Array<{ path: string } & FunctionEstimate> = [];

for (const sourceFile of sourceFiles) {
  const lines = (await readFile(sourceFile, "utf8")).split("\n");
  const path = relative(process.cwd(), sourceFile);

  if (lines.length > 300) {
    largeFiles.push({ path, lineCount: lines.length });
  }

  for (const functionEstimate of estimateFunctionLengths(lines)) {
    if (functionEstimate.lineCount > 80) {
      largeFunctions.push({ path, ...functionEstimate });
    }
  }
}

const reportLines = [
  `Source files checked: ${sourceFiles.length}`,
  `Files over 300 lines: ${largeFiles.length}`,
  ...largeFiles.map(({ path, lineCount }) => `  ${path} (${lineCount} lines)`),
  `Functions/components over 80 lines (heuristic): ${largeFunctions.length}`,
  ...largeFunctions.map(
    ({ path, name, startLine, lineCount }) =>
      `  ${path}:${startLine} ${name} (${lineCount} estimated lines)`,
  ),
];

process.stdout.write(`${reportLines.join("\n")}\n`);
