---
title: Options
description: Complete rehype-code-group API and option reference.
---

# Options

The default configuration is intentionally usable without setup. Override only the ownership, diagnostics, or naming behavior your pipeline needs.

```ts [options.ts]
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

## `assets`

Default: `"inline"`.

| Value | Behavior |
| --- | --- |
| `"inline"` | Insert styles and a classic client script only when a group exists |
| `"none"` | Emit markup only |
| `{ mode: "inline", nonce }` | Inline assets with a CSP nonce |
| `{ mode: "external", ... }` | Emit external asset elements using your URLs |

:::tip
Choose `"none"` for application bundles and `"inline"` for standalone Markdown transforms. Use external mode when CSP or long-lived caching requires stable asset URLs.
:::

## `customClassNames`

Add classes for `codeGroupClass`, `tabContainerClass`, `tabClass`, `activeTabClass`, `blockContainerClass`, and `activeBlockClass`. Defaults remain present as stable client hooks.

:::note
Custom names are additive. The default `rcg-*` classes remain so the public browser client cannot be disconnected accidentally.
:::

## `diagnostics`

Default: `"warn"`.

| Value | Invalid source | Build result |
| --- | --- | --- |
| `"warn"` | Preserved | VFile message |
| `"error"` | Preserved | Processing fails |
| `"silent"` | Preserved | No diagnostic |

## `idPrefix`

Default: `"rcg"`. Generated IDs are deterministic within each transformation. Set a unique prefix when separately compiled fragments will be combined in one document.

## `labelResolver`

Default: `commonLabelResolver`. Receives each display label and returns the rendered label. Use `fullEmojiResolver` from `rehype-code-group/emoji` for the complete shortcode catalog.

## Browser client

```ts twoslash [browser-client.ts]
import {
  initCodeGroups,
  type CodeGroupChangeDetail,
} from "rehype-code-group/client";

const cleanup = initCodeGroups(document);
//    ^?
cleanup();
```

Repeated calls for the same root return the same cleanup function. The client automatically initializes when imported in a browser.

## Package-manager options

```ts [package-managers.ts]
type PackageManagerOptions = {
  diagnostics?: "warn" | "error" | "silent";
  packageManagers?: Array<"npm" | "pnpm" | "yarn" | "bun">;
};
```

:::details[Public subpaths]
- `rehype-code-group` — rehype plugin and option types
- `rehype-code-group/remark` — fence-metadata helper
- `rehype-code-group/package-managers` — npm command converter
- `rehype-code-group/client` — browser enhancer and event types
- `rehype-code-group/styles.css` — authoritative stylesheet
- `rehype-code-group/emoji` — complete optional emoji resolver
:::
