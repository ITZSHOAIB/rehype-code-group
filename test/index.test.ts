import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { processHtml } from "../scripts/processHtml";
import { processMarkdown } from "../scripts/processMarkdown";

const fixturesDir = path.join(__dirname, "fixtures");

const readFixture = async (
  testCase: string,
  fileName: string,
): string | null => {
  try {
    const filePath = path.join(fixturesDir, testCase, fileName);
    return fs.readFileSync(filePath, "utf8");
  } catch (_err) {
    return null;
  }
};

describe("rehypeCodeGroup", async () => {
  const testCases = await fs.readdirSync(fixturesDir, { withFileTypes: true });
  const directories = testCases
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const testCase of directories) {
    it(`should process ${testCase} correctly`, async () => {
      const isHtml = testCase.split("-")[1] === "html";

      const expectedOutput = await readFixture(testCase, "output.html");

      if (expectedOutput === null) {
        throw new Error(`No output found for ${testCase}`);
      }

      let output: string;
      if (isHtml) {
        const inputHtml = await readFixture(testCase, "input.html");
        output = await processHtml(inputHtml, {});
      } else {
        const inputMd = await readFixture(testCase, "input.md");
        output = await processMarkdown(inputMd, {});
      }

      expect(output).toBe(expectedOutput);
    });
  }
});
