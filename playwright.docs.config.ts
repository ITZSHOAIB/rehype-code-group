import { defineConfig, devices } from "@playwright/test";

// End-to-end tests for the documentation site. `pnpm test:docs` builds the
// site first, then these tests run against the static export in
// docs/dist/public, served the same way `pnpm docs:preview` serves it.
const port = 4321;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "test/docs-e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: `node docs/scripts/serve.mjs --dir docs/dist/public --port ${port} --quiet`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
