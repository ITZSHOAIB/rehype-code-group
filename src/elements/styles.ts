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

export const styles = `
.${defaultClassNames.codeGroupClass} {
  --rcg-accent: #2563eb;
  --rcg-border-color: #d4d4d8;
  --rcg-focus-color: #2563eb;
  --rcg-tab-background: transparent;
  --rcg-tab-background-active: #f4f4f5;
  --rcg-tab-color: inherit;
  display: grid;
  gap: 0;
  min-width: 0;
}
.${defaultClassNames.tabContainerClass} {
  display: flex;
  gap: 0.125rem;
  overflow-x: auto;
  border-block-end: 1px solid var(--rcg-border-color);
}
.${defaultClassNames.tabClass} {
  padding: 0.5rem 1rem;
  margin: 0;
  cursor: pointer;
  color: var(--rcg-tab-color);
  border: 0;
  border-block-end: 2px solid transparent;
  background: var(--rcg-tab-background);
  font: inherit;
}
.${defaultClassNames.tabClass}.${defaultClassNames.activeTabClass} {
  border-block-end-color: var(--rcg-accent);
  background: var(--rcg-tab-background-active);
  font-weight: 600;
}
.${defaultClassNames.tabClass}:focus-visible {
  outline: 2px solid var(--rcg-focus-color);
  outline-offset: -2px;
}
.${defaultClassNames.blockContainerClass} {
  min-width: 0;
  overflow-x: auto;
  margin: 0;
}
.${defaultClassNames.codeGroupClass}[data-rcg-orientation="vertical"] {
  grid-template-columns: minmax(max-content, 12rem) minmax(0, 1fr);
  align-items: start;
}
.${defaultClassNames.codeGroupClass}[data-rcg-orientation="vertical"] .${defaultClassNames.tabContainerClass} {
  flex-direction: column;
  inline-size: 100%;
  border-block-end: 0;
  border-inline-end: 1px solid var(--rcg-border-color);
}
.${defaultClassNames.codeGroupClass}[data-rcg-orientation="vertical"] .${defaultClassNames.tabClass} {
  text-align: start;
  border-block-end: 0;
  border-inline-end: 2px solid transparent;
}
.${defaultClassNames.codeGroupClass}[data-rcg-orientation="vertical"] .${defaultClassNames.tabClass}.${defaultClassNames.activeTabClass} {
  border-inline-end-color: var(--rcg-accent);
}
.${defaultClassNames.codeGroupClass}[data-rcg-enhanced] .${defaultClassNames.blockContainerClass} {
  display: none;
}
.${defaultClassNames.codeGroupClass}[data-rcg-enhanced] .${defaultClassNames.blockContainerClass}.${defaultClassNames.activeBlockClass} {
  display: block;
}
@media (prefers-color-scheme: dark) {
  .${defaultClassNames.codeGroupClass} {
    --rcg-accent: #60a5fa;
    --rcg-border-color: #3f3f46;
    --rcg-focus-color: #93c5fd;
    --rcg-tab-background-active: #27272a;
  }
}
@supports (color: light-dark(black, white)) {
  .${defaultClassNames.codeGroupClass} {
    --rcg-accent: light-dark(#2563eb, #60a5fa);
    --rcg-border-color: light-dark(#d4d4d8, #3f3f46);
    --rcg-focus-color: light-dark(#2563eb, #93c5fd);
    --rcg-tab-background-active: light-dark(#f4f4f5, #27272a);
  }
}
@media (forced-colors: active) {
  .${defaultClassNames.codeGroupClass} {
    --rcg-accent: Highlight;
    --rcg-border-color: CanvasText;
    --rcg-focus-color: Highlight;
  }
}
@media print {
  .${defaultClassNames.tabContainerClass} {
    display: none;
  }
  .${defaultClassNames.codeGroupClass}[data-rcg-enhanced] .${defaultClassNames.blockContainerClass},
  .${defaultClassNames.codeGroupClass} .${defaultClassNames.blockContainerClass}[hidden] {
    display: block !important;
    break-inside: avoid;
  }
  .${defaultClassNames.blockContainerClass}::before {
    content: attr(data-rcg-label);
    display: block;
    margin-block-end: 0.4rem;
    font-weight: 600;
  }
}
`;
