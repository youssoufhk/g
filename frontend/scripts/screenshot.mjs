#!/usr/bin/env node
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "tests/screenshots";
mkdirSync(OUT, { recursive: true });

const pages = [
  { path: "/en/design-system", name: "design-system-dark-1440" },
  { path: "/en/dashboard", name: "dashboard-dark-1440" },
  { path: "/en/onboarding", name: "onboarding-dark-1440" },
  { path: "/en/flags", name: "flags-dark-1440" },
  { path: "/en/tenants", name: "tenants-dark-1440" },
  { path: "/en/login", name: "login-dark-1440" },
];

const mobilePages = [
  { path: "/en/design-system", name: "design-system-dark-mobile" },
  { path: "/en/dashboard", name: "dashboard-dark-mobile" },
];

const base = process.env.BASE_URL ?? "http://localhost:3000";

async function shoot(ctx, list, width, height) {
  const page = await ctx.newPage();
  for (const p of list) {
    await page.goto(`${base}${p.path}`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: `${OUT}/${p.name}.png`,
      fullPage: true,
    });
    console.log(`shot ${p.name} @ ${width}x${height}`);
  }
  await page.close();
}

const browser = await chromium.launch();
const desktop = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
await shoot(desktop, pages, 1440, 900);

const mobile = await browser.newContext({
  viewport: { width: 375, height: 812 },
  deviceScaleFactor: 2,
});
await shoot(mobile, mobilePages, 375, 812);

await browser.close();
console.log("done");
