import { expect, test } from "@playwright/test";

test("selects a tab with a pointer", async ({ page }) => {
  await page.goto("/");

  const group = page.locator("#primary-group");
  const npmPanel = page.locator("#rcg-0-block-0");
  const pnpmPanel = page.locator("#rcg-0-block-1");

  await expect(group).toHaveAttribute("data-rcg-enhanced", "");
  await expect(npmPanel).toBeVisible();
  await expect(pnpmPanel).toBeHidden();

  await group.getByRole("tab", { name: "pnpm" }).click();

  await expect(group.getByRole("tab", { name: "pnpm" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(npmPanel).toBeHidden();
  await expect(pnpmPanel).toBeVisible();
});

test("moves focus and selection with the horizontal arrow keys", async ({
  page,
}) => {
  await page.goto("/");

  const group = page.locator("#primary-group");
  const npmTab = group.getByRole("tab", { exact: true, name: "npm" });
  const pnpmTab = group.getByRole("tab", { name: "pnpm" });
  await npmTab.focus();
  await npmTab.press("ArrowRight");

  await expect(pnpmTab).toBeFocused();
  await expect(pnpmTab).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#rcg-0-block-1")).toBeVisible();
});

test("reverses horizontal arrow navigation in RTL layouts", async ({
  page,
}) => {
  await page.goto("/");

  const group = page.locator("#primary-group");
  await group.evaluate((element) => element.setAttribute("dir", "rtl"));
  const npmTab = group.getByRole("tab", { exact: true, name: "npm" });
  const pnpmTab = group.getByRole("tab", { name: "pnpm" });
  await npmTab.focus();
  await npmTab.press("ArrowLeft");

  await expect(pnpmTab).toBeFocused();
  await expect(pnpmTab).toHaveAttribute("aria-selected", "true");
});

test("jumps to the first and last tabs with Home and End", async ({ page }) => {
  await page.goto("/");

  const group = page.locator("#primary-group");
  const npmTab = group.getByRole("tab", { exact: true, name: "npm" });
  const pnpmTab = group.getByRole("tab", { name: "pnpm" });
  await npmTab.focus();
  await npmTab.press("End");
  await expect(pnpmTab).toBeFocused();

  await pnpmTab.press("Home");
  await expect(npmTab).toBeFocused();
  await expect(npmTab).toHaveAttribute("aria-selected", "true");
});

test("synchronizes groups that share an explicit key", async ({ page }) => {
  await page.goto("/");

  const primary = page.locator("#primary-group");
  const secondary = page.locator("#secondary-group");
  await primary.getByRole("tab", { name: "pnpm" }).click();

  await expect(secondary.getByRole("tab", { name: "pnpm" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.locator("#rcg-1-block-1")).toBeVisible();
});

test("restores a locally persisted selection", async ({ page }) => {
  await page.goto("/");

  const primary = page.locator("#primary-group");
  await primary.getByRole("tab", { name: "pnpm" }).click();
  await page.reload();

  await expect(primary.getByRole("tab", { name: "pnpm" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(
    page.locator("#secondary-group").getByRole("tab", { name: "pnpm" }),
  ).toHaveAttribute("aria-selected", "true");
});

test("restores a selection from the URL", async ({ page }) => {
  await page.goto("/?rcg-package-manager=pnpm");

  const secondary = page.locator("#secondary-group");
  await expect(secondary.getByRole("tab", { name: "pnpm" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(
    page.locator("#primary-group").getByRole("tab", { name: "pnpm" }),
  ).toHaveAttribute("aria-selected", "true");
});

test("persists synchronized state in every participating mode", async ({
  page,
}) => {
  await page.goto("/");

  const secondary = page.locator("#secondary-group");
  await secondary.getByRole("tab", { name: "pnpm" }).click();
  await expect(page).toHaveURL(/rcg-package-manager=pnpm/);

  await page.goto("/");
  await expect(
    page.locator("#primary-group").getByRole("tab", { name: "pnpm" }),
  ).toHaveAttribute("aria-selected", "true");
});

test("moves through vertical tabs with ArrowDown", async ({ page }) => {
  await page.goto("/");

  const secondary = page.locator("#secondary-group");
  const npmTab = secondary.getByRole("tab", { exact: true, name: "npm" });
  const pnpmTab = secondary.getByRole("tab", { name: "pnpm" });
  await npmTab.focus();
  await npmTab.press("ArrowDown");

  await expect(pnpmTab).toBeFocused();
  await expect(pnpmTab).toHaveAttribute("aria-selected", "true");
});

test("enhances code groups inserted after initialization", async ({ page }) => {
  await page.goto("/");

  await page.evaluate(() => {
    const source = document.querySelector("#primary-group");
    const clone = source?.cloneNode(true);
    if (!(clone instanceof HTMLElement)) return;
    clone.id = "dynamic-group";
    clone.removeAttribute("data-rcg-enhanced");
    document.body.append(clone);
  });

  await expect(page.locator("#dynamic-group")).toHaveAttribute(
    "data-rcg-enhanced",
    "",
  );
});

test("emits a typed change detail for application integrations", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    document.addEventListener(
      "rehype-code-group:change",
      (event) => {
        (
          window as typeof window & { codeGroupDetail?: unknown }
        ).codeGroupDetail = (event as CustomEvent).detail;
      },
      { once: true },
    );
  });

  await page
    .locator("#primary-group")
    .getByRole("tab", { name: "pnpm" })
    .click();

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as typeof window & { codeGroupDetail?: unknown })
            .codeGroupDetail,
      ),
    )
    .toEqual({
      index: 1,
      source: "pointer",
      syncKey: "package-manager",
      value: "pnpm",
    });
});

test("initialization is idempotent and exposes cleanup", async ({ page }) => {
  await page.goto("/");

  const reusedCleanup = await page.evaluate(async () => {
    const { initCodeGroups } = await import("/dist/client.js");
    const first = initCodeGroups(document);
    const second = initCodeGroups(document);
    const same = first === second;
    first();
    return same;
  });
  expect(reusedCleanup).toBe(true);

  const group = page.locator("#primary-group");
  await group.getByRole("tab", { name: "pnpm" }).click();
  await expect(
    group.getByRole("tab", { exact: true, name: "npm" }),
  ).toHaveAttribute("aria-selected", "true");
});

test("prints every panel regardless of the active tab", async ({ page }) => {
  await page.goto("/");
  await page
    .locator("#primary-group")
    .getByRole("tab", { name: "pnpm" })
    .click();
  await page.emulateMedia({ media: "print" });

  await expect(page.locator("#rcg-0-block-0")).toBeVisible();
  await expect(page.locator("#rcg-0-block-1")).toBeVisible();
});

test("moves custom active classes with the selected tab", async ({ page }) => {
  await page.goto("/");

  const group = page.locator("#custom-class-group");
  await group.getByRole("tab", { name: "Second" }).click();

  await expect(group.getByRole("tab", { name: "First" })).not.toHaveClass(
    /selected-tab/,
  );
  await expect(group.getByRole("tab", { name: "Second" })).toHaveClass(
    /selected-tab/,
  );
  await expect(page.locator("#custom-block-0")).not.toHaveClass(
    /selected-panel/,
  );
  await expect(page.locator("#custom-block-1")).toHaveClass(/selected-panel/);
});
