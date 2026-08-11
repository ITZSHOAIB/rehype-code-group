import type { Element, ElementContent, Root, RootContent } from "hast";
import { toString as hastToString } from "hast-util-to-string";
import {
  type CodeGroupTab,
  createCodeGroupElement,
} from "../elements/index.js";
import type { ClassNames, LabelResolver } from "../options.js";

type Parent = Element | Root;

const outerStart = /^:::: code-group(?:\s+(.*))?$/;
const tabStart = /^::: code-tab(?:\s+(.*))?$/;

const markerText = (node: RootContent): string | undefined =>
  node.type === "element" && node.tagName === "p"
    ? hastToString(node).trim()
    : undefined;

const parseAttributes = (value = "") => {
  const attributes = new Map<string, string>();
  const pattern = /([\w-]+)=(?:"((?:\\.|[^"])*)"|'((?:\\.|[^'])*)'|([^\s]+))/g;
  for (const match of value.matchAll(pattern)) {
    const raw = match[2] ?? match[3] ?? match[4] ?? "";
    attributes.set(match[1], raw.replace(/\\([\\"'])/g, "$1"));
  }
  return attributes;
};

const isWhitespace = (node: RootContent) =>
  node.type === "text" && node.value.trim() === "";

const asElementContent = (nodes: RootContent[]): ElementContent[] =>
  nodes.filter((node): node is ElementContent => node.type !== "doctype");

export const transformRichGroups = (
  parent: Parent,
  classNames: ClassNames,
  idPrefix: string,
  startingId = 0,
  resolveLabel: LabelResolver = (label) => label,
): number => {
  let transformed = 0;

  for (let index = 0; index < parent.children.length; index += 1) {
    const node = parent.children[index];
    const startMatch = markerText(node)?.match(outerStart);
    if (!startMatch) {
      if (node.type === "element") {
        transformed += transformRichGroups(
          node,
          classNames,
          idPrefix,
          startingId + transformed,
          resolveLabel,
        );
      }
      continue;
    }

    const groupAttributes = parseAttributes(startMatch[1]);
    const tabs: CodeGroupTab[] = [];
    let cursor = index + 1;
    let endIndex = -1;

    while (cursor < parent.children.length) {
      while (
        cursor < parent.children.length &&
        isWhitespace(parent.children[cursor])
      ) {
        cursor += 1;
      }

      const currentText = markerText(parent.children[cursor]);
      if (currentText === "::::") {
        endIndex = cursor;
        break;
      }

      const currentTab = currentText?.match(tabStart);
      if (!currentTab) break;
      const tabAttributes = parseAttributes(currentTab[1]);
      const label = tabAttributes.get("label");
      if (!label) break;

      const contentStart = cursor + 1;
      cursor = contentStart;
      while (
        cursor < parent.children.length &&
        markerText(parent.children[cursor]) !== ":::"
      ) {
        cursor += 1;
      }
      if (cursor >= parent.children.length) break;

      tabs.push({
        children: asElementContent(
          parent.children.slice(contentStart, cursor) as RootContent[],
        ),
        label: resolveLabel(label),
        value: tabAttributes.get("value") ?? label,
      });
      cursor += 1;
    }

    if (endIndex < 0 || tabs.length === 0) continue;

    const group = createCodeGroupElement(
      tabs,
      classNames,
      `${idPrefix}-${startingId + transformed}`,
      groupAttributes.get("label") ?? "Code examples",
      groupAttributes.get("default"),
    );
    const sync = groupAttributes.get("sync");
    const declaredPersistence = groupAttributes.get("persist");
    const persist =
      declaredPersistence === "local" || declaredPersistence === "url"
        ? declaredPersistence
        : undefined;
    const declaredOrientation = groupAttributes.get("orientation");
    const orientation =
      declaredOrientation === "horizontal" || declaredOrientation === "vertical"
        ? declaredOrientation
        : undefined;
    if (sync) group.properties["data-rcg-sync"] = sync;
    if (persist) group.properties["data-rcg-persist"] = persist;
    if (orientation) {
      group.properties["data-rcg-orientation"] = orientation;
      const tabList = group.children[0];
      if (tabList?.type === "element") {
        tabList.properties["aria-orientation"] = orientation;
      }
    }

    parent.children.splice(index, endIndex - index + 1, group);
    transformed += 1;
  }

  return transformed;
};
