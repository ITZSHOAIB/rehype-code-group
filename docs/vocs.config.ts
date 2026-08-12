import { Changelog, defineConfig } from "vocs/config";
import agentOutput from "./agent-output.js";

const siteUrl =
  process.env.VOCS_BASE_URL ?? "https://rehype-code-group.pages.dev";
const githubChangelog = Changelog.github({
  repo: "ITZSHOAIB/rehype-code-group",
});

const stripHtmlComments = (value: string) => {
  let output = "";
  let cursor = 0;

  while (cursor < value.length) {
    const start = value.indexOf("<!--", cursor);
    if (start === -1) return output + value.slice(cursor);
    output += value.slice(cursor, start);
    const end = value.indexOf("-->", start + 4);
    if (end === -1) return output;
    cursor = end + 3;
  }

  return output;
};

export default defineConfig({
  accentColor: "light-dark(#c2410c, #fb923c)",
  baseUrl: siteUrl,
  changelog: Changelog.from({
    type: "github",
    async fetch(options) {
      try {
        const releases = await githubChangelog.fetch(options);
        return releases.map((release) => ({
          ...release,
          body: stripHtmlComments(release.body),
        }));
      } catch (error) {
        console.warn("[docs] Could not fetch GitHub releases.", error);
        return [];
      }
    },
  }),
  codeHighlight: {
    themes: {
      dark: "vesper",
      light: "github-light",
    },
  },
  colorScheme: "dark",
  description:
    "Accessible, framework-neutral code and content tabs for the unified ecosystem.",
  editLink: {
    link: "https://github.com/ITZSHOAIB/rehype-code-group/edit/main/docs/src/pages/:path",
    text: "Suggest changes to this page",
  },
  head: {
    link: [
      {
        href: "/apple-touch-icon.png",
        rel: "apple-touch-icon",
        sizes: "180x180",
      },
    ],
    meta: {
      themeColor: "#0d0c0b",
      twitterCard: "summary_large_image",
    },
  },
  iconUrl: "/favicon-32.png",
  markdown: {
    outputRemarkPlugins: [agentOutput],
  },
  ogImageUrl: `${siteUrl}/og-image.png`,
  renderStrategy: "full-static",
  showAskAi: true,
  sidebar: [
    { text: "Getting started", link: "/getting-started" },
    {
      text: "Guides",
      items: [
        { text: "Syntax", link: "/guides/syntax" },
        { text: "State & syncing", link: "/guides/state" },
        { text: "Styling & assets", link: "/guides/styling" },
        { text: "Vocs integration", link: "/guides/vocs" },
        { text: "Frameworks", link: "/guides/frameworks" },
      ],
    },
    {
      text: "Reference",
      items: [
        { text: "Options", link: "/reference/options" },
        { text: "Accessibility", link: "/reference/accessibility" },
        { text: "Agent resources", link: "/agent-resources" },
        { text: "Changelog", link: "/changelog" },
      ],
    },
    { text: "Migration to 1.0", link: "/migration" },
  ],
  topNav: [
    { text: "Docs", link: "/getting-started" },
    {
      text: "npm",
      link: "https://www.npmjs.com/package/rehype-code-group",
      external: true,
    },
    {
      text: "GitHub",
      link: "https://github.com/ITZSHOAIB/rehype-code-group",
      external: true,
    },
  ],
  title: "rehype-code-group",
  titleTemplate: "%s | rehype-code-group",
});
