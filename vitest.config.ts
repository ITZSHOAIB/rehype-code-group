import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/client.ts", "src/options.ts"],
      reporter: ["text", "json"],
      thresholds: {
        branches: 70,
        functions: 85,
        lines: 85,
        statements: 85,
      },
    },
  },
});
