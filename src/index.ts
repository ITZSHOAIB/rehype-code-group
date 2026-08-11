import type { Element, Root } from "hast";
import type { Plugin } from "unified";
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

export { commonLabelResolver } from "./labels.js";
export type {
  AssetOptions,
  ClassNames,
  LabelResolver,
  RehypeCodeGroupOptions,
} from "./options.js";

/**
 * ## Rehype Code Group
 * A Rehype plugin for grouping code blocks with tabs,
 * allowing you to switch between different code snippets easily.
 * Perfect for documentation and tutorials where you want to show
 * the same code in different languages or configurations.
 *
 * Works with all Code Syntax Highlighters
 *
 * @param options {@link RehypeCodeGroupOptions} - Options to customize the plugin.
 * @returns Transformer function to process the AST.
 *
 * @example
 * // With rehype
 * import fs from "node:fs/promises";
 * import { rehype } from "rehype";
 * import rehypeCodeGroup from "rehype-code-group";
 *
 * const document = await fs.readFile("example/input.html", "utf8");
 *
 * const file = await rehype()
 *   .use(rehypeCodeGroup, {
 *     customClassNames: {
 *       activeTabClass: "my-active-tab",
 *     },
 *   })
 *   .process(document);
 *
 * await fs.writeFile("example/output.html", String(file));
 *
 * @example
 * // With Astro (https://astro.build)
 * import { defineConfig } from 'astro/config';
 * import rehypeCodeGroup from 'rehype-code-group';
 *
 * // https://docs.astro.build/en/reference/configuration-reference/
 * export default defineConfig({
 *   // ...
 *   markdown: {
 *     // ...
 *     rehypePlugins: [
 *       // ...
 *       rehypeCodeGroup,
 *     ],
 *   },
 *   // ...
 * });
 */
const rehypeCodeGroup: Plugin<[RehypeCodeGroupOptions], Root> = (
  options = {},
) => {
  const {
    assets = "inline",
    customClassNames,
    diagnostics = "warn",
    idPrefix = "rcg",
    labelResolver = commonLabelResolver,
  } = options;
  const classNames = getClassNames(customClassNames);

  return (tree: Root, file) => {
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
     *
     * @param {Element} node - The current node being visited.
     * @param {number} index - The index of the current node in its parent's children.
     * @param {Element} parent - The parent of the current node.
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

      if (isStartDelimiterNode(node)) {
        handleStartDelimiter(node, index, parent, codeGroups, labelResolver);
        return [SKIP];
      }

      if (isEndDelimiterNode(node)) {
        const { found, skipIndex, warning } = handleEndDelimiter(
          index,
          parent,
          codeGroups,
          classNames,
          `${idPrefix}-${nextGroupId}`,
        );

        if (warning && diagnostics !== "silent") {
          if (diagnostics === "error") {
            file.fail(warning, node, "rehype-code-group:panel-count");
          } else {
            file.message(warning, node, "rehype-code-group:panel-count");
          }
        }

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
  };
};

export default rehypeCodeGroup;
