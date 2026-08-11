import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "test/docs-e2e",
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4321",
    permissions: ["clipboard-write"],
    trace: "on-first-retry",
  },
  webServer: {
    command: "node test/docs-e2e/server.mjs",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
