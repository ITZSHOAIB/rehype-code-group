import { expect, test } from "@playwright/test";

test("homepage reveals content for keyboard focus and a reduced-motion preference", async ({
  page,
}) => {
  await page.goto("/");
  await expect
    .poll(() => page.locator("[data-motion-pending]").count())
    .toBeGreaterThan(0);
  const feature = page.locator(".home-features > li").first();
  await feature.getByRole("link").focus();
  await expect(feature).not.toHaveAttribute("data-motion-pending");
  await expect(feature.getByRole("link")).toBeFocused();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("[data-motion-pending]")).toHaveCount(0);
  await expect(page.locator(".integration-track")).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.locator(".home-hero-demo")).toHaveCSS(
    "animation-name",
    "none",
  );
  expect(
    await page
      .locator(".home-glow")
      .evaluate(
        (element) => getComputedStyle(element, "::before").animationName,
      ),
  ).toBe("none");
});

test("homepage content stays visible without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("[data-motion-pending]")).toHaveCount(0);
  for (const element of await page.locator("[data-home-reveal]").all()) {
    await expect(element).toHaveCSS("opacity", "1");
  }
  await context.close();
});
