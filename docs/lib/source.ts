import { llms, loader } from "fumadocs-core/source";
import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { applyMdxPreset } from "fumadocs-mdx/config";
import { defineDocs } from "fumadocs-mdx/macro";
import rehypeCodeGroup from "rehype-code-group";
import remarkCodeGroup from "rehype-code-group/remark";
import { docsRoute } from "./shared";

const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema,
    mdxOptions: applyMdxPreset({
      remarkPlugins: (v) => [remarkCodeGroup, ...v],
      rehypePlugins: (v) => [[rehypeCodeGroup, { assets: "none" }], ...v],
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [],
});

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await page.data.getText("processed")}`,
  renderUrl: (item) => markdownUrl(item.url),
});

/** Markdown copy of a page, served from `app/llms.mdx/[...path]`. */
export function markdownUrl(url: string) {
  return `/llms.mdx${url}.md`;
}
