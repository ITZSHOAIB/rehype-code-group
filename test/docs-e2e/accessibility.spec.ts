import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Fumadocs gives every code block's scroll viewport `role="region"` with no
 * accessible name, and doesn't let a site remove the role. axe reports the
 * repeated unnamed regions as `landmark-unique`. That markup belongs to
 * Fumadocs, not to this site or to rehype-code-group, so only that exact case
 * is set aside. Every other rule, including contrast inside code blocks, still
 * runs.
 */
const isFumadocsCodeViewport = (html: string) =>
  html.startsWith('<div role="region" tabindex="0"') &&
  html.includes("fd-scroll-container");

for (const path of ["/", "/docs/syntax/rich-groups/"]) {
  for (const colorScheme of ["light", "dark"] as const) {
    test(`${path} has no detectable accessibility violations (${colorScheme})`, async ({
      page,
    }) => {
      // Audit every section at full contrast, including those below the viewport.
      // Motion and the preference itself are covered in motion.spec.ts.
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      await page.goto(path);
      await expect(
        page.locator(".rehype-code-group[data-rcg-enhanced]").first(),
      ).toBeVisible();

      const results = await new AxeBuilder({ page }).analyze();
      const violations = results.violations
        .map((violation) => ({
          id: violation.id,
          nodes: violation.nodes.filter(
            (node) =>
              !(
                violation.id === "landmark-unique" &&
                isFumadocsCodeViewport(node.html)
              ),
          ),
        }))
        .filter((violation) => violation.nodes.length > 0)
        .map((violation) => ({
          id: violation.id,
          targets: violation.nodes.map((node) => node.target.join(" ")),
        }));
      expect(violations).toEqual([]);
    });
  }
}
