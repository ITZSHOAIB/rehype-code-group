import { basename, extname } from "node:path";
import { llms, loader } from "fumadocs-core/source";
import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { applyMdxPreset } from "fumadocs-mdx/config";
import { defineCollections, defineDocs } from "fumadocs-mdx/macro";
import rehypeCodeGroup, {
  type RehypeCodeGroupOptions,
} from "rehype-code-group";
import remarkPackageManagers from "rehype-code-group/package-managers";
import remarkCodeGroup from "rehype-code-group/remark";
import { docsRoute } from "./shared";

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
      includeProcessedMarkdown: true,
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

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await page.data.getText("processed")}`,
  renderUrl: (item) => markdownUrl(item.url),
});

/** Markdown copy of a page, served from `app/llms.mdx/[...path]`. */
export function markdownUrl(url: string) {
  return `/llms.mdx${url}.md`;
}
