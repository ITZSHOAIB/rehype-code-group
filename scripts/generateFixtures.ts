import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { processHtml } from "./processHtml";
import { processMarkdown } from "./processMarkdown";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fixturesDir = path.join(__dirname, "../test/fixtures");

const generateFixture = async (testCase: string) => {
  const isHtml = testCase.split("-")[1] === "html";

  const inputHtmlPath = path.join(fixturesDir, testCase, "input.html");
  const inputMdPath = path.join(fixturesDir, testCase, "input.md");
  const outputPath = path.join(fixturesDir, testCase, "output.html");

  let output: string | null = null;

  try {
    if (isHtml) {
      const input = await fs.readFile(inputHtmlPath, "utf8");
      output = await processHtml(input, {});
    } else {
      const input = await fs.readFile(inputMdPath, "utf8");
      output = await processMarkdown(input, {});
    }
  } catch (_err) {
    output = null;
  }

  if (output) {
    await fs.writeFile(outputPath, output, "utf8");
    console.log(`Generated output for ${testCase}`);
  } else {
    console.error(`No input found for ${testCase}`);
  }
};

const main = async () => {
  try {
    const testCases = await fs.readdir(fixturesDir, { withFileTypes: true });
    const directories = testCases
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const testCase of directories) {
      await generateFixture(testCase);
    }
  } catch (err) {
    console.error("Error reading fixtures directory:", err);
    process.exit(1);
  }
};

main();
