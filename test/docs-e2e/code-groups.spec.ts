import { expect, test } from "@playwright/test";
import { trackErrors } from "./helpers";

type MarkedWindow = Window & { __softNavigation?: boolean };

test("tabs work after client-side navigation", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/docs/");
  // A full page load would drop this marker.
  await page.evaluate(() => {
    (window as MarkedWindow).__softNavigation = true;
  });

  await page
    .getByRole("complementary")
    .getByRole("link", { name: "Compact groups", exact: true })
    .click();
  await expect(page).toHaveURL(/\/docs\/syntax\/compact-groups\/$/);
  await expect(page.locator("h1")).toHaveText("Compact groups");
  expect(
    await page.evaluate(() => (window as MarkedWindow).__softNavigation),
  ).toBe(true);

  const group = page.locator(".rehype-code-group[data-rcg-enhanced]").first();
  await expect(group).toBeVisible();
  const tabs = group.getByRole("tab");
  const second = tabs.nth(1);
  await second.click();
  await expect(second).toHaveAttribute("aria-selected", "true");
  await expect(tabs.first()).toHaveAttribute("aria-selected", "false");
  const panelId = await second.getAttribute("aria-controls");
  await expect(page.locator(`[id="${panelId}"]`)).toBeVisible();
  expect(errors).toEqual([]);
});

test("tabs support keyboard navigation", async ({ page }) => {
  await page.goto("/docs/guides/accessibility/");
  const group = page.locator(".rehype-code-group[data-rcg-enhanced]").first();
  const tabs = group.getByRole("tab");
  const count = await tabs.count();
  expect(count).toBeGreaterThan(1);

  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(tabs.nth(1)).toHaveAttribute("tabindex", "0");
  await expect(tabs.first()).toHaveAttribute("tabindex", "-1");

  await page.keyboard.press("End");
  await expect(tabs.nth(count - 1)).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.first()).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(tabs.nth(count - 1)).toBeFocused();
  await page.keyboard.press("Home");
  await expect(tabs.first()).toBeFocused();
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
});

test("homepage demos sync and remember the choice", async ({ page }) => {
  await page.goto("/");
  const groups = page.locator(
    '.rehype-code-group[data-rcg-sync="home-runtime"]',
  );
  await expect(groups).toHaveCount(2);
  await expect(groups.nth(1)).toHaveAttribute("data-rcg-enhanced", "");

  await groups.first().getByRole("tab", { name: "Bun" }).click();
  const synced = groups.nth(1).getByRole("tab", { name: "Bun" });
  await expect(synced).toHaveAttribute("aria-selected", "true");

  await page.reload();
  await expect(synced).toHaveAttribute("aria-selected", "true");
});

test("homepage demos have unique IDs", async ({ page }) => {
  await page.goto("/");
  const ids = await page
    .locator("[id]")
    .evaluateAll((elements) => elements.map((element) => element.id));
  expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
});

test("homepage resolves emoji shortcodes in fence labels", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("section", {
    hasText: "Emoji and file names",
  });
  const deploy = section.getByRole("tab", { name: "🚀 deploy.sh" });
  await deploy.click();
  await expect(deploy).toHaveAttribute("aria-selected", "true");
  await expect(section.getByRole("tablist")).not.toContainText(":rocket:");
});
