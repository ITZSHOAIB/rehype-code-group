import Link from "next/link";
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
  return (
    <div className="integration-showcase">
      <ul className="integration-logos" aria-label="Supported integrations">
        {integrations.map((integration) => (
          <li key={integration.mark} className="integration-logo-item">
            <Link href={integration.href} className="integration-logo-link">
              <IntegrationMark name={integration.mark} />
              <span>{integration.name}</span>
              <span className="integration-logo-arrow" aria-hidden="true">
                ↗
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="integration-footnote">
        <span>One plugin. A familiar place in your stack.</span>
        <Link href="/docs/integrations/unified/">
          And anywhere else rehype runs <span aria-hidden="true">→</span>
        </Link>
      </p>
    </div>
  );
}
