import type { Root } from "hast";
import type { Plugin } from "unified";
import type { RehypeCodeGroupOptions } from "./options.js";
import { transformCodeGroups } from "./transform.js";

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
  const { diagnostics = "warn" } = options;

  return (tree: Root, file) => {
    transformCodeGroups(tree, options, (warning, node) => {
      if (diagnostics === "error") {
        file.fail(warning, node, "rehype-code-group:panel-count");
      } else if (diagnostics === "warn") {
        file.message(warning, node, "rehype-code-group:panel-count");
      }
    });
  };
};

export default rehypeCodeGroup;
