import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page })
    .include(".rehype-code-group")
    .analyze();

  expect(results.violations).toEqual([]);
});
