<img width="1280" height="640" alt="rehype-code-group" src="https://github.com/user-attachments/assets/d7da11d1-9f5b-4c93-9023-fcf4d0f2c288" />

# Rehype Code Group Plugin 🤖

![NPM Version](https://img.shields.io/npm/v/rehype-code-group)
![NPM Downloads](https://img.shields.io/npm/dm/rehype-code-group)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/rehype-code-group)
![NPM License](https://img.shields.io/npm/l/rehype-code-group)


A [Rehype](https://github.com/rehypejs/rehype) plugin for grouping code blocks with tabs, allowing you to switch between different code snippets easily. Perfect for **documentation** and **tutorials** where you want to show the same code in different languages or configurations.

**Inspired by [Vitepress Code Groups](https://vitepress.dev/guide/markdown#code-groups)**

> [!TIP]
> **This plugin is versatile and can be used to create tabs for any type of content, not just code blocks. You can easily organize and display different types of content within tabs.**

## Features ✨

- **Group Code Blocks with Tabs**: Easily group code blocks with tabs, allowing users to switch between different code snippets.
- **Emoji Shortcode Support**: Use `:package:`, `:yarn:`, and other [emoji shortcodes](https://github.com/omnidan/node-emoji#readme) in tab labels—they're automatically converted to emojis.
- **Automatic Styles and Scripts**: Automatically adds the necessary styles and scripts to the document.
- **Accessibility**: Enhanced accessibility features for better user experience.
- **Versatile Content Grouping**: Create tabs for any type of content, not just code blocks. Organize and display different types of content within tabs.
- **Customizable Class Names**: Customize the class names used by the plugin to match your project's styles.

## Installation 📦

> [!NOTE]
> This package is [ESM](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c) only.

Install the plugin using any package manager:

```bash
npm install rehype-code-group
# or
pnpm add rehype-code-group
# or
yarn add rehype-code-group
```

In Deno with [esm.sh](https://esm.sh/):

```js
import rehypeCodeGroup from 'https://esm.sh/rehype-code-group'
```

In browsers with [esm.sh](https://esm.sh/):

```html
<script type="module">
  import rehypeCodeGroup from 'https://esm.sh/rehype-code-group?bundle'
</script>
```

## Usage 🚀

### Markdown Syntax

To incorporate code group tabs in your markdown file, use the following syntax:

~~~raw
::: code-group labels=[npm, pnpm, yarn]

```bash
npm install rehype-code-group
```

```bash
pnpm add rehype-code-group
```

```bash
yarn add rehype-code-group
```

:::
~~~

You can also use [emoji shortcodes](https://github.com/omnidan/node-emoji#readme) in labels—they're automatically converted to emojis:

~~~raw
::: code-group labels=[:package: npm, :package: pnpm, :yarn: yarn]

```bash
npm install rehype-code-group
```

```bash
pnpm add rehype-code-group
```

```bash
yarn add rehype-code-group
```

:::
~~~

The code group will be rendered like this (The below UI used [Expressive Code](https://expressive-code.com/) as a syntax highlighter):

![Screenshot 2024-11-13 021749](https://github.com/user-attachments/assets/0bcae4e7-569a-4189-b890-9f543a67feb6)

Check this functionalty live: [https://4techloverz.com/wordpress-astro-migration-easy-guide/#initialize-astro-project](https://4techloverz.com/wordpress-astro-migration-easy-guide/#initialize-astro-project)

### With Rehype

Here's an example of how to use the plugin with Rehype:

```typescript
import { rehype } from "rehype";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeMinifyWhitespace from "rehype-minify-whitespace";
import rehypeStringify from "rehype-stringify";
import rehypeCodeGroup from "rehype-code-group";

const options = {};

const file = await rehype()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeCodeGroup, options)
  .use(rehypeMinifyWhitespace)
  .use(rehypeStringify)
  .process(input);

console.log(String(file))
```

### With Astro

You can also use this plugin with Astro (`astro.config.ts`):

```typescript
import { defineConfig } from 'astro/config';
import rehypeCodeGroup from 'rehype-code-group';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // ...
  markdown: {
    // ...
    rehypePlugins: [
      // ...
      rehypeCodeGroup,
    ],
  },
  // ...
})
```

## Customization 🎨

You can customize the class names used by the plugin to match your project's styles. The available options are:

- customClassNames: An object to override the default class names.

### Example

```typescript
.use(rehypeCodeGroup, {
  customClassNames: {
    codeGroupClass: "my-code-group",
    tabContainerClass: "my-tab-container",
    tabClass: "my-tab",
    activeTabClass: "my-active-tab",
    blockContainerClass: "my-block-container",
    activeBlockClass: "my-active-block",
  },
})
```

### Output Example 📄

Given the following input Markdown: [input.md](/test/fixtures/single-md/input.md)

The plugin will produce the following output: [output.html](/test/fixtures/single-md/output.html)

## Contributing 🤝
Contributions are welcome! Please read the contributing guidelines first.

## License 📄
This project is licensed under the MIT License - see the [LICENSE](https://github.com/ITZSHOAIB/rehype-code-group?tab=MIT-1-ov-file) file for details.

---

Happy coding! 🎉
