import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = path.resolve(import.meta.dirname, "..");
const packageJson = JSON.parse(
  await readFile(path.join(projectRoot, "package.json"), "utf8"),
);

const exportedFiles = new Set();
for (const entry of Object.values(packageJson.exports)) {
  if (typeof entry === "string") {
    exportedFiles.add(entry);
    continue;
  }
  for (const target of Object.values(entry)) exportedFiles.add(target);
}

for (const relativeFile of exportedFiles) {
  const absoluteFile = path.join(projectRoot, relativeFile);
  const contents = await readFile(absoluteFile, "utf8");
  assert(contents.length > 0, `${relativeFile} must not be empty`);
  if (relativeFile.endsWith(".js")) await import(pathToFileURL(absoluteFile));
}

const rootModule = await readFile(
  path.join(projectRoot, "dist/index.js"),
  "utf8",
);
assert(
  !rootModule.includes("node-emoji"),
  "the default entry point must not load the complete emoji catalog",
);

const packResult = JSON.parse(
  execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
    cwd: projectRoot,
    encoding: "utf8",
  }),
)[0];
const packedPaths = packResult.files.map((file) => file.path);
assert(packedPaths.includes("package.json"));
assert(packedPaths.includes("dist/index.js"));
assert(packedPaths.includes("dist/index.d.ts"));
assert(packedPaths.includes("dist/client.js"));
assert(packedPaths.includes("dist/styles.css"));
assert(
  packedPaths.every(
    (file) =>
      file === "LICENSE" ||
      file === "README.md" ||
      file === "package.json" ||
      file.startsWith("dist/"),
  ),
  `unexpected published files: ${packedPaths.join(", ")}`,
);

console.log(
  `Package check passed: ${packResult.files.length} files, ${packResult.unpackedSize} unpacked bytes.`,
);
