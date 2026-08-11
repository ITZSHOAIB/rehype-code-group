import { expect, test } from "@playwright/test";

test("keeps every code panel readable without JavaScript", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("#rcg-0-block-0")).toBeVisible();
  await expect(page.locator("#rcg-0-block-1")).toBeVisible();
  await expect(page.locator("#primary-group")).not.toHaveAttribute(
    "data-rcg-enhanced",
    "",
  );
});
