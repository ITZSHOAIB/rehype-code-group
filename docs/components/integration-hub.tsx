"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";

type Integration = {
  name: string;
  mark: string;
  href: string;
  file: string;
  /** The config line, split so the plugin call can be highlighted. */
  before: string;
  plugin: string;
  after: string;
};

// Each line is taken from the matching integration guide.
const integrations: Integration[] = [
  {
    name: "unified",
    mark: "u",
    href: "/docs/integrations/unified/",
    file: "build.js",
    before: ".use(",
    plugin: "rehypeCodeGroup",
    after: ")",
  },
  {
    name: "MDX",
    mark: "M",
    href: "/docs/integrations/mdx/",
    file: "compile.js",
    before: "rehypePlugins: [",
    plugin: "rehypeCodeGroup",
    after: "]",
  },
  {
    name: "Sätteri",
    mark: "S",
    href: "/docs/integrations/satteri/",
    file: "render.js",
    before: "hastPlugins: [",
    plugin: "satteriCodeGroup()",
    after: "]",
  },
  {
    name: "Astro",
    mark: "A",
    href: "/docs/integrations/astro/",
    file: "astro.config.mjs",
    before: "satteri({ hastPlugins: [",
    plugin: "satteriCodeGroup()",
    after: "] })",
  },
  {
    name: "Next.js and Fumadocs",
    mark: "N",
    href: "/docs/integrations/nextjs-fumadocs/",
    file: "source.config.ts",
    before: "rehypePlugins: (v) => [",
    plugin: "rehypeCodeGroup",
    after: ", ...v]",
  },
];

const ROTATE_MS = 5000;

export function IntegrationHub() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setActive((index) => (index + 1) % integrations.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(timer);
  }, [paused]);

  const current = integrations[active];
  const left = integrations.slice(0, 3);
  const right = integrations.slice(3);

  const card = (integration: Integration, side: "left" | "right") => {
    const index = integrations.indexOf(integration);
    return (
      <li key={integration.name} className="hub-item" data-side={side}>
        <Link
          href={integration.href}
          className="hub-card"
          data-active={index === active || undefined}
          onMouseEnter={() => setActive(index)}
          onFocus={() => setActive(index)}
        >
          <span aria-hidden="true" className="hub-mark">
            {integration.mark}
          </span>
          <span className="min-w-0">
            <span className="block font-display font-semibold tracking-tight">
              {integration.name}
            </span>
            <span className="block truncate font-mono text-xs text-fd-muted-foreground">
              {integration.file}
            </span>
          </span>
          <span aria-hidden="true" className="hub-go">
            →
          </span>
        </Link>
        <span aria-hidden="true" className="hub-wire" />
      </li>
    );
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: pausing the rotation on hover is a convenience, not an action.
    <div
      className="hub"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <ul className="hub-column">{left.map((item) => card(item, "left"))}</ul>

      <div className="hub-core">
        <div className="hub-core-card">
          <p className="flex items-center gap-2 font-display font-semibold tracking-tight">
            <Logo className="size-6" />
            rehype-code-group
          </p>
          <div className="hub-config" aria-live="polite">
            <p className="hub-config-file">
              <span className="hub-dot" />
              {current.file}
            </p>
            <p key={current.name} className="hub-config-line">
              <span className="text-fd-muted-foreground">{current.before}</span>
              <span className="text-fd-primary">{current.plugin}</span>
              <span className="text-fd-muted-foreground">{current.after}</span>
            </p>
          </div>
          <p className="text-xs text-fd-muted-foreground">
            Same HTML, same options, every pipeline.
          </p>
        </div>
      </div>

      <ul className="hub-column">
        {right.map((item) => card(item, "right"))}
        <li className="hub-item" data-side="right">
          <Link
            href="/docs/integrations/unified/"
            className="hub-card hub-card-ghost"
          >
            <span aria-hidden="true" className="hub-mark">
              +
            </span>
            <span className="min-w-0">
              <span className="block font-display font-semibold tracking-tight">
                Anything with rehype
              </span>
              <span className="block font-mono text-xs text-fd-muted-foreground">
                Docusaurus, Nextra, …
              </span>
            </span>
          </Link>
          <span aria-hidden="true" className="hub-wire" />
        </li>
      </ul>
    </div>
  );
}
