// Sätteri's own declarations need Node's types, as any Sätteri project has.

import {
  type RehypeCodeGroupOptions,
  satteriCodeGroup,
  satteriCodeGroupLabels,
} from "rehype-code-group/satteri";
import { markdownToHtml } from "satteri";

const options: RehypeCodeGroupOptions = { assets: "none" };

markdownToHtml("::: code-group labels=[npm]", {
  mdastPlugins: [satteriCodeGroupLabels()],
  hastPlugins: [satteriCodeGroup(options)],
});
