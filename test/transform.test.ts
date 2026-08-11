import { expect, test } from "vitest";
import {
  processMarkdown,
  processMarkdownFile,
} from "../scripts/processMarkdown.js";
import { fullEmojiResolver } from "../src/emoji.js";

test("leaves prose containing directive text unchanged", async () => {
  const output = await processMarkdown(
    "Before ::: code-group labels=[npm] after\n\n```sh\nnpm install\n```\n\n:::",
    {},
  );

  expect(output).toBe(
    '<p>Before ::: code-group labels=[npm] after</p><pre><code class="language-sh">npm install\n</code></pre><p>:::</p>',
  );
});

test("warns and leaves a group unchanged when labels and panels differ", async () => {
  const file = await processMarkdownFile(
    "::: code-group labels=[npm, pnpm]\n\n```sh\nnpm install\n```\n\n:::",
    {},
  );

  expect(String(file)).toBe(
    '<p>::: code-group labels=[npm, pnpm]</p><pre><code class="language-sh">npm install\n</code></pre><p>:::</p>',
  );
  expect(file.messages.map((message) => message.reason)).toEqual([
    "Code group has 2 labels but 1 panel.",
  ]);
});

test("can suppress diagnostics for malformed groups", async () => {
  const file = await processMarkdownFile(
    "::: code-group labels=[npm, pnpm]\n\n```sh\nnpm install\n```\n\n:::",
    { diagnostics: "silent" },
  );

  expect(file.messages).toHaveLength(0);
});

test("produces deterministic IDs for independent transformations", async () => {
  const input = "::: code-group labels=[npm]\n\n```sh\nnpm install\n```\n\n:::";

  const first = await processMarkdown(input, {});
  const second = await processMarkdown(input, {});

  expect(second).toBe(first);
});

test("can emit semantic code-group markup without assets", async () => {
  const output = await processMarkdown(
    "::: code-group labels=[npm]\n\n```sh\nnpm install\n```\n\n:::",
    { assets: "none" },
  );

  expect(output).toContain('<div class="rehype-code-group">');
  expect(output).not.toContain("<head>");
  expect(output).not.toContain("<style>");
  expect(output).not.toContain("<script");
});

test("does not manufacture a head element for a fragment", async () => {
  const output = await processMarkdown(
    "::: code-group labels=[npm]\n\n```sh\nnpm install\n```\n\n:::",
    {},
  );

  expect(output).not.toContain("<head>");
  expect(output).toContain("<style>");
  expect(output).toContain("<script");
});

test("keeps every panel readable before the client enhances the group", async () => {
  const output = await processMarkdown(
    "::: code-group labels=[npm, pnpm]\n\n```sh\nnpm install\n```\n\n```sh\npnpm add\n```\n\n:::",
    { assets: "none" },
  );

  expect(output).not.toContain(" hidden");
});

test("gives each tab list an accessible name", async () => {
  const output = await processMarkdown(
    "::: code-group labels=[npm]\n\n```sh\nnpm install\n```\n\n:::",
    { assets: "none" },
  );

  expect(output).toContain(
    'class="rcg-tab-container" role="tablist" aria-label="Code examples"',
  );
});

test("adds a CSP nonce to inline assets", async () => {
  const output = await processMarkdown(
    "::: code-group labels=[npm]\n\n```sh\nnpm install\n```\n\n:::",
    { assets: { mode: "inline", nonce: "request-nonce" } },
  );

  expect(output).toContain('<style nonce="request-nonce">');
  expect(output).toContain(
    '<script type="text/javascript" nonce="request-nonce">',
  );
});

test("can reference external assets for a strict CSP", async () => {
  const output = await processMarkdown(
    "::: code-group labels=[npm]\n\n```sh\nnpm install\n```\n\n:::",
    {
      assets: {
        mode: "external",
        nonce: "request-nonce",
        scriptSrc: "/assets/rehype-code-group.js",
        stylesheetHref: "/assets/rehype-code-group.css",
      },
    },
  );

  expect(output).toContain(
    '<link rel="stylesheet" href="/assets/rehype-code-group.css" nonce="request-nonce">',
  );
  expect(output).toContain(
    '<script type="module" src="/assets/rehype-code-group.js" nonce="request-nonce"></script>',
  );
});

test("can prefix generated IDs when independently compiled fragments are combined", async () => {
  const output = await processMarkdown(
    "::: code-group labels=[npm]\n\n```sh\nnpm install\n```\n\n:::",
    { assets: "none", idPrefix: "install-guide" },
  );

  expect(output).toContain('id="install-guide-0-tab-0"');
  expect(output).toContain('aria-controls="install-guide-0-block-0"');
});

test("supports quoted labels containing commas", async () => {
  const output = await processMarkdown(
    '::: code-group labels=["npm, classic", "pnpm"]\n\n```sh\nnpm install\n```\n\n```sh\npnpm add\n```\n\n:::',
    { assets: "none" },
  );

  expect(output).toContain(">npm, classic</button>");
  expect(output).toContain(">pnpm</button>");
});

