#!/usr/bin/env node
/**
 * Copies the three prototype CSS files into frontend/styles/ so the React
 * atoms can apply prototype class names verbatim. Strips the Google Fonts
 * `@import url(...)` lines from tokens.css because Next.js + Tailwind 4
 * rejects @import statements that appear after CSS rules at build time.
 * The fonts are re-added at the top of globals.css instead.
 */

import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const proto = join(root, "..", "prototype");
const styles = join(root, "styles");

const pairs = [
  ["_tokens.css", "tokens.css"],
  ["_components.css", "components.css"],
  ["_layout.css", "layout.css"],
];

for (const [from, to] of pairs) {
  const src = join(proto, from);
  const dest = join(styles, to);
  if (to === "tokens.css") {
    const raw = readFileSync(src, "utf8");
    const stripped = raw.replace(/^@import url\([^)]+\);\s*$/gm, "");
    writeFileSync(dest, stripped);
  } else {
    copyFileSync(src, dest);
  }
  console.log(`synced ${from} -> ${to}`);
}
