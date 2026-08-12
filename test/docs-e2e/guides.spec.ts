import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("renders the styling preview with the documented package theme", async ({
  page,
}) => {
  await page.goto("/guides/styling/");

  const preview = page.locator(".rehype-code-group").first();
  const activeTab = preview.locator(".rcg-tab.active");
  await expect(activeTab).toBeVisible();

  const appearance = await activeTab.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      borderBottomColor: style.borderBottomColor,
    };
  });

  expect(appearance.backgroundColor).toBe("rgb(67, 20, 7)");
  expect(appearance.borderBottomColor).toBe("rgb(251, 146, 60)");
});

test("pairs a source block with an enhanced copyable code-group preview", async ({
  page,
}) => {
  await page.goto("/getting-started/");

  await expect(
    page.getByRole("heading", { level: 3, name: "Live preview" }),
  ).toBeVisible();

  const preview = page.locator(".rehype-code-group").first();
  await expect(preview).toHaveAttribute("data-rcg-enhanced", "");
  await preview.getByRole("tab", { name: "pnpm" }).click();
  const panel = preview.getByRole("tabpanel");
  await expect(panel).toContainText("pnpm add rehype-code-group");

  const copyButton = panel.getByRole("button", { name: "Copy code" });
  await expect(copyButton).toBeVisible();
  await copyButton.click();
  await expect(panel.getByRole("button", { name: "Copied" })).toBeVisible();
});

test("hydrates documentation previews without early DOM mutations", async ({
  page,
}) => {
  const hydrationWarnings: string[] = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      message.text().includes("hydrated but some attributes")
    ) {
      hydrationWarnings.push(message.text());
    }
  });

  await page.goto("/getting-started/");
  await expect(page.locator(".rehype-code-group").first()).toHaveAttribute(
    "data-rcg-enhanced",
    "",
  );
  expect(hydrationWarnings).toEqual([]);
});

test("keeps documentation readable after sidebar navigation", async ({
  page,
}) => {
  await page.goto("/getting-started/");

  await page
    .getByRole("complementary")
    .getByRole("link", { name: "State & syncing", exact: true })
    .click();
  await expect(page).toHaveURL(/\/guides\/state$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "State and syncing" }),
  ).toBeVisible();

  const fontFamily = await page
    .getByRole("heading", { level: 1, name: "State and syncing" })
    .evaluate((heading) => getComputedStyle(heading).fontFamily);
  expect(fontFamily).not.toMatch(/Times New Roman/i);
});

test("documents the Vocs integration from the guides navigation", async ({
  page,
}) => {
  await page.goto("/getting-started/");

  await page
    .getByRole("complementary")
    .getByRole("link", { name: "Vocs integration", exact: true })
    .click();

  await expect(page).toHaveURL(/\/guides\/vocs$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Use rehype-code-group with Vocs",
    }),
  ).toBeVisible();
  await expect(page.getByText("Choose one code-group syntax")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Vocs Markdown extensions" }),
  ).toHaveAttribute("href", "https://vocs.dev/writing/markdown-extensions");
});

test("renders the tab list and active preview as one connected control", async ({
  page,
}) => {
  await page.goto("/getting-started/");

  const group = page.locator(".rehype-code-group").first();
  const tabList = group.getByRole("tablist");
  const panel = group.getByRole("tabpanel");
  await expect(group).toBeVisible();
  await expect(group).toHaveAttribute("data-rcg-enhanced", "");

  const gap = await Promise.all([
    tabList.boundingBox(),
    panel.boundingBox(),
  ]).then(([tabs, activePanel]) => {
    if (!tabs || !activePanel) throw new Error("Code group is not laid out");
    return activePanel.y - (tabs.y + tabs.height);
  });

  expect(gap).toBeLessThanOrEqual(1);
});

test("aligns every tab button on the same row", async ({ page }) => {
  await page.goto("/getting-started/");

  const boxes = await page
    .locator(".rehype-code-group")
    .first()
    .getByRole("tab")
    .evaluateAll((tabs) =>
      tabs.map((tab) => {
        const box = tab.getBoundingClientRect();
        return { height: box.height, y: box.y };
      }),
    );

  expect(new Set(boxes.map(({ y }) => y)).size).toBe(1);
  expect(new Set(boxes.map(({ height }) => height)).size).toBe(1);
});

test("synchronizes related live previews", async ({ page }) => {
  await page.goto("/guides/state/");

  const groups = page.locator(".rehype-code-group");
  await expect(groups).toHaveCount(2);

  await groups.first().getByRole("tab", { name: "pnpm" }).click();
  await expect(
    groups.nth(1).getByRole("tab", { name: "pnpm" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(groups.nth(1).getByRole("tabpanel")).toContainText("pnpm dev");
});

test("live code groups have no structural accessibility violations", async ({
  page,
}) => {
  await page.goto("/guides/syntax/");
  const results = await new AxeBuilder({ page })
    .include(".rehype-code-group")
    // Vocs owns the syntax token colors inside its stock code block. Its current
    // light Shiki theme is 4.38:1 for a few tokens, so contrast belongs to the
    // documentation-theme baseline rather than this component integration.
    .disableRules(["color-contrast"])
    .analyze();
  expect(results.violations).toEqual([]);
});
