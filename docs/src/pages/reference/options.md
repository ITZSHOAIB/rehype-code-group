---
title: Options
description: Complete rehype-code-group API and option reference.
---

# Options

## `assets`

Default: `"inline"`.

- `"inline"`: insert styles and a classic client script only when a group exists.
- `"none"`: emit markup only.
- `{ mode: "inline", nonce }`: inline with a CSP nonce.
- `{ mode: "external", stylesheetHref, scriptSrc, nonce? }`: emit external asset elements.

## `customClassNames`

Add classes for `codeGroupClass`, `tabContainerClass`, `tabClass`, `activeTabClass`, `blockContainerClass`, and `activeBlockClass`. Defaults remain present as stable client hooks.

## `diagnostics`

Default: `"warn"`.

- `"warn"`: add a VFile message and preserve malformed source.
- `"error"`: fail processing.
- `"silent"`: preserve malformed source without a message.

## `idPrefix`

Default: `"rcg"`. Generated IDs are deterministic within each transformation. Set a unique prefix when separately compiled fragments will be combined in one document.

## `labelResolver`

Default: `commonLabelResolver`. Receives each display label and returns the rendered label. Use `fullEmojiResolver` from `rehype-code-group/emoji` for the complete shortcode catalog.

## Browser client

```ts
import {
  initCodeGroups,
  type CodeGroupChangeDetail,
} from "rehype-code-group/client";

const cleanup = initCodeGroups(document);
cleanup();
```

Repeated calls for the same root return the same cleanup function. The client automatically initializes when imported in a browser.

## Package-manager options

```ts
type PackageManagerOptions = {
  diagnostics?: "warn" | "error" | "silent";
  packageManagers?: Array<"npm" | "pnpm" | "yarn" | "bun">;
};
```
