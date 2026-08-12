---
title: Accessibility
description: Keyboard, screen reader, no-JavaScript, contrast, and print behavior.
---

# Accessibility

The generated markup follows the ARIA tabs pattern:

- The tab list has an accessible name and optional orientation.
- Every tab controls one `tabpanel`, and every panel points back to its tab.
- Exactly one enhanced tab participates in the page tab sequence.
- Arrow keys wrap within the list. `Home` and `End` select the first and last tabs.
- Horizontal navigation respects right-to-left direction. Vertical lists use `ArrowUp` and `ArrowDown`.

## Keyboard reference

| Key | Horizontal list | Vertical list |
| --- | --- | --- |
| `ArrowLeft` / `ArrowRight` | Previous / next tab, RTL-aware | No selection change |
| `ArrowUp` / `ArrowDown` | No selection change | Previous / next tab |
| `Home` | First tab | First tab |
| `End` | Last tab | Last tab |

:::success[Built in]
Keyboard behavior, ARIA relationships, focus movement, and progressive enhancement ship with the browser client. Applications do not need to recreate them.
:::

## Progressive enhancement

Server output does not hide inactive panels. If scripts are blocked, delayed, or fail, all content remains readable. After the client marks a group as enhanced, inactive panels are hidden.

```css [enhanced-state.css]
.rehype-code-group[data-rcg-enhanced] .rcg-block:not(.active) {
  display: none;
}
```

## User preferences

Bundled styles provide dark-mode values, visible focus, forced-color tokens, logical properties, and a print mode that includes every panel.

## Testing policy

The project runs behavioral browser tests in Chromium, Firefox, WebKit, and a JavaScript-disabled Chromium project. Automated axe checks complement—but do not replace—manual keyboard and assistive-technology review.

If custom CSS changes colors or focus treatment, retest contrast and keyboard visibility in your application theme.

:::details[Application review checklist]
- Reach every tab with the expected arrow keys.
- Confirm `Home` and `End` wrap to the boundary tabs.
- Verify a visible focus indicator in every supported theme.
- Read tab names and panel relationships with a screen reader.
- Disable JavaScript and confirm every panel remains readable.
- Print the page and confirm every panel is included.
:::
