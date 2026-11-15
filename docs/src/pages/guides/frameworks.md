---
title: Frameworks
description: Configure rehype-code-group in Astro and unified pipelines.
---

# Frameworks

The plugin belongs in the rehype phase regardless of framework. What changes is who owns the Markdown pipeline and browser assets.

| Environment | Pipeline hook | Recommended asset mode |
| --- | --- | --- |
| Astro 7 (Sätteri) | `markdown.processor` with `rehype-code-group/satteri` | `"inline"` or `"none"` |
| Astro 6 and earlier | `markdown.rehypePlugins` | `"inline"` or `"none"` |
| Vocs | Separate unified pipeline or MDX component | `"none"` |
| Unified | `.use(rehypeCodeGroup)` after `remarkRehype` | Any |

## Astro

Astro 7 renders Markdown with Sätteri by default. Add the Sätteri plugins to its processor; they take the same options and write the same HTML as the rehype plugin.

```ts [astro.config.ts]
import { satteri } from "@astrojs/markdown-satteri";
import { defineConfig } from "astro/config";
import {
  satteriCodeGroup,
  satteriCodeGroupLabels,
} from "rehype-code-group/satteri";

export default defineConfig({
  markdown: {
    processor: satteri({ // [!code focus]
      mdastPlugins: [satteriCodeGroupLabels()], // [!code focus]
      hastPlugins: [satteriCodeGroup({ assets: "inline" })], // [!code focus]
    }), // [!code focus]
  },
});
```

`satteriCodeGroupLabels` is optional: it takes tab labels from `[label]` fence metadata, like the remark companion. The `npm2yarn` package-manager converter is remark-only for now.

On Astro 6 and earlier, or with `@astrojs/markdown-remark` installed, add the rehype plugin to `markdown.rehypePlugins` instead.

```ts [astro.config.ts]
import { defineConfig } from "astro/config";
import rehypeCodeGroup from "rehype-code-group";

export default defineConfig({
  markdown: {
    rehypePlugins: [[rehypeCodeGroup, { assets: "inline" }]], // [!code focus]
  },
});
```

For a global application bundle, choose `assets: "none"`, import the CSS from a global stylesheet, and import the browser client from an Astro component script.

## Vocs

Vocs already provides native code groups for hand-authored documentation. Use `rehype-code-group` when you need its generated HAST contract, rich-content tabs, explicit synchronization, or persistence. See the dedicated [Vocs integration guide](/guides/vocs) for the safe setup and the syntax boundary between both tools.

:::warning
Do not feed the same `:::code-group` directive through both Vocs' built-in transformer and `rehype-code-group`. Each syntax needs one clear owner.
:::

## Unified and remark

The fence-metadata helper must run in the remark phase. The rehype plugin runs after `remark-rehype`.

```ts [markdown-pipeline.ts]
processor
  .use(remarkParse)
  .use(remarkCodeGroup)
  .use(remarkRehype) // [!code focus]
  .use(rehypeCodeGroup) // [!code focus]
  .use(rehypeStringify);
```

## Package-manager converter

Mark a shell fence with `npm2yarn` and run the package-manager remark plugin before `remarkCodeGroup`.

````md [install-command.md]
```sh npm2yarn
npm install rehype-code-group
```
````

It generates npm, pnpm, Yarn, and Bun tabs for install aliases, removals, scripts, and one-off `npx` executables. Unsupported npm commands produce a VFile warning instead of a silently invented translation.

:::tip
Treat the converter as an authoring convenience, not a shell interpreter. Diagnostics are preferable to plausible but incorrect commands.
:::
