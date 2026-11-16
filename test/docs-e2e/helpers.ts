import type { Page } from "@playwright/test";

/**
 * Collect console errors, uncaught exceptions and failed requests (including
 * 404s for prefetched route data) while a page is in use.
 */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("requestfailed", (request) => {
    errors.push(
      `requestfailed: ${request.url()} ${request.failure()?.errorText}`,
    );
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      errors.push(`http ${response.status()}: ${response.url()}`);
    }
  });
  return errors;
}

/** Turn an absolute production URL from the sitemap into a local path. */
export function toPath(url: string) {
  return new URL(url).pathname;
}
