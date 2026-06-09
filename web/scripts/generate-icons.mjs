// Rasterize the brand SVG monograms into the PNG sizes the PWA
// manifest + Apple touch icon need. Run after the brand mark changes:
//
//   node scripts/generate-icons.mjs
//
// Source SVGs (hand-authored, hardcoded colors):
//   public/icons/grocery-icon.svg          → "any" purpose icons
//   public/icons/grocery-icon-maskable.svg → "maskable" purpose icons
//
// Output PNGs land alongside them in public/icons/. Uses
// @resvg/resvg-js (a self-contained Rust rasterizer — no native
// system deps), kept as a devDependency since this is build-time only.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Resvg } from "@resvg/resvg-js";

const here = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(here, "..", "public", "icons");

function render(svgFile, size, outFile) {
  const svg = readFileSync(join(iconsDir, svgFile), "utf8");
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: size } });
  const png = resvg.render().asPng();
  writeFileSync(join(iconsDir, outFile), png);
  return png.length;
}

const jobs = [
  // "any" purpose — full-bleed artwork.
  ["grocery-icon.svg", 192, "icon-192.png"],
  ["grocery-icon.svg", 256, "icon-256.png"],
  ["grocery-icon.svg", 384, "icon-384.png"],
  ["grocery-icon.svg", 512, "icon-512.png"],
  // "maskable" purpose — artwork inset to the safe zone.
  ["grocery-icon-maskable.svg", 192, "icon-maskable-192.png"],
  ["grocery-icon-maskable.svg", 512, "icon-maskable-512.png"],
  // Apple touch icon (opaque, 180px) — older iOS prefers a PNG.
  ["grocery-icon.svg", 180, "apple-touch-icon-180.png"],
];

let total = 0;
for (const [svg, size, out] of jobs) {
  const bytes = render(svg, size, out);
  total += bytes;
  console.log(`  ${out.padEnd(26)} ${(bytes / 1024).toFixed(1)} KB`);
}
console.log(`Generated ${jobs.length} icons (${(total / 1024).toFixed(1)} KB).`);
