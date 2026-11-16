---
"rehype-code-group": patch
---

Make theming overrides apply with the default inline assets. The bundled visual rules now have zero specificity, so site CSS wins regardless of load order, and the `--rcg-*` custom properties are read from the group or any ancestor, such as `:root`. Rules that show and hide panels keep their specificity. Vertical groups now move their tabs above the panels on screens narrower than `40rem`.
