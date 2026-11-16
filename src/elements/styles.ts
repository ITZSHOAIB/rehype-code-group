import type { ClassNames } from "../options.js";

export const defaultClassNames: ClassNames = {
  activeTabClass: "active",
  activeBlockClass: "active",
  tabClass: "rcg-tab",
  tabContainerClass: "rcg-tab-container",
  blockContainerClass: "rcg-block",
  codeGroupClass: "rehype-code-group",
};

const mergeClassNames = (defaultClass: string, customClass?: string) =>
  customClass ? `${defaultClass} ${customClass}` : defaultClass;

export const getClassNames = (
  customClassNames?: Partial<ClassNames>,
): ClassNames => {
  return {
    activeTabClass: mergeClassNames(
      defaultClassNames.activeTabClass,
      customClassNames?.activeTabClass,
    ),
    activeBlockClass: mergeClassNames(
      defaultClassNames.activeBlockClass,
      customClassNames?.activeBlockClass,
    ),
    tabClass: mergeClassNames(
      defaultClassNames.tabClass,
      customClassNames?.tabClass,
    ),
    tabContainerClass: mergeClassNames(
      defaultClassNames.tabContainerClass,
      customClassNames?.tabContainerClass,
    ),
    blockContainerClass: mergeClassNames(
      defaultClassNames.blockContainerClass,
      customClassNames?.blockContainerClass,
    ),
    codeGroupClass: mergeClassNames(
      defaultClassNames.codeGroupClass,
      customClassNames?.codeGroupClass,
    ),
  };
};

const group = `.${defaultClassNames.codeGroupClass}`;
const tabs = `.${defaultClassNames.tabContainerClass}`;
const tab = `.${defaultClassNames.tabClass}`;
const block = `.${defaultClassNames.blockContainerClass}`;
const vertical = `${group}[data-rcg-orientation="vertical"]`;

/**
 * Visual rules are wrapped in `:where()`, so any site rule wins whatever the
 * load order; inline assets land after the site's stylesheets. The rules
 * that show and hide panels keep their specificity, because they are
 * behavior rather than looks.
 *
 * The public `--rcg-*` properties are never set here, only read with
 * fallbacks into private `--_rcg-*` ones. That way a value set on the group
 * or on any ancestor, such as `:root`, takes effect.
 */
export const styles = `
:where(${group}) {
  --_rcg-accent: var(--rcg-accent, #2563eb);
  --_rcg-border-color: var(--rcg-border-color, #d4d4d8);
  --_rcg-focus-color: var(--rcg-focus-color, #2563eb);
  --_rcg-tab-background: var(--rcg-tab-background, transparent);
  --_rcg-tab-background-active: var(--rcg-tab-background-active, #f4f4f5);
  display: grid;
  gap: 0;
  min-width: 0;
}
:where(${tabs}) {
  display: flex;
  gap: 0.125rem;
  overflow-x: auto;
  border-block-end: 1px solid var(--_rcg-border-color);
}
:where(${tab}) {
  padding: 0.5rem 1rem;
  margin: 0;
  cursor: pointer;
  color: var(--rcg-tab-color);
  border: 0;
  border-block-end: 2px solid transparent;
  background: var(--_rcg-tab-background);
  font: inherit;
}
:where(${tab}.${defaultClassNames.activeTabClass}) {
  border-block-end-color: var(--_rcg-accent);
  background: var(--_rcg-tab-background-active);
  font-weight: 600;
}
:where(${tab}:focus-visible) {
  outline: 2px solid var(--_rcg-focus-color);
  outline-offset: -2px;
}
:where(${block}) {
  min-width: 0;
  overflow-x: auto;
  margin: 0;
}
:where(${vertical}) {
  grid-template-columns: minmax(max-content, 12rem) minmax(0, 1fr);
  align-items: start;
}
:where(${vertical} ${tabs}) {
  flex-direction: column;
  inline-size: 100%;
  border-block-end: 0;
  border-inline-end: 1px solid var(--_rcg-border-color);
}
:where(${vertical} ${tab}) {
  text-align: start;
  border-block-end: 0;
  border-inline-end: 2px solid transparent;
}
:where(${vertical} ${tab}.${defaultClassNames.activeTabClass}) {
  border-inline-end-color: var(--_rcg-accent);
}
@media (max-width: 40rem) {
  :where(${vertical}) {
    grid-template-columns: minmax(0, 1fr);
  }
  :where(${vertical} ${tabs}) {
    flex-direction: row;
    border-inline-end: 0;
    border-block-end: 1px solid var(--_rcg-border-color);
  }
  :where(${vertical} ${tab}) {
    text-align: center;
    border-inline-end: 0;
    border-block-end: 2px solid transparent;
  }
  :where(${vertical} ${tab}.${defaultClassNames.activeTabClass}) {
    border-block-end-color: var(--_rcg-accent);
  }
}
${group}[data-rcg-enhanced] ${block} {
  display: none;
}
${group}[data-rcg-enhanced] ${block}.${defaultClassNames.activeBlockClass} {
  display: block;
}
@media (prefers-color-scheme: dark) {
  :where(${group}) {
    --_rcg-accent: var(--rcg-accent, #60a5fa);
    --_rcg-border-color: var(--rcg-border-color, #3f3f46);
    --_rcg-focus-color: var(--rcg-focus-color, #93c5fd);
    --_rcg-tab-background-active: var(--rcg-tab-background-active, #27272a);
  }
}
@supports (color: light-dark(black, white)) {
  :where(${group}) {
    --_rcg-accent: var(--rcg-accent, light-dark(#2563eb, #60a5fa));
    --_rcg-border-color: var(--rcg-border-color, light-dark(#d4d4d8, #3f3f46));
    --_rcg-focus-color: var(--rcg-focus-color, light-dark(#2563eb, #93c5fd));
    --_rcg-tab-background-active: var(--rcg-tab-background-active, light-dark(#f4f4f5, #27272a));
  }
}
@media (forced-colors: active) {
  :where(${group}) {
    --_rcg-accent: Highlight;
    --_rcg-border-color: CanvasText;
    --_rcg-focus-color: Highlight;
  }
}
@media print {
  ${tabs} {
    display: none;
  }
  ${group}[data-rcg-enhanced] ${block},
  ${group} ${block}[hidden] {
    display: block !important;
    break-inside: avoid;
  }
  :where(${block})::before {
    content: attr(data-rcg-label);
    display: block;
    margin-block-end: 0.4rem;
    font-weight: 600;
  }
}
`;
