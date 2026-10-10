import { mkdir } from "node:fs/promises";

import sharp from "sharp";

import { publishedWorks } from "../src/shared/works.ts";

const WIDTH = 1200;
const HEIGHT = 630;
const output = "public/og";
const logo = "public/images/logo-mark-128.png";

async function createWorkImage(id: string) {
  const source = `public/previews/${id}-desktop.webp`;
  await sharp(source)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "north" })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${WIDTH}" height="${HEIGHT}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="55%" stop-opacity="0"/><stop offset="100%" stop-color="#07090d" stop-opacity=".9"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`,
        ),
      },
      { input: logo, left: 42, top: 540 },
    ])
    .jpeg({ quality: 78, progressive: true })
    .toFile(`${output}/${id}.jpg`);
}

await mkdir(output, { recursive: true });
await Promise.all(publishedWorks.map((work) => createWorkImage(work.id)));
await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background: "#07090d" } })
  .composite([
    {
      input: Buffer.from(
        `<svg width="${WIDTH}" height="${HEIGHT}"><defs><radialGradient id="a"><stop stop-color="#00bdf0" stop-opacity=".6"/><stop offset="1" stop-color="#07090d" stop-opacity="0"/></radialGradient><radialGradient id="b"><stop stop-color="#0058d9" stop-opacity=".6"/><stop offset="1" stop-color="#07090d" stop-opacity="0"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#a)"/><rect width="100%" height="100%" fill="url(#b)" transform="translate(260 0)"/></svg>`,
      ),
    },
    { input: logo, left: 536, top: 251 },
  ])
  .jpeg({ quality: 78, progressive: true })
  .toFile(`${output}/hub.jpg`);
console.log(`Generated ${publishedWorks.length + 1} social images.`);
