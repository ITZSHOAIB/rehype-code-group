<p align="center">
  <img width="180" height="180" alt="rehype-code-group logo" src="https://raw.githubusercontent.com/ITZSHOAIB/rehype-code-group/main/docs/public/rehype-code-group-logo.png" />
</p>

# rehype-code-group

[![npm version](https://img.shields.io/npm/v/rehype-code-group)](https://www.npmjs.com/package/rehype-code-group)
[![weekly downloads](https://img.shields.io/npm/dw/rehype-code-group)](https://www.npmjs.com/package/rehype-code-group)
[![bundle size](https://img.shields.io/bundlephobia/minzip/rehype-code-group)](https://bundlephobia.com/package/rehype-code-group)
[![license](https://img.shields.io/npm/l/rehype-code-group)](./LICENSE)

Accessible, framework-neutral code tabs for rehype. Group highlighted code or arbitrary content, synchronize related choices, persist state, and choose exactly how browser assets are delivered.

[Documentation](https://rehype-code-group.pages.dev/) · [npm](https://www.npmjs.com/package/rehype-code-group) · [Report an issue](https://github.com/ITZSHOAIB/rehype-code-group/issues)

## Why use it?

- Works after any syntax highlighter instead of owning highlighting.
- Uses ARIA tabs, roving focus, RTL-aware arrows, vertical navigation, and `Home`/`End`.
- Keeps every panel readable when JavaScript is unavailable and when printing.
- Supports compact code groups and rich tabs containing prose, lists, or multiple blocks.
- Synchronizes only with explicit keys; state can live in local storage or a shareable URL.
- Offers inline, external, nonce-bearing, and application-owned asset modes for strict CSPs.
- Includes remark helpers for fence metadata and npm/pnpm/Yarn/Bun command conversion.
- Ships an ESM browser client, authoritative CSS, and TypeScript declarations as public subpaths.

Inspired by [VitePress code groups](https://vitepress.dev/guide/markdown#code-groups), designed for the wider unified ecosystem.

## Install

This package is ESM-only and supports Node.js 20 or newer.

```sh
npm install rehype-code-group
# pnpm add rehype-code-group
# yarn add rehype-code-group
# bun add rehype-code-group
```

## Quick start

```ts
import { rehype } from "rehype";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeCodeGroup from "rehype-code-group";

const file = await rehype()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeCodeGroup)
  .use(rehypeStringify)
  .process(markdown);
```

Then write one label per code block:

````md
::: code-group labels=[npm, pnpm, yarn]

```sh
npm install rehype-code-group
```

```sh
pnpm add rehype-code-group
```

```sh
yarn add rehype-code-group
```

:::
````

Labels containing commas can be quoted. The small default resolver supports common shortcodes including `:package:`, `:yarn:`, `:robot:`, `:rocket:`, and `:sparkles:`.

## Rich-content groups

Use four colons around nested `code-tab` directives. Panels may contain any content emitted into HAST.

`````md
:::: code-group label="Choose a runtime" default="node" sync="runtime" persist="local"

::: code-tab label="Node.js" value="node"

Use the current LTS release:

```sh
node app.js
```

:::

::: code-tab label="Bun" value="bun"

Run TypeScript directly:

```sh
bun app.ts
```

:::

::::
`````

Set `orientation="vertical"` for an `ArrowUp`/`ArrowDown` tab list. Use `persist="url"` when the selected value should be shareable as `?rcg-runtime=bun`.

## Fence metadata

Run the remark companion before `remark-rehype` to use fence metadata as labels:

```ts
import remarkCodeGroup from "rehype-code-group/remark";

processor.use(remarkCodeGroup).use(remarkRehype);
```

````md
::: code-group

```sh [npm]
npm install package
```

```sh [pnpm]
pnpm add package
```

:::
````

## Package-manager tabs

The optional remark converter translates install aliases, removals, scripts, multiline fences, and `npx` executables. Unsupported npm commands emit a diagnostic rather than guessing.

```ts
import remarkPackageManagers from "rehype-code-group/package-managers";

processor
  .use(remarkPackageManagers, { packageManagers: ["npm", "pnpm", "yarn", "bun"] })
  .use(remarkCodeGroup)
  .use(remarkRehype);
```

````md
```sh npm2yarn
npm install rehype-code-group
```
````

## Asset delivery

Inline assets are the zero-config default and are emitted only when a group exists.

```ts
processor.use(rehypeCodeGroup, {
  assets: { mode: "inline", nonce: requestNonce },
});
```

For a global application bundle:

```ts
// Markdown configuration
processor.use(rehypeCodeGroup, { assets: "none" });

// Application entry point
import "rehype-code-group/styles.css";
import { initCodeGroups } from "rehype-code-group/client";

const cleanup = initCodeGroups(document);
```

Strict CSP deployments can ask the plugin to emit external URLs:

```ts
processor.use(rehypeCodeGroup, {
  assets: {
    mode: "external",
    stylesheetHref: "/assets/code-group.css",
    scriptSrc: "/assets/code-group.js",
    nonce: requestNonce,
  },
});
```

## Options

```ts
type RehypeCodeGroupOptions = {
  assets?:
    | "inline"
    | "none"
    | { mode: "inline"; nonce?: string }
    | {
        mode: "external";
        nonce?: string;
        scriptSrc: string;
        stylesheetHref: string;
      };
  customClassNames?: Partial<ClassNames>;
  diagnostics?: "warn" | "error" | "silent";
  idPrefix?: string;
  labelResolver?: (label: string) => string;
};
```

Malformed compact groups remain untouched. `diagnostics: "warn"` adds a VFile message, `"error"` fails the build, and `"silent"` suppresses the message.

Generated IDs are deterministic per transformation. Supply `idPrefix` when separately compiled fragments will later share one document.

## Styling

Default classes are retained when custom classes are added, keeping browser behavior stable. The bundled styles keep tabs aligned inside host typography systems and follow the page's light or dark `color-scheme`. Theme with `--rcg-accent`, `--rcg-border-color`, `--rcg-focus-color`, `--rcg-tab-background`, `--rcg-tab-background-active`, and `--rcg-tab-color`.

```css
.rehype-code-group {
  --rcg-accent: rebeccapurple;
  --rcg-tab-background-active: color-mix(in srgb, rebeccapurple 12%, transparent);
}
```

## Emoji catalog

The default resolver intentionally stays small. Opt into the complete catalog:

```ts
import rehypeCodeGroup from "rehype-code-group";
import { fullEmojiResolver } from "rehype-code-group/emoji";

processor.use(rehypeCodeGroup, { labelResolver: fullEmojiResolver });
```

Any application-defined label resolver is supported.

## Browser events

Direct selections emit a bubbling `rehype-code-group:change` event with `{ index, source, syncKey, value }`. The client observes dynamically inserted groups and repeated initialization of the same root is safe and returns its existing cleanup function.

## Astro

```ts
import { defineConfig } from "astro/config";
import rehypeCodeGroup from "rehype-code-group";

export default defineConfig({
  markdown: {
    rehypePlugins: [[rehypeCodeGroup, { assets: "inline" }]],
  },
});
```

See the [framework guide](https://rehype-code-group.pages.dev/guides/frameworks/) for Astro and Vocs integration notes.

## Documentation site

The documentation is a fully static [Vocs](https://vocs.dev/) site with interactive examples powered by the package's public browser client and stylesheet.

```sh
pnpm docs:dev
pnpm docs:build
```

For Cloudflare Pages, keep the repository root as the project root, use `pnpm docs:build` as the build command, and use `docs/dist/public` as the output directory. Set `VOCS_BASE_URL` to the canonical deployed URL in the production environment only; leave it unset for local and branch previews so their assets and navigation remain self-contained.

## Quality and security

Unit tests enforce coverage thresholds. Playwright exercises Chromium, Firefox, WebKit, dynamic content, keyboard behavior, no-JavaScript fallback, and axe checks. CI also tests supported Node releases, audits all dependencies, performs dependency review and CodeQL analysis, generates an SBOM, validates the packed npm artifact, and can run Snyk when `SNYK_TOKEN` is configured.

Security reports follow the private process in [SECURITY.md](./SECURITY.md).

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md), add a failing public-behavior test first, and include a changeset for user-visible changes.

## License

[MIT](./LICENSE) © Sohab Sk
