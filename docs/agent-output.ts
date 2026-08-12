import type { List, ListItem, Paragraph, Root, RootContent } from "mdast";
import type { Plugin } from "unified";

type MdxAttribute = {
  name: string;
  type: string;
  value?: string | { type: string; value: string } | null;
};

type MdxElement = {
  attributes?: MdxAttribute[];
  children?: UnknownNode[];
  name?: string | null;
  type: "mdxJsxFlowElement";
};

type ParentNode = { children: UnknownNode[] };
type UnknownNode = RootContent | MdxElement | { type: string };

const isMdxElement = (node: UnknownNode, name?: string): node is MdxElement =>
  node.type === "mdxJsxFlowElement" &&
  "name" in node &&
  (name === undefined || node.name === name);

const hasChildren = (node: UnknownNode): node is UnknownNode & ParentNode =>
  "children" in node && Array.isArray(node.children);

const getStringAttribute = (node: MdxElement, name: string) => {
  const attribute = node.attributes?.find(
    (candidate) =>
      candidate.type === "mdxJsxAttribute" && candidate.name === name,
  );
  return typeof attribute?.value === "string" ? attribute.value : undefined;
};

const textParagraph = (value: string): Paragraph => ({
  type: "paragraph",
  children: [{ type: "text", value }],
});

const cardToListItem = (card: MdxElement): ListItem | undefined => {
  const title = getStringAttribute(card, "title");
  const target = getStringAttribute(card, "to");
  if (!title || !target) return undefined;

  const description = getStringAttribute(card, "description");
  return {
    type: "listItem",
    children: [
      {
        type: "paragraph",
        children: [
          {
            type: "link",
            url: target,
            children: [{ type: "text", value: title }],
          },
          ...(description
            ? [{ type: "text" as const, value: ` — ${description}` }]
            : []),
        ],
      },
    ],
  };
};

const cardsToList = (cards: MdxElement): List | undefined => {
  const items = (cards.children ?? [])
    .filter((child): child is MdxElement => isMdxElement(child, "Card"))
    .map(cardToListItem)
    .filter((item): item is ListItem => item !== undefined);

  return items.length > 0
    ? { type: "list", ordered: false, spread: false, children: items }
    : undefined;
};

const transformChildren = (parent: ParentNode) => {
  const children: UnknownNode[] = [];

  for (const child of parent.children) {
    if (isMdxElement(child, "Cards")) {
      const list = cardsToList(child);
      if (list) children.push(list);
      continue;
    }

    if (isMdxElement(child, "Card")) {
      const item = cardToListItem(child);
      if (item) children.push(...item.children);
      continue;
    }

    if (isMdxElement(child, "CodeGroupPreview")) {
      children.push(
        textParagraph(
          getStringAttribute(child, "agentSummary") ??
            "Interactive preview. The equivalent source is included in this section.",
        ),
      );
      continue;
    }

    if (isMdxElement(child, "HomePage")) {
      children.push(
        textParagraph(
          "rehype-code-group provides accessible, framework-neutral code and content tabs for unified pipelines.",
        ),
        {
          type: "list",
          ordered: false,
          spread: false,
          children: [
            {
              type: "listItem",
              children: [
                {
                  type: "paragraph",
                  children: [
                    {
                      type: "link",
                      url: "/getting-started",
                      children: [{ type: "text", value: "Get started" }],
                    },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              children: [
                {
                  type: "paragraph",
                  children: [
                    {
                      type: "link",
                      url: "https://www.npmjs.com/package/rehype-code-group",
                      children: [{ type: "text", value: "npm package" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      );
      continue;
    }

    if (hasChildren(child)) transformChildren(child);
    children.push(child);
  }

  parent.children = children;
};

const agentOutput: Plugin<[], Root> = () => (tree) => {
  transformChildren(tree as unknown as ParentNode);
};

export default agentOutput;
