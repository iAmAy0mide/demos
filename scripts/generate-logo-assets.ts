import { access, mkdir } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const SOURCE_FILE = path.resolve("public/images/Logo.png");
const OUTPUT_DIRECTORY = path.resolve("public/images");
const SIZES = [64, 128, 256, 512] as const;
const TOUCH_ICON_SIZE = 180;
const TOUCH_ICON_PADDING = 28;
const INK = "#07090d";

async function createMark(size: number) {
  await sharp(SOURCE_FILE)
    .resize(size, size, { fit: "contain", withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(OUTPUT_DIRECTORY, `logo-mark-${size}.png`));
}

async function createTouchIcon() {
  const innerSize = TOUCH_ICON_SIZE - TOUCH_ICON_PADDING * 2;
  const mark = await sharp(SOURCE_FILE)
    .resize(innerSize, innerSize, { fit: "contain", withoutEnlargement: true })
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: TOUCH_ICON_SIZE,
      height: TOUCH_ICON_SIZE,
      channels: 4,
      background: INK,
    },
  })
    .composite([{ input: mark, gravity: "centre" }])
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(OUTPUT_DIRECTORY, "apple-touch-icon.png"));
}

async function main() {
  await access(SOURCE_FILE);
  await mkdir(OUTPUT_DIRECTORY, { recursive: true });
  await Promise.all(SIZES.map(createMark));
  await createTouchIcon();
  console.log("Generated Axmion logo derivatives.");
}

await main();
