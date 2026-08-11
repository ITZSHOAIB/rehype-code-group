import { rehype } from "rehype";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { expect, test } from "vitest";
import rehypeCodeGroup from "../src/index.js";
import remarkCodeGroup from "../src/remark.js";

test("uses code-fence metadata as tab labels", async () => {
  const file = await rehype()
    .use(remarkParse)
    .use(remarkCodeGroup)
    .use(remarkRehype)
    .use(rehypeCodeGroup, { assets: "none" })
    .use(rehypeStringify)
    .process(
      "::: code-group\n\n```sh [npm]\nnpm install\n```\n\n```sh [pnpm]\npnpm add\n```\n\n:::",
    );

  const output = String(file);
  expect(output).toContain(">npm</button>");
  expect(output).toContain(">pnpm</button>");
});

test("finds bracketed labels alongside other fence metadata", async () => {
  const file = await rehype()
    .use(remarkParse)
    .use(remarkCodeGroup)
    .use(remarkRehype)
    .use(rehypeCodeGroup, { assets: "none" })
    .use(rehypeStringify)
    .process(
      "::: code-group\n\n```sh title=install.sh [npm]\nnpm install\n```\n\n:::",
    );

  expect(String(file)).toContain(">npm</button>");
});
