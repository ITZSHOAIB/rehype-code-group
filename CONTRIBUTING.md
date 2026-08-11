# Contributing

Thanks for improving `rehype-code-group`.

## Requirements

- Node.js 24 is recommended for the complete workspace; the published plugin is tested on Node.js 20, 22, and 24.
- pnpm 10.34.5, enabled through Corepack.

## Setup

```sh
corepack enable
pnpm install --frozen-lockfile
```

## Test-driven workflow

Every behavior change starts with one failing test at the public boundary.

1. Add the smallest unit, integration, or browser test that demonstrates the behavior.
2. Run it and confirm the expected failure.
3. Implement only enough production code to pass.
4. Refactor while the focused test remains green.
5. Run the full relevant suite.

Avoid mocking internal collaborators. Prefer Markdown-to-HTML integration tests for compiler behavior and Playwright for browser behavior.

## Commands

```sh
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm test:e2e
pnpm test:package
pnpm test:docs
pnpm audit
```

The full Playwright suite requires Chromium, Firefox, and WebKit:

```sh
pnpm exec playwright install chromium firefox webkit
```

## Pull requests

- Keep changes scoped and document user-visible behavior.
- Add a changeset with `pnpm changeset`.
- Do not update golden fixtures merely to hide an unintended regression.
- Ensure no generated `dist`, coverage, Playwright, or documentation build cache files are committed.

Use GitHub's private vulnerability reporting flow for security issues; see [SECURITY.md](./SECURITY.md).
