import { expect, test } from "@playwright/test";

test("search finds documentation pages", async ({ page }) => {
  await page.goto("/docs/");
  // The layout has separate search buttons for narrow and wide screens.
  await page
    .locator("button[data-search-full]")
    .filter({ visible: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("combobox").fill("persist");

  const result = dialog
    .getByRole("option")
    .filter({ hasText: /sync and persistence/i })
    .first();
  await expect(result).toBeVisible();
  await result.click();
  await expect(page).toHaveURL(/\/docs\/syntax\/sync-and-persistence\//);
});

test("the search index leaves out group markers", async ({ request }) => {
  const response = await request.get("/api/search");
  expect(response.ok()).toBe(true);
  const body = await response.text();
  expect(body).toContain("sync-and-persistence");
  expect(body).not.toContain('"content":":::"');
  expect(body).not.toMatch(/"content":"::: code-(group|tab)/);
});
