// Generate the changelog page from the repository's CHANGELOG.md, which
// Changesets maintains. The output is gitignored and rebuilt on every
// `build` and `dev`, so the page never drifts from the published notes.
import { readFile, writeFile } from "node:fs/promises";

const changelog = await readFile(
  new URL("../../CHANGELOG.md", import.meta.url),
  "utf8",
);
// Drop the `# rehype-code-group` title; the page supplies its own.
const body = changelog.replace(/^# .*\r?\n/, "").trim();

await writeFile(
  new URL("../content/docs/changelog.md", import.meta.url),
  `---
title: Changelog
description: Every published version of rehype-code-group, generated from the repository's CHANGELOG.md.
---

${body}
`,
);
console.log("changelog: wrote content/docs/changelog.md");
