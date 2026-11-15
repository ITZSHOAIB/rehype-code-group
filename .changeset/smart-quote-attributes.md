---
"rehype-code-group": patch
---

Accept typographic quotes in code-group labels and rich-group attributes. Hosts that run smartypants before rehype, such as Astro by default, curl `"…"` and `'…'` into `“…”` and `‘…’`, which previously broke quoted values like `label=":package: npm"` or `labels=["npm, classic", pnpm]`.
