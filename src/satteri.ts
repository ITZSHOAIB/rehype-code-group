import type { Root } from "hast";
import type { Code, Paragraph, Parent } from "mdast";
import type {
  HastPluginDefinition,
  HastVisitorContext,
  MdastPluginDefinition,
} from "satteri";
import type { RehypeCodeGroupOptions } from "./options.js";
import { rewriteLabelMetadata } from "./remark.js";
import { transformCodeGroups } from "./transform.js";

export { commonLabelResolver } from "./labels.js";
export type {
  AssetOptions,
  ClassNames,
  LabelResolver,
  RehypeCodeGroupOptions,
} from "./options.js";

type HastNode = { type: string; value?: unknown; children?: HastNode[] };

/** Whether any text in the tree could open a group, so pages without one skip the copy. */
const hasGroupMarker = (node: HastNode): boolean =>
  (node.type === "text" &&
    typeof node.value === "string" &&
    node.value.includes(":::")) ||
  (node.children?.some(hasGroupMarker) ?? false);

/**
 * Copy a hook's tree as plain data. Older Sätteri releases hand hooks node
 * stubs carrying internal `_`-prefixed handles, which `structuredClone`
 * rejects; those aren't part of the tree, so they're left out. Plain objects
 * keep every key: MDX's `data._mdxExplicitJsx` must survive.
 */
const copyTree = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(copyTree);
  if (value === null || typeof value !== "object") return value;
  const prototype = Object.getPrototypeOf(value);
  const isStub = prototype !== Object.prototype && prototype !== null;
  const copy: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (!isStub || !key.startsWith("_")) copy[key] = copyTree(entry);
  }
  return copy;
};

// Windows file URLs keep a slash before the drive letter: `/D:/docs/a.md`.
const describeFile = (ctx: HastVisitorContext) =>
  ctx.fileURL
    ? `${decodeURIComponent(ctx.fileURL.pathname).replace(/^\/(?=[A-Za-z]:)/, "")}: `
    : "";

/**
 * ## Sätteri Code Group
 * The rehype-code-group transform as a Sätteri hast plugin, for Astro 7's
 * default Markdown processor and anything else built on Sätteri. Takes the
 * same options and writes the same HTML as the rehype plugin.
 *
 * Sätteri doesn't surface plugin diagnostics yet, so malformed groups are
 * logged with `console.warn`, or thrown when `diagnostics` is `"error"`.
 *
 * @param options {@link RehypeCodeGroupOptions} - Options to customize the plugin.
 * @returns A Sätteri hast plugin.
 *
 * @example
 * // astro.config.mjs
 * import { defineConfig } from "astro/config";
 * import { satteri } from "@astrojs/markdown-satteri";
 * import { satteriCodeGroup, satteriCodeGroupLabels } from "rehype-code-group/satteri";
 *
 * export default defineConfig({
 *   markdown: {
 *     processor: satteri({
 *       mdastPlugins: [satteriCodeGroupLabels()],
 *       hastPlugins: [satteriCodeGroup()],
 *     }),
 *   },
 * });
 */
export const satteriCodeGroup = (
  options: RehypeCodeGroupOptions = {},
): HastPluginDefinition => {
  const { diagnostics = "warn" } = options;

  return {
    name: "rehype-code-group",
    after(root, ctx) {
      if (!hasGroupMarker(root as HastNode)) return;

      // Sätteri hands hooks a read-only tree; transform a copy and swap it in.
      const tree = copyTree(root) as Root;
      const found = transformCodeGroups(tree, options, (warning) => {
        if (diagnostics === "silent") return;
        const severity = diagnostics === "error" ? "error" : "warning";
        ctx.report({ message: warning, severity });
        const message = `rehype-code-group: ${describeFile(ctx)}${warning}`;
        if (diagnostics === "error") throw new Error(message);
        console.warn(message);
      });

      if (found) {
        ctx.replaceNode(
          root,
          tree as unknown as Parameters<typeof ctx.replaceNode>[1],
        );
      }
    },
  };
};

/**
 * ## Sätteri Code Group Labels
 * The `remark-code-group` label syntax as a Sätteri mdast plugin: lets a
 * `::: code-group` take its tab labels from `[label]` fence metadata. Use it
 * with {@link satteriCodeGroup}.
 *
 * @returns A Sätteri mdast plugin.
 */
export const satteriCodeGroupLabels = (): MdastPluginDefinition => ({
  name: "rehype-code-group-labels",
  before(root, ctx) {
    // `replaceNode` is the one mutation every supported Sätteri release has.
    rewriteLabelMetadata(root as unknown as Parent, {
      setMeta: (code: Code, meta) => {
        const { lang, position, value } = code;
        ctx.replaceNode(code, { type: "code", lang, meta, position, value });
      },
      setParagraphText: (paragraph: Paragraph, value) => {
        ctx.replaceNode(paragraph, {
          type: "paragraph",
          children: [{ type: "text", value }],
          position: paragraph.position,
        });
      },
    });
  },
});
