import { expect, test } from "@playwright/test";

test("publishes focused machine-readable documentation", async ({
  request,
}) => {
  const [indexResponse, pageResponse] = await Promise.all([
    request.get("/llms.txt"),
    request.get("/assets/md/getting-started.md"),
  ]);

  expect(indexResponse.ok()).toBe(true);
  expect(await indexResponse.text()).toContain(
    "[Agent resources](/agent-resources)",
  );

  expect(pageResponse.ok()).toBe(true);
  const markdown = await pageResponse.text();
  expect(markdown).toContain("npm install rehype-code-group");
  expect(markdown).not.toContain("<CodeGroupPreview");
  expect(markdown).not.toContain("<Cards>");
  expect(markdown).not.toContain("<Card ");
});

test("links agent resources and release notes from the docs sidebar", async ({
  page,
}) => {
  await page.goto("/getting-started/");
  const sidebar = page.getByRole("complementary");

  await expect(
    sidebar.getByRole("link", { name: "Agent resources", exact: true }),
  ).toHaveAttribute("href", "/agent-resources");
  await expect(
    sidebar.getByRole("link", { name: "Changelog", exact: true }),
  ).toHaveAttribute("href", "/changelog");
});

test("emits canonical discovery metadata", async ({ request }) => {
  const [homeResponse, robotsResponse, sitemapResponse] = await Promise.all([
    request.get("/"),
    request.get("/robots.txt"),
    request.get("/sitemap.xml"),
  ]);

  expect(homeResponse.ok()).toBe(true);
  const home = await homeResponse.text();
  expect(home).toContain('<link rel="icon" href="/favicon-32.png"');
  expect(home).toContain(
    '<meta property="og:image" content="https://rehype-code-group.pages.dev/og-image.png"',
  );
  expect(robotsResponse.ok()).toBe(true);
  expect(await robotsResponse.text()).toContain("Sitemap:");
  expect(sitemapResponse.ok()).toBe(true);
  expect(await sitemapResponse.text()).toContain("/agent-resources");
});
