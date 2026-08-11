import type { Element, Root } from "hast";
import { toString as hastToString } from "hast-util-to-string";
import {
  type CodeGroup,
  createRehypeCodeGroupElement,
} from "../elements/index.js";
import type { ClassNames, LabelResolver } from "../options.js";

const START_DELIMITER_REGEX = /^::: code-group labels=\[([^\]]+)\]$/;
const END_DELIMITER = ":::";

const parseLabels = (value: string): string[] => {
  const labels: string[] = [];
  let current = "";
  let escaped = false;
  let quote: '"' | "'" | undefined;

  for (const character of value) {
    if (escaped) {
      current += character;
      escaped = false;
    } else if (character === "\\") {
      escaped = true;
    } else if (quote) {
      if (character === quote) quote = undefined;
      else current += character;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === ",") {
      labels.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }

  if (escaped) current += "\\";
  labels.push(current.trim());
  return labels;
};

export const isStartDelimiterNode = (node: Element): boolean => {
  const match = hastToString(node).trim().match(START_DELIMITER_REGEX);
  return node.tagName === "p" && match !== null;
};

export const isEndDelimiterNode = (node: Element): boolean => {
  return node.tagName === "p" && hastToString(node).trim() === END_DELIMITER;
};

/**
 * Handle the start delimiter node.
 * If the node is a start delimiter,
 * - create a code group object
 * - push it to the code groups stack.
 */
export const handleStartDelimiter = (
  node: Element,
  index: number,
  parent: Element | Root,
  codeGroups: CodeGroup[],
  resolveLabel: LabelResolver,
) => {
  const startMatch = hastToString(node).trim().match(START_DELIMITER_REGEX);

  if (startMatch) {
    const tabLabels = parseLabels(startMatch[1]).map(resolveLabel);
    codeGroups.push({ parentNode: parent, startIndex: index, tabLabels });
  }
};

/**
 * Handle the end delimiter node.
 * If the node is an end delimiter,
 * - pop the last code group from the stack
 * - create a rehype-code-group element
 * - replace the code group nodes with the rehype-code-group element.
 * - return the skip index to skip the replaced nodes.
 * - return the found status.
 * If the node is not an end delimiter, return the not found status.
 */
export const handleEndDelimiter = (
  index: number,
  parent: Element | Root,
  codeGroups: CodeGroup[],
  classNames: ClassNames,
  uniqueId: string,
) => {
  const codeGroup = codeGroups.pop();
  const endIndex = index;

  if (codeGroup && codeGroup.parentNode === parent) {
    const { parentNode, startIndex } = codeGroup;
    const panelCount = parentNode.children
      .slice(startIndex + 1, endIndex)
      .filter((child) => child.type === "element").length;

    if (panelCount !== codeGroup.tabLabels.length) {
      return {
        found: false,
        skipIndex: -1,
        warning: `Code group has ${codeGroup.tabLabels.length} labels but ${panelCount} panel${panelCount === 1 ? "" : "s"}.`,
      };
    }

    const rehypeCodeGroupElement: Element = createRehypeCodeGroupElement(
      codeGroup,
      endIndex,
      classNames,
      uniqueId,
    );

    parentNode.children.splice(
      startIndex,
      endIndex - startIndex + 1,
      rehypeCodeGroupElement,
    );
    return {
      found: true,
      skipIndex: startIndex + 1,
    };
  }
  return { found: false, skipIndex: -1, warning: undefined };
};
