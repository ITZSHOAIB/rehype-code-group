import { defineConfig } from "vocs/config";

export default defineConfig({
  accentColor: "light-dark(#c2410c, #fb923c)",
  baseUrl: process.env.VOCS_BASE_URL,
  colorScheme: "dark",
  description:
    "Accessible, framework-neutral code and content tabs for the unified ecosystem.",
  editLink: {
    link: "https://github.com/ITZSHOAIB/rehype-code-group/edit/main/docs/src/pages/:path",
    text: "Suggest changes to this page",
  },
  renderStrategy: "full-static",
  sidebar: [
    { text: "Getting started", link: "/getting-started" },
    {
      text: "Guides",
      items: [
        { text: "Syntax", link: "/guides/syntax" },
        { text: "State & syncing", link: "/guides/state" },
        { text: "Styling & assets", link: "/guides/styling" },
        { text: "Frameworks", link: "/guides/frameworks" },
      ],
    },
    {
      text: "Reference",
      items: [
        { text: "Options", link: "/reference/options" },
        { text: "Accessibility", link: "/reference/accessibility" },
      ],
    },
    { text: "Migration to 1.0", link: "/migration" },
  ],
  topNav: [
    { text: "Docs", link: "/getting-started" },
    {
      text: "GitHub",
      link: "https://github.com/ITZSHOAIB/rehype-code-group",
      external: true,
    },
  ],
  title: "rehype-code-group",
  titleTemplate: "%s | rehype-code-group",
});
