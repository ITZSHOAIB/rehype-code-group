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

## Progressive enhancement

Server output does not hide inactive panels. If scripts are blocked, delayed, or fail, all content remains readable. After the client marks a group as enhanced, inactive panels are hidden.

## User preferences

Bundled styles provide dark-mode values, visible focus, forced-color tokens, logical properties, and a print mode that includes every panel.

## Testing policy

The project runs behavioral browser tests in Chromium, Firefox, WebKit, and a JavaScript-disabled Chromium project. Automated axe checks complement—but do not replace—manual keyboard and assistive-technology review.

If custom CSS changes colors or focus treatment, retest contrast and keyboard visibility in your application theme.
