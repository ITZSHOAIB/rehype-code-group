---
title: Migration to 1.0
description: Adopt the accessible runtime, asset modes, and smaller default emoji resolver.
---

# Migration to 1.0

Version 1.0 preserves the original compact directive while making its output progressively enhanced and expanding the public API.

## Browser behavior

Tabs now use roving `tabindex`, keyboard selection, complete tab/panel relationships, and deterministic IDs. Inactive panels are not hidden in server HTML; the client hides them only after marking the group as enhanced. This intentionally keeps content readable when JavaScript fails.

If your CSS targeted `[hidden]` in server output, target `.rehype-code-group[data-rcg-enhanced] .rcg-block` instead or use the bundled stylesheet.

## CSS

The invalid nested CSS emitted by earlier versions has been replaced with standard CSS. Default class names remain unchanged. New custom properties are the preferred theming surface.

## Emoji labels

The default bundle resolves a small set of common shortcodes. To retain the complete earlier catalog:

```ts
import rehypeCodeGroup from "rehype-code-group";
import { fullEmojiResolver } from "rehype-code-group/emoji";

processor.use(rehypeCodeGroup, { labelResolver: fullEmojiResolver });
```

## Asset ownership

Existing installations can keep the zero-config inline default. Sites with a global asset pipeline should move to `assets: "none"` and import `rehype-code-group/styles.css` plus `rehype-code-group/client` once.

## Malformed groups

Label/panel count mismatches are no longer partially transformed. Source remains readable and processing emits a warning. Use `diagnostics: "error"` to enforce valid groups in CI.

## New syntax is opt-in

Existing `::: code-group labels=[...]` content continues to work. Rich-content directives, fence metadata, synchronized state, and package-manager conversion require explicit syntax or companion imports.
