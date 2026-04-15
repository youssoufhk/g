import { test, expect } from "@playwright/test";

// Smoke test: the shell renders the sidebar, topbar, and bottom-nav placeholders
// on the dashboard page. This is the first scenario of the 45 E2E tests we aim
// to have green by v1.0 launch (see docs/TESTING_STRATEGY.md layer 3).
//
// The scenario runs against `npm run dev` locally. In CI the webServer in
// playwright.config.ts builds and starts the app.

test("dashboard renders shell chrome in dark mode at 1440", async ({ page }) => {
  await page.goto("/en/dashboard");

  // Sidebar is 224px wide (CLAUDE.md rule 3).
  const sidebar = page.locator('aside[aria-label="Primary navigation"]');
  await expect(sidebar).toBeVisible();
  const box = await sidebar.boundingBox();
  expect(box?.width).toBe(224);

  // Topbar search placeholder is localized via next-intl.
  await expect(
    page.getByPlaceholder("Search employees, clients, projects"),
  ).toBeVisible();

  // Dark mode is home (CLAUDE.md principle 9).
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("mobile bottom nav replaces sidebar at narrow viewport", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 700 } });
  const page = await context.newPage();
  await page.goto("/en/dashboard");

  await expect(page.locator('aside[aria-label="Primary navigation"]')).toBeHidden();
  await expect(page.locator('nav[aria-label="Primary navigation"]')).toBeVisible();
  await context.close();
});
