import { expect, type Page, test } from "@playwright/test";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import rehypeCodeGroup from "../../dist/index.js";

const markdown = [
  ':::: code-group label="Runtime" orientation="vertical"',
  '::: code-tab label="Node.js" value="node"',
  "```sh\nnode app.js\n```",
  ":::",
  '::: code-tab label="Bun" value="bun"',
  "```sh\nbun app.ts\n```",
  ":::",
  "::::",
].join("\n\n");

// Default inline assets: the plugin's <style> lands inside the rendered
// content, after any stylesheet in the page head.
const fragment = String(
  await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeCodeGroup)
    .use(rehypeStringify)
    .process(markdown),
);

const render = (page: Page, siteCss = "") =>
  page.setContent(
    `<!doctype html><html><head><style>${siteCss}</style></head><body>${fragment}</body></html>`,
  );

const activeTabAccent = (page: Page) =>
  page
    .locator(".rcg-tab.active")
    .evaluate((tab) => getComputedStyle(tab).borderInlineEndColor);

test("uses the default accent without site styles", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await render(page);
  expect(await activeTabAccent(page)).toBe("rgb(37, 99, 235)");
});

test("site custom properties on the group win over inline assets", async ({
  page,
}) => {
  await render(page, ".rehype-code-group { --rcg-accent: rgb(255, 0, 0); }");
  expect(await activeTabAccent(page)).toBe("rgb(255, 0, 0)");
});

test("site custom properties on an ancestor reach the group", async ({
  page,
}) => {
  await render(page, ":root { --rcg-accent: rgb(255, 0, 0); }");
  expect(await activeTabAccent(page)).toBe("rgb(255, 0, 0)");
});

test("site rules override the bundled look regardless of load order", async ({
  page,
}) => {
  await render(page, ".rcg-tab { padding: 3px; }");
  expect(
    await page
      .locator(".rcg-tab.active")
      .evaluate((tab) => getComputedStyle(tab).paddingTop),
  ).toBe("3px");
});

test("site display rules cannot reveal inactive panels", async ({ page }) => {
  await render(page, ".rcg-block { display: flex; }");
  await expect(page.getByText("bun app.ts")).toBeHidden();
  await expect(page.getByText("node app.js")).toBeVisible();
});

test("vertical groups stack their tabs on narrow screens", async ({ page }) => {
  const tabListDirection = () =>
    page
      .getByRole("tablist")
      .evaluate((list) => getComputedStyle(list).flexDirection);

  await page.setViewportSize({ width: 900, height: 600 });
  await render(page);
  expect(await tabListDirection()).toBe("column");

  await page.setViewportSize({ width: 380, height: 600 });
  expect(await tabListDirection()).toBe("row");
  const [list, panel] = await Promise.all([
    page.getByRole("tablist").boundingBox(),
    page.getByRole("tabpanel").boundingBox(),
  ]);
  expect(panel?.y).toBeGreaterThanOrEqual((list?.y ?? 0) + (list?.height ?? 0));
});
