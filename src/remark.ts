import type { Code, Paragraph, Parent, Root } from "mdast";
import type { Plugin } from "unified";

const paragraphText = (node: Parent["children"][number]) =>
  node.type === "paragraph" &&
  node.children.length === 1 &&
  node.children[0].type === "text"
    ? node.children[0].value.trim()
    : undefined;

/** How a host applies the label rewrites to its own mdast tree. */
export type LabelEditor = {
  setMeta: (code: Code, meta: string | undefined) => void;
  setParagraphText: (paragraph: Paragraph, value: string) => void;
};

/**
 * Move `[label]` fence metadata onto the `::: code-group` line, as
 * `labels=[...]`, for every group in the tree.
 */
export const rewriteLabelMetadata = (parent: Parent, editor: LabelEditor) => {
  for (let index = 0; index < parent.children.length; index += 1) {
    const child = parent.children[index];
    if (paragraphText(child) !== "::: code-group") {
      if ("children" in child) rewriteLabelMetadata(child as Parent, editor);
      continue;
    }

    let endIndex = index + 1;
    while (
      endIndex < parent.children.length &&
      paragraphText(parent.children[endIndex]) !== ":::"
    ) {
      endIndex += 1;
    }
    if (endIndex >= parent.children.length) continue;

    const codeBlocks = parent.children.slice(index + 1, endIndex);
    if (
      codeBlocks.length === 0 ||
      codeBlocks.some((node) => node.type !== "code")
    ) {
      continue;
    }

    const parsedMetadata = (codeBlocks as Code[]).map((block) => {
      const meta = block.meta?.trim();
      const match = meta?.match(/(?:^|\s)\[([^\]]+)\](?:\s|$)/);
      return match
        ? {
            block,
            label: match[1],
            remainingMeta: meta?.replace(match[0], " ").trim() || undefined,
          }
        : undefined;
    });
    if (parsedMetadata.some((entry) => !entry)) continue;

    for (const entry of parsedMetadata) {
      if (entry) editor.setMeta(entry.block, entry.remainingMeta);
    }
    const labels = parsedMetadata.map((entry) => entry?.label ?? "");

    editor.setParagraphText(
      child as Paragraph,
      `::: code-group labels=[${labels.map((label) => JSON.stringify(label)).join(", ")}]`,
    );
  }
};

const remarkCodeGroup: Plugin<[], Root> = () => (tree) => {
  rewriteLabelMetadata(tree, {
    setMeta: (code, meta) => {
      code.meta = meta;
    },
    setParagraphText: (paragraph, value) => {
      paragraph.children = [{ type: "text", value }];
    },
  });
};

export default remarkCodeGroup;
