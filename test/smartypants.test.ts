import { rehype } from "rehype";
import rehypeMinifyWhitespace from "rehype-minify-whitespace";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkSmartypants from "remark-smartypants";
import { expect, test } from "vitest";
import rehypeCodeGroup from "../src/index.js";

// Astro and other hosts curl straight quotes before rehype plugins run.
const processWithSmartypants = async (input: string) =>
  String(
    await rehype()
      .use(remarkParse)
      .use(remarkSmartypants)
      .use(remarkRehype)
      .use(rehypeCodeGroup, { assets: "none" })
      .use(rehypeMinifyWhitespace)
      .use(rehypeStringify)
      .process(input),
  );

test("reads rich-group attributes whose quotes were curled by smartypants", async () => {
  const output = await processWithSmartypants(
    ':::: code-group label="Install with" sync="pm"\n\n::: code-tab label=":package: npm" value="npm"\n\n```sh\nnpm install\n```\n\n:::\n\n::: code-tab label=\'Yarn classic\' value=\'yarn\'\n\n```sh\nyarn add\n```\n\n:::\n\n::::',
  );

  expect(output).toContain('role="tablist" aria-label="Install with"');
  expect(output).toContain('data-rcg-sync="pm"');
  expect(output).toContain('data-rcg-value="npm"');
  expect(output).toContain(">📦 npm</button>");
  expect(output).toContain('data-rcg-value="yarn"');
  expect(output).toContain(">Yarn classic</button>");
});

test("reads compact labels whose quotes were curled by smartypants", async () => {
  const output = await processWithSmartypants(
    "::: code-group labels=[\"npm, classic\", 'pnpm']\n\n```sh\nnpm install\n```\n\n```sh\npnpm add\n```\n\n:::",
  );

  expect(output).toContain(">npm, classic</button>");
  expect(output).toContain(">pnpm</button>");
});

test("keeps apostrophes inside smart-quoted labels", async () => {
  const output = await processWithSmartypants(
    ':::: code-group\n\n::: code-tab label="Node\'s runtime" value="node"\n\n```sh\nnode app.js\n```\n\n:::\n\n::::',
  );

  expect(output).toContain(">Node’s runtime</button>");
});
