import type { Element, Root } from "hast";
import { SKIP, visit } from "unist-util-visit";
import type { CodeGroup } from "./elements/index.js";
import { getClassNames } from "./elements/styles.js";
import {
  handleEndDelimiter,
  handleStartDelimiter,
  isEndDelimiterNode,
  isStartDelimiterNode,
} from "./handlers/delimiters.js";
import { transformRichGroups } from "./handlers/richGroups.js";
import {
  addExternalAssets,
  addStylesAndScript,
} from "./handlers/stylesAndScript.js";
import { commonLabelResolver } from "./labels.js";
import type { RehypeCodeGroupOptions } from "./options.js";

/** Receives a malformed-group warning and the node it concerns. */
export type ReportWarning = (warning: string, node: Element) => void;

/**
 * Transform every code group in a hast tree in place, and add the assets the
 * chosen asset mode needs. Shared by the rehype and Sätteri plugins.
 *
 * @returns Whether any code group was found.
 */
export const transformCodeGroups = (
  tree: Root,
  options: RehypeCodeGroupOptions,
  reportWarning: ReportWarning,
): boolean => {
  const {
    assets = "inline",
    customClassNames,
    idPrefix = "rcg",
    labelResolver = commonLabelResolver,
  } = options;
  const classNames = getClassNames(customClassNames);

  let headElement: Element | undefined;
  let htmlElement: Element | undefined;
  let firstStyleIndex = -1;
  const codeGroups: CodeGroup[] = [];
  let nextGroupId = transformRichGroups(
    tree,
    classNames,
    idPrefix,
    0,
    labelResolver,
  );
  let codeGroupFound = nextGroupId > 0;

  /**
   * Visit each element node in the tree to
   * - find code groups and wrap them in a rehype-code-group element.
   * - find the head and html elements to add styles and script.
   */
  visit(tree, "element", (node, index, parent) => {
    if (node.type !== "element" || index === undefined) {
      return;
    }

    if (node.tagName === "head") {
      headElement = node;
    }

    if (node.tagName === "html") {
      htmlElement = node;
    }

    // Identify the first style element index
    if (node.tagName === "style" && firstStyleIndex === -1) {
      firstStyleIndex = index ?? -1;
    }

    if (!parent) {
      return;
    }
    // MDX JSX parents only differ in fields the handlers never touch.
    const groupParent = parent as Element | Root;

    if (isStartDelimiterNode(node)) {
      handleStartDelimiter(node, index, groupParent, codeGroups, labelResolver);
      return [SKIP];
    }

    if (isEndDelimiterNode(node)) {
      const { found, skipIndex, warning } = handleEndDelimiter(
        index,
        groupParent,
        codeGroups,
        classNames,
        `${idPrefix}-${nextGroupId}`,
      );

      if (warning) reportWarning(warning, node);

      if (found) {
        nextGroupId += 1;
        codeGroupFound = found;
        return [SKIP, skipIndex];
      }
    }
  });

  const assetMode = typeof assets === "string" ? assets : assets.mode;
  if (codeGroupFound && assetMode === "inline") {
    addStylesAndScript(
      tree,
      classNames,
      headElement,
      htmlElement,
      firstStyleIndex,
      typeof assets === "object" ? assets.nonce : undefined,
    );
  }
  if (
    codeGroupFound &&
    typeof assets === "object" &&
    assets.mode === "external"
  ) {
    addExternalAssets(tree, assets, headElement, htmlElement);
  }

  return codeGroupFound;
};
