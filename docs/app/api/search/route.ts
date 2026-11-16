import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/lib/source";

export const revalidate = false;

// Search text is extracted from the Markdown tree, before rehype-code-group
// turns `:::` marker paragraphs into tabs. Leave the markers out of the index.
const groupMarker = /^:{3,4}(\s+code-(group|tab)\b.*)?$/;

export const { staticGET: GET } = createFromSource(source, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: "english",
  buildIndex(page) {
    const { structuredData } = page.data;
    return {
      id: page.url,
      url: page.url,
      title: page.data.title,
      description: page.data.description,
      structuredData: {
        ...structuredData,
        contents: structuredData.contents.filter(
          (item) => !groupMarker.test(item.content.trim()),
        ),
      },
    };
  },
});
