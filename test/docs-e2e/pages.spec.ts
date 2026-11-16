import { expect, test } from "@playwright/test";
import { toPath, trackErrors } from "./helpers";

test("every page in the sitemap loads without errors", async ({
  browser,
  request,
}) => {
  test.slow();
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
    toPath(match[1]),
  );
  expect(paths).toContain("/");
  expect(paths).toContain("/docs/getting-started/");
  expect(paths.length).toBeGreaterThan(20);

  for (const path of paths) {
    const page = await browser.newPage();
    const errors = trackErrors(page);
    const response = await page.goto(path, { waitUntil: "networkidle" });
    expect(response?.status(), path).toBe(200);
    await expect(page.locator("h1").first(), path).toBeVisible();

    // Every group marker was turned into tabs: none is left as a paragraph.
    const leftovers = await page
      .locator("p")
      .filter({ hasText: /^\s*:{3,4}(\s|$)/ })
      .count();
    expect(leftovers, `unconverted group on ${path}`).toBe(0);

    expect(errors, path).toEqual([]);
    await page.close();
  }
});

test("unknown paths get the 404 page", async ({ page }) => {
  const response = await page.goto("/docs/no-such-page/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "This tab is empty",
  );
});

test("pages declare canonical URLs and social images", async ({ page }) => {
  await page.goto("/docs/syntax/rich-groups/");
  await expect(page).toHaveTitle("Rich groups | rehype-code-group");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://rehype-code-group.pages.dev/docs/syntax/rich-groups/",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://rehype-code-group.pages.dev/og-image.png",
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
});
