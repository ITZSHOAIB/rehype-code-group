"use client";
import Link from "next/link";
import { useState } from "react";
import { IntegrationMark } from "@/components/integration-mark";

const integrations = [
  { name: "unified", mark: "unified", href: "/docs/integrations/unified/" },
  { name: "MDX", mark: "mdx", href: "/docs/integrations/mdx/" },
  { name: "Sätteri", mark: "satteri", href: "/docs/integrations/satteri/" },
  { name: "Astro", mark: "astro", href: "/docs/integrations/astro/" },
  {
    name: "Next.js & Fumadocs",
    mark: "nextjs",
    href: "/docs/integrations/nextjs-fumadocs/",
  },
] as const;

export function IntegrationHub() {
  const [paused, setPaused] = useState(false);
  return (
    <div className="integration-showcase" data-paused={paused || undefined}>
      <div className="integration-reel">
        <div className="integration-track">
          <ul className="integration-logos" aria-label="Supported integrations">
            {integrations.map((integration) => (
              <li key={integration.mark}>
                <Link href={integration.href} className="integration-logo-link">
                  <IntegrationMark name={integration.mark} />
                  <span>{integration.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div
            className="integration-logos integration-logos-copy"
            aria-hidden="true"
          >
            {integrations.map((integration) => (
              <Link
                key={integration.mark}
                href={integration.href}
                tabIndex={-1}
                className="integration-logo-link"
              >
                <IntegrationMark name={integration.mark} />
                <span>{integration.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="integration-footnote">
        <Link href="/docs/integrations/unified/">
          And anywhere else rehype runs <span aria-hidden="true">→</span>
        </Link>
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
          className="integration-motion-toggle"
        >
          {paused ? "Resume motion" : "Pause motion"}
        </button>
      </div>
    </div>
  );
}
