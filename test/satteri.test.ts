import fs from "node:fs";
import path from "node:path";
import { rehype } from "rehype";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { markdownToHtml, mdxToJs } from "satteri";
import { describe, expect, test, vi } from "vitest";
import { fullEmojiResolver } from "../src/emoji.js";
import rehypeCodeGroup from "../src/index.js";
import type { RehypeCodeGroupOptions } from "../src/options.js";
import remarkCodeGroup from "../src/remark.js";
import { satteriCodeGroup, satteriCodeGroupLabels } from "../src/satteri.js";

const viaUnified = async (input: string, options: RehypeCodeGroupOptions) =>
  String(
    await rehype()
      .use(remarkParse)
      .use(remarkCodeGroup)
      .use(remarkRehype)
      .use(rehypeCodeGroup, options)
      .use(rehypeStringify)
      .process(input),
  );

const viaSatteri = (input: string, options: RehypeCodeGroupOptions) =>
  markdownToHtml(input, {
    mdastPlugins: [satteriCodeGroupLabels()],
    hastPlugins: [satteriCodeGroup(options)],
  }).html;

// The two serializers differ only in the whitespace they put between blocks.
const normalize = (html: string) => html.replaceAll(/>\s+</g, "><").trim();

const fixturesDir = path.join(__dirname, "fixtures");
const fixtureInputs = fs
  .readdirSync(fixturesDir)
  .filter((name) => name.endsWith("-md"))
  .map((name) => [
    name,
    fs.readFileSync(path.join(fixturesDir, name, "input.md"), "utf8"),
  ]);

const group = "::: code-group labels=[npm]\n\n```sh\nnpm install\n```\n\n:::";

const parityCases: [string, string, RehypeCodeGroupOptions][] = [
  ...fixtureInputs.map(
    ([name, input]) =>
      [name, input, {}] as [string, string, RehypeCodeGroupOptions],
  ),
  [
    "fence-metadata labels",
    '::: code-group\n\n```sh [npm] title="install"\nnpm install\n```\n\n```sh [pnpm]\npnpm add\n```\n\n:::',
    { assets: "none" },
  ],
  [
    "rich tabs",
    ':::: code-group sync=pm persist=local default=pnpm label="Install"\n\n::: code-tab label=npm\n\nRun **npm**.\n\n:::\n\n::: code-tab label=pnpm value=pnpm\n\n```sh\npnpm add\n```\n\n:::\n\n::::',
    { assets: "none" },
  ],
  ["nested in a blockquote", `> ${group.replaceAll("\n", "\n> ")}`, {}],
  [
    "mismatched labels",
    "::: code-group labels=[npm, pnpm]\n\n```sh\nnpm install\n```\n\n:::",
    { diagnostics: "silent" },
  ],
  [
    "custom classes and ID prefix",
    group,
    {
      idPrefix: "docs",
      customClassNames: { activeTabClass: "is-on", tabClass: "my-tab" },
    },
  ],
  [
    "external assets",
    group,
    {
      assets: {
        mode: "external",
        nonce: "abc",
        scriptSrc: "/rcg.js",
        stylesheetHref: "/rcg.css",
      },
    },
  ],
  [
    "inline assets with nonce",
    group,
    { assets: { mode: "inline", nonce: "abc" } },
  ],
  [
    "full emoji resolver",
    "::: code-group labels=[:rocket: npm]\n\n```sh\nnpm install\n```\n\n:::",
    { labelResolver: fullEmojiResolver },
  ],
  ["no code groups", "# Title\n\nJust prose with ::: in it.", {}],
];

describe("Sätteri output matches the unified plugins", () => {
  for (const [name, input, options] of parityCases) {
    test(name, async () => {
      expect(normalize(viaSatteri(input, options))).toBe(
        normalize(await viaUnified(input, options)),
      );
    });
  }
});

// Astro's Sätteri processor enables smart punctuation unless `smartypants` is false.
test("reads quoted values curled by Astro's default smart punctuation", () => {
  const { html } = markdownToHtml(
    ':::: code-group label="Install with" sync="pm"\n\n::: code-tab label=":package: npm" value="npm"\n\n```sh\nnpm install\n```\n\n:::\n\n::::\n\n::: code-group labels=["npm, classic", \'pnpm\']\n\n```sh\nnpm install\n```\n\n```sh\npnpm add\n```\n\n:::',
    {
      features: { smartPunctuation: true },
      hastPlugins: [satteriCodeGroup({ assets: "none" })],
    },
  );

  expect(html).toContain('role="tablist" aria-label="Install with"');
  expect(html).toContain('data-rcg-sync="pm"');
  expect(html).toContain(">📦 npm</button>");
  expect(html).toContain(">npm, classic</button>");
  expect(html).toContain(">pnpm</button>");
});

test("numbers groups per document, not per plugin instance", () => {
  const plugins = {
    mdastPlugins: [satteriCodeGroupLabels()],
    hastPlugins: [satteriCodeGroup({ assets: "none" })],
  };
  const first = markdownToHtml(group, plugins).html;
  const second = markdownToHtml(group, plugins).html;

  expect(second).toBe(first);
  expect(first).toContain('id="rcg-0-tab-0"');
});

test("warns about a malformed group, naming the file", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  markdownToHtml(
    "::: code-group labels=[npm, pnpm]\n\n```sh\nnpm install\n```\n\n:::",
    {
      fileURL: new URL("file:///docs/install.md"),
      hastPlugins: [satteriCodeGroup()],
    },
  );

  expect(warn).toHaveBeenCalledOnce();
  expect(warn.mock.calls[0][0]).toContain(
    "Code group has 2 labels but 1 panel.",
  );
  expect(warn.mock.calls[0][0]).toContain("install.md");
  warn.mockRestore();
});

test("throws on a malformed group when diagnostics is error", () => {
  expect(() =>
    markdownToHtml(
      "::: code-group labels=[npm, pnpm]\n\n```sh\nnpm install\n```\n\n:::",
      { hastPlugins: [satteriCodeGroup({ diagnostics: "error" })] },
    ),
  ).toThrow("Code group has 2 labels but 1 panel.");
});

test("stays silent about a malformed group when diagnostics is silent", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  markdownToHtml(
    "::: code-group labels=[npm, pnpm]\n\n```sh\nnpm install\n```\n\n:::",
    { hastPlugins: [satteriCodeGroup({ diagnostics: "silent" })] },
  );

  expect(warn).not.toHaveBeenCalled();
  warn.mockRestore();
});

test("keeps explicit JSX out of the MDX components map", () => {
  const input = `<a href="/docs">Docs</a>

${group}`;
  const compile = (hastPlugins: Parameters<typeof mdxToJs>[1]["hastPlugins"]) =>
    mdxToJs(input, { hastPlugins }).code;

  expect(compile([])).toContain('_jsx("a"');
  expect(compile([satteriCodeGroup({ assets: "none" })])).toContain('_jsx("a"');
});

test("transforms code groups in MDX and keeps the MDX intact", () => {
  const { code } = mdxToJs(
    `import Note from "./note"\n\n<Note level={2}>Hi</Note>\n\n${group}`,
    {
      mdastPlugins: [satteriCodeGroupLabels()],
      hastPlugins: [satteriCodeGroup({ assets: "none" })],
    },
  );

  expect(code).toContain('import Note from "./note"');
  expect(code).toContain("level: 2");
  expect(code).toContain('"rehype-code-group"');
  expect(code).toContain('role: "tablist"');
});
