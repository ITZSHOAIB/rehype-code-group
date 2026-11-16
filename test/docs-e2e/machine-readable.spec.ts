import { expect, test } from "@playwright/test";

const site = "https://rehype-code-group.pages.dev";

test("llms.txt lists every page as Markdown", async ({ request }) => {
  const response = await request.get("/llms.txt");
  expect(response.ok()).toBe(true);
  const body = await response.text();
  expect(body).toContain("/llms.mdx/docs/getting-started.md");
  expect(body).toContain("/llms.mdx/docs/reference/options.md");
});

test("llms-full.txt contains the full documentation", async ({ request }) => {
  const response = await request.get("/llms-full.txt");
  expect(response.ok()).toBe(true);
  const body = await response.text();
  expect(body).toContain("# Getting started");
  expect(body).toContain("# Options");
  expect(body).toContain("::: code-group");
});

test("each page has a Markdown version", async ({ request }) => {
  const response = await request.get("/llms.mdx/docs/syntax/compact-groups.md");
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toMatch(/^text\/markdown/);
  const body = await response.text();
  expect(body).toMatch(/^# Compact groups/);
  expect(body).toContain("labels=[");
});

test("sitemap.xml lists the homepage and docs", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toMatch(/xml/);
  const body = await response.text();
  expect(body).toContain(`<loc>${site}/</loc>`);
  expect(body).toContain(`<loc>${site}/docs/getting-started/</loc>`);
  expect(body).toContain(`<loc>${site}/docs/changelog/</loc>`);
});

test("robots.txt allows crawling and points at the sitemap", async ({
  request,
}) => {
  const response = await request.get("/robots.txt");
  expect(response.ok()).toBe(true);
  const body = await response.text();
  expect(body).toMatch(/User-Agent: \*\s+Allow: \//i);
  expect(body).toContain(`Sitemap: ${site}/sitemap.xml`);
});
