#!/usr/bin/env node
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "tests/screenshots/sections";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
await page.goto("http://localhost:3000/en/design-system", {
  waitUntil: "networkidle",
});

const sections = await page.$$("section");
console.log(`found ${sections.length} sections`);
for (let i = 0; i < sections.length; i++) {
  const section = sections[i];
  const title = await section.$eval("h2", (el) => el.textContent ?? "section");
  const safe = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await section.screenshot({ path: `${OUT}/${String(i).padStart(2, "0")}-${safe}.png` });
  console.log(`shot ${i}: ${title}`);
}

await browser.close();
