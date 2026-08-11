import { writeFile } from "node:fs/promises";
import { styles } from "../dist/elements/styles.js";

await writeFile(
  new URL("../dist/styles.css", import.meta.url),
  styles.trimStart(),
);
await writeFile(
  new URL("../dist/styles.css.d.ts", import.meta.url),
  "declare const stylesheet: string;\nexport default stylesheet;\n",
);
