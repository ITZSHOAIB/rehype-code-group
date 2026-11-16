export const appName = "rehype-code-group";
export const siteUrl = "https://rehype-code-group.pages.dev";
export const siteDescription =
  "Accessible, framework-neutral code and content tabs for Markdown, built at compile time by a rehype plugin.";
export const docsRoute = "/docs";
export const ogImage = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "rehype-code-group: accessible code tabs for rehype",
};

export const gitConfig = {
  user: "ITZSHOAIB",
  repo: "rehype-code-group",
  branch: "main",
};

export const repoUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;
export const npmUrl = "https://www.npmjs.com/package/rehype-code-group";

/** Pages are exported as `<route>/index.html`, so canonical URLs end in `/`. */
export function absoluteUrl(path: string) {
  return new URL(path.endsWith("/") ? path : `${path}/`, siteUrl).href;
}

/** The file to edit on GitHub for a docs page, relative to `content/docs`. */
export function sourceFileUrl(pagePath: string) {
  // The changelog page is generated from the repository's CHANGELOG.md.
  const file =
    pagePath === "changelog.md"
      ? "CHANGELOG.md"
      : `docs/content/docs/${pagePath}`;
  return `${repoUrl}/blob/${gitConfig.branch}/${encodeURI(file)}`;
}
