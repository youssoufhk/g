#!/usr/bin/env node
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "tests/screenshots";
mkdirSync(`${OUT}/light`, { recursive: true });
mkdirSync(`${OUT}/interactive`, { recursive: true });

const browser = await chromium.launch();

// 1. LIGHT MODE - design-system + dashboard
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  const pages = [
    ["/en/design-system", "design-system-light"],
    ["/en/dashboard", "dashboard-light"],
    ["/en/onboarding", "onboarding-light"],
    ["/en/login", "login-light"],
  ];
  for (const [path, name] of pages) {
    await page.goto(`http://localhost:3000${path}`, {
      waitUntil: "networkidle",
    });
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${OUT}/light/${name}.png`, fullPage: true });
    console.log(`shot ${name}`);
  }
  await ctx.close();
}

// 2. INTERACTIVE - modal, drawer, toast, tooltip
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/en/design-system", {
    waitUntil: "networkidle",
  });

  // Modal
  await page.click("text=Open modal");
  await page.waitForTimeout(300);
  await page.screenshot({
    path: `${OUT}/interactive/modal-open.png`,
    fullPage: false,
  });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  console.log("shot modal-open");

  // Drawer
  await page.click("text=Open drawer");
  await page.waitForTimeout(400);
  await page.screenshot({
    path: `${OUT}/interactive/drawer-open.png`,
    fullPage: false,
  });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  console.log("shot drawer-open");

  // Toast
  await page.click("text=Show toast");
  await page.waitForTimeout(300);
  await page.screenshot({
    path: `${OUT}/interactive/toast-success.png`,
    fullPage: false,
  });
  await page.click("text=Error toast");
  await page.waitForTimeout(300);
  await page.screenshot({
    path: `${OUT}/interactive/toast-error.png`,
    fullPage: false,
  });
  console.log("shot toast");
  await ctx.close();
}

await browser.close();
console.log("done");
