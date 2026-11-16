// Finish the static export for hosting:
//
// 1. Next 16 writes segment prefetch files as nested folders, such as
//    `docs/__next.docs/$oc$slug/__PAGE__.txt`, while the client router asks for
//    the dotted name `docs/__next.docs.$oc$slug.__PAGE__.txt`. Copy each one to
//    the dotted name so soft navigation prefetches hit instead of 404ing.
// 2. Move the export to `dist/public`, the Cloudflare Pages output directory.
import { copyFile, mkdir, readdir, rename, rm } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const out = new URL("../out/", import.meta.url).pathname.replace(
  /^\/(?=[A-Za-z]:)/,
  "",
);
const dist = join(out, "..", "dist");

const filesUnder = async (directory) => {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await filesUnder(path)));
    else files.push(path);
  }
  return files;
};

let flattened = 0;
const flattenSegments = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "_next") continue;
    const path = join(directory, entry.name);
    if (entry.name.startsWith("__next.")) {
      for (const file of await filesUnder(path)) {
        const dotted = relative(directory, file).split(sep).join(".");
        await copyFile(file, join(directory, dotted));
        flattened += 1;
      }
    } else {
      await flattenSegments(path);
    }
  }
};

await flattenSegments(out);
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await rename(out, join(dist, "public"));
console.log(
  `postbuild: wrote ${flattened} prefetch aliases, site is in docs/dist/public`,
);
