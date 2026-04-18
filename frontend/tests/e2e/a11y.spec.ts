import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Axe-core accessibility sweep (CRITIC_PLAN B9, OPUS_CRITICS §B9 WCAG).
 *
 * Runs the WCAG 2.1 AA + best-practice rule sets against the four
 * highest-traffic tenant pages in dark mode (the default per
 * CLAUDE.md principle 9). The test fails the build if any AA rule
 * reports a violation. Light-mode parity is covered by the visual
 * diff suite in tests/visual.
 *
 * The impact budget is zero. If a legitimate new pattern trips a
 * rule, fix the pattern, never suppress the rule.
 */
const PAGES = [
  { name: "dashboard", path: "/en/dashboard" },
  { name: "employees", path: "/en/employees" },
  { name: "invoices", path: "/en/invoices" },
  { name: "admin", path: "/en/admin" },
];

for (const page of PAGES) {
  test(`a11y: ${page.name} has zero AA violations`, async ({ page: p }) => {
    await p.goto(page.path);
    await p.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page: p })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
      .analyze();

    expect(
      results.violations,
      results.violations
        .map((v) => `${v.id}: ${v.help} (${v.nodes.length} node(s))`)
        .join("\n"),
    ).toHaveLength(0);
  });
}
