import type { Element, ElementContent, Root } from "hast";
import type { ClassNames } from "../options.js";
import { getScript } from "./script.js";
import { styles } from "./styles.js";

export type CodeGroup = {
  parentNode: Element | Root;
  startIndex: number;
  tabLabels: string[];
};

export type CodeGroupTab = {
  children: ElementContent[];
  label: string;
  value: string;
};

const createRcgTabsElement = (
  tabs: CodeGroupTab[],
  classNames: ClassNames,
  uniqueId: string,
  accessibleLabel: string,
  selectedIndex: number,
): Element => {
  return {
    type: "element",
    tagName: "div",
    properties: {
      className: classNames.tabContainerClass.split(" "),
      role: "tablist",
      "aria-label": accessibleLabel,
    },
    children: tabs.map((tab, i) => ({
      type: "element",
      tagName: "button",
      properties: {
        type: "button",
        className: [
          ...classNames.tabClass.split(" "),
          ...(i === selectedIndex ? classNames.activeTabClass.split(" ") : []),
        ],
        role: "tab",
        "aria-selected": i === selectedIndex ? "true" : "false",
        "aria-controls": `${uniqueId}-block-${i}`,
        "data-rcg-value": tab.value,
        id: `${uniqueId}-tab-${i}`,
        tabIndex: i === selectedIndex ? 0 : -1,
      },
      children: [{ type: "text", value: tab.label }],
    })),
  };
};

const createCodeBlockWrapper = (
  children: ElementContent[],
  classNames: ClassNames,
  uniqueId: string,
  idx: number,
  selectedIndex: number,
  label: string,
): Element => {
  const isActive = idx === selectedIndex;
  return {
    type: "element",
    tagName: "div",
    properties: {
      className: [
        ...classNames.blockContainerClass.split(" "),
        ...(isActive ? classNames.activeBlockClass.split(" ") : []),
      ],
      role: "tabpanel",
      "aria-labelledby": `${uniqueId}-tab-${idx}`,
      "data-rcg-label": label,
      id: `${uniqueId}-block-${idx}`,
    },
    children,
  };
};

export const createCodeGroupElement = (
  tabs: CodeGroupTab[],
  classNames: ClassNames,
  uniqueId: string,
  accessibleLabel = "Code examples",
  defaultValue?: string,
): Element => {
  const selectedIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.value === defaultValue),
  );
  const properties: Element["properties"] = {
    className: classNames.codeGroupClass.split(" "),
  };
  if (classNames.activeTabClass !== "active") {
    properties["data-rcg-active-tab-classes"] = classNames.activeTabClass;
  }
  if (classNames.activeBlockClass !== "active") {
    properties["data-rcg-active-block-classes"] = classNames.activeBlockClass;
  }
  return {
    type: "element",
    tagName: "div",
    properties,
    children: [
      createRcgTabsElement(
        tabs,
        classNames,
        uniqueId,
        accessibleLabel,
        selectedIndex,
      ),
      ...tabs.map((tab, index) =>
        createCodeBlockWrapper(
          tab.children,
          classNames,
          uniqueId,
          index,
          selectedIndex,
          tab.label,
        ),
      ),
    ],
  };
};

export const createRehypeCodeGroupElement = (
  codeGroup: CodeGroup,
  endIndex: number,
  classNames: ClassNames,
  uniqueId: string,
): Element => {
  const { parentNode, startIndex, tabLabels } = codeGroup;
  const tabs: CodeGroupTab[] = [];

  for (let i = startIndex + 1; i < endIndex; i++) {
    const codeBlock = parentNode.children[i] as Element;

    if (codeBlock.type === "element") {
      const index = tabs.length;
      tabs.push({
        children: [codeBlock],
        label: tabLabels[index],
        value: tabLabels[index],
      });
    }
  }

  return createCodeGroupElement(tabs, classNames, uniqueId);
};

export const createStyleElement = (nonce?: string): Element => {
  return {
    type: "element",
    tagName: "style",
    properties: nonce ? { nonce } : {},
    children: [{ type: "text", value: styles }],
  };
};

export const createScriptElement = (
  classNames: ClassNames,
  nonce?: string,
): Element => {
  return {
    type: "element",
    tagName: "script",
    properties: { type: "text/javascript", ...(nonce ? { nonce } : {}) },
    children: [{ type: "text", value: getScript(classNames) }],
  };
};
