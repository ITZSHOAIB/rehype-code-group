---
title: Frameworks
description: Configure rehype-code-group in Astro, Vocs, and unified pipelines.
---

# Frameworks

## Astro

Add the plugin to `markdown.rehypePlugins`.

```ts
import { defineConfig } from "astro/config";
import rehypeCodeGroup from "rehype-code-group";

export default defineConfig({
  markdown: {
    rehypePlugins: [[rehypeCodeGroup, { assets: "inline" }]],
  },
});
```

For a global application bundle, choose `assets: "none"`, import the CSS from a global stylesheet, and import the browser client from an Astro component script.

## Vocs

Vocs pages support MDX imports, so a live documentation preview can use a small client component that imports `rehype-code-group/client`. The plugin itself remains framework-neutral: it only needs the generated HTML and its browser client.

For generated Markdown inside a Vocs pipeline, run `rehype-code-group` after Markdown has been converted to HAST. When the site owns assets globally, choose `assets: "none"`, import `rehype-code-group/styles.css`, and import `rehype-code-group/client` once in a client component.

## Unified and remark

The fence-metadata helper must run in the remark phase. The rehype plugin runs after `remark-rehype`.

```ts
processor
  .use(remarkParse)
  .use(remarkCodeGroup)
  .use(remarkRehype)
  .use(rehypeCodeGroup)
  .use(rehypeStringify);
```

## Package-manager converter

Mark a shell fence with `npm2yarn` and run the package-manager remark plugin before `remarkCodeGroup`.

````md
```sh npm2yarn
npm install rehype-code-group
```
````

It generates npm, pnpm, Yarn, and Bun tabs for install aliases, removals, scripts, and one-off `npx` executables. Unsupported npm commands produce a VFile warning instead of a silently invented translation.