test("can fail the build for malformed groups in strict mode", async () => {
  await expect(
    processMarkdown(
      "::: code-group labels=[npm, pnpm]\n\n```sh\nnpm install\n```\n\n:::",
      { diagnostics: "error" },
    ),
  ).rejects.toThrow("Code group has 2 labels but 1 panel.");
});

test("groups arbitrary multi-node content with nested code-tab directives", async () => {
  const output = await processMarkdown(
    ':::: code-group label="Install with"\n\n::: code-tab label="npm" value="npm"\n\nUse npm:\n\n```sh\nnpm install\n```\n\n:::\n\n::: code-tab label="pnpm" value="pnpm"\n\nUse pnpm:\n\n```sh\npnpm add\n```\n\n:::\n\n::::',
    { assets: "none" },
  );

  expect(output).toContain('role="tablist" aria-label="Install with"');
  expect(output).toContain('data-rcg-value="npm"');
  expect(output).toContain(">npm</button>");
  expect(output).toContain("<p>Use npm:</p><pre>");
  expect(output).toContain('data-rcg-value="pnpm"');
  expect(output).toContain(">pnpm</button>");
  expect(output).toContain("<p>Use pnpm:</p><pre>");
});

test("selects a declared default tab in generated markup", async () => {
  const output = await processMarkdown(
    ':::: code-group default="pnpm"\n\n::: code-tab label="npm" value="npm"\n\n```sh\nnpm install\n```\n\n:::\n\n::: code-tab label="pnpm" value="pnpm"\n\n```sh\npnpm add\n```\n\n:::\n\n::::',
    { assets: "none" },
  );

  expect(output).toMatch(
    /aria-selected="true"[^>]*data-rcg-value="pnpm"[^>]*tabindex="0"/,
  );
  expect(output).toMatch(
    /aria-selected="false"[^>]*data-rcg-value="npm"[^>]*tabindex="-1"/,
  );
});

test("emits explicit synchronization and orientation metadata", async () => {
  const output = await processMarkdown(
    ':::: code-group sync="package-manager" persist="local" orientation="vertical"\n\n::: code-tab label="npm" value="npm"\n\n```sh\nnpm install\n```\n\n:::\n\n::::',
    { assets: "none" },
  );

  expect(output).toContain('data-rcg-sync="package-manager"');
  expect(output).toContain('data-rcg-persist="local"');
  expect(output).toContain('aria-orientation="vertical"');
});

test("can resolve tab labels with an application-defined function", async () => {
  const output = await processMarkdown(
    "::: code-group labels=[:tool: npm]\n\n```sh\nnpm install\n```\n\n:::",
    {
      assets: "none",
      labelResolver: (label) => label.replace(":tool:", "🛠️"),
    },
  );

  expect(output).toContain(">🛠️ npm</button>");
});

test("offers the complete emoji catalog as an opt-in resolver", async () => {
  const output = await processMarkdown(
    "::: code-group labels=[:coffee: npm]\n\n```sh\nnpm install\n```\n\n:::",
    { assets: "none", labelResolver: fullEmojiResolver },
  );

  expect(output).toContain(">☕ npm</button>");
});

test("exposes stable CSS custom properties for application theming", async () => {
  const output = await processMarkdown(
    "::: code-group labels=[npm]\n\n```sh\nnpm install\n```\n\n:::",
    {},
  );

  expect(output).toContain("--rcg-accent:");
  expect(output).toContain("--rcg-border-color:");
  expect(output).toContain("--rcg-tab-background-active:");
});

test("does not emit invalid orientation or persistence semantics", async () => {
  const output = await processMarkdown(
    ':::: code-group persist="session" orientation="diagonal"\n\n::: code-tab label="npm" value="npm"\n\n```sh\nnpm install\n```\n\n:::\n\n::::',
    { assets: "none" },
  );

  expect(output).not.toContain('data-rcg-persist="session"');
  expect(output).not.toContain('aria-orientation="diagonal"');
  expect(output).not.toContain('data-rcg-orientation="diagonal"');
});

test("retains panel labels for printed output", async () => {
  const output = await processMarkdown(
    "::: code-group labels=[npm]\n\n```sh\nnpm install\n```\n\n:::",
    { assets: "none" },
  );

  expect(output).toMatch(/class="rcg-block active"[^>]*data-rcg-label="npm"/);
});

test("exposes active class metadata for the browser runtime", async () => {
  const output = await processMarkdown(
    "::: code-group labels=[npm]\n\n```sh\nnpm install\n```\n\n:::",
    {
      assets: "none",
      customClassNames: {
        activeTabClass: "selected-tab",
        activeBlockClass: "selected-panel",
      },
    },
  );

  expect(output).toContain('data-rcg-active-tab-classes="active selected-tab"');
  expect(output).toContain(
    'data-rcg-active-block-classes="active selected-panel"',
  );
});
