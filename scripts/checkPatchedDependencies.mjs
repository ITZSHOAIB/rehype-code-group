import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const docsRequire = createRequire(
  new URL("../docs/package.json", import.meta.url),
);
const vocsRequire = createRequire(docsRequire.resolve("vocs"));

const uint32 = (buffer, offset, value) => {
  new DataView(buffer.buffer).setUint32(offset, value, false);
};

const text = (buffer, offset, value) => {
  buffer.set(new TextEncoder().encode(value), offset);
};

const probes = {
  heif() {
    const input = new Uint8Array(64);
    uint32(input, 0, 64);
    text(input, 4, "meta");
    uint32(input, 12, 52);
    text(input, 16, "iprp");
    uint32(input, 20, 44);
    text(input, 24, "ipco");
    text(input, 32, "ispe");
    return ["image-size/types/heif", "HEIF", input];
  },
  icns() {
    const input = new Uint8Array(16);
    text(input, 0, "icns");
    uint32(input, 4, input.length);
    text(input, 8, "ic07");
    return ["image-size/types/icns", "ICNS", input];
  },
  jxl() {
    const input = new Uint8Array(12);
    text(input, 4, "jxlp");
    return ["image-size/types/jxl", "JXL", input];
  },
};

const probeName = process.argv[2];
if (probeName) {
  const probe = probes[probeName];
  assert(probe, `Unknown dependency security probe: ${probeName}`);
  const [moduleName, exportName, input] = probe();
  const handler = vocsRequire(moduleName)[exportName];
  assert.throws(() => handler.calculate(input));
} else {
  for (const name of Object.keys(probes)) {
    const result = spawnSync(process.execPath, [import.meta.filename, name], {
      encoding: "utf8",
      timeout: 1_000,
    });
    assert.equal(
      result.status,
      0,
      `${name} security probe failed or timed out:\n${result.stderr}`,
    );
  }
  console.log("Patched dependency security checks passed.");
}
