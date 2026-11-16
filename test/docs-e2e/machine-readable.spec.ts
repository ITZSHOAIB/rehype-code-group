import { expect, test } from "@playwright/test";

const site = "https://rehype-code-group.pages.dev";

test("llms.txt has package context and a working Markdown link for every docs page", async ({
  request,
}) => {
  const response = await request.get("/llms.txt");
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toMatch(/^text\/plain/);
  const body = await response.text();
  expect(body).toMatch(/^# rehype-code-group\n\n> /);
  expect(body).toContain("Node.js 22.12");
  expect(body).toContain(`${site}/llms-full.txt`);
  const links = [...body.matchAll(/\]\((https:[^)]+\.md)\)/g)].map(
    (match) => new URL(match[1]).pathname,
  );
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const docs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => new URL(match[1]).pathname)
    .filter((path) => path.startsWith("/docs/"));
  expect(links.length).toBe(docs.length);
  for (const path of docs) {
    const markdown = `/llms.mdx${path.replace(/\/$/, "")}.md`;
    expect(links).toContain(markdown);
    const page = await request.get(markdown);
    expect(page.ok(), markdown).toBe(true);
    expect(page.headers()["content-type"]).toMatch(/^text\/markdown/);
    expect(await page.text()).toContain(`Source: ${site}${path}`);
    const html = await (await request.get(path)).text();
    const tags = html.match(/<link\b[^>]+>/g) ?? [];
    expect(
      tags.some(
        (tag) =>
          tag.includes('rel="alternate"') &&
          tag.includes('type="text/markdown"') &&
          tag.includes(`href="${site}${markdown}"`),
      ),
      path,
    ).toBe(true);
  }
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

test("agent discovery is in server-rendered HTML and Markdown exports retain warnings", async ({
  request,
}) => {
  for (const path of ["/", "/docs/getting-started/"]) {
    const html = await (await request.get(path)).text();
    expect(html).toContain(`rel="describedby" href="${site}/llms.txt"`);
  }
  const start = await (
    await request.get("/llms.mdx/docs/getting-started.md")
  ).text();
  expect(start).not.toMatch(/^<\/?Steps?>/m);
  expect(start).toContain("import rehypeCodeGroup");
  const integration = await (
    await request.get("/llms.mdx/docs/integrations/nextjs-fumadocs.md")
  ).text();
  expect(integration).toContain("> **Order matters here**");
  expect(integration).not.toContain(
    '<Callout type="warn" title="Order matters here">',
  );
});
