import { basename, extname } from "node:path";
import {
  type PlaceholderData,
  renderPlaceholder,
} from "fumadocs-core/mdx-plugins/remark-llms.runtime";
import { llms, loader } from "fumadocs-core/source";
import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { applyMdxPreset } from "fumadocs-mdx/config";
import { defineCollections, defineDocs } from "fumadocs-mdx/macro";
import rehypeCodeGroup, {
  type RehypeCodeGroupOptions,
} from "rehype-code-group";
import remarkPackageManagers from "rehype-code-group/package-managers";
import remarkCodeGroup from "rehype-code-group/remark";
import {
  absoluteUrl,
  appName,
  docsRoute,
  repoUrl,
  siteDescription,
  siteUrl,
} from "./shared";

// The site imports the client and stylesheet once, in the root layout, so the
// plugin emits markup only. Malformed groups fail the build.
const codeGroupOptions: RehypeCodeGroupOptions = {
  assets: "none",
  diagnostics: "error",
};

const mdxOptions = (rehypeCodeGroupPlugin: typeof rehypeCodeGroup) =>
  applyMdxPreset({
    // Fumadocs ships its own tab and npm-conversion syntax. Turn both off so
    // every tab on this site comes from rehype-code-group.
    remarkCodeTabOptions: false,
    remarkNpmOptions: false,
    remarkPlugins: (v) => [
      [remarkPackageManagers, { diagnostics: "error" }],
      remarkCodeGroup,
      ...v,
    ],
    // Must run before Fumadocs' Shiki `rehypeCode`, which comes first in `v`.
    rehypePlugins: (v) => [[rehypeCodeGroupPlugin, codeGroupOptions], ...v],
  });

const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema,
    mdxOptions: mdxOptions(rehypeCodeGroup),
    postprocess: {
      includeProcessedMarkdown: {
        mdxAsPlaceholder: ["Callout"],
        filterElement(node) {
          if (
            (node.type === "mdxJsxFlowElement" ||
              node.type === "mdxJsxTextElement") &&
            (node.name === "Steps" || node.name === "Step")
          )
            return "children-only";
          return true;
        },
      },
    },
  },
  meta: {
    schema: metaSchema,
  },
});

/**
 * The homepage renders several demo files on one page. Generated IDs restart
 * at `rcg-0` in every file, so give each file its own prefix.
 */
type Transformer = NonNullable<ReturnType<typeof rehypeCodeGroup>>;

function rehypeCodeGroupPerFile(
  this: ThisParameterType<typeof rehypeCodeGroup>,
  options: RehypeCodeGroupOptions,
): Transformer {
  // Two parameters on purpose: unified treats a transformer that declares a
  // third (`next`) as callback-style and waits for it to be called.
  return (tree, file) => {
    const idPrefix = `home-${basename(file.path, extname(file.path))}`;
    const transform = rehypeCodeGroup.call(this, { ...options, idPrefix });
    return transform?.(tree, file, () => {});
  };
}

export const homeDemos = defineCollections({
  type: "doc",
  dir: "content/home",
  mdxOptions: mdxOptions(rehypeCodeGroupPerFile),
});

export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [],
});

const markdownComponents = {
  Callout: ({ attributes, children }: PlaceholderData) => {
    const title =
      typeof attributes.title === "string" ? attributes.title : "Note";
    return `> **${title}**\n>\n${children
      .trim()
      .split("\n")
      .map((line) => `> ${line}`)
      .join("\n")}\n`;
  },
};

export const docsLlms = llms(source, {
  renderPage: async (page) => {
    const body = await renderPlaceholder(
      await page.data.getText("processed"),
      markdownComponents,
    );
    return `# ${page.data.title}\n\n${page.data.description ?? ""}\n\nSource: ${absoluteUrl(page.url)}\n\n${body}`;
  },
  renderUrl: (item) => new URL(markdownUrl(item.url), siteUrl).href,
});

/** A small, curated entry point; detailed content lives behind its links. */
export function llmsIndex() {
  const pages = source.getPages();
  const groups = [
    [
      "Start here",
      (url: string) =>
        url === docsRoute || url === `${docsRoute}/getting-started`,
    ],
    ["Writing groups", (url: string) => url.startsWith(`${docsRoute}/syntax/`)],
    [
      "Shipping and troubleshooting",
      (url: string) => url.startsWith(`${docsRoute}/guides/`),
    ],
    [
      "Integrations",
      (url: string) => url.startsWith(`${docsRoute}/integrations/`),
    ],
    ["Reference", (url: string) => url.startsWith(`${docsRoute}/reference/`)],
  ] as const;
  const lines = [
    `# ${appName}`,
    "",
    `> ${siteDescription}`,
    "",
    "Requires Node.js 22.12 or newer and ESM. Choose the guide for your Markdown processor before copying configuration; the unified/rehype and Sätteri adapters use different entry points.",
    "",
    "These links serve Markdown without JavaScript. Code fences retain the authoring syntax. For options and defaults, use the reference pages. For framework setup, use the matching integration guide.",
  ];
  for (const [title, matches] of groups) {
    lines.push("", `## ${title}`, "");
    for (const page of pages.filter((page) => matches(page.url))) {
      lines.push(
        `- [${page.data.title}](${new URL(markdownUrl(page.url), siteUrl).href}): ${page.data.description ?? ""}`,
      );
    }
  }
  lines.push(
    "",
    "## Optional",
    "",
    `- [Full documentation](${siteUrl}/llms-full.txt): All documentation in one file; prefer individual pages for a smaller context.`,
    ...pages
      .filter((page) => page.url === `${docsRoute}/changelog`)
      .map(
        (page) =>
          `- [Changelog](${new URL(markdownUrl(page.url), siteUrl).href}): Published release history.`,
      ),
    `- [Source repository](${repoUrl}): Implementation, issues, and package source.`,
    "",
  );
  return lines.join("\n");
}

/** Markdown copy of a page, served from `app/llms.mdx/[...path]`. */
export function markdownUrl(url: string) {
  return `/llms.mdx${url}.md`;
}
