import type { Element, Root } from "hast";
import { toString as hastToString } from "hast-util-to-string";
import * as emoji from "node-emoji";
import {
  type CodeGroup,
  createRehypeCodeGroupElement,
} from "../elements/index.js";
import type { ClassNames } from "../options.js";

const START_DELIMITER_REGEX = /::: code-group labels=\[([^\]]+)\]/;
const END_DELIMITER = ":::";

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
 *
 * @param {Element} node - The current node being visited.
 * @param {number} index - The index of the current node in its parent's children.
 * @param {Element | Root} parent - The parent of the current node.
 * @param {CodeGroup[]} codeGroups - The stack to keep track of the last found start delimiter.
 */
export const handleStartDelimiter = (
  node: Element,
  index: number,
  parent: Element | Root,
  codeGroups: CodeGroup[],
) => {
  const startMatch = hastToString(node).trim().match(START_DELIMITER_REGEX);

  if (startMatch) {
    const tabLabels = startMatch[1]
      .split(",")
      .map((label) => emoji.emojify(label.trim()));
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
 *
 * @param {number} index - The index of the current node in its parent's children.
 * @param {Element | Root} parent - The parent of the current node.
 * @param {CodeGroup[]} codeGroups - The stack to keep track of the last found start delimiter.
 * @param {ClassNames} classNames - The class names for styling code group elements.
 * @returns {Object} An object containing the found status and the skip index.
 */
export const handleEndDelimiter = (
  index: number,
  parent: Element | Root,
  codeGroups: CodeGroup[],
  classNames: ClassNames,
) => {
  const codeGroup = codeGroups.pop();
  const endIndex = index;

  if (codeGroup && codeGroup.parentNode === parent) {
    const { parentNode, startIndex } = codeGroup;

    const rehypeCodeGroupElement: Element = createRehypeCodeGroupElement(
      codeGroup,
      endIndex,
      classNames,
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
  return { found: false, skipIndex: -1 };
};
