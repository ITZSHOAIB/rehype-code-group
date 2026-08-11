import type { Code, Paragraph, Parent, Root } from "mdast";
import type { Plugin } from "unified";

const paragraphText = (node: Parent["children"][number]) =>
  node.type === "paragraph" &&
  node.children.length === 1 &&
  node.children[0].type === "text"
    ? node.children[0].value.trim()
    : undefined;

const setParagraphText = (paragraph: Paragraph, value: string) => {
  paragraph.children = [{ type: "text", value }];
};

const transformParent = (parent: Parent) => {
  for (let index = 0; index < parent.children.length; index += 1) {
    const child = parent.children[index];
    if (paragraphText(child) !== "::: code-group") {
      if ("children" in child) transformParent(child as Parent);
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
      if (entry) entry.block.meta = entry.remainingMeta;
    }
    const labels = parsedMetadata.map((entry) => entry?.label ?? "");

    setParagraphText(
      child as Paragraph,
      `::: code-group labels=[${labels.map((label) => JSON.stringify(label)).join(", ")}]`,
    );
  }
};

const remarkCodeGroup: Plugin<[], Root> = () => (tree) => {
  transformParent(tree);
};

export default remarkCodeGroup;
