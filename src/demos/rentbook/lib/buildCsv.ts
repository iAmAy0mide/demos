export type CsvRow = Record<string, string | number | null | undefined>;

function escapeCsv(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** Produces an Excel-friendly RFC 4180 CSV. Dates and amounts are supplied as plain values. */
export function buildCsv(headers: string[], rows: CsvRow[]) {
  const lines = [headers.map(escapeCsv).join(",")];
  rows.forEach((row) => lines.push(headers.map((header) => escapeCsv(row[header])).join(",")));
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}
