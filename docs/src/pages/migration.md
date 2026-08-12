---
title: Migration to 1.0
description: Adopt the accessible runtime, asset modes, and smaller default emoji resolver.
---

# Migration to 1.0

Version 1.0 preserves the original compact directive while making its output progressively enhanced and expanding the public API.

:::info
Compact `::: code-group labels=[...]` content remains valid. Most migration work is CSS and asset ownership, not content rewrites.
:::

## Migration checklist

::::steps
##### Update the package

Install version 1 and run your existing Markdown build before changing configuration.

##### Adopt the bundled browser contract

Use the public stylesheet and client together. If your application owns assets, select `assets: "none"` explicitly.

##### Retest custom CSS

Replace server-side `[hidden]` assumptions and prefer documented CSS custom properties.

##### Choose diagnostics for CI

Set `diagnostics: "error"` when malformed groups should fail production builds.
::::

## Browser behavior

Tabs now use roving `tabindex`, keyboard selection, complete tab/panel relationships, and deterministic IDs. Inactive panels are not hidden in server HTML; the client hides them only after marking the group as enhanced. This intentionally keeps content readable when JavaScript fails.

If your CSS targeted `[hidden]` in server output, target `.rehype-code-group[data-rcg-enhanced] .rcg-block` instead or use the bundled stylesheet.

## CSS

The invalid nested CSS emitted by earlier versions has been replaced with standard CSS. Default class names remain unchanged. New custom properties are the preferred theming surface.

## Emoji labels

The default bundle resolves a small set of common shortcodes. To retain the complete earlier catalog:

```ts [emoji-labels.ts]
import rehypeCodeGroup from "rehype-code-group";
import { fullEmojiResolver } from "rehype-code-group/emoji";

processor.use(rehypeCodeGroup, { labelResolver: fullEmojiResolver }); // [!code focus]
```

## Asset ownership

Existing installations can keep the zero-config inline default. Sites with a global asset pipeline should move to `assets: "none"` and import `rehype-code-group/styles.css` plus `rehype-code-group/client` once.

```ts [application-entry.ts]
import "rehype-code-group/styles.css";
import "rehype-code-group/client";
```

## Malformed groups

Label/panel count mismatches are no longer partially transformed. Source remains readable and processing emits a warning. Use `diagnostics: "error"` to enforce valid groups in CI.

## New syntax is opt-in

Existing `::: code-group labels=[...]` content continues to work. Rich-content directives, fence metadata, synchronized state, and package-manager conversion require explicit syntax or companion imports.
