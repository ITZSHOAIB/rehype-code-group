import { rehype } from "rehype";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { expect, test } from "vitest";
import rehypeCodeGroup from "../src/index.js";
import remarkPackageManagers from "../src/package-managers.js";
import remarkCodeGroup from "../src/remark.js";

test("converts an npm install command for npm, pnpm, Yarn, and Bun", async () => {
  const file = await rehype()
    .use(remarkParse)
    .use(remarkPackageManagers)
    .use(remarkCodeGroup)
    .use(remarkRehype)
    .use(rehypeCodeGroup, { assets: "none" })
    .use(rehypeStringify)
    .process("```sh npm2yarn\nnpm install rehype-code-group\n```");

  const output = String(file);
  expect(output).toContain("npm install rehype-code-group");
  expect(output).toContain("pnpm add rehype-code-group");
  expect(output).toContain("yarn add rehype-code-group");
  expect(output).toContain("bun add rehype-code-group");
});

test("converts the npm install alias and keeps development flags", async () => {
  const file = await rehype()
    .use(remarkParse)
    .use(remarkPackageManagers)
    .use(remarkCodeGroup)
    .use(remarkRehype)
    .use(rehypeCodeGroup, { assets: "none" })
    .use(rehypeStringify)
    .process("```sh npm2yarn\nnpm i -D vitest\n```");

  const output = String(file);
  expect(output).toContain("pnpm add -D vitest");
  expect(output).toContain("yarn add -D vitest");
  expect(output).toContain("bun add -D vitest");
});

test("converts package removal commands", async () => {
  const file = await rehype()
    .use(remarkParse)
    .use(remarkPackageManagers)
    .use(remarkCodeGroup)
    .use(remarkRehype)
    .use(rehypeCodeGroup, { assets: "none" })
    .use(rehypeStringify)
    .process("```sh npm2yarn\nnpm uninstall lodash\n```");

  const output = String(file);
  expect(output).toContain("pnpm remove lodash");
  expect(output).toContain("yarn remove lodash");
  expect(output).toContain("bun remove lodash");
});

test("converts package script commands", async () => {
  const file = await rehype()
    .use(remarkParse)
    .use(remarkPackageManagers)
    .use(remarkCodeGroup)
    .use(remarkRehype)
    .use(rehypeCodeGroup, { assets: "none" })
    .use(rehypeStringify)
    .process("```sh npm2yarn\nnpm run build -- --watch\n```");

  const output = String(file);
  expect(output).toContain("pnpm run build -- --watch");
  expect(output).toContain("yarn run build -- --watch");
  expect(output).toContain("bun run build -- --watch");
});

test("converts one-off package executable commands", async () => {
  const file = await rehype()
    .use(remarkParse)
    .use(remarkPackageManagers)
    .use(remarkCodeGroup)
    .use(remarkRehype)
    .use(rehypeCodeGroup, { assets: "none" })
    .use(rehypeStringify)
    .process("```sh npm2yarn\nnpx prettier . --check\n```");

  const output = String(file);
  expect(output).toContain("pnpm dlx prettier . --check");
  expect(output).toContain("yarn dlx prettier . --check");
  expect(output).toContain("bunx prettier . --check");
});

test("converts every supported command in a multiline code fence", async () => {
  const file = await rehype()
    .use(remarkParse)
    .use(remarkPackageManagers, { packageManagers: ["npm", "pnpm"] })
    .use(remarkCodeGroup)
    .use(remarkRehype)
    .use(rehypeCodeGroup, { assets: "none" })
    .use(rehypeStringify)
    .process(
      "```sh npm2yarn\nnpm install vite\nnpm run build\nnpx vite preview\n```",
    );

  expect(String(file)).toContain(
    "pnpm add vite\npnpm run build\npnpm dlx vite preview",
  );
});

test("warns when an npm command cannot be translated safely", async () => {
  const file = await rehype()
    .use(remarkParse)
    .use(remarkPackageManagers)
    .use(remarkCodeGroup)
    .use(remarkRehype)
    .use(rehypeCodeGroup, { assets: "none" })
    .use(rehypeStringify)
    .process(
      "```sh npm2yarn\nnpm config set registry https://example.com\n```",
    );

  expect(file.messages.map((message) => message.reason)).toContain(
    'Unable to translate npm command: "npm config set registry https://example.com".',
  );
});

test("converts reproducible clean installs", async () => {
  const file = await rehype()
    .use(remarkParse)
    .use(remarkPackageManagers)
    .use(remarkCodeGroup)
    .use(remarkRehype)
    .use(rehypeCodeGroup, { assets: "none" })
    .use(rehypeStringify)
    .process("```sh npm2yarn\nnpm ci\n```");

  const output = String(file);
  expect(output).toContain("pnpm install --frozen-lockfile");
  expect(output).toContain("yarn install --immutable");
  expect(output).toContain("bun install --frozen-lockfile");
});
