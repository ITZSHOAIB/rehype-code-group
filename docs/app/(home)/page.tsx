import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { getMDXComponents } from "@/components/mdx";
import { npmUrl, repoUrl } from "@/lib/shared";
import { homeDemos } from "@/lib/source";

function Demo({ file, className }: { file: string; className?: string }) {
  const entry = homeDemos.get(file);
  if (!entry) throw new Error(`Missing homepage demo: content/home/${file}`);
  const Body = entry.body;
  return (
    <div className={className ? `home-demo ${className}` : "home-demo"}>
      <Body components={getMDXComponents()} />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-fd-primary">
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-fd-muted-foreground text-pretty">{children}</p>
    </div>
  );
}

const features: { title: string; body: ReactNode; href: string }[] = [
  {
    title: "Built at compile time",
    body: "Tabs are real HTML from your Markdown. Without JavaScript, every panel stays readable.",
    href: "/docs",
  },
  {
    title: "Accessible by default",
    body: "WAI-ARIA tabs with roving focus, arrow keys, Home and End, in either orientation.",
    href: "/docs/guides/accessibility",
  },
  {
    title: "Synced and remembered",
    body: "Groups that share a sync key switch together, and can remember the choice in storage or the URL.",
    href: "/docs/syntax/sync-and-persistence",
  },
  {
    title: "npm to every manager",
    body: "Write one npm command, get npm, pnpm, Yarn and Bun tabs.",
    href: "/docs/syntax/package-managers",
  },
  {
    title: "CSP-friendly assets",
    body: "Inline with a nonce, external files, or none at all when you bundle the client yourself.",
    href: "/docs/guides/asset-delivery",
  },
  {
    title: "Any content in a tab",
    body: "Rich groups hold prose, lists, images and components, not just code.",
    href: "/docs/syntax/rich-groups",
  },
];

const integrations = [
  { name: "unified", href: "/docs/integrations/unified" },
  { name: "Astro", href: "/docs/integrations/astro" },
  { name: "Next.js and Fumadocs", href: "/docs/integrations/nextjs-fumadocs" },
  { name: "MDX", href: "/docs/integrations/mdx" },
  { name: "Sätteri", href: "/docs/integrations/satteri" },
];

export default function HomePage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-x-clip">
      <div
        aria-hidden="true"
        className="home-grid-backdrop pointer-events-none absolute inset-x-0 top-0 h-[44rem]"
      />
      <div
        aria-hidden="true"
        className="home-glow pointer-events-none absolute inset-x-0 top-0 h-[44rem]"
      />

      {/* Hero */}
      <section className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pt-16 pb-20 sm:pt-24 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border bg-fd-card/70 px-3 py-1 font-mono text-xs text-fd-muted-foreground backdrop-blur">
            <Logo className="size-4" />a rehype plugin
          </p>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl">
            Code tabs, folded into your{" "}
            <span className="text-fd-primary">Markdown</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-fd-muted-foreground text-pretty">
            Write{" "}
            <code className="font-mono text-fd-foreground">::: code-group</code>{" "}
            around a few code blocks. Get accessible, keyboard-friendly tabs at
            build time, in any framework that runs rehype.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center rounded-full bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/85"
            >
              Get started
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center rounded-full border bg-fd-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
            >
              Read the docs
            </Link>
          </div>
        </div>
        <div className="folder-card">
          <Demo file="install.mdx" />
        </div>
      </section>

      {/* Source and result */}
      <section className="relative mx-auto w-full max-w-6xl px-6 py-16">
        <SectionHeading
          eyebrow="How it works"
          title="Plain Markdown in, real tabs out"
        >
          A compact group is a start marker with labels, your code blocks, and a
          closing marker. Nothing else to learn.
        </SectionHeading>
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <figure className="min-w-0">
            <figcaption className="mb-3 font-mono text-xs text-fd-muted-foreground">
              You write
            </figcaption>
            <Demo file="compact-source.mdx" />
          </figure>
          <figure className="min-w-0">
            <figcaption className="mb-3 font-mono text-xs text-fd-muted-foreground">
              Readers get
            </figcaption>
            <Demo file="compact.mdx" />
          </figure>
        </div>
      </section>

      {/* Sync */}
      <section className="relative mx-auto w-full max-w-6xl px-6 py-16">
        <SectionHeading
          eyebrow="Sync and persist"
          title="Pick once, everywhere"
        >
          These two groups share a sync key. Choose a runtime in either one and
          both follow. Reload the page and your choice is still there.
        </SectionHeading>
        <Demo file="synced.mdx" className="grid gap-6 lg:grid-cols-2" />
        <p className="mt-6 text-center text-sm text-fd-muted-foreground">
          Keyboard: focus a tab, then use <kbd className="key">←</kbd>{" "}
          <kbd className="key">→</kbd> <kbd className="key">Home</kbd>{" "}
          <kbd className="key">End</kbd>.
        </p>
      </section>

      {/* Vertical */}
      <section className="relative mx-auto w-full max-w-6xl px-6 py-16">
        <SectionHeading
          eyebrow="Rich groups"
          title="Tabs for whatever you put in them"
        >
          Rich groups take attributes for a default tab, sync, persistence and a
          vertical layout. Each tab can hold any Markdown.
        </SectionHeading>
        <div className="mx-auto max-w-4xl">
          <Demo file="vertical.mdx" />
        </div>
      </section>

      {/* Features */}
      <section className="relative mx-auto w-full max-w-6xl px-6 py-16">
        <SectionHeading
          eyebrow="Features"
          title="Small plugin, careful details"
        >
          Everything is generated as static HTML, then enhanced by a small
          client script.
        </SectionHeading>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <li key={feature.title}>
              <Link
                href={feature.href}
                className="group block h-full rounded-2xl border bg-fd-card p-6 transition-colors hover:border-fd-primary/50"
              >
                <h3 className="font-display text-lg font-semibold tracking-tight group-hover:text-fd-primary">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-fd-muted-foreground">
                  {feature.body}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Integrations */}
      <section className="relative mx-auto w-full max-w-6xl px-6 py-16">
        <SectionHeading eyebrow="Integrations" title="Works where rehype works">
          Use it with unified directly, or in the tools built on it. A Sätteri
          version is included for Astro 7's default processor.
        </SectionHeading>
        <ul className="flex flex-wrap justify-center gap-3">
          {integrations.map((integration) => (
            <li key={integration.href}>
              <Link
                href={integration.href}
                className="inline-flex rounded-full border bg-fd-card px-4 py-2 font-mono text-sm transition-colors hover:border-fd-primary/50 hover:text-fd-primary"
              >
                {integration.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-auto border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-fd-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <Logo className="size-5" />
            rehype-code-group, MIT licensed. Built by Sohab Sk.
          </p>
          <nav aria-label="Footer" className="flex gap-5">
            <Link href="/docs" className="hover:text-fd-foreground">
              Docs
            </Link>
            <Link href="/docs/changelog" className="hover:text-fd-foreground">
              Changelog
            </Link>
            <a href={repoUrl} className="hover:text-fd-foreground">
              GitHub
            </a>
            <a href={npmUrl} className="hover:text-fd-foreground">
              npm
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
