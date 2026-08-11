import ArrowUpRight from "~icons/lucide/arrow-up-right";
import BookOpen from "~icons/lucide/book-open";
import Github from "~icons/lucide/github";
import PackageCheck from "~icons/lucide/package-check";
import Npm from "~icons/simple-icons/npm";
import { CodeGroupPreview } from "./CodeGroupPreview.js";
import { ProofPoints } from "./ProofPoints.js";

export function LandingHero() {
  return (
    <section className="rcg-hero" aria-labelledby="rcg-home-title">
      <div className="rcg-home-shell">
        <div className="rcg-home-copy">
          <p className="rcg-home-eyebrow">
            <PackageCheck aria-hidden="true" />
            rehype-code-group · Rehype plugin
          </p>
          <h1 id="rcg-home-title">Code tabs that belong in your docs.</h1>
          <p className="rcg-home-tagline">
            Accessible code and content tabs for the unified ecosystem.
          </p>
          <p className="rcg-home-description">
            Turn neighboring code blocks—or arbitrary HTML content—into an
            accessible tab interface without coupling to a syntax highlighter or
            frontend framework.
          </p>
          <div className="rcg-home-actions">
            <a
              className="rcg-home-button rcg-home-button-primary"
              href="/getting-started"
            >
              <BookOpen aria-hidden="true" />
              Get started
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a
              className="rcg-home-button"
              href="https://github.com/ITZSHOAIB/rehype-code-group"
            >
              <Github aria-hidden="true" />
              GitHub
            </a>
            <a
              className="rcg-home-button"
              href="https://www.npmjs.com/package/rehype-code-group"
            >
              <Npm aria-hidden="true" />
              View on npm
            </a>
          </div>
        </div>

        <div className="rcg-home-install">
          <p className="rcg-home-install-label">Install your way</p>
          <CodeGroupPreview
            accessibleLabel="Install rehype-code-group"
            id="home-install"
            items={[
              {
                code: "npm install rehype-code-group",
                label: "npm",
                lang: "sh",
              },
              { code: "pnpm add rehype-code-group", label: "pnpm", lang: "sh" },
              { code: "yarn add rehype-code-group", label: "yarn", lang: "sh" },
              { code: "bun add rehype-code-group", label: "bun", lang: "sh" },
            ]}
          />
          <p className="rcg-home-install-footnote">
            <PackageCheck aria-hidden="true" />
            One package. Any documentation stack.
          </p>
        </div>
      </div>

      <ProofPoints />
    </section>
  );
}
