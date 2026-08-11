import { expect, test } from "@playwright/test";

test("introduces the documentation from a focused package home page", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Code tabs that belong in your docs.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Accessible code and content tabs for the unified ecosystem.",
      { exact: true },
    ),
  ).toBeVisible();
});

test("presents a product landing hero with a documentation CTA", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("link", { name: "Get started", exact: true }),
  ).toHaveAttribute("href", "/getting-started");
  await expect(
    page.getByRole("link", { name: "Docs", exact: true }),
  ).toHaveAttribute("href", "/getting-started");
  await expect(page.getByRole("complementary")).toHaveCount(0);
});

test("pairs the landing message with install choices and project proof points", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("tablist", { name: "Install rehype-code-group" }),
  ).toBeVisible();
  await expect(page.getByText(/downloads in the last 30 days/)).toBeVisible();
  await expect(page.getByText(/Keyboard navigation built in/)).toBeVisible();
  await expect(
    page.getByText(/Open source and production-ready/),
  ).toBeVisible();
});

test("keeps project proof points readable beside the hero", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const highlights = page.getByRole("region", { name: "Project highlights" });
  const sizes = await Promise.all([
    highlights
      .getByText(/downloads in the last 30 days/)
      .evaluate((element) =>
        Number.parseFloat(getComputedStyle(element).fontSize),
      ),
    highlights
      .getByText("16k")
      .evaluate((element) =>
        Number.parseFloat(getComputedStyle(element).fontSize),
      ),
  ]);

  expect(sizes[0]).toBeGreaterThanOrEqual(14);
  expect(sizes[1]).toBeGreaterThanOrEqual(48);
});

test("presents adoption as the lead proof with supporting trust signals", async ({
  page,
}) => {
  await page.goto("/");

  const highlights = page.getByRole("region", { name: "Project highlights" });
  await expect(highlights.getByText("Used in the wild")).toBeVisible();
  await expect(highlights.getByText("16k")).toBeVisible();
  await expect(highlights.getByText("ARIA tabs")).toBeVisible();
  await expect(highlights.getByText("MIT licensed")).toBeVisible();
  await expect(highlights.getByText("Accessible")).toBeVisible();
  await expect(highlights.getByText("Permissive")).toBeVisible();
});

test("balances the project proof rail with matching outer insets", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const highlights = page.getByRole("region", { name: "Project highlights" });
  const insets = await highlights.evaluate((element) => {
    const lead = element.querySelector<HTMLElement>(".rcg-home-proof-lead");
    const badge = element.querySelector<HTMLElement>(
      ".rcg-home-proof-details article > span",
    );
    if (!lead || !badge) throw new Error("Expected proof rail content");

    const railBounds = element.getBoundingClientRect();
    const leadBounds = lead.getBoundingClientRect();
    const badgeBounds = badge.getBoundingClientRect();
    const leadPadding = Number.parseFloat(getComputedStyle(lead).paddingLeft);

    return {
      left: leadBounds.left + leadPadding - railBounds.left,
      right: railBounds.right - badgeBounds.right,
    };
  });

  expect(insets.left).toBeGreaterThanOrEqual(24);
  expect(insets.right).toBeGreaterThanOrEqual(24);
  expect(Math.abs(insets.left - insets.right)).toBeLessThanOrEqual(4);
});

test("uses one ember accent across primary homepage controls", async ({
  page,
}) => {
  await page.goto("/");

  const [buttonColor, activeTabColor] = await Promise.all([
    page
      .getByRole("link", { name: "Get started", exact: true })
      .evaluate((element) => getComputedStyle(element).backgroundColor),
    page
      .getByRole("tab", { name: "npm", exact: true })
      .first()
      .evaluate((element) => getComputedStyle(element).borderBottomColor),
  ]);

  expect(buttonColor).toBe("rgb(251, 146, 60)");
  expect(activeTabColor).toBe("rgb(251, 146, 60)");
});

test("carries the solar aurora hero atmosphere behind the top navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const hero = page.getByRole("region", {
    name: "Code tabs that belong in your docs.",
  });
  const appearance = await hero.evaluate((element) => ({
    backgroundImage: getComputedStyle(element).backgroundImage,
    top: element.getBoundingClientRect().top,
  }));
  const headerBackground = await page
    .locator("[data-v-gutter-top]")
    .evaluate((element) => getComputedStyle(element).backgroundColor);

  expect(appearance.top).toBe(0);
  expect(appearance.backgroundImage).toContain("190, 24, 93");
  expect(headerBackground).toBe("rgba(0, 0, 0, 0)");
});

test("retains the homepage theme after client-side navigation", async ({
  page,
}) => {
  await page.goto("/getting-started/");
  await page
    .getByRole("link", { name: "rehype-code-group", exact: true })
    .first()
    .click();

  await expect(page).toHaveURL(/\/$/);
  const fontSize = await page
    .getByRole("heading", {
      level: 1,
      name: "Code tabs that belong in your docs.",
    })
    .evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).fontSize),
    );
  expect(fontSize).toBeGreaterThan(64);
});

test("keeps the landing page focused without a playground", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("region", { name: "Interactive code group playground" }),
  ).toHaveCount(0);
  await expect(page.locator(".rcg-footer")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Playground", exact: true }),
  ).toHaveCount(0);
});

test("aligns the homepage content to one shared desktop grid", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const [title, highlights] = await Promise.all([
    page
      .getByRole("heading", {
        level: 1,
        name: "Code tabs that belong in your docs.",
      })
      .boundingBox(),
    page.getByRole("region", { name: "Project highlights" }).boundingBox(),
  ]);

  expect(title?.x).toBe(highlights?.x);
});

test("uses a coherent reading scale across homepage sections", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const heroDescription = page.getByText(
    /Turn neighboring code blocks—or arbitrary HTML content/,
  );
  const proofDescription = page.getByText(/downloads in the last 30 days/);

  const [heroType, proofType] = await Promise.all([
    heroDescription.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        fontSize: Number.parseFloat(style.fontSize),
        lineHeight: Number.parseFloat(style.lineHeight),
        width: element.getBoundingClientRect().width,
      };
    }),
    proofDescription.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        fontSize: Number.parseFloat(style.fontSize),
        lineHeight: Number.parseFloat(style.lineHeight),
      };
    }),
  ]);

  expect(heroType.fontSize).toBeGreaterThanOrEqual(16);
  expect(heroType.width).toBeLessThanOrEqual(640);
  expect(proofType.fontSize).toBeGreaterThanOrEqual(14);
  expect(proofType.lineHeight / proofType.fontSize).toBeGreaterThanOrEqual(1.2);
});

test("keeps the landing experience dark across system preferences", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");

  const colorScheme = await page.evaluate(
    () => getComputedStyle(document.documentElement).colorScheme,
  );
  expect(colorScheme).toBe("dark");
});

test("keeps the stock documentation home usable on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Code tabs that belong in your docs.",
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
