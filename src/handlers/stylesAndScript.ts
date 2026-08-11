import type { Element, Root } from "hast";
import { createScriptElement, createStyleElement } from "../elements/index.js";
import type { AssetOptions, ClassNames } from "../options.js";

type ExternalAssetOptions = Extract<AssetOptions, { mode: "external" }>;

const insertAssets = (
  tree: Root,
  assets: Element[],
  headElement?: Element,
  htmlElement?: Element,
) => {
  if (headElement) {
    headElement.children.push(...assets);
    return;
  }

  if (htmlElement) {
    htmlElement.children.unshift({
      type: "element",
      tagName: "head",
      properties: {},
      children: assets,
    });
    return;
  }

  tree.children.unshift(...assets);
};

export const addExternalAssets = (
  tree: Root,
  options: ExternalAssetOptions,
  headElement?: Element,
  htmlElement?: Element,
) => {
  const nonce = options.nonce ? { nonce: options.nonce } : {};
  insertAssets(
    tree,
    [
      {
        type: "element",
        tagName: "link",
        properties: {
          rel: ["stylesheet"],
          href: options.stylesheetHref,
          ...nonce,
        },
        children: [],
      },
      {
        type: "element",
        tagName: "script",
        properties: { type: "module", src: options.scriptSrc, ...nonce },
        children: [],
      },
    ],
    headElement,
    htmlElement,
  );
};

export const addStylesAndScript = (
  tree: Root,
  classNames: ClassNames,
  headElement?: Element,
  htmlElement?: Element,
  firstStyleIndex = -1,
  nonce?: string,
) => {
  let head = headElement;
  const html = htmlElement;

  const styleElement: Element = createStyleElement(nonce);
  const scriptElement: Element = createScriptElement(classNames, nonce);

  if (head) {
    if (firstStyleIndex !== -1) {
      head.children.splice(firstStyleIndex, 0, styleElement);
    } else {
      head.children.push(styleElement);
    }
    head.children.push(scriptElement);
  } else if (html) {
    head = {
      type: "element",
      tagName: "head",
      properties: {},
      children: [styleElement, scriptElement],
    };
    html.children.unshift(head);
  } else {
    tree.children.unshift(styleElement, scriptElement);
  }
};
